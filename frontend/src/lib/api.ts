import apiClient from './api-client'

/* ────────────── Types ────────────── */

export interface Profile {
  id: number
  name: string
  avatar: string
  color: string
  grade: number
  createdAt: string
}

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

export interface TopicProgress {
  topicId: string
  topicName: string
  grade: number
  bestStars: number
  bestScore: number
  plays: number
  correct: number
  total: number
  lastPlayed: string
}

export interface LevelProgress {
  topicId: string
  level: number
  bestStars: number
  bestScore: number
  plays: number
}

export interface CreateResultInput {
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
}

/* ────────────── Request helpers ────────────── */

const unwrap = <T>(payload: unknown): T => {
  const data = (payload as { data?: T })?.data
  return data as T
}

export const profilesApi = {
  list: async (): Promise<Profile[]> =>
    unwrap<{ profiles: Profile[] }>((await apiClient.post('/profiles/list', {})).data).profiles,

  create: async (input: {
    name: string
    avatar: string
    color: string
    grade: number
  }): Promise<Profile> =>
    unwrap<{ profile: Profile }>((await apiClient.post('/profiles/create', input)).data).profile,

  get: async (id: number): Promise<Profile> =>
    unwrap<{ profile: Profile }>((await apiClient.post('/profiles/get', { id })).data).profile,

  update: async (input: Partial<Profile> & { id: number }): Promise<Profile> =>
    unwrap<{ profile: Profile }>((await apiClient.post('/profiles/update', input)).data).profile,

  remove: async (id: number): Promise<void> => {
    await apiClient.post('/profiles/delete', { id })
  },
}

export const resultsApi = {
  create: async (input: CreateResultInput): Promise<GameResult> =>
    unwrap<{ result: GameResult }>((await apiClient.post('/results/create', input)).data).result,

  get: async (id: number): Promise<GameResult> =>
    unwrap<{ result: GameResult }>((await apiClient.post('/results/get', { id })).data).result,

  list: async (params: {
    userId: number
    grade?: number
    topicId?: string
    limit?: number
  }): Promise<GameResult[]> =>
    unwrap<{ results: GameResult[] }>((await apiClient.post('/results/list', params)).data).results,

  stats: async (userId: number): Promise<ProfileStats> =>
    unwrap<{ stats: ProfileStats }>((await apiClient.post('/results/stats', { userId })).data).stats,

  topicProgress: async (userId: number, grade?: number): Promise<TopicProgress[]> =>
    unwrap<{ progress: TopicProgress[] }>(
      (await apiClient.post('/results/topic-progress', { userId, grade })).data
    ).progress,

  levelProgress: async (userId: number, grade?: number): Promise<LevelProgress[]> =>
    unwrap<{ levels: LevelProgress[] }>(
      (await apiClient.post('/results/level-progress', { userId, grade })).data
    ).levels,

  remove: async (id: number): Promise<void> => {
    await apiClient.post('/results/delete', { id })
  },
}
