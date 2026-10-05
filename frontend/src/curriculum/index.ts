import { grade1Topics } from './grade1'
import { grade2Topics } from './grade2'
import { grade3Topics } from './grade3'
import { grade4Topics } from './grade4'
import { grade5Topics } from './grade5'
import { grade6Topics } from './grade6'
import type { Topic } from './types'

export * from './types'
export * from './core'

export interface GradeInfo {
  grade: number
  /** Display name, such as "Grade 1" */
  name: string
  /** Grade tagline */
  tagline: string
  /** Grade description */
  description: string
  /** Primary color key */
  color: string
  topics: Topic[]
}

export const GRADES: GradeInfo[] = [
  {
    grade: 1,
    name: 'Grade 1',
    tagline: 'Counting and first addition and subtraction',
    description: 'Start by counting, learn the numbers up to 100, add and subtract within 20, and meet basic shapes.',
    color: 'indigo',
    topics: grade1Topics,
  },
  {
    grade: 2,
    name: 'Grade 2',
    tagline: 'Regrouping and first multiplication',
    description: 'Master addition with carrying and subtraction with borrowing within 100, meet multiplication, and learn to tell time, measure length and use money.',
    color: 'orange',
    topics: grade2Topics,
  },
  {
    grade: 3,
    name: 'Grade 3',
    tagline: 'Multiplication, division and first fractions',
    description: 'Memorize the multiplication tables, learn division facts and two-step mixed operations, and meet fractions and perimeter.',
    color: 'green',
    topics: grade3Topics,
  },
  {
    grade: 4,
    name: 'Grade 4',
    tagline: 'Large numbers and decimals',
    description: 'Work with numbers beyond ten thousand, multiply three-digit by two-digit numbers, divide by two-digit numbers, and learn fraction addition and subtraction and decimals.',
    color: 'pink',
    topics: grade4Topics,
  },
  {
    grade: 5,
    name: 'Grade 5',
    tagline: 'Fractions, decimals and equations',
    description: 'Learn decimal and fraction multiplication and division, area and volume, percentages and simple equations.',
    color: 'purple',
    topics: grade5Topics,
  },
  {
    grade: 6,
    name: 'Grade 6',
    tagline: 'Ratios, proportions and circles',
    description: 'Master mixed fraction operations, ratios and proportions, percentage applications, circles, negative numbers and algebraic equations.',
    color: 'teal',
    topics: grade6Topics,
  },
]

export const ALL_TOPICS: Topic[] = GRADES.flatMap((g) => g.topics)

export const getGrade = (grade: number): GradeInfo | undefined =>
  GRADES.find((g) => g.grade === grade)

export const getTopic = (grade: number, topicId: string): Topic | undefined =>
  getGrade(grade)?.topics.find((t) => t.id === topicId)

/** Topic color map: key → CSS variable name */
export const COLOR_VAR: Record<string, string> = {
  indigo: 'var(--theme-indigo)',
  orange: 'var(--accent)',
  green: 'var(--theme-green)',
  pink: 'var(--theme-pink)',
  purple: 'var(--theme-purple)',
  teal: 'var(--theme-teal)',
  blue: 'var(--theme-blue)',
  yellow: 'var(--theme-gold)',
  gold: 'var(--theme-gold)',
  red: 'var(--theme-red)',
}

/** Topic soft background map: key → translucent tint */
export const COLOR_SOFT: Record<string, string> = {
  indigo: 'oklch(0.511 0.262 276.966 / 0.12)',
  orange: 'oklch(0.646 0.222 41.116 / 0.14)',
  green: 'oklch(0.723 0.219 149.579 / 0.14)',
  pink: 'oklch(0.645 0.246 16.439 / 0.14)',
  purple: 'oklch(0.627 0.265 303.9 / 0.14)',
  teal: 'oklch(0.704 0.14 182.503 / 0.14)',
  blue: 'oklch(0.623 0.214 259.815 / 0.14)',
  yellow: 'oklch(0.828 0.189 84.429 / 0.18)',
  gold: 'oklch(0.828 0.189 84.429 / 0.18)',
  red: 'oklch(0.627 0.229 22.5 / 0.14)',
}

export const topicColor = (key: string): string => COLOR_VAR[key] ?? COLOR_VAR.indigo
export const topicSoft = (key: string): string => COLOR_SOFT[key] ?? COLOR_SOFT.indigo
