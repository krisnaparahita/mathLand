import { GRADES } from '../../../frontend/src/curriculum'
import * as core from '../../../frontend/src/curriculum/core'
import type { Question } from '../../../frontend/src/curriculum/types'

// Use the existing Jest runner for the pure TypeScript curriculum as well as the API.
const topics = GRADES.flatMap((grade) => grade.topics)
const cases = topics.flatMap((topic) => topic.levels.map((level) => ({ topic, ...level })))
const numbers = (text: string): number[] => (text.match(/\d+(?:\.\d+)?/g) ?? []).map(Number)
const value = (text: string): number => {
  const [n, d = '1'] = text.split('/')
  return Number(n) / Number(d)
}
const between = (n: number, min: number, max: number): void => {
  expect(Number.isFinite(n)).toBe(true)
  expect(n).toBeGreaterThanOrEqual(min)
  expect(n).toBeLessThanOrEqual(max)
}
const close = (actual: number, expected: number): void => { expect(actual).toBeCloseTo(expected, 8) }

// Independent oracle for precedence, parentheses and fraction literals.
const calculate = (expression: string): number => {
  const tokens = expression.match(/\d+(?:\.\d+)?|[()+−×÷/]/g) ?? []
  let index = 0
  const atom = (): number => {
    if (tokens[index] === '−') { index += 1; return -atom() }
    if (tokens[index] === '(') {
      index += 1
      const result = sum()
      expect(tokens[index++]).toBe(')')
      return result
    }
    const n = Number(tokens[index++])
    if (tokens[index] === '/') { index += 1; return n / Number(tokens[index++]) }
    return n
  }
  const product = (): number => {
    let result = atom()
    while (tokens[index] === '×' || tokens[index] === '÷') {
      const op = tokens[index++]
      const next = atom()
      result = op === '×' ? result * next : result / next
    }
    return result
  }
  const sum = (): number => {
    let result = product()
    while (tokens[index] === '+' || tokens[index] === '−') {
      const op = tokens[index++]
      const next = product()
      result = op === '+' ? result + next : result - next
    }
    return result
  }
  const result = sum()
  expect(index).toBe(tokens.length)
  return result
}
const regroupCount = (a: number, b: number, addition: boolean): number => {
  let transfer = 0
  let count = 0
  while (a > 0 || b > 0) {
    transfer = Number(addition ? a % 10 + b % 10 + transfer >= 10 : a % 10 - transfer < b % 10)
    count += transfer
    a = Math.floor(a / 10)
    b = Math.floor(b / 10)
  }
  return count
}
const checkArithmetic = (q: Question): void => {
  const expression = q.prompt.match(/^(?:Use column addition: |Calculate smartly: |Use the distributive property: )?([\d .()+−×÷/]+) = \?/)
  if (expression) close(value(q.answer), calculate(expression[1]))
  for (const [pattern, operation] of [
    [/^(\d+) \+ \(  \) = (\d+)$/, (a: number, total: number) => total - a],
    [/^(\d+) × \(  \) = (\d+)$/, (a: number, total: number) => total / a],
    [/^(\d+) ÷ \(  \) = (\d+)$/, (a: number, total: number) => a / total],
  ] as const) {
    const match = q.prompt.match(pattern)
    if (match) close(Number(q.answer), operation(Number(match[1]), Number(match[2])))
  }
  const judge = q.prompt.match(/^True or false: ([\d .+−×÷/]+) ([=<>]) ([\d ./]+)$/)
  if (judge) {
    const left = calculate(judge[1]), right = calculate(judge[3])
    const correct = judge[2] === '=' ? Math.abs(left - right) < 1e-9 : judge[2] === '>' ? left > right : left < right
    expect(q.answer).toBe(String(correct))
  }
}
type Contract = (q: Question, level: number) => void
const nonnegative: Contract = (q) => {
  if (/^-?\d+(?:\.\d+)?(?:\/\d+)?$/.test(q.answer)) between(value(q.answer), 0, Number.MAX_SAFE_INTEGER)
}
const contracts: Record<string, Contract> = {
  'g1-counting': (q, level) => {
    between(Number(q.answer.split(' ')[0]), 0, 100)
    if (level <= 2) {
      expect(q.prompt.startsWith('Count the dots.')).toBe(true)
      between(Number(q.answer), 1, level === 1 ? 10 : 20)
      expect(q.prompt.match(/●/g)?.length).toBe(Number(q.answer))
    }
  },
  'g1-addition': (q, level) => {
    between(Number(q.answer), 0, level === 1 ? 5 : level === 2 ? 10 : 20)
    if (level === 3) {
      const [a, b] = numbers(q.prompt)
      between(a, 1, 9); between(b, 1, 9)
      expect(regroupCount(a, b, true)).toBe(1)
    }
  },
  'g1-subtraction': (q, level) => {
    const [a, b, c] = numbers(q.prompt)
    if (q.kind === 'fill') between(Number(q.answer), 0, level <= 2 ? (level === 1 ? 5 : 10) : 20)
    if (level <= 2) { between(a, 0, level === 1 ? 5 : 10); between(b, 0, a) }
    if (level === 3) { between(a, 10, 20); expect(a).toBeGreaterThanOrEqual(b); expect(regroupCount(a, b, false)).toBe(1) }
    if (/^\d+ −/.test(q.prompt) && q.prompt.endsWith('= ?')) {
      expect(a - b).toBeGreaterThanOrEqual(0)
      if (c !== undefined) expect(a - b - c).toBeGreaterThanOrEqual(0)
    }
  },
  'g1-compare': (q, level) => {
    if (level === 1) numbers(q.prompt).forEach((n) => between(n, 1, 20))
    if (level === 3 && /^\d+ ○/.test(q.prompt)) numbers(q.prompt).forEach((n) => between(n, 10, 99))
    const match = q.prompt.match(/^([\d +]+) ○ (\d+)\./)
    if (match) { const a = calculate(match[1]), b = Number(match[2]); expect(q.answer).toBe(a > b ? '>' : a < b ? '<' : '=') }
  },
  'g1-shapes': (q) => {
    if (q.kind === 'fill') between(Number(q.answer), 0, 11)
    const counted = q.prompt.match(/How many (triangles|squares|circles|rectangles) are there\?\n(.*)/)
    if (counted) {
      const symbols: Record<string, string> = { triangles: '▲', squares: '■', circles: '●', rectangles: '▬' }
      expect(Number(q.answer)).toBe([...counted[2]].filter((symbol) => symbol === symbols[counted[1]]).length)
    }
  },
  'g1-word': (q) => {
    if (q.kind === 'fill') between(Number(q.answer), 0, 20)
    numbers(q.prompt).forEach((n) => between(n, 0, q.kind === 'judge' ? 22 : 20))
    const [a, b, c] = numbers(q.prompt)
    if (q.unit === 'birds') { close(Number(q.answer), a + b); between(a + b, 0, 20) }
    if (q.unit === 'people') { between(a + b, 0, 20); close(Number(q.answer), a + b - c) }
  },
  'g2-add100': (q, level) => {
    const [a, b, c] = numbers(q.prompt), addition = q.prompt.includes('+')
    if (q.kind !== 'judge') between(Number(q.answer), 0, 100)
    if (level === 1) { expect(a % 10).toBe(0); expect(b % 10).toBe(0) }
    if (level === 2) { between(a, 10, 99); between(b, 10, 99); expect(regroupCount(a, b, addition)).toBe(0) }
    if (level === 3 || level === 4) { expect(addition).toBe(level === 3); expect(regroupCount(a, b, addition)).toBe(1) }
    if (/^\d+ − \d+ \+/.test(q.prompt)) { between(a - b, 0, 100); between(a - b + c, 0, 100) }
  },
  'g2-carryborrow': (q, level) => {
    const [a, b] = numbers(q.prompt)
    if (level <= 4) {
      const addition = q.prompt.includes('+')
      expect(addition).toBe(level <= 2)
      expect(regroupCount(a, b, addition)).toBe(level === 2 || level === 4 ? 2 : 1)
      if (level === 1) between(Number(q.answer), 0, 99)
    }
    if (q.smartTip === 'Mark the carry') expect(a % 10 + b % 10).toBeGreaterThanOrEqual(10)
    if (q.kind === 'fill') between(Number(q.answer), 0, 499)
  },
  'g2-multintro': (q, level) => {
    const [a, b] = numbers(q.prompt)
    if (q.prompt.includes('×') && !q.prompt.startsWith('Which')) { between(a, 2, 9); expect(a <= 5 || b <= 5).toBe(true) }
    if (q.unit === 'apples') expect(a <= 5 || b <= 5).toBe(true)
    if (level >= 4 && q.prompt.startsWith('Which expression')) {
      expect(a * b).toBeGreaterThan(a + b); expect(a * b).toBeGreaterThan(a * 2); expect(a * b).toBeGreaterThan(b * 2)
    }
    if (q.kind === 'fill') between(Number(q.answer), 1, 81)
  },
  'g2-time': (q) => {
    for (const time of q.prompt.matchAll(/\b(\d+):(\d{2})\b/g)) { between(Number(time[1]), 1, 12); between(Number(time[2]), 0, 59) }
    if (q.prompt.includes('started her homework')) {
      const [start, end] = [...q.prompt.matchAll(/7:(\d{2})/g)].map((match) => Number(match[1]))
      close(Number(q.answer), end - start)
    }
    if (q.kind === 'choice' && /^On a clock/.test(q.prompt)) expect(q.answer).toMatch(/^(?:[1-9]|1[0-2]):(?:00|30)$/)
  },
  'g2-measure': nonnegative,
  'g2-money': nonnegative,
  'g3-multable': (q, level) => {
    if (q.kind === 'fill' && q.prompt.includes('×')) {
      const [a, b] = numbers(q.prompt)
      between(a, 1, level === 1 ? 5 : 9)
      between(b, 1, q.prompt.includes('(  )') ? 81 : level === 1 ? 5 : 9)
      if (level === 2) expect(a >= 6 || b >= 6).toBe(true)
      if (q.prompt.startsWith('Given')) between(numbers(q.prompt)[4], 1, 9)
    }
    if (q.prompt.startsWith('Which expression')) { const [a, b, , c] = numbers(q.prompt); expect(new Set([a * b, a * c, b * c]).size).toBe(3) }
  },
  'g3-division': (q) => {
    const rem = q.prompt.match(/remainder of (\d+) ÷ (\d+)/)
    if (rem) { close(Number(q.answer), Number(rem[1]) % Number(rem[2])); between(Number(q.answer), 1, Number(rem[2]) - 1) }
    const div = q.prompt.match(/^(\d+) ÷ (\d+) = quotient/)
    if (div) close(Number(q.answer), Math.floor(Number(div[1]) / Number(div[2])))
    if (q.prompt.includes(' R ')) {
      const [a, b, quotient, remainder] = numbers(q.prompt)
      expect(q.answer).toBe(String(a === b * quotient + remainder && remainder < b))
      expect(q.explanation).toContain(`correct result is ${Math.floor(a / b)} R ${a % b}.`)
    }
  },
  'g3-mixed': (q) => {
    if (q.kind === 'fill') { between(Number(q.answer), 0, 1000); expect(Number.isInteger(Number(q.answer))).toBe(true) }
    const match = q.prompt.match(/^\((\d+) − (\d+)\)/)
    if (match) expect(Number(match[1])).toBeGreaterThanOrEqual(Number(match[2]))
  },
  'g3-fraction': (q, level) => {
    if (level === 1 && q.kind === 'choice') expect(q.answer).toMatch(/^1\/\d+$/)
    if (level <= 3) expect(q.prompt).not.toMatch(/\d+\/\d+ [+−]/)
    nonnegative(q, level)
  },
  'g3-perimeter': (q) => {
    const [a, b, c] = numbers(q.prompt)
    if (q.prompt.startsWith('A triangle has sides')) { expect(a + b).toBeGreaterThan(c); expect(a + c).toBeGreaterThan(b); expect(b + c).toBeGreaterThan(a); close(Number(q.answer), a + b + c) }
    nonnegative(q, 1)
  },
  'g3-calendar': (q) => {
    if (q.prompt.startsWith('A train')) { const [start, duration] = numbers(q.prompt); between(Number(q.answer), 0, 23); expect(Number(q.answer)).toBe((start + 12 + duration) % 24) }
  },
  'g4-bignum': nonnegative,
  'g4-multidigit': (q, level) => {
    const [a, b] = numbers(q.prompt)
    if (level === 1) { between(a, 10, 99); expect(b % 10).toBe(0) }
    if (level === 2 && /^\d+ ×/.test(q.prompt) && b % 10 !== 0) between(a, 100, 999)
  },
  'g4-division2': (q, level) => {
    const [a, b] = numbers(q.prompt)
    if (level === 1) { between(a, 10, 999); expect(b % 10).toBe(0) }
    if (level === 2) { between(b, 10, 99); expect(a >= 100 ? Math.floor(a / 10) : a).toBeGreaterThanOrEqual(b) }
    if (/remainder of/.test(q.prompt)) { close(Number(q.answer), a % b); between(Number(q.answer), 0, b - 1) }
    if (/quotient of/.test(q.prompt)) close(Number(q.answer), Math.floor(a / b))
  },
  'g4-fraction-ops': nonnegative,
  'g4-decimal': nonnegative,
  'g4-geometry': (q) => {
    if (q.prompt.startsWith('A full turn')) { close(Number(q.answer), 360 / numbers(q.prompt)[0]); expect(Number.isInteger(Number(q.answer))).toBe(true) }
  },
  'g5-decimal-ops': nonnegative,
  'g5-fraction-muldiv': (q) => {
    const [a, n, d] = numbers(q.prompt)
    if (q.prompt.startsWith('A rope')) close(Number(q.answer), a * n / d)
    if (q.prompt.includes('tons were taken')) close(Number(q.answer), a * d / n)
  },
  'g5-factors': nonnegative,
  'g5-area-volume': nonnegative,
  'g5-percent': (q, level) => {
    if (level <= 2) expect(q.prompt).not.toMatch(/as a fraction|% of|A class/)
    if (level <= 3) expect(q.prompt).not.toMatch(/% of|A class/)
    const [a, b] = numbers(q.prompt)
    if (q.prompt.startsWith('A class')) close(Number(q.answer), Math.round(b / a * 1000) / 10)
    if (q.prompt.startsWith('A book')) { close(Number(q.answer), a * b / 100); expect(Number.isInteger(Number(q.answer))).toBe(true) }
  },
  'g5-equation': nonnegative,
  'g6-fraction-mixed': (q) => {
    if (q.prompt.startsWith('A shipment')) { const [total, n1, d, n2] = numbers(q.prompt); close(Number(q.answer), total * (d - n1 - n2) / d) }
  },
  'g6-ratio': (q) => {
    if (q.prompt.startsWith('Share')) { const [total, a, b] = numbers(q.prompt); expect(a).not.toBe(b); close(Number(q.answer), total / (a + b) * (q.prompt.includes('bigger') ? Math.max(a, b) : Math.min(a, b))) }
  },
  'g6-percent-app': nonnegative,
  'g6-circle': (q, level) => {
    if (level === 1) expect(q.prompt).not.toMatch(/circumference|area/)
    if (level === 2) expect(q.prompt).not.toMatch(/area/)
    nonnegative(q, level)
  },
  'g6-negative': (q) => {
    if (q.prompt.includes('below zero')) expect(Number(q.answer)).toBe(-numbers(q.prompt)[0])
    if (/^\d+ \+ \(−\d+\)/.test(q.prompt)) { const [a, b] = numbers(q.prompt); close(Number(q.answer), a - b) }
  },
  'g6-algebra': nonnegative,
}

