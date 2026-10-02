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
  /** 展示名称，如「一年级」 */
  name: string
  /** 年级标语 */
  tagline: string
  /** 年级简介 */
  description: string
  /** 主色 key */
  color: string
  topics: Topic[]
}

export const GRADES: GradeInfo[] = [
  {
    grade: 1,
    name: '一年级',
    tagline: '数数与加减法启蒙',
    description: '从数数开始，认识 100 以内的数，学会 20 以内的加减法，认识基本图形。',
    color: 'indigo',
    topics: grade1Topics,
  },
  {
    grade: 2,
    name: '二年级',
    tagline: '进位退位与乘法入门',
    description: '掌握 100 以内进位加与退位减，初步认识乘法，学会认时间、量长度、用人民币。',
    color: 'orange',
    topics: grade2Topics,
  },
  {
    grade: 3,
    name: '三年级',
    tagline: '乘除法与分数初步',
    description: '熟记乘法口诀，学会表内除法与两步混合运算，认识分数和周长。',
    color: 'green',
    topics: grade3Topics,
  },
  {
    grade: 4,
    name: '四年级',
    tagline: '大数与小数',
    description: '认识万以上的大数，掌握三位数乘两位数与两位数除法，学习分数加减和小数。',
    color: 'pink',
    topics: grade4Topics,
  },
  {
    grade: 5,
    name: '五年级',
    tagline: '分数小数与方程',
    description: '学习小数乘除法、分数乘除法、面积体积、百分数和简易方程。',
    color: 'purple',
    topics: grade5Topics,
  },
  {
    grade: 6,
    name: '六年级',
    tagline: '比比例与圆',
    description: '掌握分数混合运算、比与比例、百分数应用、圆、负数和代数式方程。',
    color: 'teal',
    topics: grade6Topics,
  },
]

export const ALL_TOPICS: Topic[] = GRADES.flatMap((g) => g.topics)

export const getGrade = (grade: number): GradeInfo | undefined =>
  GRADES.find((g) => g.grade === grade)

export const getTopic = (grade: number, topicId: string): Topic | undefined =>
  getGrade(grade)?.topics.find((t) => t.id === topicId)

/** 专题配色映射：key → CSS 变量名 */
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

/** 专题淡色背景映射：key → 半透明底色 */
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
