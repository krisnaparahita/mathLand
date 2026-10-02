import { z } from 'zod'

export const createResultSchema = z.object({
  userId: z.number().int().positive(),
  grade: z.number().int().min(1).max(6),
  topicId: z.string().min(1).max(64),
  topicName: z.string().max(80).default(''),
  level: z.number().int().min(1).max(5),
  correct: z.number().int().min(0),
  total: z.number().int().min(1),
  score: z.number().int().min(0),
  stars: z.number().int().min(0).max(3),
  durationMs: z.number().int().min(0).default(0),
  timed: z.boolean().default(true),
})

export const listResultsSchema = z.object({
  userId: z.number().int().positive(),
  grade: z.number().int().min(1).max(6).optional(),
  topicId: z.string().max(64).optional(),
  limit: z.number().int().min(1).max(200).default(50),
})

export const statsSchema = z.object({
  userId: z.number().int().positive(),
})

export const topicProgressSchema = z.object({
  userId: z.number().int().positive(),
  grade: z.number().int().min(1).max(6).optional(),
})

export const getResultSchema = z.object({
  id: z.number().int().positive(),
})

export type CreateResultInput = z.infer<typeof createResultSchema>

export interface GameResult {
  id: number
  userId: number
  grade: number
  topicId: string
  topicName: string
  level: number
  correct: number
  total: number
  score: number
  stars: number
  durationMs: number
  timed: boolean
  createdAt: string
}

export interface ProfileStats {
  totalGames: number
  totalQuestions: number
  correctQuestions: number
  accuracy: number
  totalStars: number
  totalTimeMs: number
  streakDays: number
  bestStreakDays: number
  gradeCounts: { grade: number; games: number }[]
}
