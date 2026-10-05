import {
  buildLevels,
  buildQuestionSet,
  fracStr,
  gcd,
  makeChoice,
  makeFill,
  makeJudge,
  rng,
  simplify,
} from './core'
import type { Question, Topic } from './types'

const round2 = (n: number): number => Math.round(n * 100) / 100

/* ══════════════════════════════════════════════
   1. Multiplying and dividing decimals
   ══════════════════════════════════════════════ */

const decimalOps: Topic = {
  id: 'g5-decimal-ops',
  grade: 5,
  name: 'Multiplying and Dividing Decimals',
  color: 'indigo',
  icon: 'Calculator',
  summary: 'Master multiplying and dividing decimals, and use rounded products and quotients.',
  explanation: [
    {
      title: 'Multiplying decimals',
      body: 'First multiply as if they were whole numbers. Then count the total number of decimal places in both factors and put the decimal point that many places from the right of the product. If there are not enough digits, add zeros at the front.',
      example: '0.8 × 3 = 2.4; 0.25 × 0.4 = 0.1',
    },
    {
      title: 'Dividing decimals',
      body: 'When the divisor is a decimal, first turn it into a whole number (move the decimal point of the divisor to the right, and move the decimal point of the dividend the same number of places). Then divide as with whole numbers, and keep the decimal point of the quotient lined up with the dividend.',
      example: '7.5 ÷ 0.5 = 75 ÷ 5 = 15',
    },
    {
      title: 'Rounding products and quotients',
      body: 'To round a result, work out one more digit than you need to keep, then round. To keep two decimal places, work to the third.',
      example: '0.67 × 3.4 = 2.278 ≈ 2.28 (rounded to two decimal places)',
    },
  ],
  smartMethods: [
    {
      name: 'Count the decimal places',
      when: 'Multiplying decimals',
      steps: ['Ignore the decimal points and multiply as whole numbers', 'Count the total decimal places in both factors', 'Put the decimal point that many places from the right of the product'],
      example: '1.2 × 0.3: 12 × 3 = 36, with 2 decimal places in total → 0.36',
    },
    {
      name: 'Make the divisor a whole number',
      when: 'The divisor is a decimal',
      steps: ['Move the decimal point of the divisor right until it is a whole number', 'Move the decimal point of the dividend the same number of places', 'Divide as with whole numbers'],
      example: '7.5 ÷ 0.5 → 75 ÷ 5 = 15',
    },
    {
      name: 'Work one more digit, then round',
      when: 'The answer must be rounded to some decimal places',
      steps: ['Work out one more digit than the question asks for', 'Look at that extra digit', '5 or more rounds up, less than 5 rounds down'],
      example: '2.278 to two places → 2.28',
    },
  ],
  levels: buildLevels(5, [
    'Decimal times whole number',
    'Decimal times decimal',
    'Decimal divided by whole number',
    'Decimal divided by decimal',
    'Rounded products and quotients',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const a = Math.round((rng.int(1, 9) + rng.pick([0.1, 0.2, 0.5, 0.25, 0.4])) * 100) / 100
      const b = rng.int(2, [9, 12, 20, 30, 40][level - 1])
      return makeFill({
        prompt: `${a} × ${b} = ?`,
        answer: round2(a * b),
        explanation: `First multiply as whole numbers. ${a} has ${(String(a).split('.')[1] || '').length} decimal places, so count the same number of places from the right of the product to get ${round2(a * b)}.`,
        smartTip: 'Count the decimal places',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const a = rng.pick([0.2, 0.4, 0.5, 0.8, 1.2, 1.5, 2.4, 3.6])
        const b = rng.pick([0.2, 0.5, 0.4, 0.25, 1.5, 2.5, 0.8])
        return makeFill({
          prompt: `${a} × ${b} = ?`,
          answer: round2(a * b),
          explanation: `The two factors have ${((String(a).split('.')[1] || '').length) + ((String(b).split('.')[1] || '').length)} decimal places in total. Count that many places from the right of the whole-number product to get ${round2(a * b)}.`,
          smartTip: 'Count the decimal places',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const divisor = rng.int(2, 9)
        const quotient = rng.pick([0.5, 1.5, 2.5, 3.5, 4.5, 1.2, 2.4])
        const dividend = round2(divisor * quotient)
        return makeFill({
          prompt: `${dividend} ÷ ${divisor} = ?`,
          answer: round2(dividend / divisor),
          explanation: `Divide as with whole numbers, keeping the decimal point of the quotient lined up with the decimal point of the dividend: ${dividend} ÷ ${divisor} = ${round2(dividend / divisor)}.`,
          smartTip: 'Make the divisor a whole number',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const divisor = rng.pick([0.2, 0.4, 0.5, 0.25, 1.5, 2.5])
        const quotient = rng.int(2, 20)
        const dividend = round2(divisor * quotient)
        const shift = (String(divisor).split('.')[1] || '').length
        return makeFill({
          prompt: `${dividend} ÷ ${divisor} = ?`,
          answer: quotient,
          explanation: `Move the decimal point of the divisor ${divisor} right ${shift} ${shift === 1 ? 'place' : 'places'} to make ${divisor * 10 ** shift}, and move the dividend the same ${shift === 1 ? 'place' : 'places'} to make ${round2(dividend * 10 ** shift)}. Then ${round2(dividend * 10 ** shift)} ÷ ${divisor * 10 ** shift} = ${quotient}.`,
          smartTip: 'Make the divisor a whole number',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const a = rng.pick([0.67, 1.23, 2.34, 3.56, 4.78])
        const b = rng.int(2, 9)
        const raw = a * b
        return makeFill({
          prompt: `What is ${a} × ${b} rounded to one decimal place?`,
          answer: Math.round(raw * 10) / 10,
          explanation: `First ${a} × ${b} = ${round2(raw)}. To round to one decimal place, look at the second decimal digit and round to get ${Math.round(raw * 10) / 10}.`,
          smartTip: 'Work one more digit, then round',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const price = rng.pick([1.5, 2.5, 3.6, 4.8, 5.5])
        const count = rng.int(2, 9)
        return makeFill({
          prompt: `Apples cost ${price} dollars per kilogram. How many dollars do ${count} kilograms cost?`,
          answer: round2(price * count),
          unit: 'dollars',
          explanation: `Unit price × quantity = total price: ${price} × ${count} = ${round2(price * count)} dollars.`,
          smartTip: 'Count the decimal places',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   2. Multiplying and dividing fractions
   ══════════════════════════════════════════════ */

const fractionMulDiv: Topic = {
  id: 'g5-fraction-muldiv',
  grade: 5,
  name: 'Multiplying and Dividing Fractions',
  color: 'orange',
  icon: 'PieChart',
  summary: 'Master fraction times whole number, fraction times fraction, and dividing by a number as multiplying by its reciprocal.',
  explanation: [
    {
      title: 'Fraction times a whole number',
      body: 'To multiply a fraction by a whole number, multiply the numerator by the whole number and keep the denominator. If you can simplify, do it first to make the work easier.',
      example: '2/7 × 3 = 6/7',
    },
    {
      title: 'Fraction times a fraction',
      body: 'To multiply two fractions, multiply the numerators to get the new numerator and multiply the denominators to get the new denominator. Simplify before you multiply to work faster.',
      example: '2/3 × 3/4 = 6/12 = 1/2',
    },
    {
      title: 'Dividing fractions',
      body: 'Dividing by any number other than 0 is the same as multiplying by its reciprocal. To find the reciprocal of a fraction, swap the numerator and the denominator.',
      example: '3/4 ÷ 2/5 = 3/4 × 5/2 = 15/8',
    },
  ],
  smartMethods: [
    {
      name: 'Simplify first, then multiply',
      when: 'Multiplying fractions',
      steps: ['First check whether a numerator and a denominator share a factor', 'Cancel across', 'Then multiply numerators and multiply denominators'],
      example: '2/3 × 3/4 → cancel the 3 → 2/4 = 1/2',
    },
    {
      name: 'Divide by multiplying the reciprocal',
      when: 'You see a fraction division',
      steps: ['Flip the fraction after the division sign (swap numerator and denominator)', 'Change the division sign to a multiplication sign', 'Multiply the fractions'],
      example: '3/4 ÷ 2/5 = 3/4 × 5/2 = 15/8',
    },
    {
      name: 'Write a whole number over 1',
      when: 'Multiplying or dividing a fraction and a whole number',
      steps: ['Write the whole number as a fraction with denominator 1', 'Then multiply or divide the fractions', 'The reciprocal of a whole number n is 1/n'],
      example: '6 ÷ 2/3 = 6 × 3/2 = 9',
    },
  ],
  levels: buildLevels(5, [
    'Fraction times whole number',
    'Fraction times fraction',
    'Fraction divided by whole number',
    'Whole number divided by fraction',
    'Mixed fraction multiplication and division problems',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const d = rng.int(2, 9)
      const n = rng.int(1, d - 1)
      const k = rng.int(2, [5, 6, 8, 9, 12][level - 1])
      return makeFill({
        prompt: `${n}/${d} × ${k} = ? Write it in simplest form as numerator/denominator (write a whole number as just the number).`,
        answer: fracStr(n * k, d),
        explanation: `Multiply the numerator ${n} by the whole number ${k} to get ${n * k}, and keep the denominator ${d}. That gives ${n * k}/${d}, which simplifies to ${fracStr(n * k, d)}.`,
        smartTip: 'Simplify first, then multiply',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const d1 = rng.int(2, 6)
        const d2 = rng.int(2, 6)
        const n1 = rng.int(1, d1 - 1)
        const n2 = rng.int(1, d2 - 1)
        return makeFill({
          prompt: `${n1}/${d1} × ${n2}/${d2} = ? Write it in simplest form as numerator/denominator.`,
          answer: fracStr(n1 * n2, d1 * d2),
          explanation: `Multiply the numerators: ${n1} × ${n2} = ${n1 * n2}. Multiply the denominators: ${d1} × ${d2} = ${d1 * d2}. That gives ${n1 * n2}/${d1 * d2}, which simplifies to ${fracStr(n1 * n2, d1 * d2)}.`,
          smartTip: 'Simplify first, then multiply',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const k = rng.int(2, [4, 6, 8, 9, 12][level - 1])
        const d = rng.int(2, 9)
        const n = rng.int(1, d - 1)
        return makeFill({
          prompt: `${n}/${d} ÷ ${k} = ? Write it in simplest form as numerator/denominator.`,
          answer: fracStr(n, d * k),
          explanation: `Dividing by ${k} is the same as multiplying by 1/${k}: ${n}/${d} × 1/${k} = ${n}/${d * k}, which simplifies to ${fracStr(n, d * k)}.`,
          smartTip: 'Divide by multiplying the reciprocal',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const d2 = rng.int(2, 6)
        const n2 = rng.int(1, d2 - 1)
        const d1 = rng.int(2, 6)
        const n1 = rng.int(1, d1 - 1)
        return makeFill({
          prompt: `${n1}/${d1} ÷ ${n2}/${d2} = ? Write it in simplest form as numerator/denominator.`,
          answer: fracStr(n1 * d2, d1 * n2),
          explanation: `Dividing by ${n2}/${d2} is the same as multiplying by ${d2}/${n2}: ${n1}/${d1} × ${d2}/${n2} = ${n1 * d2}/${d1 * n2}, which simplifies to ${fracStr(n1 * d2, d1 * n2)}.`,
          smartTip: 'Divide by multiplying the reciprocal',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const k = rng.int(2, 9)
        const d = rng.int(2, 6)
        const n = rng.int(1, d - 1)
        return makeFill({
          prompt: `${k} ÷ ${n}/${d} = ? Write it in simplest form as numerator/denominator (write a whole number as just the number).`,
          answer: fracStr(k * d, n),
          explanation: `${k} divided by ${n}/${d} is ${k} × ${d}/${n} = ${k * d}/${n}, which simplifies to ${fracStr(k * d, n)}.`,
          smartTip: 'Write a whole number over 1',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const total = rng.int(12, 60)
        const d = rng.pick([2, 3, 4, 5, 6])
        const n = rng.int(1, d - 1)
        const part = (total / d) * n
        return makeFill({
          prompt: `A rope is ${total} m long and ${n}/${d} of it is used. How many meters are used?`,
          answer: round2(part),
          unit: 'm',
          explanation: `To find a fraction of a number, multiply: ${total} × ${n}/${d} = ${round2(part)} m.`,
          smartTip: 'Simplify first, then multiply',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const part = rng.int(4, 30)
        const d = rng.pick([2, 3, 4])
        const n = rng.int(1, d - 1)
        const total = (part * d) / n
        return makeFill({
          prompt: `${part} tons were taken from a pile of coal. That was exactly ${n}/${d} of the original weight. How many tons were there originally?`,
          answer: round2(total),
          unit: 'tons',
          explanation: `If ${n}/${d} of a number is ${part}, find the number by dividing: ${part} ÷ ${n}/${d} = ${part} × ${d}/${n} = ${round2(total)} tons.`,
          smartTip: 'Divide by multiplying the reciprocal',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   3. Factors and multiples
   ══════════════════════════════════════════════ */

const factors: Topic = {
  id: 'g5-factors',
  grade: 5,
  name: 'Factors and Multiples',
  color: 'green',
  icon: 'Grid3x3',
  summary: 'Master the divisibility rules for 2, 3 and 5, find the greatest common factor and least common multiple, and meet prime and composite numbers.',
  explanation: [
    {
      title: 'Multiples and factors',
      body: 'If a × b = c (a, b and c are all nonzero whole numbers), then a and b are factors of c, and c is a multiple of a and b. A number has a limited number of factors but unlimited multiples.',
      example: '3 × 4 = 12, so 3 and 4 are factors of 12, and 12 is a multiple of 3 and 4',
    },
    {
      title: 'Divisibility rules for 2, 3 and 5',
      body: 'A number whose ones digit is 0, 2, 4, 6 or 8 is a multiple of 2. A number whose ones digit is 0 or 5 is a multiple of 5. If the sum of a number\'s digits is a multiple of 3, the number is a multiple of 3.',
      example: '123: 1 + 2 + 3 = 6, and 6 is a multiple of 3, so 123 is a multiple of 3',
    },
    {
      title: 'Prime and composite numbers',
      body: 'A number with exactly two factors, 1 and itself, is called a prime number. A number with other factors besides 1 and itself is called a composite number. 1 is neither prime nor composite.',
      example: '2, 3, 5, 7 and 11 are prime; 4, 6, 8 and 9 are composite',
    },
  ],
  smartMethods: [
    {
      name: 'Check the ones digit for 2 and 5',
      when: 'Deciding whether a number is a multiple of 2 or 5',
      steps: ['Look only at the ones digit', 'Ones digit 0, 2, 4, 6, 8 → multiple of 2', 'Ones digit 0 or 5 → multiple of 5'],
      example: 'The ones digit of 340 is 0 → it is a multiple of both 2 and 5',
    },
    {
      name: 'Add the digits for 3',
      when: 'Deciding whether a number is a multiple of 3',
      steps: ['Add up all the digits', 'See whether the sum is a multiple of 3', 'If it is, the original number is too'],
      example: '123: 1 + 2 + 3 = 6 → multiple of 3',
    },
    {
      name: 'Short division for GCF and LCM',
      when: 'Finding the greatest common factor or least common multiple',
      steps: ['Keep dividing both numbers by a common factor', 'Stop when the two numbers share no more factors', 'The divisors multiplied together give the GCF; the divisors and the bottom numbers all multiplied give the LCM'],
      example: '12 and 18: GCF 6, LCM 36',
    },
  ],
  levels: buildLevels(5, [
    'Learn factors and multiples',
    'Divisibility rules for 2, 5 and 3',
    'Prime and composite numbers',
    'Greatest common factor and least common multiple',
    'Factors and multiples word problems',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const a = rng.int(2, 9)
      const b = rng.int(2, 9)
      const product = a * b
      return makeFill({
        prompt: `${a} × ${b} = ${product}. What is ${product} ÷ ${a}?`,
        answer: b,
        explanation: `From ${a} × ${b} = ${product}, both ${a} and ${b} are factors of ${product}. Turned around, ${product} ÷ ${a} = ${b}.`,
        smartTip: 'Check the ones digit for 2 and 5',
      })
    })

    makers.push(() => {
      const n = rng.int(10, 99)
      const isEven = n % 2 === 0
      return makeJudge({
        prompt: `True or false: ${n} is a multiple of 2.`,
        correct: isEven,
        explanation: `The ones digit of ${n} is ${n % 10}, ${isEven ? 'which is even, so it is a multiple of 2' : 'which is not 0, 2, 4, 6 or 8, so it is not a multiple of 2'}.`,
        smartTip: 'Check the ones digit for 2 and 5',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const n = rng.int(100, 999)
        const digitSum = String(n)
          .split('')
          .reduce((s, c) => s + Number(c), 0)
        const isMultiple3 = digitSum % 3 === 0
        return makeJudge({
          prompt: `True or false: ${n} is a multiple of 3.`,
          correct: isMultiple3,
          explanation: `Sum of the digits: ${String(n).split('').join(' + ')} = ${digitSum}. ${digitSum} ${isMultiple3 ? 'is' : 'is not'} a multiple of 3, so ${n} ${isMultiple3 ? 'is' : 'is not'} a multiple of 3.`,
          smartTip: 'Add the digits for 3',
        })
      })
    }

    if (level >= 2) {
      makers.push(() => {
        const n = rng.int(11, 200)
        return makeFill({
          prompt: `What is the smallest multiple of ${n}?`,
          answer: n,
          explanation: `The smallest multiple of a number is the number itself. There is no biggest multiple.`,
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]
        const composites = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21]
        const isPrime = rng.bool()
        const n = isPrime ? rng.pick(primes) : rng.pick(composites)
        return makeChoice({
          prompt: `Is ${n} prime or composite?`,
          answer: isPrime ? 'Prime' : 'Composite',
          wrong: [isPrime ? 'Composite' : 'Prime', 'Neither prime nor composite', 'Cannot tell'],
          explanation: isPrime
            ? `${n} has only two factors, 1 and ${n}, so it is prime.`
            : `${n} has other factors besides 1 and itself, so it is composite.`,
          smartTip: 'Add the digits for 3',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const a = rng.int(6, 30)
        let b = rng.int(6, 30)
        while (b === a) b = rng.int(6, 30)
        const g = gcd(a, b)
        const l = (a * b) / g
        return makeFill({
          prompt: `What is the greatest common factor of ${a} and ${b}?`,
          answer: g,
          explanation: `The biggest of the common factors of ${a} and ${b} is ${g} (and their least common multiple is ${l}).`,
          smartTip: 'Short division for GCF and LCM',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const a = rng.int(4, 20)
        let b = rng.int(4, 20)
        while (b === a) b = rng.int(4, 20)
        const g = gcd(a, b)
        const l = (a * b) / g
        return makeFill({
          prompt: `What is the least common multiple of ${a} and ${b}?`,
          answer: l,
          explanation: `LCM = product of the two numbers ÷ GCF = ${a} × ${b} ÷ ${g} = ${l}.`,
          smartTip: 'Short division for GCF and LCM',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const a = rng.int(2, 9)
        const b = rng.int(2, 9)
        const l = (a * b) / gcd(a, b)
        return makeFill({
          prompt: `Sam goes to the library every ${a} days and Mia goes every ${b} days. They both went today. After how many days will they next go on the same day?`,
          answer: l,
          unit: 'days',
          explanation: `This asks for the least common multiple of ${a} and ${b}, which is ${l}, so it is ${l} days later.`,
          smartTip: 'Short division for GCF and LCM',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   4. Area and volume
   ══════════════════════════════════════════════ */

const areaVolume: Topic = {
  id: 'g5-area-volume',
  grade: 5,
  name: 'Area and Volume',
  color: 'pink',
  icon: 'Box',
  summary: 'Master the areas of parallelograms, triangles and trapezoids, and the volumes of cuboids and cubes.',
  explanation: [
    {
      title: 'Areas of three shapes',
      body: 'Area of a parallelogram = base × height. Area of a triangle = base × height ÷ 2. Area of a trapezoid = (top + bottom) × height ÷ 2.',
      example: 'Triangle with base 6 and height 4 → 6 × 4 ÷ 2 = 12',
    },
    {
      title: 'Where the area formulas come from',
      body: 'Two identical triangles can be joined to make a parallelogram, so the area of a triangle is half the area of a parallelogram with the same base and height. A trapezoid works the same way.',
      example: 'Try putting the shapes together and you will see why we divide by 2',
    },
    {
      title: 'Volume and capacity',
      body: 'Volume of a cuboid = length × width × height. Volume of a cube = edge³. You can also use "base area × height" for both. 1 liter = 1,000 milliliters = 1 cubic decimeter.',
      example: 'Length 5, width 4, height 3 → volume 60 cubic centimeters',
    },
  ],
  smartMethods: [
    {
      name: 'Cut and fill into known shapes',
      when: 'The shape is irregular or you have not learned its formula',
      steps: ['Cut the shape into a few shapes you know', 'Work out each area', 'Add the results together (or subtract)'],
      example: 'An L shape can be split into two rectangles',
    },
    {
      name: 'Half of the same base and height',
      when: 'Finding the area of a triangle',
      steps: ['First think of the parallelogram with the same base and height', 'Parallelogram area = base × height', 'Divide by 2 to get the triangle area'],
      example: 'Base 6, height 4 → 24 ÷ 2 = 12',
    },
    {
      name: 'Base area times height',
      when: 'Finding the volume of a prism',
      steps: ['First work out the area of the base', 'Then multiply by the height', 'Make sure the units are cubic units'],
      example: 'Base area 20, height 5 → volume 100',
    },
  ],
  levels: buildLevels(5, [
    'Area of a parallelogram',
    'Area of a triangle',
    'Area of a trapezoid',
    'Volume of cuboids and cubes',
    'Area and volume word problems',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const base = rng.int(3, [9, 12, 15, 20, 25][level - 1])
      const height = rng.int(2, [8, 10, 12, 15, 18][level - 1])
      return makeFill({
        prompt: `A parallelogram has a base of ${base} cm and a height of ${height} cm. What is its area in square centimeters?`,
        answer: base * height,
        unit: 'cm²',
        explanation: `Area of a parallelogram = base × height = ${base} × ${height} = ${base * height} cm².`,
        smartTip: 'Cut and fill into known shapes',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const base = rng.int(4, [10, 14, 18, 24, 30][level - 1])
        const height = rng.int(2, 12) * 2
        return makeFill({
          prompt: `A triangle has a base of ${base} cm and a height of ${height} cm. What is its area in square centimeters?`,
          answer: (base * height) / 2,
          unit: 'cm²',
          explanation: `Area of a triangle = base × height ÷ 2 = ${base} × ${height} ÷ 2 = ${(base * height) / 2} cm².`,
          smartTip: 'Half of the same base and height',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const top = rng.int(3, 12)
        const bottom = top + rng.int(2, 12)
        const height = rng.int(2, 10) * 2
        return makeFill({
          prompt: `A trapezoid has a top of ${top} cm, a bottom of ${bottom} cm and a height of ${height} cm. What is its area in square centimeters?`,
          answer: ((top + bottom) * height) / 2,
          unit: 'cm²',
          explanation: `Area of a trapezoid = (top + bottom) × height ÷ 2 = (${top} + ${bottom}) × ${height} ÷ 2 = ${((top + bottom) * height) / 2} cm².`,
          smartTip: 'Cut and fill into known shapes',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const triangleArea = rng.pick([12, 18, 24, 30, 36])
        return makeChoice({
          prompt: `A triangle and a parallelogram have the same base and height. The triangle has an area of ${triangleArea} cm². What is the area of the parallelogram?`,
          answer: `${triangleArea * 2} cm²`,
          wrong: [`${triangleArea} cm²`, `${triangleArea / 2} cm²`, `${triangleArea + 12} cm²`],
          explanation: `With the same base and height, a triangle is half the area of a parallelogram, so the parallelogram's area = ${triangleArea} × 2 = ${triangleArea * 2} cm².`,
          smartTip: 'Half of the same base and height',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const l = rng.int(3, 12)
        const w = rng.int(2, 10)
        const h = rng.int(2, 8)
        return makeFill({
          prompt: `A cuboid is ${l} cm long, ${w} cm wide and ${h} cm high. What is its volume in cubic centimeters?`,
          answer: l * w * h,
          unit: 'cm³',
          explanation: `Volume of a cuboid = length × width × height = ${l} × ${w} × ${h} = ${l * w * h} cm³.`,
          smartTip: 'Base area times height',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const edge = rng.int(2, 12)
        return makeFill({
          prompt: `A cube has an edge of ${edge} cm. What is its volume in cubic centimeters?`,
          answer: edge ** 3,
          unit: 'cm³',
          explanation: `Volume of a cube = edge × edge × edge = ${edge} × ${edge} × ${edge} = ${edge ** 3} cm³.`,
          smartTip: 'Base area times height',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const l = rng.int(4, 12)
        const w = rng.int(3, 10)
        const h = rng.int(2, 8)
        const volume = l * w * h
        return makeFill({
          prompt: `A cuboid pool is ${l} m long, ${w} m wide and ${h} m deep. What is the most water it can hold, in cubic meters?`,
          answer: volume,
          unit: 'm³',
          explanation: `Capacity = length × width × height = ${l} × ${w} × ${h} = ${volume} m³.`,
          smartTip: 'Base area times height',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const baseArea = rng.int(5, 30)
        const height = rng.int(3, 10)
        return makeJudge({
          prompt: `True or false: A cuboid has a base area of ${baseArea} cm² and a height of ${height} cm. Its volume is ${baseArea + height} cm³.`,
          correct: false,
          explanation: `Volume = base area × height = ${baseArea} × ${height} = ${baseArea * height} cm³, not ${baseArea + height}.`,
          smartTip: 'Base area times height',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   5. Percentages
   ══════════════════════════════════════════════ */

const percent: Topic = {
  id: 'g5-percent',
  grade: 5,
  name: 'Percentages',
  color: 'purple',
  icon: 'Percent',
  summary: 'Understand what a percentage means, convert between percentages, decimals and fractions, and do simple calculations.',
  explanation: [
    {
      title: 'What a percentage means',
      body: 'A number that shows one number as a certain number of hundredths of another is called a percentage (percent means "out of 100"). A percentage only describes a ratio between two numbers, so it has no unit.',
      example: 'The attendance rate of Class 6A is 98%',
    },
    {
      title: 'Converting between percentages, decimals and fractions',
      body: 'Percentage to decimal: drop the percent sign and move the decimal point two places left. Decimal to percentage: move the decimal point two places right and add the percent sign. Percentage to fraction: write it over 100, then simplify.',
      example: '25% = 0.25 = 1/4; 0.6 = 60%',
    },
    {
      title: 'Finding a percentage of a number',
      body: 'To find a percentage of a number, multiply the number by the percentage (first change the percentage to a decimal or a fraction).',
      example: '15% of 200 = 200 × 0.15 = 30',
    },
  ],
  smartMethods: [
    {
      name: 'Move the decimal point two places',
      when: 'Converting between percentages and decimals',
      steps: ['Percentage to decimal: drop the percent sign, move the point left two places', 'Decimal to percentage: move the point right two places, add the percent sign', 'Add zeros if there are not enough digits'],
      example: '3% = 0.03; 1.2 = 120%',
    },
    {
      name: 'Write it over 100, then simplify',
      when: 'Converting a percentage to a fraction',
      steps: ['Write the percentage as a fraction over 100', 'Divide the numerator and denominator by a common factor', 'Reduce to simplest form'],
      example: '45% = 45/100 = 9/20',
    },
    {
      name: 'Change to a decimal, then multiply',
      when: 'Finding a percentage of a number',
      steps: ['Change the percentage to a decimal', 'Multiply the number by that decimal', 'Check the unit'],
      example: '25% of 80 = 80 × 0.25 = 20',
    },
  ],
  levels: buildLevels(5, [
    'Meaning of percentages, reading and writing',
    'Convert between percentages and decimals',
    'Convert between percentages and fractions',
    'Find a percentage of a number',
    'Percentage rates in real life',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const p = rng.pick([5, 8, 12, 15, 20, 25, 30, 36, 45, 50, 60, 75, 80, 90])
      return makeFill({
        prompt: `Write ${p}% as a decimal.`,
        answer: p / 100,
        explanation: `Drop the percent sign and move the decimal point two places left: ${p}% = ${p / 100}.`,
        smartTip: 'Move the decimal point two places',
      })
    })

    makers.push(() => {
      const d = rng.pick([0.05, 0.08, 0.12, 0.25, 0.4, 0.6, 0.75, 0.9, 1.2])
      return makeFill({
        prompt: `Write ${d} as a percentage. What number comes before the percent sign?`,
        answer: Math.round(d * 100),
        unit: '%',
        explanation: `Move the decimal point two places right and add the percent sign: ${d} = ${Math.round(d * 100)}%.`,
        smartTip: 'Move the decimal point two places',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const p = rng.pick([20, 25, 40, 50, 60, 75, 80])
        return makeFill({
          prompt: `Write ${p}% as a fraction in simplest form. What is the numerator?`,
          answer: simplify(p, 100)[0],
          explanation: `${p}% = ${p}/100 = ${fracStr(p, 100)}, so the numerator is ${simplify(p, 100)[0]}.`,
          smartTip: 'Write it over 100, then simplify',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const n = rng.int(20, 200)
        const p = rng.pick([10, 20, 25, 50, 75])
        return makeFill({
          prompt: `What is ${p}% of ${n}?`,
          answer: round2((n * p) / 100),
          explanation: `${n} × ${p}% = ${n} × ${p / 100} = ${round2((n * p) / 100)}.`,
          smartTip: 'Change to a decimal, then multiply',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const total = rng.int(20, 200)
        const part = rng.int(1, total - 1)
        const p = round2((part / total) * 100)
        return makeFill({
          prompt: `A class has ${total} students and ${part} of them are boys. What percentage of the class are boys? (Round to one decimal place and enter only the number.)`,
          answer: Math.round(p * 10) / 10,
          unit: '%',
          explanation: `${part} ÷ ${total} = ${round2(part / total)} = ${Math.round(p * 10) / 10}%.`,
          smartTip: 'Change to a decimal, then multiply',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const total = rng.int(50, 400)
        const p = rng.pick([20, 25, 40, 60, 75, 80])
        return makeFill({
          prompt: `A book has ${total} pages and you have read ${p}% of it. How many pages have you read?`,
          answer: round2((total * p) / 100),
          unit: 'pages',
          explanation: `${total} × ${p / 100} = ${round2((total * p) / 100)} pages.`,
          smartTip: 'Change to a decimal, then multiply',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const total = rng.pick([200, 400, 500, 800, 1000])
        const p = rng.pick([10, 15, 20, 25, 30])
        return makeJudge({
          prompt: `True or false: ${p}% of ${total} dollars is ${round2((total * p) / 100) + total} dollars.`,
          correct: false,
          explanation: `${total} × ${p}% = ${total} × ${p / 100} = ${round2((total * p) / 100)} dollars, not ${round2((total * p) / 100) + total} dollars.`,
          smartTip: 'Change to a decimal, then multiply',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const total = rng.pick([40, 50, 80, 100, 200])
        const correct = rng.int(1, total - 1)
        return makeFill({
          prompt: `A math quiz has ${total} questions and Alex got ${correct} right. What is the accuracy? (Enter only the number before the percent sign.)`,
          answer: round2((correct / total) * 100),
          unit: '%',
          explanation: `Accuracy = questions right ÷ total questions × 100% = ${correct} ÷ ${total} × 100% = ${round2((correct / total) * 100)}%.`,
          smartTip: 'Change to a decimal, then multiply',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   6. Simple equations
   ══════════════════════════════════════════════ */

const equation: Topic = {
  id: 'g5-equation',
  grade: 5,
  name: 'Simple Equations',
  color: 'teal',
  icon: 'Variable',
  summary: 'Use letters to stand for numbers, understand the properties of equality, and solve equations like x ± a = b and ax = b.',
  explanation: [
    {
      title: 'Letters stand for numbers',
      body: 'Letters can stand for numbers, quantities and relationships between quantities. When a number and a letter are multiplied, the multiplication sign can be left out, and the number is written before the letter.',
      example: 'a × 3 is written 3a; 1 × a is written a',
    },
    {
      title: 'Equations and the properties of equality',
      body: 'An equation is an equality that contains an unknown. If you add or subtract the same number on both sides, or multiply or divide both sides by the same number (not 0), the equality still holds.',
      example: 'x + 5 = 12 → subtract 5 from both sides → x = 7',
    },
    {
      title: 'How to write a solution',
      body: 'Write "Solution:" first and keep the equals signs lined up on each step. At the end, check your answer: put the value of x back into the original equation and see whether both sides are equal.',
      example: '3x = 15 → x = 5. Check: 3 × 5 = 15 ✓',
    },
  ],
  smartMethods: [
    {
      name: 'Balance scale',
      when: 'You do not understand the properties of equality',
      steps: ['Think of the equals sign as a balance scale', 'Whatever you add on the left you must add on the right', 'Keep the scale balanced'],
      example: 'x + 5 = 12: take 5 away from both sides',
    },
    {
      name: 'Undo with the opposite operation',
      when: 'Solving x ± a = b equations',
      steps: ['Keep the term with x on the left', 'Move the number to the right side', 'Addition becomes subtraction and subtraction becomes addition'],
      example: 'x + 8 = 20 → x = 20 − 8 = 12',
    },
    {
      name: 'Check by substituting',
      when: 'After you have found x',
      steps: ['Put the value of x into the left side of the original equation', 'Work out the result', 'See whether it equals the right side'],
      example: 'x = 7 in x + 5 = 12 → 7 + 5 = 12 ✓',
    },
  ],
  levels: buildLevels(5, [
    'Letters stand for numbers',
    'Solve x + a = b and x − a = b',
    'Solve ax = b',
    'Solve ax + b = c',
    'Write equations to solve problems',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const coeff = rng.int(2, 9)
      return makeFill({
        prompt: `Use a letter: each pencil costs ${coeff} dollars. How much do a pencils cost? Enter the number in front of a.`,
        answer: coeff,
        explanation: `Total price = unit price × quantity = ${coeff} × a = ${coeff}a, so the number in front of a is ${coeff}.`,
        smartTip: 'Balance scale',
      })
    })

    makers.push(() => {
      const a = rng.int(2, [20, 30, 50, 80, 100][level - 1])
      const x = rng.int(1, [18, 28, 48, 78, 98][level - 1])
      return makeFill({
        prompt: `Solve the equation: x + ${a} = ${x + a}. What is x?`,
        answer: x,
        explanation: `Subtract ${a} from both sides: x = ${x + a} − ${a} = ${x}. Check: ${x} + ${a} = ${x + a} ✓`,
        smartTip: 'Undo with the opposite operation',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const a = rng.int(2, [20, 30, 50, 80, 100][level - 1])
        const x = rng.int(a + 1, a + [20, 30, 50, 80, 100][level - 1])
        return makeFill({
          prompt: `Solve the equation: x − ${a} = ${x - a}. What is x?`,
          answer: x,
          explanation: `Add ${a} to both sides: x = ${x - a} + ${a} = ${x}. Check: ${x} − ${a} = ${x - a} ✓`,
          smartTip: 'Undo with the opposite operation',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const a = rng.int(2, [5, 7, 9, 12, 12][level - 1])
        const x = rng.int(2, [9, 12, 15, 20, 25][level - 1])
        return makeFill({
          prompt: `Solve the equation: ${a}x = ${a * x}. What is x?`,
          answer: x,
          explanation: `Divide both sides by ${a}: x = ${a * x} ÷ ${a} = ${x}. Check: ${a} × ${x} = ${a * x} ✓`,
          smartTip: 'Balance scale',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const x = rng.int(2, 12)
        const a = rng.int(2, 9)
        return makeChoice({
          prompt: `Which is the solution of the equation ${a}x = ${a * x}?`,
          answer: `x = ${x}`,
          wrong: [`x = ${x + 1}`, `x = ${x + a}`, `x = ${x * a}`],
          explanation: `Put x = ${x} in: ${a} × ${x} = ${a * x}. Both sides are equal, so x = ${x} is the solution.`,
          smartTip: 'Check by substituting',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const a = rng.int(2, 9)
        const x = rng.int(2, 15)
        const b = rng.int(1, 30)
        return makeFill({
          prompt: `Solve the equation: ${a}x + ${b} = ${a * x + b}. What is x?`,
          answer: x,
          explanation: `First treat ${a}x as one piece: ${a}x = ${a * x + b} − ${b} = ${a * x}. Then divide both sides by ${a}: x = ${x}.`,
          smartTip: 'Undo with the opposite operation',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const price = rng.int(3, 12)
        const count = rng.int(3, 12)
        const total = price * count + rng.int(1, 20)
        return makeFill({
          prompt: `Each notebook costs ${price} dollars. Mia buys x notebooks, pays ${total} dollars and gets ${total - price * count} dollars back in change. This gives the equation ${price}x + ${total - price * count} = ${total}. What is x?`,
          answer: count,
          explanation: `${price}x = ${total} − ${total - price * count} = ${price * count}, so x = ${price * count} ÷ ${price} = ${count}.`,
          smartTip: 'Check by substituting',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const x = rng.int(3, 20)
        const a = rng.int(2, 8)
        const b = rng.int(1, 20)
        return makeJudge({
          prompt: `True or false: x = ${x} is the solution of the equation ${a}x + ${b} = ${a * x + b}.`,
          correct: true,
          explanation: `Check by substituting: ${a} × ${x} + ${b} = ${a * x} + ${b} = ${a * x + b}. Both sides are equal, so the statement is true.`,
          smartTip: 'Check by substituting',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

export const grade5Topics: Topic[] = [
  decimalOps,
  fractionMulDiv,
  factors,
  areaVolume,
  percent,
  equation,
]
