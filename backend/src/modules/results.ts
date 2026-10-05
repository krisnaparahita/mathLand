import { Router, Request, Response } from 'express'
import { query } from '../config/database'
import { AppError } from '../middleware/errorHandler'
import {
  createResultSchema,
  listResultsSchema,
  getResultSchema,
  statsSchema,
  topicProgressSchema,
  GameResult,
  ProfileStats,
} from '../types/result.types'

export const resultRouter: Router = Router()

interface ResultRow {
  id: number
  user_id: number
  grade: number
  topic_id: string
  topic_name: string
  level: number
  correct: number
  total: number
  score: number
  stars: number
  duration_ms: number
  timed: boolean
  created_at: Date
}

const toResult = (row: ResultRow): GameResult => ({
  id: row.id,
  userId: row.user_id,
  grade: row.grade,
  topicId: row.topic_id,
  topicName: row.topic_name,
  level: row.level,
  correct: row.correct,
  total: row.total,
  score: row.score,
  stars: row.stars,
  durationMs: row.duration_ms,
  timed: row.timed,
  createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
})

const ok = <T>(res: Response, data: T, status = 200) => {
  res.status(status).json({ status: 'success', data })
}

const RESULT_COLUMNS = `id, user_id, grade, topic_id, topic_name, level, correct, total,
  score, stars, duration_ms, timed, created_at`

/** POST /api/results/create */
resultRouter.post('/create', async (req: Request, res: Response) => {
  const input = createResultSchema.parse(req.body)

  const userExists = await query('SELECT id FROM users WHERE id = $1', [input.userId])
  if (userExists.rows.length === 0) {
    throw new AppError(404, 'Profile not found. Please create a profile first')
  }

  const result = await query<ResultRow>(
    `INSERT INTO game_results
      (user_id, grade, topic_id, topic_name, level, correct, total, score, stars, duration_ms, timed)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING ${RESULT_COLUMNS}`,
    [
      input.userId,
      input.grade,
      input.topicId,
      input.topicName,
      input.level,
      input.correct,
      input.total,
      input.score,
      input.stars,
      input.durationMs,
      input.timed,
    ]
  )

  ok(res, { result: toResult(result.rows[0]) }, 201)
})

/** POST /api/results/list */
resultRouter.post('/list', async (req: Request, res: Response) => {
  const { userId, grade, topicId, limit } = listResultsSchema.parse(req.body)

  const conditions = ['user_id = $1']
  const values: unknown[] = [userId]
  let idx = 2

  if (grade !== undefined) {
    conditions.push(`grade = $${idx}`)
    values.push(grade)
    idx += 1
  }
  if (topicId !== undefined) {
    conditions.push(`topic_id = $${idx}`)
    values.push(topicId)
    idx += 1
  }

  values.push(limit)
  const result = await query<ResultRow>(
    `SELECT ${RESULT_COLUMNS} FROM game_results
     WHERE ${conditions.join(' AND ')}
     ORDER BY created_at DESC
     LIMIT $${idx}`,
    values
  )

  ok(res, { results: result.rows.map(toResult) })
})

/** POST /api/results/get — Get a single result */
resultRouter.post('/get', async (req: Request, res: Response) => {
  const { id } = getResultSchema.parse(req.body)
  const result = await query<ResultRow>(
    `SELECT ${RESULT_COLUMNS} FROM game_results WHERE id = $1`,
    [id]
  )
  if (result.rows.length === 0) {
    throw new AppError(404, 'Result not found')
  }
  ok(res, { result: toResult(result.rows[0]) })
})

/** Calculate consecutive practice days ending today */
const computeStreak = (dates: string[]): { streakDays: number; bestStreakDays: number } => {
  if (dates.length === 0) return { streakDays: 0, bestStreakDays: 0 }

  const daySet = new Set(dates.map((d) => d.slice(0, 10)))
  const sorted = Array.from(daySet).sort()

  let best = 1
  let run = 1
  for (let i = 1; i < sorted.length; i += 1) {
    const prev = new Date(`${sorted[i - 1]}T00:00:00Z`).getTime()
    const curr = new Date(`${sorted[i]}T00:00:00Z`).getTime()
    if (curr - prev === 86400000) {
      run += 1
      best = Math.max(best, run)
    } else {
      run = 1
    }
  }

  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

  let streakDays = 0
  if (daySet.has(today) || daySet.has(yesterday)) {
    const cursor = new Date(`${daySet.has(today) ? today : yesterday}T00:00:00Z`)
    while (daySet.has(cursor.toISOString().slice(0, 10))) {
      streakDays += 1
      cursor.setTime(cursor.getTime() - 86400000)
    }
  }

  return { streakDays, bestStreakDays: best }
}

