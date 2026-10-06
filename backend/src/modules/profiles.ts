import { Router, Request, Response } from 'express'
import { query } from '../config/database'
import { AppError } from '../middleware/errorHandler'
import { getDeviceId } from '../middleware/device'
import {
  createProfileSchema,
  getProfileSchema,
  updateProfileSchema,
  Profile,
} from '../types/profile.types'

export const profileRouter: Router = Router()

interface ProfileRow {
  id: number
  name: string
  avatar: string
  color: string
  grade: number
  created_at: Date
}

const toProfile = (row: ProfileRow): Profile => ({
  id: row.id,
  name: row.name,
  avatar: row.avatar,
  color: row.color,
  grade: row.grade,
  createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
})

const ok = <T>(res: Response, data: T, status = 200) => {
  res.status(status).json({ status: 'success', data })
}

/** POST /api/profiles/list */
profileRouter.post('/list', async (_req: Request, res: Response) => {
  const result = await query<ProfileRow>(
    `SELECT id, name, avatar, color, grade, created_at FROM users
     WHERE device_id = $1 ORDER BY created_at ASC`,
    [getDeviceId(res)]
  )
  ok(res, { profiles: result.rows.map(toProfile) })
})

/** POST /api/profiles/create */
profileRouter.post('/create', async (req: Request, res: Response) => {
  const input = createProfileSchema.parse(req.body)
  const result = await query<ProfileRow>(
    `INSERT INTO users (name, avatar, color, grade, device_id) VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, avatar, color, grade, created_at`,
    [input.name, input.avatar, input.color, input.grade, getDeviceId(res)]
  )
  ok(res, { profile: toProfile(result.rows[0]) }, 201)
})

/** POST /api/profiles/get */
profileRouter.post('/get', async (req: Request, res: Response) => {
  const { id } = getProfileSchema.parse(req.body)
  const result = await query<ProfileRow>(
    'SELECT id, name, avatar, color, grade, created_at FROM users WHERE id = $1 AND device_id = $2',
    [id, getDeviceId(res)]
  )
  if (result.rows.length === 0) {
    throw new AppError(404, 'Profile not found')
  }
  ok(res, { profile: toProfile(result.rows[0]) })
})

/** POST /api/profiles/update */
profileRouter.post('/update', async (req: Request, res: Response) => {
  const input = updateProfileSchema.parse(req.body)
  const fields: string[] = []
  const values: unknown[] = []
  let idx = 1

  for (const key of ['name', 'avatar', 'color', 'grade'] as const) {
    const value = input[key]
    if (value !== undefined) {
      fields.push(`${key} = $${idx}`)
      values.push(value)
      idx += 1
    }
  }

  if (fields.length === 0) {
    throw new AppError(400, 'No fields to update')
  }

  values.push(input.id, getDeviceId(res))
  const result = await query<ProfileRow>(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} AND device_id = $${idx + 1}
     RETURNING id, name, avatar, color, grade, created_at`,
    values
  )

  if (result.rows.length === 0) {
    throw new AppError(404, 'Profile not found')
  }
  ok(res, { profile: toProfile(result.rows[0]) })
})

/** POST /api/profiles/delete */
profileRouter.post('/delete', async (req: Request, res: Response) => {
  const { id } = getProfileSchema.parse(req.body)
  await query('DELETE FROM users WHERE id = $1 AND device_id = $2', [id, getDeviceId(res)])
  ok(res, { deleted: true })
})
