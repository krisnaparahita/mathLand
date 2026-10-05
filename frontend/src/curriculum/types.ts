/** Question kind: multiple choice / fill in the blank / true or false */
export type QuestionKind = 'choice' | 'fill' | 'judge'

export interface Question {
  id: string
  kind: QuestionKind
  /** Question prompt */
  prompt: string
  /** Unit shown next to a fill-in answer, such as "apples" or "cm" */
  unit?: string
  /** Correct answer (always stored as a string for easy comparison) */
  answer: string
  /** Multiple-choice options (already shuffled) */
  options?: string[]
  /** Per-question explanation */
  explanation: string
  /** Name of the related smart method */
  smartTip?: string
}

export interface SmartMethod {
  /** Method name, such as "Make a ten" */
  name: string
  /** When the method applies */
  when: string
  /** Step-by-step breakdown */
  steps: string[]
  /** Worked example */
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
  /** Level goal description */
  goal: string
}

export interface Topic {
  id: string
  grade: number
  name: string
  /** Topic color key */
  color: string
  /** lucide icon name */
  icon: string
  summary: string
  explanation: ExplanationBlock[]
  smartMethods: SmartMethod[]
  levels: LevelMeta[]
  /**
   * Generate questions for a level's difficulty (results differ on every call, which rotates the questions)
   * @param exclude Prompts answered recently, which the generator avoids where possible
   */
  generate: (level: number, count: number, exclude?: string[]) => Question[]
}

export interface Rng {
  int: (min: number, max: number) => number
  pick: <T>(arr: readonly T[]) => T
  shuffle: <T>(arr: readonly T[]) => T[]
  bool: (probability?: number) => boolean
  /** Take n distinct elements from the array */
  sample: <T>(arr: readonly T[], n: number) => T[]
}