describe('Every curriculum level respects its exercise constraints', () => {
  afterEach(() => jest.restoreAllMocks())
  it('has an explicit contract for all 36 topics and all 180 levels', () => {
    expect(topics).toHaveLength(36)
    expect(cases).toHaveLength(180)
    expect(Object.keys(contracts).sort()).toEqual(topics.map((topic) => topic.id).sort())
  })
  it.each(cases)('$topic.id level $level: $goal', ({ topic, level, questionCount }) => {
    let seed = 12345 + topic.grade * 100 + level
    jest.spyOn(Math, 'random').mockImplementation(() => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
      return seed / 2 ** 32
    })
    const check = (q: Question): void => {
      for (const text of [q.prompt, q.answer, q.explanation]) expect(text).not.toMatch(/NaN|undefined|Infinity/)
      if (q.kind === 'choice') {
        expect(q.options).toContain(q.answer)
        expect(new Set(q.options).size).toBe(q.options?.length)
        expect(q.options!.length).toBeGreaterThanOrEqual(2)
      }
      if (q.kind === 'judge') expect(['true', 'false']).toContain(q.answer)
      checkArithmetic(q)
      contracts[topic.id](q, level)
    }
    const build = core.buildQuestionSet
    // Exercise every maker directly: rotation and de-duplication must not hide a bad branch.
    const spy = jest.spyOn(core, 'buildQuestionSet').mockImplementation((count, makers, exclude) => {
      for (const maker of makers) for (let sample = 0; sample < 64; sample += 1) check(maker())
      return build(count, makers, exclude)
    })
    const first = topic.generate(level, questionCount)
    spy.mockRestore()
    const second = topic.generate(level, questionCount, first.map((q) => q.prompt))
    for (const set of [first, second]) {
      expect(set).toHaveLength(questionCount)
      expect(new Set(set.map((q) => q.id)).size).toBe(questionCount)
      set.forEach(check)
    }
  })
})
