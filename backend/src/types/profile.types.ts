import { z } from 'zod'

export const AVATARS = [
  'cat',
  'dog',
  'rabbit',
  'bird',
  'fish',
  'turtle',
  'squirrel',
  'bug',
  'snail',
  'paw',
] as const

export const COLORS = [
  'indigo',
  'orange',
  'green',
  'pink',
  'blue',
  'purple',
  'yellow',
  'teal',
] as const

export const createProfileSchema = z.object({
  name: z.string().trim().min(1, '昵称不能为空').max(20, '昵称最多 20 个字符'),
  avatar: z.enum(AVATARS).default('cat'),
  color: z.enum(COLORS).default('indigo'),
  grade: z.number().int().min(1).max(6).default(1),
})

export const updateProfileSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1).max(20).optional(),
  avatar: z.enum(AVATARS).optional(),
  color: z.enum(COLORS).optional(),
  grade: z.number().int().min(1).max(6).optional(),
})

export const getProfileSchema = z.object({
  id: z.number().int().positive(),
})

export type CreateProfileInput = z.infer<typeof createProfileSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

export interface Profile {
  id: number
  name: string
  avatar: string
  color: string
  grade: number
  createdAt: string
}
