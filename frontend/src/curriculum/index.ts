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
    color: 'orange',
    topics: grade1Topics,
  },
  {
    grade: 2,
    name: 'Grade 2',
    tagline: 'Regrouping and first multiplication',
    description: 'Master addition with carrying and subtraction with borrowing within 100, meet multiplication, and learn to tell time, measure length and use money.',
    color: 'yellow',
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
    color: 'indigo',
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
    color: 'pink',
    topics: grade6Topics,
  },
]

export const ALL_TOPICS: Topic[] = GRADES.flatMap((g) => g.topics)

export const getGrade = (grade: number): GradeInfo | undefined =>
  GRADES.find((g) => g.grade === grade)

export const getTopic = (grade: number, topicId: string): Topic | undefined =>
  getGrade(grade)?.topics.find((t) => t.id === topicId)

/** Topic color map: key → CSS variable (bright fill color of the playful palette) */
export const COLOR_VAR: Record<string, string> = {
  orange: 'var(--c-coral)',
  red: 'var(--c-coral)',
  yellow: 'var(--c-sun)',
  gold: 'var(--c-sun)',
  green: 'var(--c-mint)',
  indigo: 'var(--c-sky)',
  purple: 'var(--c-grape)',
  pink: 'var(--c-pink)',
  teal: 'var(--c-teal)',
  blue: 'var(--c-ocean)',
}

const DEFAULT_KEY = 'indigo'
const fill = (key: string): string => COLOR_VAR[key] ?? COLOR_VAR[DEFAULT_KEY]

/** Bright fill, for backgrounds, bars and icons */
export const topicColor = (key: string): string => fill(key)

/** Pale tint of the color, for card and badge backgrounds */
export const topicSoft = (key: string): string => `color-mix(in oklch, ${fill(key)} 24%, white)`

/** Darker shade of the color that stays readable as text on white or tinted backgrounds */
export const topicText = (key: string): string =>
  `color-mix(in oklch, ${fill(key)} 52%, oklch(0.28 0.04 280))`

/** Darker shade for the hard bottom edge of solid, pressable elements */
export const topicEdge = (key: string): string =>
  `color-mix(in oklch, ${fill(key)} 62%, oklch(0.2 0.04 280))`

/** Text color that stays readable on top of the bright fill */
export const topicInk = (key: string): string =>
  key === 'blue' ? 'oklch(0.99 0.005 85)' : 'oklch(0.28 0.04 280)'
