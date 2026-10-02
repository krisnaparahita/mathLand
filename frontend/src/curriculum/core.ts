import type { Question, Rng } from './types'

/* ──────────────────────────────────────────────
   随机数工具
   ────────────────────────────────────────────── */

export const createRng = (): Rng => {
  const int = (min: number, max: number): number =>
    Math.floor(Math.random() * (max - min + 1)) + min

  const shuffle = <T>(arr: readonly T[]): T[] => {
    const out = [...arr]
    for (let i = out.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[out[i], out[j]] = [out[j], out[i]]
    }
    return out
  }

  const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]

  const sample = <T>(arr: readonly T[], n: number): T[] => shuffle(arr).slice(0, n)

  const bool = (probability = 0.5): boolean => Math.random() < probability

  return { int, pick, shuffle, sample, bool }
}

export const rng = createRng()

/* ──────────────────────────────────────────────
   数值工具
   ────────────────────────────────────────────── */

/** 最多保留 2 位小数并去掉多余的 0 */
export const fmt = (n: number): string => {
  const rounded = Math.round(n * 100) / 100
  return String(rounded)
}

/** 保留指定小数位并去掉多余 0 */
export const fmtFixed = (n: number, digits: number): string => {
  const rounded = Math.round(n * 10 ** digits) / 10 ** digits
  return String(rounded)
}

export const gcd = (a: number, b: number): number => {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y !== 0) {
    const t = y
    y = x % y
    x = t
  }
  return x || 1
}

/** 约分，返回 [分子, 分母] */
export const simplify = (n: number, d: number): [number, number] => {
  const g = gcd(n, d)
  return [n / g, d / g]
}

/** 分数字符串：分母为 1 时只显示整数 */
export const fracStr = (n: number, d: number): string => {
  const [a, b] = simplify(n, d)
  if (b === 1) return String(a)
  return `${a}/${b}`
}

/** 限制数值在 [min, max] */
export const clamp = (n: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, n))

/* ──────────────────────────────────────────────
   题目构造
   ────────────────────────────────────────────── */

let questionSeq = 0
const nextId = (): string => {
  questionSeq += 1
  return `q${Date.now().toString(36)}${questionSeq.toString(36)}`
}

export interface ChoiceSpec {
  prompt: string
  answer: string
  /** 干扰项 */
  wrong: string[]
  explanation: string
  smartTip?: string
}

export const makeChoice = (spec: ChoiceSpec): Question => {
  const unique = Array.from(new Set([spec.answer, ...spec.wrong])).filter((v) => v !== '')
  const options = rng.shuffle(unique).slice(0, 4)
  if (!options.includes(spec.answer)) {
    options[Math.floor(Math.random() * options.length)] = spec.answer
  }
  return {
    id: nextId(),
    kind: 'choice',
    prompt: spec.prompt,
    answer: spec.answer,
    options: rng.shuffle(options),
    explanation: spec.explanation,
    smartTip: spec.smartTip,
  }
}

export interface FillSpec {
  prompt: string
  answer: string | number
  unit?: string
  explanation: string
  smartTip?: string
}

export const makeFill = (spec: FillSpec): Question => ({
  id: nextId(),
  kind: 'fill',
  prompt: spec.prompt,
  answer: String(spec.answer),
  unit: spec.unit,
  explanation: spec.explanation,
  smartTip: spec.smartTip,
})

export interface JudgeSpec {
  prompt: string
  correct: boolean
  explanation: string
  smartTip?: string
}

export const makeJudge = (spec: JudgeSpec): Question => ({
  id: nextId(),
  kind: 'judge',
  prompt: spec.prompt,
  answer: spec.correct ? 'true' : 'false',
  explanation: spec.explanation,
  smartTip: spec.smartTip,
})

/* ──────────────────────────────────────────────
   出题集合：轮换 + 去重
   ────────────────────────────────────────────── */

/**
 * 从多个出题函数中轮换生成题目，自动去重。
 * 每次调用都会打乱出题函数顺序，保证「同一关卡每次进入题目都不同」。
 *
 * @param exclude 最近已经做过的题干，会尽量避开（题库很小的专题如乘法口诀尤其有用）
 */
export const buildQuestionSet = (
  count: number,
  makers: Array<() => Question>,
  exclude?: string[]
): Question[] => {
  const result: Question[] = []
  const seen = new Set<string>()
  const recent = exclude && exclude.length > 0 ? new Set(exclude) : null
  const order = rng.shuffle(makers)

  for (let i = 0; i < count; i += 1) {
    let added = false
    for (let attempt = 0; attempt < 24 && !added; attempt += 1) {
      const maker = order[(i + attempt) % order.length]
      const q = maker()
      const sig = `${q.prompt}|${q.answer}`
      if (seen.has(sig)) continue
      // 前 18 次尝试优先避开最近做过的题，之后为保证题量允许复用
      if (recent?.has(q.prompt) && attempt < 18) continue
      seen.add(sig)
      result.push(q)
      added = true
    }
    if (!added) {
      // 极端情况兜底：允许重复
      const q = order[i % order.length]()
      result.push(q)
    }
  }

  return result
}

/* ──────────────────────────────────────────────
   关卡与计分
   ────────────────────────────────────────────── */

export const LEVEL_NAMES = ['入门', '进阶', '熟练', '挑战', '大师'] as const

const BASE_LEVELS = [
  { questionCount: 8, secondsPerQuestion: 20 },
  { questionCount: 10, secondsPerQuestion: 18 },
  { questionCount: 12, secondsPerQuestion: 15 },
  { questionCount: 14, secondsPerQuestion: 13 },
  { questionCount: 16, secondsPerQuestion: 12 },
]

/** 依据年级生成 5 个关卡的题量与单题时间（低年级更宽松） */
export const buildLevels = (grade: number, goals: string[]): import('./types').LevelMeta[] => {
  const countDelta = grade <= 2 ? -2 : 0
  const secondDelta = grade <= 2 ? 5 : grade >= 5 ? -2 : 0

  return BASE_LEVELS.map((base, index) => ({
    level: index + 1,
    name: LEVEL_NAMES[index],
    questionCount: Math.max(6, base.questionCount + countDelta),
    secondsPerQuestion: Math.max(8, base.secondsPerQuestion + secondDelta),
    goal: goals[index] ?? '认真完成所有题目',
  }))
}

/** 正确率 → 星级 */
export const starsForAccuracy = (accuracy: number): number => {
  if (accuracy >= 90) return 3
  if (accuracy >= 70) return 2
  if (accuracy >= 50) return 1
  return 0
}

/** 判断用户答案是否正确（数字按数值比较） */
export const isAnswerCorrect = (question: Question, input: string): boolean => {
  const user = input.trim()
  const answer = question.answer.trim()
  if (user === answer) return true

  const un = Number(user)
  const an = Number(answer)
  if (!Number.isNaN(un) && !Number.isNaN(an) && user !== '' && answer !== '') {
    return Math.abs(un - an) < 1e-6
  }
  return false
}

/** 规范化用户输入的分数比较（支持 1/2 形式） */
export const normalizeFractionInput = (input: string): string => input.trim().replace(/\s+/g, '')