/** POST /api/results/stats */
resultRouter.post('/stats', async (req: Request, res: Response) => {
  const { userId } = statsSchema.parse(req.body)

  const agg = await query<{
    games: string
    questions: string
    correct: string
    stars: string
    time_ms: string
  }>(
    `SELECT
       COUNT(*)::text        AS games,
       COALESCE(SUM(total), 0)::text   AS questions,
       COALESCE(SUM(correct), 0)::text AS correct,
       COALESCE(SUM(stars), 0)::text   AS stars,
       COALESCE(SUM(duration_ms), 0)::text AS time_ms
     FROM game_results WHERE user_id = $1`,
    [userId]
  )

  const row = agg.rows[0]
  const totalGames = Number(row?.games ?? 0)
  const totalQuestions = Number(row?.questions ?? 0)
  const correctQuestions = Number(row?.correct ?? 0)

  const dates = await query<{ created_at: Date }>(
    'SELECT created_at FROM game_results WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  )
  const { streakDays, bestStreakDays } = computeStreak(
    dates.rows.map((d) => (d.created_at instanceof Date ? d.created_at.toISOString() : String(d.created_at)))
  )

  const byGrade = await query<{ grade: number; games: string }>(
    `SELECT grade, COUNT(*)::text AS games FROM game_results
     WHERE user_id = $1 GROUP BY grade ORDER BY grade`,
    [userId]
  )

  const stats: ProfileStats = {
    totalGames,
    totalQuestions,
    correctQuestions,
    accuracy: totalQuestions === 0 ? 0 : Math.round((correctQuestions / totalQuestions) * 1000) / 10,
    totalStars: Number(row?.stars ?? 0),
    totalTimeMs: Number(row?.time_ms ?? 0),
    streakDays,
    bestStreakDays,
    gradeCounts: byGrade.rows.map((r) => ({ grade: r.grade, games: Number(r.games) })),
  }

  ok(res, { stats })
})

/** POST /api/results/topic-progress */
resultRouter.post('/topic-progress', async (req: Request, res: Response) => {
  const { userId, grade } = topicProgressSchema.parse(req.body)

  const values: unknown[] = [userId]
  let sql = `SELECT topic_id,
                    MAX(topic_name) AS topic_name,
                    MAX(grade)      AS grade,
                    MAX(stars)::text      AS best_stars,
                    MAX(score)::text      AS best_score,
                    COUNT(*)::text        AS plays,
                    COALESCE(SUM(correct),0)::text AS correct,
                    COALESCE(SUM(total),0)::text   AS total,
                    MAX(created_at)       AS last_played
             FROM game_results WHERE user_id = $1`
  if (grade !== undefined) {
    sql += ' AND grade = $2'
    values.push(grade)
  }
  sql += ' GROUP BY topic_id ORDER BY last_played DESC'

  const result = await query<{
    topic_id: string
    topic_name: string
    grade: number
    best_stars: string
    best_score: string
    plays: string
    correct: string
    total: string
    last_played: Date
  }>(sql, values)

  ok(res, {
    progress: result.rows.map((r) => ({
      topicId: r.topic_id,
      topicName: r.topic_name,
      grade: r.grade,
      bestStars: Number(r.best_stars),
      bestScore: Number(r.best_score),
      plays: Number(r.plays),
      correct: Number(r.correct),
      total: Number(r.total),
      lastPlayed: r.last_played instanceof Date ? r.last_played.toISOString() : String(r.last_played),
    })),
  })
})

/** POST /api/results/level-progress — per topic per level best stars */
resultRouter.post('/level-progress', async (req: Request, res: Response) => {
  const { userId, grade } = topicProgressSchema.parse(req.body)
  const values: unknown[] = [userId]
  let sql = `SELECT topic_id, level, MAX(stars)::text AS best_stars, MAX(score)::text AS best_score,
                    COUNT(*)::text AS plays
             FROM game_results WHERE user_id = $1`
  if (grade !== undefined) {
    sql += ' AND grade = $2'
    values.push(grade)
  }
  sql += ' GROUP BY topic_id, level'

  const result = await query<{
    topic_id: string
    level: number
    best_stars: string
    best_score: string
    plays: string
  }>(sql, values)

  ok(res, {
    levels: result.rows.map((r) => ({
      topicId: r.topic_id,
      level: r.level,
      bestStars: Number(r.best_stars),
      bestScore: Number(r.best_score),
      plays: Number(r.plays),
    })),
  })
})

/** POST /api/results/delete */
resultRouter.post('/delete', async (req: Request, res: Response) => {
  const id = Number(req.body?.id)
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, 'A valid result id is required')
  }
  await query('DELETE FROM game_results WHERE id = $1', [id])
  ok(res, { deleted: true })
})
