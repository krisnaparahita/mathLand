import type { Question, Rng } from './types'

/* ──────────────────────────────────────────────
   Random number helpers
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
   Number helpers
   ────────────────────────────────────────────── */

/** Keep at most 2 decimal places and drop trailing zeros */
export const fmt = (n: number): string => {
  const rounded = Math.round(n * 100) / 100
  return String(rounded)
}

/** Keep the given number of decimal places and drop trailing zeros */
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

/** Reduce a fraction, returning [numerator, denominator] */
export const simplify = (n: number, d: number): [number, number] => {
  const g = gcd(n, d)
  return [n / g, d / g]
}

/** Fraction string: shows only the whole number when the denominator is 1 */
export const fracStr = (n: number, d: number): string => {
  const [a, b] = simplify(n, d)
  if (b === 1) return String(a)
  return `${a}/${b}`
}

/** Clamp a number to [min, max] */
export const clamp = (n: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, n))

/* ──────────────────────────────────────────────
   Question builders
   ────────────────────────────────────────────── */

let questionSeq = 0
const nextId = (): string => {
  questionSeq += 1
  return `q${Date.now().toString(36)}${questionSeq.toString(36)}`
}

export interface ChoiceSpec {
  prompt: string
  answer: string
  /** Distractors */
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
   Question sets: rotation + de-duplication
   ────────────────────────────────────────────── */

/**
 * Generate questions by rotating through several maker functions, with automatic de-duplication.
 * The maker order is shuffled on every call so the same level has different questions each time.
 *
 * @param exclude Prompts answered recently, avoided where possible (especially useful for topics with a tiny question pool, such as multiplication tables)
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
      // The first 18 attempts avoid recently answered questions; after that, reuse is allowed to guarantee the question count
      if (recent?.has(q.prompt) && attempt < 18) continue
      seen.add(sig)
      result.push(q)
      added = true
    }
    if (!added) {
      // Last-resort fallback: allow duplicates
      const q = order[i % order.length]()
      result.push(q)
    }
  }

  return result
}

/* ──────────────────────────────────────────────
   Levels and scoring
   ────────────────────────────────────────────── */

export const LEVEL_NAMES = ['Starter', 'Intermediate', 'Skilled', 'Challenge', 'Master'] as const

const BASE_LEVELS = [
  { questionCount: 8, secondsPerQuestion: 20 },
  { questionCount: 10, secondsPerQuestion: 18 },
  { questionCount: 12, secondsPerQuestion: 15 },
  { questionCount: 14, secondsPerQuestion: 13 },
  { questionCount: 16, secondsPerQuestion: 12 },
]

/** Build question count and per-question time for the 5 levels by grade (lower grades get more relaxed settings) */
export const buildLevels = (grade: number, goals: string[]): import('./types').LevelMeta[] => {
  const countDelta = grade <= 2 ? -2 : 0
  const secondDelta = grade <= 2 ? 5 : grade >= 5 ? -2 : 0

  return BASE_LEVELS.map((base, index) => ({
    level: index + 1,
    name: LEVEL_NAMES[index],
    questionCount: Math.max(6, base.questionCount + countDelta),
    secondsPerQuestion: Math.max(8, base.secondsPerQuestion + secondDelta),
    goal: goals[index] ?? 'Complete all the questions carefully',
  }))
}

/** Accuracy → star rating */
export const starsForAccuracy = (accuracy: number): number => {
  if (accuracy >= 90) return 3
  if (accuracy >= 70) return 2
  if (accuracy >= 50) return 1
  return 0
}

/** Check whether the user's answer is correct (numbers are compared by value) */
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

/** Normalize user input for fraction comparison (supports the 1/2 form) */
export const normalizeFractionInput = (input: string): string => input.trim().replace(/\s+/g, '')
