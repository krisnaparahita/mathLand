import {
  buildLevels,
  buildQuestionSet,
  fracStr,
  gcd,
  makeChoice,
  makeFill,
  makeJudge,
  rng,
} from './core'
import type { Question, Topic } from './types'

/** Format a number with thousands separators for display, such as 1,234,567 */
const withCommas = (n: number): string => n.toLocaleString('en-US')

/* ══════════════════════════════════════════════
   1. Large numbers
   ══════════════════════════════════════════════ */

const bigNumber: Topic = {
  id: 'g4-bignum',
  grade: 4,
  name: 'Large Numbers',
  color: 'indigo',
  icon: 'Hash',
  summary: 'Work with numbers beyond ten thousand: read and write them, rewrite them in thousands and millions, and round them.',
  explanation: [
    {
      title: 'The place value chart',
      body: 'Each place is worth 10 times the place to its right. From right to left the places are ones, tens, hundreds, thousands, ten thousands, hundred thousands, millions, ten millions, hundred millions, billions…',
      example: '12,345,678 → 1 ten million, 2 millions, 3 hundred thousands, 4 ten thousands, 5 thousands, 6 hundreds, 7 tens, 8 ones',
    },
    {
      title: 'Reading numbers',
      body: 'Split the digits into groups of three from the right, and read each group from the left followed by its name (thousand, million…). Do not read a group that is all zeros.',
      example: '40,080,030 is read "forty million, eighty thousand, thirty"',
    },
    {
      title: 'Rewriting and rounding',
      body: 'To rewrite a number in thousands, drop the last 3 zeros and say "thousand"; in millions, drop the last 6 zeros and say "million". To round, look at the digit just after the place you are rounding to: if it is less than 5, round down, and if it is 5 or more, round up.',
      example: '384,400 rounded to the nearest thousand is 384,000 (the hundreds digit is 4, so round down)',
    },
  ],
  smartMethods: [
    {
      name: 'Group in threes',
      when: 'Reading and writing large numbers',
      steps: ['Split the digits into groups of three from the right', 'Read the millions group first, then thousands, then ones', 'Skip any group that is all zeros'],
      example: '384|400 → three hundred eighty-four thousand, four hundred',
    },
    {
      name: 'Look at one digit to round',
      when: 'Rounding a number',
      steps: ['Decide which place you are rounding to', 'Look at the digit just after it', 'Less than 5 rounds down, 5 or more rounds up'],
      example: '384,400 to the nearest thousand: the hundreds digit is 4, so round down → 384,000',
    },
    {
      name: 'Drop the zeros, add the word',
      when: 'Rewriting a round number in thousands or millions',
      steps: ['Count the zeros at the end', 'Drop 3 zeros for thousands (6 for millions)', 'Write the word "thousand" (or "million") after it'],
      example: '560,000 → 560 thousand',
    },
  ],
  levels: buildLevels(4, [
    'Place value and counting units',
    'Reading and writing large numbers',
    'Rewriting numbers in thousands and millions',
    'Rounding large numbers',
    'Large number word problems',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const base = level >= 3 ? 10000 : 1000
      const baseName = level >= 3 ? 'ten thousand' : 'one thousand'
      const answerName = level >= 3 ? 'one hundred thousand' : 'ten thousand'
      return makeFill({
        prompt: `What is 10 times ${baseName}? Enter the number.`,
        answer: base * 10,
        explanation: `Each place is worth 10 times the place to its right, so 10 × ${withCommas(base)} = ${withCommas(base * 10)}, which is ${answerName}.`,
        smartTip: 'Group in threes',
      })
    })

    makers.push(() => {
      const k = rng.int(1, [9, 99, 999, 9999, 9999][level - 1])
      return makeFill({
        prompt: `${withCommas(k)} thousand = (  )? Enter the full number.`,
        answer: k * 1000,
        explanation: `1 thousand = 1,000, so ${withCommas(k)} × 1,000 = ${withCommas(k * 1000)}.`,
        smartTip: 'Drop the zeros, add the word',
      })
    })

    makers.push(() => {
      const value = rng.int(1, [9, 99, 999, 9999, 9999][level - 1]) * 1000
      return makeFill({
        prompt: `Write ${withCommas(value)} in thousands. How many thousand is it?`,
        answer: value / 1000,
        unit: 'thousand',
        explanation: `Drop the last 3 zeros and add the word "thousand": ${withCommas(value)} = ${withCommas(value / 1000)} thousand.`,
        smartTip: 'Drop the zeros, add the word',
      })
    })

    makers.push(() => {
      const k = rng.int(1, [9, 99, 999, 9999, 9999][level - 1])
      const rest = rng.int(1, 999)
      return makeFill({
        prompt: `A number is made of ${withCommas(k)} thousands and ${rest} ones. What is the number?`,
        answer: k * 1000 + rest,
        explanation: `${withCommas(k)} thousands is ${withCommas(k * 1000)}. Add ${rest} ones and the number is ${withCommas(k * 1000 + rest)}.`,
        smartTip: 'Group in threes',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const value = rng.int(1, 9999) * 1000 + rng.int(0, 999)
        return makeFill({
          prompt: `Write ${withCommas(value)} in thousands. How many thousand is it?`,
          answer: value / 1000,
          unit: 'thousand',
          explanation: `Move the decimal point 3 places to the left: ${withCommas(value)} → ${value / 1000} thousand.`,
          smartTip: 'Drop the zeros, add the word',
        })
      })
    }

    if (level >= 2) {
      makers.push(() => {
        const k = rng.int(12, 98)
        const rest = rng.int(1, 999)
        const value = k * 1000 + rest
        const hundredsDigit = Math.floor(rest / 100)
        const rounded = hundredsDigit >= 5 ? k + 1 : k
        return makeFill({
          prompt: `Round ${withCommas(value)} to the nearest thousand.`,
          answer: rounded * 1000,
          explanation: `Look at the hundreds digit, ${hundredsDigit}. ${hundredsDigit >= 5 ? '5 or more rounds up' : 'Less than 5 rounds down'}, so the answer is ${withCommas(rounded * 1000)}.`,
          smartTip: 'Look at one digit to round',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const m = rng.int(1, 99)
        const value = m * 1000000
        return makeFill({
          prompt: `Write ${withCommas(value)} in millions. How many million is it?`,
          answer: m,
          unit: 'million',
          explanation: `Drop the last 6 zeros and add the word "million": ${withCommas(value)} = ${m} million.`,
          smartTip: 'Drop the zeros, add the word',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const digit = rng.int(0, 9)
        const base = rng.int(10, 99) * 1000
        const value = base + digit * 100 + rng.int(0, 99)
        const rounded = digit >= 5 ? base / 1000 + 1 : base / 1000
        return makeChoice({
          prompt: `${withCommas(value)} ≈ (  ) thousand`,
          answer: `${rounded} thousand`,
          wrong: [`${rounded + 1} thousand`, `${base / 1000} thousand`, `${rounded - 1} thousand`],
          explanation: `The hundreds digit is ${digit}. ${digit >= 5 ? '5 or more rounds up' : 'Less than 5 rounds down'}, so it is about ${rounded} thousand.`,
          smartTip: 'Look at one digit to round',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const cases: Array<[string, string, string[]]> = [
          ['The highest digit of a number is in the millions place. How many digits does the number have?', '7 digits', ['6 digits', '8 digits', '5 digits']],
          ['What is 10 × 100,000?', '1,000,000', ['100,000', '10,000,000', '1,000,000,000']],
          ['How many thousands are in one million?', '1,000', ['100', '10', '10,000']],
          ['What number is 1 more than the largest eight-digit number?', '100,000,000', ['99,999,999', '10,000,001', '9,999,999']],
        ]
        const [prompt, answer, wrong] = rng.pick(cases)
        return makeChoice({
          prompt,
          answer,
          wrong,
          explanation: `The correct answer is ${answer}. Remember the order of the places: ones, tens, hundreds, thousands, ten thousands, hundred thousands, millions, ten millions, hundred millions.`,
          smartTip: 'Group in threes',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   2. Multiplying by two-digit numbers
   ══════════════════════════════════════════════ */

const multiDigit: Topic = {
  id: 'g4-multidigit',
  grade: 4,
  name: 'Multi-Digit Multiplication',
  color: 'orange',
  icon: 'X',
  summary: 'Master written multiplication of three-digit by two-digit numbers, and understand how the product changes and how to estimate.',
  explanation: [
    {
      title: 'Written multiplication',
      body: 'First multiply the three-digit number by the ones digit of the two-digit number. Then multiply it by the tens digit (line up the last digit of this result with the tens place). Finally add the two products.',
      example: '145 × 12 = 145 × 2 + 145 × 10 = 290 + 1,450 = 1,740',
    },
    {
      title: 'How the product changes',
      body: 'If one factor stays the same and the other factor is multiplied (or divided) by some number, the product is multiplied (or divided) by the same number.',
      example: '6 × 20 = 120, so 6 × 40 = 240',
    },
    {
      title: 'Estimating products',
      body: 'To estimate, round each factor to a nearby ten or hundred, then multiply. Use "≈" to show an estimate.',
      example: '298 × 31 ≈ 300 × 30 = 9,000',
    },
  ],
  smartMethods: [
    {
      name: 'Multiply in steps, then add',
      when: 'Doing written three-digit by two-digit multiplication',
      steps: ['Multiply by the ones digit to get the first product', 'Multiply by the tens digit, lining up its last digit with the tens place', 'Add the two products'],
      example: '145 × 12 → 290 + 1,450 = 1,740',
    },
    {
      name: 'How the product changes',
      when: 'You know one product and need another',
      steps: ['Find how many times bigger (or smaller) a factor became', 'Make the product the same number of times bigger (or smaller)', 'No need to work it out again from scratch'],
      example: 'Given 25 × 4 = 100, then 25 × 12 = 300',
    },
    {
      name: 'Round to estimate',
      when: 'You only need a rough result',
      steps: ['Round both factors to a nearby ten or hundred', 'Multiply the rounded numbers', 'Write the result with the approximately-equal sign'],
      example: '412 × 19 ≈ 400 × 20 = 8,000',
    },
  ],
  levels: buildLevels(4, [
    'Multiply two-digit numbers by multiples of ten and a hundred',
    'Written three-digit by two-digit multiplication',
    'How the product changes',
    'Estimating products',
    'Multiplication word problems',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const a = rng.int(11, 99)
      const b = rng.pick([10, 20, 30, 40, 50, 100, 200, 300])
      return makeFill({
        prompt: `${a} × ${b} = ?`,
        answer: a * b,
        explanation: `First work out ${a} × ${b / 10} = ${a * (b / 10)}, then add a 0 on the end (or the matching number of zeros) to get ${a * b}.`,
        smartTip: 'Multiply in steps, then add',
      })
    })

    makers.push(() => {
      const a = rng.int(101, [399, 599, 799, 999, 999][level - 1])
      const b = rng.int(11, [29, 49, 69, 89, 99][level - 1])
      return makeFill({
        prompt: `${a} × ${b} = ?`,
        answer: a * b,
        explanation: `Split it up: ${a} × ${b % 10} = ${a * (b % 10)} and ${a} × ${Math.floor(b / 10) * 10} = ${a * Math.floor(b / 10) * 10}. Adding them gives ${a * b}.`,
        smartTip: 'Multiply in steps, then add',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const a = rng.int(11, 99)
        const b = rng.int(11, 99)
        const product = a * b
        return makeChoice({
          prompt: `${a} × ${b} = ?`,
          answer: String(product),
          wrong: [String(product + a), String(product - a), String(product + 10)],
          explanation: `${a} × ${b} = ${product}. You can split it as ${a} × ${b % 10} + ${a} × ${Math.floor(b / 10) * 10} = ${a * (b % 10)} + ${a * Math.floor(b / 10) * 10} = ${product}.`,
          smartTip: 'Multiply in steps, then add',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const a = rng.int(12, 60)
        const b = rng.int(3, 9)
        const factor = rng.pick([2, 3, 4, 5])
        return makeFill({
          prompt: `Given ${a} × ${b} = ${a * b}, what is ${a} × ${b * factor}?`,
          answer: a * b * factor,
          explanation: `One factor, ${a}, stays the same and the other factor becomes ${factor} times bigger, so the product becomes ${factor} times bigger: ${a * b} × ${factor} = ${a * b * factor}.`,
          smartTip: 'How the product changes',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const a = rng.int(2, 9) * 100 + rng.int(1, 99)
        const b = rng.int(2, 9) * 10 + rng.int(1, 9)
        const approxA = Math.round(a / 100) * 100
        const approxB = Math.round(b / 10) * 10
        return makeChoice({
          prompt: `About how much is ${a} × ${b}? Pick the best estimate.`,
          answer: String(approxA * approxB),
          wrong: [
            String(Math.round(approxA / 100) * 100 * b),
            String(a * approxB),
            String((approxA + 100) * approxB),
          ],
          explanation: `Round ${a} to ${approxA} and ${b} to ${approxB}. ${approxA} × ${approxB} = ${approxA * approxB}.`,
          smartTip: 'Round to estimate',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const price = rng.int(101, 499)
        const count = rng.int(11, 49)
        return makeFill({
          prompt: `An electric fan costs ${price} dollars. A school buys ${count} fans. How many dollars does it spend in all?`,
          answer: price * count,
          unit: 'dollars',
          explanation: `Unit price × quantity = total price: ${price} × ${count} = ${price * count} dollars.`,
          smartTip: 'Multiply in steps, then add',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const speed = rng.int(60, 95)
        const hours = rng.int(11, 29)
        return makeJudge({
          prompt: `True or false: A car travels ${speed} km every hour. In ${hours} hours it travels ${speed * hours + speed} km.`,
          correct: false,
          explanation: `Distance = speed × time = ${speed} × ${hours} = ${speed * hours} km, not ${speed * hours + speed} km.`,
          smartTip: 'How the product changes',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   3. Dividing by two-digit numbers
   ══════════════════════════════════════════════ */

const division2: Topic = {
  id: 'g4-division2',
  grade: 4,
  name: 'Two-Digit Division',
  color: 'green',
  icon: 'Divide',
  summary: 'Master estimating quotients when dividing by two-digit numbers, and understand how the quotient stays the same and division with a remainder.',
  explanation: [
    {
      title: 'Start from the highest place',
      body: 'When the divisor is a two-digit number, look at the first two digits of the dividend. If they are too small to divide, look at the first three digits. Write each quotient digit above the last digit you used.',
      example: '576 ÷ 18: the first two digits, 57, are enough, so the first digit of the quotient is in the tens place',
    },
    {
      title: 'Trial quotients',
      body: 'Round the divisor to a nearby ten to try a quotient. If you round the divisor down, the trial quotient tends to be too big and needs lowering. If you round it up, the trial quotient tends to be too small and needs raising.',
      example: '576 ÷ 18: treat 18 as 20 and try 2 with 21 left over, which is too small, so raise it to 3',
    },
    {
      title: 'The quotient stays the same',
      body: 'If you multiply or divide both the dividend and the divisor by the same number (not 0), the quotient stays the same, but the remainder changes with it.',
      example: '80 ÷ 20 = 8 ÷ 2 = 4',
    },
  ],
  smartMethods: [
    {
      name: 'Round the divisor to try a quotient',
      when: 'The divisor is two digits and a quotient is hard to see',
      steps: ['Round the divisor to a nearby ten', 'Use that ten to guess a quotient', 'Work it out; if the quotient is too big lower it, and if too small raise it'],
      example: 'Treat 18 as 20, and 43 as 40',
    },
    {
      name: 'Shrink or grow both together',
      when: 'The dividend and divisor both end in zeros',
      steps: ['Drop the same number of zeros from the dividend and the divisor', 'The quotient stays the same', 'If there is a remainder, put the same number of zeros back on it'],
      example: '800 ÷ 20 = 80 ÷ 2 = 40',
    },
    {
      name: 'Check: quotient × divisor + remainder',
      when: 'After finishing a division with a remainder',
      steps: ['Multiply the quotient by the divisor', 'Add the remainder', 'See whether it equals the dividend'],
      example: 'Quotient 12 remainder 5, divisor 20 → 12 × 20 + 5 = 245',
    },
  ],
  levels: buildLevels(4, [
    'Divide two- and three-digit numbers by multiples of ten',
    'Two-digit division (first digits big enough)',
    'Two-digit division (adjusting the quotient)',
    'The quotient stays the same',
    'Division word problems',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const divisor = rng.pick([10, 20, 30, 40, 50, 60, 70, 80, 90])
      const quotient = rng.int(2, [9, 9, 12, 15, 20][level - 1])
      const dividend = divisor * quotient
      return makeFill({
        prompt: `${dividend} ÷ ${divisor} = ?`,
        answer: quotient,
        explanation: `Think multiplication: ${divisor} × ${quotient} = ${dividend}, so the quotient is ${quotient}.`,
        smartTip: 'Shrink or grow both together',
      })
    })

    makers.push(() => {
      const divisor = rng.int(11, [29, 49, 69, 89, 99][level - 1])
      const quotient = rng.int(2, [9, 12, 15, 20, 25][level - 1])
      const dividend = divisor * quotient
      return makeFill({
        prompt: `${dividend} ÷ ${divisor} = ?`,
        answer: quotient,
        explanation: `Try a quotient: treat ${divisor} as ${Math.round(divisor / 10) * 10}. ${divisor} × ${quotient} = ${dividend}, so the quotient is ${quotient}.`,
        smartTip: 'Round the divisor to try a quotient',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const divisor = rng.int(11, 49)
        const quotient = rng.int(3, 20)
        const remainder = rng.int(1, divisor - 1)
        const dividend = divisor * quotient + remainder
        return makeFill({
          prompt: `What is the quotient of ${dividend} ÷ ${divisor}? (Enter only the quotient.)`,
          answer: quotient,
          explanation: `${divisor} × ${quotient} = ${divisor * quotient} and ${dividend} − ${divisor * quotient} = ${remainder} (the remainder ${remainder} < ${divisor}), so the quotient is ${quotient}.`,
          smartTip: 'Check: quotient × divisor + remainder',
        })
      })
    }

    if (level >= 2) {
      makers.push(() => {
        const divisor = rng.int(11, 49)
        const quotient = rng.int(3, 20)
        const remainder = rng.int(1, divisor - 1)
        const dividend = divisor * quotient + remainder
        return makeFill({
          prompt: `What is the remainder of ${dividend} ÷ ${divisor}?`,
          answer: remainder,
          explanation: `${divisor} × ${quotient} = ${divisor * quotient} and ${dividend} − ${divisor * quotient} = ${remainder}, so the remainder is ${remainder}.`,
          smartTip: 'Check: quotient × divisor + remainder',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const divisor = rng.int(12, 45)
        const quotient = rng.int(4, 18)
        const dividend = divisor * quotient
        return makeChoice({
          prompt: `${dividend} ÷ ${divisor} = ?`,
          answer: String(quotient),
          wrong: [String(quotient + 1), String(quotient - 1), String(quotient + 2)],
          explanation: `Try a quotient and check: ${divisor} × ${quotient} = ${dividend}, so it divides exactly and the quotient is ${quotient}.`,
          smartTip: 'Round the divisor to try a quotient',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const a = rng.int(3, 9)
        const b = rng.int(2, 9)
        const factor = rng.pick([10, 100])
        return makeFill({
          prompt: `Given ${a * b} ÷ ${b} = ${a}, what is ${a * b * factor} ÷ ${b * factor}?`,
          answer: a,
          explanation: `The dividend and the divisor are both multiplied by ${factor}, so the quotient stays the same at ${a}.`,
          smartTip: 'Shrink or grow both together',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const total = rng.int(200, 900)
        const perBox = rng.int(11, 45)
        const boxes = Math.floor(total / perBox)
        const remainder = total % perBox
        return makeFill({
          prompt: `There are ${total} eggs and each box holds ${perBox} eggs. How many full boxes can be packed?`,
          answer: boxes,
          unit: 'boxes',
          explanation: `${total} ÷ ${perBox} = ${boxes} R ${remainder}. The ${remainder} left over are not enough for another box, so ${boxes} full boxes can be packed.`,
          smartTip: 'Check: quotient × divisor + remainder',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const speed = rng.int(45, 85)
        const distance = speed * rng.int(3, 9)
        return makeFill({
          prompt: `Two cities are ${distance} km apart. A car travels ${speed} km every hour. How many hours does it take to get there?`,
          answer: distance / speed,
          unit: 'hours',
          explanation: `Time = distance ÷ speed = ${distance} ÷ ${speed} = ${distance / speed} hours.`,
          smartTip: 'Shrink or grow both together',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   4. Adding and subtracting fractions
   ══════════════════════════════════════════════ */

const fractionOps: Topic = {
  id: 'g4-fraction-ops',
  grade: 4,
  name: 'Adding and Subtracting Fractions',
  color: 'pink',
  icon: 'PieChart',
  summary: 'Master simplifying, finding common denominators, adding and subtracting fractions with different denominators, and comparing fractions.',
  explanation: [
    {
      title: 'Simplifying and simplest form',
      body: 'Dividing the numerator and the denominator of a fraction by a common factor does not change its value. This is called simplifying. When the only common factor is 1, the fraction is in simplest form.',
      example: '6/8 = 3/4 (divide the numerator and denominator by 2)',
    },
    {
      title: 'Common denominators',
      body: 'Changing fractions with different denominators into equal fractions with the same denominator is called finding a common denominator. We usually use the least common multiple of the two denominators.',
      example: '1/2 and 1/3 → 3/6 and 2/6',
    },
    {
      title: 'Adding and subtracting with different denominators',
      body: 'First find a common denominator so the fractions have the same denominator, then add or subtract as you do with the same denominator. Finally simplify the answer.',
      example: '1/2 + 1/3 = 3/6 + 2/6 = 5/6',
    },
  ],
  smartMethods: [
    {
      name: 'Divide out common factors',
      when: 'You need a fraction in simplest form',
      steps: ['Find a common factor of the numerator and denominator', 'Divide both by it', 'Keep going until the only common factor is 1'],
      example: '12/18 → divide by 6 → 2/3',
    },
    {
      name: 'Least common multiple',
      when: 'Adding or subtracting fractions with different denominators',
      steps: ['Find the least common multiple of the two denominators', 'Change each fraction to one with that denominator', 'Add or subtract the numerators and keep the denominator'],
      example: '2/3 + 1/4 → 8/12 + 3/12 = 11/12',
    },
    {
      name: 'Cross-multiply to compare',
      when: 'Comparing two fractions with different denominators',
      steps: ['Multiply the first numerator by the second denominator', 'Multiply the second numerator by the first denominator', 'Compare the two products; the fraction on the side with the bigger product is bigger'],
      example: '2/3 and 3/5: 2 × 5 = 10 and 3 × 3 = 9, so 2/3 > 3/5',
    },
  ],
  levels: buildLevels(4, [
    'Simplifying and simplest form',
    'Add and subtract with the same denominator',
    'Add and subtract with different denominators',
    'Comparing fractions',
    'Fraction word problems',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const factor = rng.int(2, [4, 6, 8, 9, 12][level - 1])
      const simpN = rng.int(1, 8)
      const simpD = simpN + rng.int(1, 6)
      const n = simpN * factor
      const d = simpD * factor
      return makeFill({
        prompt: `Simplify ${n}/${d} to its simplest form. Write it as numerator/denominator.`,
        answer: fracStr(n, d),
        explanation: `Divide the numerator and denominator by ${factor}: ${n} ÷ ${factor} = ${n / factor} and ${d} ÷ ${factor} = ${d / factor}, giving ${fracStr(n, d)}.`,
        smartTip: 'Divide out common factors',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const d = rng.int(5, 15)
        const a = rng.int(1, d - 2)
        const b = rng.int(1, Math.max(1, d - a - 1))
        return makeFill({
          prompt: `${a}/${d} + ${b}/${d} = ? Write it in simplest form as numerator/denominator (write a whole number as just the number).`,
          answer: fracStr(a + b, d),
          explanation: `Add fractions with the same denominator by adding the numerators and keeping the denominator: ${a} + ${b} = ${a + b}, giving ${a + b}/${d}, which simplifies to ${fracStr(a + b, d)}.`,
          smartTip: 'Least common multiple',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const d1 = rng.pick([2, 3, 4])
        const d2 = rng.pick([5, 6, 8].filter((x) => x !== d1))
        const lcm = (d1 * d2) / gcd(d1, d2)
        const a = rng.int(1, d1 - 1)
        const b = rng.int(1, d2 - 1)
        return makeFill({
          prompt: `${a}/${d1} + ${b}/${d2} = ? Write it in simplest form as numerator/denominator.`,
          answer: fracStr(a * (lcm / d1) + b * (lcm / d2), lcm),
          explanation: `First use ${lcm} as the common denominator: ${a}/${d1} = ${a * (lcm / d1)}/${lcm} and ${b}/${d2} = ${b * (lcm / d2)}/${lcm}. Adding gives ${a * (lcm / d1) + b * (lcm / d2)}/${lcm}, which simplifies to ${fracStr(a * (lcm / d1) + b * (lcm / d2), lcm)}.`,
          smartTip: 'Least common multiple',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const d = rng.int(6, 15)
        const a = rng.int(3, d - 1)
        const b = rng.int(1, a - 1)
        return makeFill({
          prompt: `${a}/${d} − ${b}/${d} = ? Write it in simplest form as numerator/denominator.`,
          answer: fracStr(a - b, d),
          explanation: `Subtract fractions with the same denominator by subtracting the numerators and keeping the denominator: ${a} − ${b} = ${a - b}, giving ${a - b}/${d}, which simplifies to ${fracStr(a - b, d)}.`,
          smartTip: 'Least common multiple',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const d1 = rng.int(2, 9)
        const d2 = rng.int(2, 9)
        if (d1 === d2) return makers[0]()
        const a = rng.int(1, d1 - 1)
        const b = rng.int(1, d2 - 1)
        const left = a * d2
        const right = b * d1
        const symbol = left > right ? '>' : left < right ? '<' : '='
        return makeChoice({
          prompt: `${a}/${d1} ○ ${b}/${d2}. What goes in the circle?`,
          answer: symbol,
          wrong: [symbol === '>' ? '<' : symbol === '<' ? '>' : '>', '=', '≠'],
          explanation: `Cross-multiply: ${a} × ${d2} = ${left} and ${b} × ${d1} = ${right}. ${left > right ? `${left} > ${right}` : left < right ? `${left} < ${right}` : 'They are equal'}, so write ${symbol}.`,
          smartTip: 'Cross-multiply to compare',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const d = rng.int(4, 12)
        const a = rng.int(1, d - 2)
        const b = rng.int(1, Math.max(1, d - a - 1))
        return makeFill({
          prompt: `A farmer plowed ${a}/${d} of a field in the morning and ${b}/${d} in the afternoon. What fraction of the field is still not plowed? Write it in simplest form as numerator/denominator (write 0 if nothing is left).`,
          answer: fracStr(d - a - b, d),
          explanation: `Think of the whole field as 1 = ${d}/${d}. ${a + b}/${d} is plowed, so ${d}/${d} − ${a + b}/${d} = ${d - a - b}/${d} is left, which simplifies to ${fracStr(d - a - b, d)}.`,
          smartTip: 'Least common multiple',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const d1 = 2
        const d2 = rng.pick([4, 6, 8, 10])
        const a = 1
        const b = rng.int(1, d2 - 1)
        const lcm = d2
        return makeJudge({
          prompt: `True or false: ${a}/${d1} + ${b}/${d2} = ${a + b}/${d1 + d2}`,
          correct: false,
          explanation: `With different denominators you cannot just add the numerators and the denominators separately. Find a common denominator first: ${a}/${d1} = ${a * (lcm / d1)}/${lcm}, and adding ${b}/${d2} gives ${fracStr(a * (lcm / d1) + b, lcm)}.`,
          smartTip: 'Least common multiple',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   5. Introduction to decimals
   ══════════════════════════════════════════════ */

const decimal: Topic = {
  id: 'g4-decimal',
  grade: 4,
  name: 'Introduction to Decimals',
  color: 'purple',
  icon: 'Percent',
  summary: 'Understand the meaning and properties of decimals, compare decimals, and add and subtract them.',
  explanation: [
    {
      title: 'What decimals mean',
      body: 'Fractions with a denominator of 10, 100, 1,000 … can be written as decimals. The first digit after the decimal point is the tenths place, the second is the hundredths place and the third is the thousandths place.',
      example: '3/10 = 0.3, 27/100 = 0.27',
    },
    {
      title: 'A property of decimals',
      body: 'Adding zeros to the end of a decimal, or removing them, does not change its value. You can use this to simplify a decimal.',
      example: '0.50 = 0.5, 2.300 = 2.3',
    },
    {
      title: 'Adding and subtracting decimals',
      body: 'To add or subtract decimals, line up the decimal points (so matching place values line up), calculate as with whole numbers, and put the decimal point in the answer.',
      example: '3.25 + 1.7 = 3.25 + 1.70 = 4.95',
    },
  ],
  smartMethods: [
    {
      name: 'Line up the place values',
      when: 'Adding or subtracting decimals',
      steps: ['First line up the decimal points', 'Add zeros at the end if the numbers have different lengths', 'Calculate as with whole numbers'],
      example: '3.25 + 1.7 → 3.25 + 1.70 = 4.95',
    },
    {
      name: 'Drop the extra zeros',
      when: 'A decimal has zeros at the end',
      steps: ['Check for zeros at the end of the decimal', 'Remove all the zeros at the end', 'The value does not change'],
      example: '2.300 = 2.3',
    },
    {
      name: 'Compare from the left',
      when: 'Comparing decimals',
      steps: ['Compare the whole number parts first', 'If they are the same, compare the tenths', 'Keep comparing one place at a time'],
      example: '3.25 and 3.3: the whole parts match, tenths 2 < 3, so 3.25 < 3.3',
    },
  ],
  levels: buildLevels(4, [
    'Meaning of decimals, reading and writing',
    'Properties of decimals and simplifying',
    'Comparing decimals',
    'Adding and subtracting decimals',
    'Decimal word problems',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const n = rng.int(1, 99)
      const denom = rng.pick([10, 100])
      return makeFill({
        prompt: `Write ${n}/${denom} as a decimal.`,
        answer: n / denom,
        explanation: `The denominator is ${denom}, so the decimal has ${denom === 10 ? 'one decimal place' : 'two decimal places'}: ${n}/${denom} = ${n / denom}.`,
        smartTip: 'Drop the extra zeros',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const whole = rng.int(1, 9)
        const frac = rng.pick([10, 20, 30, 50, 60, 70, 80, 90, 40])
        return makeFill({
          prompt: `Write ${whole}.${frac} as a decimal in simplest form.`,
          answer: whole + frac / 100,
          explanation: `Remove the zeros at the end of the decimal and the value stays the same: ${whole}.${frac} = ${whole + frac / 100}.`,
          smartTip: 'Drop the extra zeros',
        })
      })
    }

    if (level >= 2) {
      makers.push(() => {
        const whole = rng.int(0, 9)
        const tenths = rng.int(1, 9)
        return makeJudge({
          prompt: `True or false: ${whole}.${tenths}0 = ${whole}.${tenths}`,
          correct: true,
          explanation: `Adding or removing a zero at the end of a decimal does not change its value, so ${whole}.${tenths}0 = ${whole}.${tenths}.`,
          smartTip: 'Drop the extra zeros',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const whole = rng.int(1, 9)
        const a = rng.int(1, 9)
        const b = rng.int(1, 9)
        if (a === b) return makers[0]()
        const left = whole + a / 10
        const right = whole + b / 10
        const symbol = left > right ? '>' : '<'
        return makeChoice({
          prompt: `${left} ○ ${right}. What goes in the circle?`,
          answer: symbol,
          wrong: [symbol === '>' ? '<' : '>', '=', '≠'],
          explanation: `The whole number part is ${whole} for both. Compare the tenths: ${Math.max(a, b)} > ${Math.min(a, b)}, so write ${symbol}.`,
          smartTip: 'Compare from the left',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const a = Math.round((rng.int(1, 90) + rng.int(0, 99) / 100) * 100) / 100
        const b = Math.round((rng.int(1, 50) + rng.int(0, 99) / 100) * 100) / 100
        const sum = Math.round((a + b) * 100) / 100
        return makeFill({
          prompt: `${a} + ${b} = ?`,
          answer: sum,
          explanation: `Line up the decimal points and add: ${a} + ${b} = ${sum}.`,
          smartTip: 'Line up the place values',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const a = Math.round((rng.int(20, 90) + rng.int(0, 99) / 100) * 100) / 100
        const b = Math.round((rng.int(1, Math.floor(a) - 1) + rng.int(0, 99) / 100) * 100) / 100
        const diff = Math.round((a - b) * 100) / 100
        return makeFill({
          prompt: `${a} − ${b} = ?`,
          answer: diff,
          explanation: `Line up the decimal points and subtract: ${a} − ${b} = ${diff}.`,
          smartTip: 'Line up the place values',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const priceA = rng.int(1, 9) + rng.int(1, 9) / 10
        const priceB = rng.int(1, 9) + rng.int(1, 9) / 10
        const total = Math.round((priceA + priceB) * 10) / 10
        const paid = Math.ceil(total) + rng.int(0, 5)
        return makeFill({
          prompt: `A pen costs ${priceA} dollars and a notebook costs ${priceB} dollars. You pay ${paid} dollars. How many dollars do you get back in change?`,
          answer: Math.round((paid - total) * 10) / 10,
          unit: 'dollars',
          explanation: `First the total price: ${priceA} + ${priceB} = ${total} dollars. Then the change: ${paid} − ${total} = ${Math.round((paid - total) * 10) / 10} dollars.`,
          smartTip: 'Line up the place values',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   6. Angles and lines
   ══════════════════════════════════════════════ */

const geometry: Topic = {
  id: 'g4-geometry',
  grade: 4,
  name: 'Angles and Lines',
  color: 'teal',
  icon: 'Compass',
  summary: 'Learn line segments, rays and lines, measure and draw angles, and understand parallel and perpendicular lines.',
  explanation: [
    {
      title: 'Line segments, rays and lines',
      body: 'A line segment has two endpoints and a length you can measure. A ray has one endpoint and goes on forever in one direction. A line has no endpoints and goes on forever in both directions.',
      example: 'Segment AB is written AB, ray AB is written "ray AB", and line AB is written "line AB"',
    },
    {
      title: 'Measuring angles',
      body: 'Use a protractor to measure an angle: put the center of the protractor on the vertex of the angle, line up the 0 line with one side of the angle, and read the mark where the other side points. The size of an angle does not depend on how long its sides are, only on how wide they open.',
      example: '1 right angle = 90°, 1 straight angle = 180°, 1 full turn = 360°',
    },
    {
      title: 'Parallel and perpendicular',
      body: 'Two lines in the same plane that never meet are parallel. When two lines cross at a right angle, they are perpendicular.',
      example: 'The top and bottom edges of a whiteboard are parallel, and two neighboring edges are perpendicular',
    },
  ],
  smartMethods: [
    {
      name: 'Three steps with a protractor',
      when: 'Measuring an angle in degrees',
      steps: ['Put the center on the vertex', 'Line up the 0 line with one side', 'Read the mark where the other side points (check whether to read the inner or outer scale)'],
      example: 'If the angle opens to the right, read the inner scale; if it opens to the left, read the outer scale',
    },
    {
      name: 'Compare with a right angle',
      when: 'Quickly deciding what type of angle it is',
      steps: ['Remember a right angle is 90°', 'Smaller than a right angle is acute', 'Bigger than a right angle but smaller than a straight angle is obtuse'],
      example: '120° > 90° → obtuse angle',
    },
    {
      name: 'Draw a perpendicular with a set square',
      when: 'Drawing a perpendicular line or checking for one',
      steps: ['Put one short side of the set square against the given line', 'Draw along the other short side', 'Mark the right angle symbol'],
      example: 'Drawing a perpendicular from a point outside the line uses the same method',
    },
  ],
  levels: buildLevels(4, [
    'Learn line segments, rays and lines',
    'Measuring and classifying angles',
    'Drawing angles and angle calculations',
    'Parallel and perpendicular lines',
    'Geometry word problems',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const cases: Array<[string, string, string[]]> = [
        ['The light from a flashlight is closest to which figure?', 'ray', ['line segment', 'line', 'curve']],
        ['A tight piece of string is closest to which figure?', 'line segment', ['ray', 'line', 'broken line']],
        ['A straight road goes on forever in both directions. Which figure is it closest to?', 'line', ['line segment', 'ray', 'curve']],
        ['How many endpoints does a line segment have?', '2', ['1', '0', '3']],
      ]
      const [prompt, answer, wrong] = rng.pick(cases)
      return makeChoice({
        prompt,
        answer,
        wrong,
        explanation: `The correct answer is ${answer}. A line segment has 2 endpoints and a length you can measure, a ray has 1 endpoint, and a line has no endpoints.`,
        smartTip: 'Three steps with a protractor',
      })
    })

    makers.push(() => {
      const cases: Array<[string, number, string]> = [
        ['How many vertices does an angle have?', 1, 'vertex'],
        ['How many sides does an angle have?', 2, 'sides'],
      ]
      const [prompt, answer, unit] = rng.pick(cases)
      return makeFill({
        prompt,
        answer,
        unit,
        explanation: `An angle is formed by two rays that start at the same point, so it has 1 vertex and 2 sides. The answer is ${answer} ${unit}.`,
        smartTip: 'Three steps with a protractor',
      })
    })

    makers.push(() => {
      const angle = rng.pick([30, 45, 60, 75, 100, 120, 135, 150])
      const type = angle < 90 ? 'acute' : angle === 90 ? 'right' : angle < 180 ? 'obtuse' : 'straight'
      return makeChoice({
        prompt: `An angle is ${angle}°. What type of angle is it?`,
        answer: type,
        wrong: (['acute', 'right', 'obtuse', 'straight'] as const).filter((t) => t !== type),
        explanation: `${angle}° is ${angle < 90 ? 'less than 90°' : angle === 90 ? 'equal to 90°' : 'more than 90° and less than 180°'}, so it is ${type === 'acute' || type === 'obtuse' ? 'an' : 'a'} ${type} angle.`,
        smartTip: 'Compare with a right angle',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const cases: Array<[string, number, string]> = [
          ['How many degrees are in 1 right angle?', 90, 'degrees'],
          ['How many degrees are in 1 straight angle?', 180, 'degrees'],
          ['How many degrees are in 1 full turn?', 360, 'degrees'],
          ['How many right angles make 1 full turn?', 4, 'right angles'],
          ['How many right angles make 1 straight angle?', 2, 'right angles'],
        ]
        const [prompt, answer, unit] = rng.pick(cases)
        return makeFill({
          prompt,
          answer,
          unit,
          explanation: `The correct answer is ${answer} ${unit}. A right angle is 90°, a straight angle is 180° and a full turn is 360°.`,
          smartTip: 'Compare with a right angle',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const a = rng.pick([30, 45, 60, 90, 120])
        const b = 180 - a
        return makeFill({
          prompt: `One angle is ${a}°. Together with another angle it makes a straight angle. How many degrees is the other angle?`,
          answer: b,
          unit: 'degrees',
          explanation: `A straight angle is 180°, so 180 − ${a} = ${b}°.`,
          smartTip: 'Three steps with a protractor',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const a = rng.pick([30, 45, 60])
        const b = 90 - a
        return makeFill({
          prompt: `A right angle is split into two angles. One of them is ${a}°. How many degrees is the other?`,
          answer: b,
          unit: 'degrees',
          explanation: `A right angle is 90°, so 90 − ${a} = ${b}°.`,
          smartTip: 'Compare with a right angle',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const cases: Array<[string, string, string[]]> = [
          ['What do we call two lines in the same plane that never meet?', 'parallel', ['perpendicular', 'intersecting', 'overlapping']],
          ['Two lines cross at a right angle. What is their relationship?', 'perpendicular', ['parallel', 'overlapping', 'cannot tell']],
          ['What is the relationship between opposite sides of a rectangle?', 'parallel', ['perpendicular', 'intersecting but not perpendicular', 'no relationship']],
          ['What is the relationship between neighboring sides of a rectangle?', 'perpendicular', ['parallel', 'cannot tell', 'no relationship']],
        ]
        const [prompt, answer, wrong] = rng.pick(cases)
        return makeChoice({
          prompt,
          answer,
          wrong,
          explanation: `The correct answer is ${answer}. Parallel lines never meet, and perpendicular lines meet at 90°.`,
          smartTip: 'Draw a perpendicular with a set square',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const parts = rng.int(3, 8)
        const each = 360 / parts
        return makeFill({
          prompt: `A full turn is divided equally into ${parts} parts. How many degrees is each part?`,
          answer: each,
          unit: 'degrees',
          explanation: `A full turn is 360°, so 360 ÷ ${parts} = ${each}°.`,
          smartTip: 'Three steps with a protractor',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const cases: Array<[string, number, string]> = [
          ['At exactly 3 o\'clock, what angle do the hour hand and minute hand make?', 90, 'degrees'],
          ['At exactly 6 o\'clock, what angle do the hour hand and minute hand make?', 180, 'degrees'],
          ['At exactly 12 o\'clock, what angle do the hour hand and minute hand make?', 0, 'degrees'],
        ]
        const [prompt, answer, unit] = rng.pick(cases)
        return makeFill({
          prompt,
          answer,
          unit,
          explanation: `Each big mark on a clock face is 30°, so the answer is ${answer}°.`,
          smartTip: 'Compare with a right angle',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

export const grade4Topics: Topic[] = [
  bigNumber,
  multiDigit,
  division2,
  fractionOps,
  decimal,
  geometry,
]
