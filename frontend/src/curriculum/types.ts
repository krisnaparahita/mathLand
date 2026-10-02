/** 题型：选择题 / 填空题 / 判断题 */
export type QuestionKind = 'choice' | 'fill' | 'judge'

export interface Question {
  id: string
  kind: QuestionKind
  /** 题干 */
  prompt: string
  /** 填空时显示的单位，如「个」「厘米」 */
  unit?: string
  /** 正确答案（统一字符串化，便于比较） */
  answer: string
  /** 选择题选项（顺序已随机打乱） */
  options?: string[]
  /** 逐题解析 */
  explanation: string
  /** 关联的巧算方法名 */
  smartTip?: string
}

export interface SmartMethod {
  /** 方法名，如「凑十法」 */
  name: string
  /** 适用情形 */
  when: string
  /** 步骤拆解 */
  steps: string[]
  /** 示例算式 */
  example: string
}

export interface ExplanationBlock {
  title: string
  body: string
  example?: string
}

export interface LevelMeta {
  level: number
  name: string
  questionCount: number
  secondsPerQuestion: number
  /** 关卡目标说明 */
  goal: string
}

export interface Topic {
  id: string
  grade: number
  name: string
  /** 专题配色 key */
  color: string
  /** lucide 图标名 */
  icon: string
  summary: string
  explanation: ExplanationBlock[]
  smartMethods: SmartMethod[]
  levels: LevelMeta[]
  /**
   * 按关卡难度生成题目（每次调用结果不同，实现题目轮换）
   * @param exclude 最近做过的题干，生成器会尽量避开
   */
  generate: (level: number, count: number, exclude?: string[]) => Question[]
}

export interface Rng {
  int: (min: number, max: number) => number
  pick: <T>(arr: readonly T[]) => T
  shuffle: <T>(arr: readonly T[]) => T[]
  bool: (probability?: number) => boolean
  /** 从数组中取 n 个不重复元素 */
  sample: <T>(arr: readonly T[], n: number) => T[]
}
