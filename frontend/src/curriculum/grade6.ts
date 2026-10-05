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
const PI = 3.14

/* ══════════════════════════════════════════════
   1. Mixed fraction operations
   ══════════════════════════════════════════════ */

const fractionMixed: Topic = {
  id: 'g6-fraction-mixed',
  grade: 6,
  name: 'Mixed Fraction Operations',
  color: 'indigo',
  icon: 'Sigma',
  summary: 'Master mixed operations with fractions and smart shortcuts, and apply the laws of operations to fractions.',
  explanation: [
    {
      title: 'The order of operations still applies',
      body: 'The order for mixed fraction operations is the same as for whole numbers: multiply and divide before adding and subtracting, do parentheses first, and work left to right for operations at the same level.',
      example: '1/2 + 1/3 × 3/4 = 1/2 + 1/4 = 3/4',
    },
    {
      title: 'The laws of operations work for fractions',
      body: 'The commutative and associative laws of addition, and the commutative, associative and distributive laws of multiplication, all work for fractions too. Using them well makes calculations easier.',
      example: '(1/4 + 2/3) × 12 = 1/4 × 12 + 2/3 × 12 = 3 + 8 = 11',
    },
    {
      title: 'Reciprocals and cancelling',
      body: 'Dividing by a fraction is the same as multiplying by its reciprocal. Cancelling common factors before you multiply cuts down the work a lot.',
      example: '5/6 ÷ 10 = 5/6 × 1/10 = 1/12',
    },
  ],
  smartMethods: [
    {
      name: 'Distributive property',
      when: 'You see "a sum times a number"',
      steps: ['Multiply the number outside the parentheses by each term inside', 'Then add the two products', 'The results often come out as whole numbers'],
      example: '(1/4 + 2/3) × 12 = 3 + 8 = 11',
    },
    {
      name: 'Cancel first, then multiply',
      when: 'A numerator and a denominator share a factor in a fraction multiplication',
      steps: ['Look across for common factors first', 'Cancel them, then multiply', 'This avoids working with big numbers'],
      example: '7/8 × 4/21 → cancel 7 and 4 → 1/6',
    },
    {
      name: 'Divide by multiplying the reciprocal',
      when: 'The expression has a division',
      steps: ['Take the reciprocal of each number after a division sign', 'Change the division signs to multiplication signs', 'Turn it all into multiplication and calculate'],
      example: '2/3 ÷ 4/5 ÷ 5 = 2/3 × 5/4 × 1/5 = 1/6',
    },
  ],
  levels: buildLevels(6, [
    'Mixed addition and subtraction of fractions',
    'Mixed multiplication and division of fractions',
    'All four operations with fractions',
    'Smart calculation with the laws of operations',
    'Mixed fraction operation word problems',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const d = rng.int(4, 12)
      const a = rng.int(1, d - 1)
      const b = rng.int(1, d - 1)
      return makeFill({
        prompt: `${a}/${d} + ${b}/${d} − 1/${d} = ? Write it in simplest form as numerator/denominator (write a whole number as just the number).`,
        answer: fracStr(a + b - 1, d),
        explanation: `The denominators are the same, so just add and subtract the numerators: ${a} + ${b} − 1 = ${a + b - 1}, giving ${a + b - 1}/${d}, which simplifies to ${fracStr(a + b - 1, d)}.`,
        smartTip: 'Cancel first, then multiply',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const d1 = rng.int(2, 5)
        const d2 = rng.int(2, 5)
        const n1 = rng.int(1, d1 - 1)
        const n2 = rng.int(1, d2 - 1)
        return makeFill({
          prompt: `${n1}/${d1} × ${n2}/${d2} = ? Write it in simplest form as numerator/denominator.`,
          answer: fracStr(n1 * n2, d1 * d2),
          explanation: `Multiply the numerators: ${n1} × ${n2} = ${n1 * n2}. Multiply the denominators: ${d1} × ${d2} = ${d1 * d2}. That gives ${n1 * n2}/${d1 * d2}, which simplifies to ${fracStr(n1 * n2, d1 * d2)}.`,
          smartTip: 'Cancel first, then multiply',
        })
      })
    }

    if (level >= 2) {
      makers.push(() => {
        const d1 = rng.int(2, 5)
        const d2 = rng.int(2, 5)
        const n1 = rng.int(1, d1 - 1)
        const n2 = rng.int(1, d2 - 1)
        return makeFill({
          prompt: `${n1}/${d1} ÷ ${n2}/${d2} = ? Write it in simplest form as numerator/denominator.`,
          answer: fracStr(n1 * d2, d1 * n2),
          explanation: `Dividing by ${n2}/${d2} is the same as multiplying by ${d2}/${n2}: ${n1}/${d1} × ${d2}/${n2} = ${n1 * d2}/${d1 * n2}, which simplifies to ${fracStr(n1 * d2, d1 * n2)}.`,
          smartTip: 'Divide by multiplying the reciprocal',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const d = rng.int(3, 8)
        const n = rng.int(1, d - 1)
        const k = rng.int(2, 6)
        const add = rng.int(1, 5)
        return makeFill({
          prompt: `${n}/${d} × ${k} + ${add}/${d} = ? Write it in simplest form as numerator/denominator (write a whole number as just the number).`,
          answer: fracStr(n * k + add, d),
          explanation: `Multiply first: ${n}/${d} × ${k} = ${n * k}/${d}. Then add ${add}/${d} to get ${n * k + add}/${d}, which simplifies to ${fracStr(n * k + add, d)}.`,
          smartTip: 'Divide by multiplying the reciprocal',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const d1 = rng.pick([2, 4])
        const d2 = rng.pick([3, 6])
        const n1 = rng.int(1, d1 - 1)
        const n2 = rng.int(1, d2 - 1)
        const factor = 12
        const result = (n1 / d1) * factor + (n2 / d2) * factor
        return makeFill({
          prompt: `Use the distributive property: (${n1}/${d1} + ${n2}/${d2}) × ${factor} = ?`,
          answer: round2(result),
          explanation: `Distributive property: ${n1}/${d1} × ${factor} + ${n2}/${d2} × ${factor} = ${round2((n1 / d1) * factor)} + ${round2((n2 / d2) * factor)} = ${round2(result)}.`,
          smartTip: 'Distributive property',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const d = rng.int(2, 6)
        const n = rng.int(1, d - 1)
        const k = rng.int(2, 9)
        return makeFill({
          prompt: `Calculate smartly: ${n}/${d} × ${k} ÷ ${k} = ? Write it in simplest form as numerator/denominator.`,
          answer: fracStr(n, d),
          explanation: `Multiplying by ${k} and then dividing by ${k} cancel each other out, so the result is still ${fracStr(n, d)}.`,
          smartTip: 'Divide by multiplying the reciprocal',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const total = rng.int(30, 120)
        const d = rng.pick([3, 4, 5])
        const n1 = rng.int(1, d - 2)
        const n2 = d - n1 - 1
        return makeFill({
          prompt: `A shipment weighs ${total} tons. ${n1}/${d} of it is moved the first time and ${n2}/${d} the second time. How many tons are left?`,
          answer: round2((total * (d - n1 - n2)) / d),
          unit: 'tons',
          explanation: `Together ${n1 + n2}/${d} is moved, so ${d - n1 - n2}/${d} is left: ${total} × ${d - n1 - n2}/${d} = ${round2((total * (d - n1 - n2)) / d)} tons.`,
          smartTip: 'Cancel first, then multiply',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const d = rng.int(2, 6)
        const n = rng.int(1, d - 1)
        const k = rng.int(2, 8)
        return makeJudge({
          prompt: `True or false: ${n}/${d} × ${k} ÷ ${k} = ${n}/${d}`,
          correct: true,
          explanation: `Multiplying by a number and then dividing by the same number leaves the value unchanged, so ${n}/${d} × ${k} ÷ ${k} = ${fracStr(n, d)}.`,
          smartTip: 'Divide by multiplying the reciprocal',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   2. Ratios and proportions
   ══════════════════════════════════════════════ */

const ratio: Topic = {
  id: 'g6-ratio',
  grade: 6,
  name: 'Ratios and Proportions',
  color: 'orange',
  icon: 'Scale',
  summary: 'Understand what a ratio means and its basic property, simplify ratios, find ratio values, and share amounts in a ratio.',
  explanation: [
    {
      title: 'What a ratio means',
      body: 'The quotient of two numbers is also called their ratio. ":" is the ratio sign. In a : b, a is the first term, b is the second term, and the result of a ÷ b is the value of the ratio. The second term cannot be 0.',
      example: '3 : 5 = 3 ÷ 5 = 0.6, with first term 3, second term 5 and value 0.6',
    },
    {
      title: 'The basic property of ratios',
      body: 'If you multiply or divide both terms of a ratio by the same number (not 0), the value of the ratio does not change. You can use this to simplify ratios.',
      example: '12 : 18 = 2 : 3 (divide both terms by 6)',
    },
    {
      title: 'Sharing in a ratio',
      body: 'To split an amount in a given ratio, first find the total number of parts, then work out how much one part is, and finally multiply by each share\'s number of parts.',
      example: 'Share 60 in the ratio 2 : 3 → each part is 12 → 24 and 36',
    },
  ],
  smartMethods: [
    {
      name: 'Divide by the GCF',
      when: 'Simplifying a ratio of whole numbers',
      steps: ['Find the greatest common factor of the two terms', 'Divide both terms by it', 'You get the simplest whole-number ratio'],
      example: '18 : 24 → divide by 6 → 3 : 4',
    },
    {
      name: 'Clear decimals or fractions first',
      when: 'A term of the ratio is a fraction or a decimal',
      steps: ['Turn decimals into whole numbers (multiply both by 10, 100 …)', 'Or give fractions a common denominator', 'Then simplify as a whole-number ratio'],
      example: '0.4 : 0.6 → 4 : 6 → 2 : 3',
    },
    {
      name: 'Total parts method',
      when: 'Sharing an amount in a ratio',
      steps: ['Add up the terms of the ratio to get the total number of parts', 'Total ÷ total parts = size of one part', 'Size of one part × each share\'s parts = each share'],
      example: '60 in the ratio 2 : 3 → 5 parts in total, each part 12 → 24 and 36',
    },
  ],
  levels: buildLevels(6, [
    'Learn ratios and find ratio values',
    'Simplify ratios',
    'The basic property of ratios',
    'Share amounts in a ratio',
    'Ratio and proportion word problems',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const a = rng.int(2, 9)
      const b = rng.int(2, 9)
      return makeFill({
        prompt: `What is the value of the ratio ${a} : ${b}? (Round to two decimal places.)`,
        answer: round2(a / b),
        explanation: `Value of a ratio = first term ÷ second term = ${a} ÷ ${b} = ${round2(a / b)}.`,
        smartTip: 'Divide by the GCF',
      })
    })

    makers.push(() => {
      const factor = rng.int(2, [3, 5, 7, 9, 12][level - 1])
      const a = rng.int(1, 9)
      const b = rng.int(1, 9)
      const g = gcd(a * factor, b * factor)
      return makeFill({
        prompt: `Simplify ${a * factor} : ${b * factor} to the simplest whole-number ratio. What is the first term?`,
        answer: (a * factor) / g,
        explanation: `Divide both terms by the greatest common factor ${g}: ${a * factor} : ${b * factor} = ${(a * factor) / g} : ${(b * factor) / g}, so the first term is ${(a * factor) / g}.`,
        smartTip: 'Divide by the GCF',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const base = rng.pick([0.2, 0.4, 0.5, 0.6, 0.8, 1.2, 1.5, 2.5])
        const a = Math.round(base * 10)
        const b = rng.int(2, 9) * 5
        const g = gcd(a, b)
        return makeFill({
          prompt: `Simplify ${base} : ${b / 10} to the simplest whole-number ratio. What is the first term?`,
          answer: a / g,
          explanation: `First turn the decimals into whole numbers (multiply both by 10): ${a} : ${b}. Then divide by the greatest common factor ${g} to get ${a / g} : ${b / g}, so the first term is ${a / g}.`,
          smartTip: 'Clear decimals or fractions first',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const k = rng.int(2, 6)
        return makeFill({
          prompt: `The first term of a ratio is multiplied by ${k}. To keep the value of the ratio the same, what should the second term be multiplied by?`,
          answer: k,
          explanation: `If both terms of a ratio are multiplied or divided by the same number (not 0), the value does not change, so the second term must also be multiplied by ${k}.`,
          smartTip: 'Divide by the GCF',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const a = rng.int(1, 5)
        const b = rng.int(1, 5)
        const parts = a + b
        const per = rng.int(3, 20)
        const total = parts * per
        return makeFill({
          prompt: `Share ${total} in the ratio ${a} : ${b}. How much is the bigger share?`,
          answer: Math.max(a, b) * per,
          explanation: `Total parts = ${a} + ${b} = ${parts}. One part = ${total} ÷ ${parts} = ${per}. The bigger share = ${Math.max(a, b)} × ${per} = ${Math.max(a, b) * per}.`,
          smartTip: 'Total parts method',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const a = rng.int(1, 5)
        const b = rng.int(1, 5)
        const parts = a + b
        const per = rng.int(3, 20)
        const total = parts * per
        return makeFill({
          prompt: `Share ${total} in the ratio ${a} : ${b}. How much is the smaller share?`,
          answer: Math.min(a, b) * per,
          explanation: `Total parts = ${parts} and one part = ${per}. The smaller share = ${Math.min(a, b)} × ${per} = ${Math.min(a, b) * per}.`,
          smartTip: 'Total parts method',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const scale = rng.pick([50, 100, 200, 500, 1000])
        const mapDist = rng.int(2, 12)
        return makeFill({
          prompt: `A map has a scale of 1 : ${scale}. Two places are ${mapDist} cm apart on the map. What is the real distance in centimeters?`,
          answer: mapDist * scale,
          unit: 'cm',
          explanation: `Real distance = map distance × the second term of the scale = ${mapDist} × ${scale} = ${mapDist * scale} cm.`,
          smartTip: 'Total parts method',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const a = rng.int(2, 6)
        const b = rng.int(2, 6)
        const c = rng.int(2, 9)
        return makeJudge({
          prompt: `True or false: The value of the ratio ${a} : ${b} equals the value of the ratio ${a * c} : ${b * c}.`,
          correct: true,
          explanation: `Both terms are multiplied by ${c}, so the value does not change: ${a} : ${b} = ${a * c} : ${b * c} = ${round2(a / b)}.`,
          smartTip: 'Divide by the GCF',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   3. Percentage applications
   ══════════════════════════════════════════════ */

const percentApp: Topic = {
  id: 'g6-percent-app',
  grade: 6,
  name: 'Percentage Applications',
  color: 'green',
  icon: 'TrendingUp',
  summary: 'Solve real problems about discounts, tax, interest, and percentage increase and decrease.',
  explanation: [
    {
      title: 'Discounts',
      body: 'A discount of 20% off means you pay 80% of the original price. The sale price = original price × (100% − discount).',
      example: 'Original price 200 dollars with 20% off → 200 × 80% = 160 dollars',
    },
    {
      title: 'Tax and interest',
      body: 'Tax = income × tax rate. Interest = principal × interest rate × time. The total you take out = principal + interest.',
      example: 'Principal 1,000 dollars, 2% a year, for 1 year → interest 20 dollars',
    },
    {
      title: 'Percentage increase and decrease',
      body: 'To find "how many percent more (or less) than a number", first find the amount of the change, then divide by the base amount (the 100%). Finding the base is the key.',
      example: 'From 50 up to 60, the increase is (60 − 50) ÷ 50 = 20%',
    },
  ],
  smartMethods: [
    {
      name: 'Find the base (the 100%)',
      when: 'Doing percentage word problems',
      steps: ['Look after words like "is", "of", "than" and "equal to" to find the base', 'If the base is known, multiply', 'If the base is unknown, divide or write an equation'],
      example: '"20% lower than the original price" → the original price is the base',
    },
    {
      name: 'Multiply by the percent you pay',
      when: 'Finding the price after a discount',
      steps: ['Work out the percentage you pay: 100% − the discount', 'Original price × that percentage = sale price', 'To find the saving, use original price − sale price'],
      example: '200 × 80% = 160, so you save 40 dollars',
    },
    {
      name: 'Percent change formula',
      when: 'Finding the percentage increase or decrease',
      steps: ['First find the difference between the amounts', 'Then divide by the original amount (the base)', 'Finally write it as a percentage'],
      example: '(60 − 50) ÷ 50 = 20%',
    },
  ],
  levels: buildLevels(6, [
    'Discount problems',
    'Percentage increase and decrease',
    'Tax problems',
    'Interest problems',
    'Percentage word problems',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const price = rng.pick([50, 80, 100, 120, 150, 200, 240, 300, 360, 400])
      const discount = rng.pick([5, 6, 7, 8, 9])
      const off = 100 - discount * 10
      return makeFill({
        prompt: `An item originally costs ${price} dollars and is on sale for ${off}% off. What is the sale price in dollars?`,
        answer: round2((price * discount) / 10),
        unit: 'dollars',
        explanation: `${off}% off means paying ${discount * 10}%, so the sale price = ${price} × ${discount * 10}% = ${round2((price * discount) / 10)} dollars.`,
        smartTip: 'Multiply by the percent you pay',
      })
    })

    makers.push(() => {
      const price = rng.pick([50, 80, 100, 120, 150, 200, 240, 300, 360, 400])
      const discount = rng.pick([5, 6, 7, 8, 9])
      const off = 100 - discount * 10
      return makeFill({
        prompt: `An item originally costs ${price} dollars and is on sale for ${off}% off. How many dollars cheaper is it than the original price?`,
        answer: round2(price - (price * discount) / 10),
        unit: 'dollars',
        explanation: `Sale price = ${price} × ${discount * 10}% = ${round2((price * discount) / 10)} dollars, so it is ${price} − ${round2((price * discount) / 10)} = ${round2(price - (price * discount) / 10)} dollars cheaper.`,
        smartTip: 'Multiply by the percent you pay',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const base = rng.int(20, 200)
        const p = rng.pick([10, 20, 25, 50])
        const isUp = rng.bool()
        const value = isUp ? round2(base * (1 + p / 100)) : round2(base * (1 - p / 100))
        return makeFill({
          prompt: `Start with ${base} and ${isUp ? 'increase' : 'decrease'} it by ${p}%. What number do you get?`,
          answer: value,
          explanation: `${base} × (1 ${isUp ? '+' : '−'} ${p / 100}) = ${base} × ${round2(isUp ? 1 + p / 100 : 1 - p / 100)} = ${value}.`,
          smartTip: 'Percent change formula',
        })
      })
    }

    if (level >= 2) {
      makers.push(() => {
        const base = rng.pick([50, 80, 100, 120, 200])
        const p = rng.pick([20, 25, 50])
        const now = round2(base * (1 + p / 100))
        return makeFill({
          prompt: `A number was ${base} and is now ${now}. By what percent did it increase? (Enter only the number.)`,
          answer: p,
          unit: '%',
          explanation: `(new − original) ÷ original = (${now} − ${base}) ÷ ${base} = ${round2(now - base)} ÷ ${base} = ${p / 100} = ${p}%.`,
          smartTip: 'Percent change formula',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const income = rng.pick([2000, 3000, 4000, 5000, 6000, 8000])
        const rate = rng.pick([3, 5, 10])
        return makeFill({
          prompt: `A monthly income of ${income} dollars is taxed at a rate of ${rate}%. How many dollars of tax must be paid?`,
          answer: round2((income * rate) / 100),
          unit: 'dollars',
          explanation: `Tax = income × tax rate = ${income} × ${rate}% = ${round2((income * rate) / 100)} dollars.`,
          smartTip: 'Find the base (the 100%)',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const principal = rng.pick([1000, 2000, 5000, 8000, 10000])
        const rate = rng.pick([1.5, 2, 2.5, 3])
        const years = rng.int(1, 3)
        return makeFill({
          prompt: `${principal} dollars is put in a bank at an interest rate of ${rate}% a year for ${years} ${years === 1 ? 'year' : 'years'}. How many dollars of interest are earned at the end?`,
          answer: round2((principal * (rate / 100) * years)),
          unit: 'dollars',
          explanation: `Interest = principal × rate × time = ${principal} × ${rate}% × ${years} = ${round2(principal * (rate / 100) * years)} dollars.`,
          smartTip: 'Find the base (the 100%)',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const total = rng.pick([200, 300, 400, 500, 600])
        const p = rng.pick([20, 25, 40, 60, 75])
        return makeFill({
          prompt: `Grade 6 has ${total} students and ${p}% of them are boys. How many girls are there?`,
          answer: round2((total * (100 - p)) / 100),
          unit: 'girls',
          explanation: `Girls are ${100 - p}% of the students: ${total} × ${100 - p}% = ${round2((total * (100 - p)) / 100)} girls.`,
          smartTip: 'Find the base (the 100%)',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const now = rng.pick([80, 90, 120, 150, 180])
        const p = rng.pick([20, 25, 50])
        const original = round2(now / (1 - p / 100))
        return makeFill({
          prompt: `After a ${p}% price cut an item sells for ${now} dollars. What was the original price in dollars?`,
          answer: original,
          unit: 'dollars',
          explanation: `Sale price = original price × (1 − ${p}%), so the original price = ${now} ÷ ${round2(1 - p / 100)} = ${original} dollars.`,
          smartTip: 'Find the base (the 100%)',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   4. Circles
   ══════════════════════════════════════════════ */

const circle: Topic = {
  id: 'g6-circle',
  grade: 6,
  name: 'Circles',
  color: 'pink',
  icon: 'Circle',
  summary: 'Learn the parts of a circle, and master circumference and area (use 3.14 for π).',
  explanation: [
    {
      title: 'Parts of a circle',
      body: 'The center is marked O. A line segment from the center to any point on the circle is a radius r. A line segment through the center with both ends on the circle is a diameter d. In the same circle, d = 2r and r = d ÷ 2.',
      example: 'A circle with a radius of 3 cm has a diameter of 6 cm',
    },
    {
      title: 'Circumference',
      body: 'The circumference C = πd = 2πr. Pi (π) is the ratio of the circumference to the diameter. It is a non-repeating decimal that goes on forever, and we usually use 3.14.',
      example: 'Radius 5 → C = 2 × 3.14 × 5 = 31.4',
    },
    {
      title: 'Area of a circle',
      body: 'Cut a circle into equal pieces and rearrange them into an almost-rectangle. The length of the rectangle is half the circumference (πr) and the width is the radius r, so the area S = πr².',
      example: 'Radius 5 → S = 3.14 × 5² = 78.5',
    },
  ],
  smartMethods: [
    {
      name: 'Diameter → radius',
      when: 'The question gives the diameter',
      steps: ['First divide the diameter by 2 to get the radius', 'Then use the circumference or area formula', 'Do not use d where r is needed'],
      example: 'd = 8 → r = 4, S = 3.14 × 16 = 50.24',
    },
    {
      name: 'Multiply by π last',
      when: 'Working out circumference and area by hand',
      steps: ['First work out r or r²', 'Then multiply by 3.14', 'This makes mistakes less likely'],
      example: 'r = 5 → r² = 25 → 25 × 3.14 = 78.5',
    },
    {
      name: 'Big circle minus small circle',
      when: 'Finding the area of a ring (the shaded part)',
      steps: ['First find the area of the outer circle', 'Then find the area of the inner circle', 'Subtract the two'],
      example: 'R = 5, r = 3 → 3.14 × (25 − 9) = 50.24',
    },
  ],
  levels: buildLevels(6, [
    'Learn the parts of a circle',
    'Circumference of a circle',
    'Area of a circle',
    'Rings and combined shapes',
    'Circles in real life',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const r = rng.int(2, [5, 8, 10, 12, 15][level - 1])
      return makeFill({
        prompt: `A circle has a radius of ${r} cm. What is its diameter in centimeters?`,
        answer: r * 2,
        unit: 'cm',
        explanation: `In the same circle, diameter = radius × 2 = ${r} × 2 = ${r * 2} cm.`,
        smartTip: 'Diameter → radius',
      })
    })

    makers.push(() => {
      const d = rng.int(1, [5, 8, 10, 12, 15][level - 1]) * 2
      return makeFill({
        prompt: `A circle has a diameter of ${d} cm. What is its radius in centimeters?`,
        answer: d / 2,
        unit: 'cm',
        explanation: `In the same circle, radius = diameter ÷ 2 = ${d} ÷ 2 = ${d / 2} cm.`,
        smartTip: 'Diameter → radius',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const r = rng.int(1, [5, 8, 10, 12, 15][level - 1])
        return makeFill({
          prompt: `A circle has a radius of ${r} cm. What is its circumference in centimeters? (Use 3.14 for π.)`,
          answer: round2(2 * PI * r),
          unit: 'cm',
          explanation: `C = 2πr = 2 × 3.14 × ${r} = ${round2(2 * PI * r)} cm.`,
          smartTip: 'Multiply by π last',
        })
      })
    }

    if (level >= 2) {
      makers.push(() => {
        const d = rng.int(2, [6, 10, 14, 18, 20][level - 1]) * 2
        return makeFill({
          prompt: `A circle has a diameter of ${d} cm. What is its circumference in centimeters? (Use 3.14 for π.)`,
          answer: round2(PI * d),
          unit: 'cm',
          explanation: `C = πd = 3.14 × ${d} = ${round2(PI * d)} cm.`,
          smartTip: 'Diameter → radius',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const r = rng.int(1, [5, 8, 10, 12, 15][level - 1])
        return makeFill({
          prompt: `A circle has a radius of ${r} cm. What is its area in square centimeters? (Use 3.14 for π.)`,
          answer: round2(PI * r * r),
          unit: 'cm²',
          explanation: `S = πr² = 3.14 × ${r}² = 3.14 × ${r * r} = ${round2(PI * r * r)} cm².`,
          smartTip: 'Multiply by π last',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const d = rng.int(1, 10) * 2
        const r = d / 2
        return makeFill({
          prompt: `A circle has a diameter of ${d} cm. What is its area in square centimeters? (Use 3.14 for π.)`,
          answer: round2(PI * r * r),
          unit: 'cm²',
          explanation: `First find the radius: ${d} ÷ 2 = ${r} cm. Then the area: 3.14 × ${r}² = ${round2(PI * r * r)} cm².`,
          smartTip: 'Diameter → radius',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const R = rng.int(4, 10)
        const r = rng.int(1, R - 1)
        return makeFill({
          prompt: `A ring has an outer radius of ${R} cm and an inner radius of ${r} cm. What is its area in square centimeters? (Use 3.14 for π.)`,
          answer: round2(PI * (R * R - r * r)),
          unit: 'cm²',
          explanation: `S = π(R² − r²) = 3.14 × (${R * R} − ${r * r}) = 3.14 × ${R * R - r * r} = ${round2(PI * (R * R - r * r))} cm².`,
          smartTip: 'Big circle minus small circle',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const r = rng.int(2, 9)
        const laps = rng.int(2, 10)
        return makeFill({
          prompt: `A round flower bed has a radius of ${r} m. How many meters do you walk if you go around it ${laps} times? (Use 3.14 for π.)`,
          answer: round2(2 * PI * r * laps),
          unit: 'm',
          explanation: `One lap is the circumference: 2 × 3.14 × ${r} = ${round2(2 * PI * r)} m. ${laps} laps = ${round2(2 * PI * r)} × ${laps} = ${round2(2 * PI * r * laps)} m.`,
          smartTip: 'Multiply by π last',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const c = round2(2 * PI * rng.int(2, 9))
        const r = round2(c / (2 * PI))
        return makeJudge({
          prompt: `True or false: If the radius of a circle is doubled, the circumference doubles and the area doubles too.`,
          correct: false,
          explanation: `When the radius doubles, the circumference does double, but the area becomes 2² = 4 times as big. For example, with r = ${r} the circumference is about ${c}, the area is πr², and doubling the radius makes the area 4 times as big.`,
          smartTip: 'Multiply by π last',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   5. Negative numbers
   ══════════════════════════════════════════════ */

const negative: Topic = {
  id: 'g6-negative',
  grade: 6,
  name: 'Negative Numbers',
  color: 'purple',
  icon: 'Thermometer',
  summary: 'Learn positive and negative numbers, show them on a number line and compare them, and understand quantities with opposite meanings.',
  explanation: [
    {
      title: 'Positive and negative numbers',
      body: 'Numbers like 3, +5 and 1.2 are positive numbers (the plus sign can be left out). Numbers with a minus sign, like −3 and −5.5, are negative numbers. 0 is neither positive nor negative, and it is the dividing line between them.',
      example: '5°C above zero is written +5°C, and 5°C below zero is written −5°C',
    },
    {
      title: 'Using positive and negative numbers for opposite quantities',
      body: 'When two quantities have opposite meanings, one can be shown with a positive number and the other with a negative number. First decide which one counts as positive, and then the opposite one is negative.',
      example: 'Walking 5 m east is +5 m, and walking 5 m west is −5 m',
    },
    {
      title: 'Comparing on a number line',
      body: 'On a number line, a number on the left is always smaller than a number on the right. Positive numbers are greater than 0, negative numbers are less than 0, and every positive number is greater than every negative number. Between two negative numbers, the one with the bigger absolute value is smaller.',
      example: '−5 < −3 < 0 < 2',
    },
  ],
  smartMethods: [
    {
      name: 'Draw a number line',
      when: 'Comparing positive and negative numbers',
      steps: ['Draw a number line and mark 0', 'Mark each number on it', 'The further right, the bigger; the further left, the smaller'],
      example: '−5 −3 0 2 → they get bigger from left to right',
    },
    {
      name: 'Compare negatives by absolute value',
      when: 'Comparing two negative numbers',
      steps: ['First compare their absolute values', 'The negative number with the bigger absolute value is smaller', 'In other words, the further from 0, the smaller'],
      example: '|−8| > |−3|, so −8 < −3',
    },
    {
      name: 'Choose the positive direction first',
      when: 'Using positive and negative numbers in real situations',
      steps: ['Decide which direction (or situation) counts as positive', 'The opposite is written as negative', '0 stands for the starting point or the standard'],
      example: 'If income is positive → spending 100 dollars is written −100 dollars',
    },
  ],
  levels: buildLevels(6, [
    'Learn positive and negative numbers',
    'Opposite quantities with positive and negative numbers',
    'Showing numbers on a number line and comparing them',
    'Simple calculations with positive and negative numbers',
    'Negative number word problems',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const n = rng.int(1, 20)
      return makeFill({
        prompt: `How do you write ${n}°C below zero as a negative number?`,
        answer: -n,
        unit: '°C',
        explanation: `Taking 0°C as the standard, ${n}°C below zero is written −${n}°C.`,
        smartTip: 'Choose the positive direction first',
      })
    })

    makers.push(() => {
      const n = rng.int(1, 100)
      const isIncome = rng.bool()
      return makeChoice({
        prompt: `If income counts as positive, how do you write ${isIncome ? 'an income' : 'an expense'} of ${n} dollars?`,
        answer: `${isIncome ? '+' : '−'}${n} dollars`,
        wrong: [
          `${isIncome ? '−' : '+'}${n} dollars`,
          `${n} dollars`,
          `0 dollars`,
        ],
        explanation: `Income is positive, so ${isIncome ? 'an income' : 'an expense'} of ${n} dollars is written ${isIncome ? '+' : '−'}${n} dollars.`,
        smartTip: 'Choose the positive direction first',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const cases: Array<[string, string, string[]]> = [
          ['If walking east counts as positive, how do you write walking 8 m west?', '−8 m', ['+8 m', '8 m', '0 m']],
          ['If a rising water level counts as positive, how do you write a drop of 3 cm?', '−3 cm', ['+3 cm', '3 cm', '0 cm']],
          ['If a correct answer scores positive points, how do you write losing 5 points for a wrong answer?', '−5 points', ['+5 points', '5 points', '0 points']],
          ['If being above sea level counts as positive, how do you write 155 m below sea level?', '−155 m', ['+155 m', '155 m', '0 m']],
        ]
        const [prompt, answer, wrong] = rng.pick(cases)
        return makeChoice({
          prompt,
          answer,
          wrong,
          explanation: `The correct answer: ${answer}. A quantity with the opposite meaning is shown with a minus sign.`,
          smartTip: 'Choose the positive direction first',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const a = -rng.int(1, 20)
        const b = rng.int(0, 20)
        return makeChoice({
          prompt: `Which is bigger, ${a} or ${b}?`,
          answer: String(Math.max(a, b)),
          wrong: [String(Math.min(a, b)), '0', 'They are equal'],
          explanation: `A positive number is greater than a negative number: ${Math.max(a, b)} > ${Math.min(a, b)}. On the number line ${Math.max(a, b)} is on the right.`,
          smartTip: 'Draw a number line',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const a = -rng.int(2, 20)
        const b = -rng.int(1, 19)
        if (a === b) return makers[0]()
        const symbol = a > b ? '>' : '<'
        return makeChoice({
          prompt: `${a} ○ ${b}. What goes in the circle?`,
          answer: symbol,
          wrong: [symbol === '>' ? '<' : '>', '=', '≠'],
          explanation: `Compare two negative numbers by absolute value. Between ${Math.abs(a)} and ${Math.abs(b)}, ${Math.abs(a) > Math.abs(b) ? `${Math.abs(a)} is bigger, so ${a} is smaller` : `${Math.abs(b)} is bigger, so ${b} is smaller`}. Write ${symbol}.`,
          smartTip: 'Compare negatives by absolute value',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const a = rng.int(1, 15)
        const b = rng.int(1, 15)
        return makeFill({
          prompt: `The temperature is ${-a}°C and rises by ${a + b}°C. What is the temperature now?`,
          answer: b,
          unit: '°C',
          explanation: `−${a} + ${a + b} = ${b}, so the temperature is ${b}°C.`,
          smartTip: 'Draw a number line',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const a = rng.int(1, 15)
        const b = rng.int(1, 15)
        return makeFill({
          prompt: `${a} + (−${b}) = ?`,
          answer: a - b,
          explanation: `Adding a negative number is the same as subtracting its absolute value: ${a} − ${b} = ${a - b}.`,
          smartTip: 'Draw a number line',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const start = -rng.int(5, 15)
        const up = rng.int(3, 20)
        const down = rng.int(1, 10)
        return makeFill({
          prompt: `An elevator starts at floor ${start}, goes up ${up} floors, then down ${down} floors. Which floor does it end on?`,
          answer: start + up - down,
          explanation: `${start} + ${up} − ${down} = ${start + up - down}, so it ends on floor ${start + up - down}.`,
          smartTip: 'Draw a number line',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        return makeJudge({
          prompt: 'True or false: 0 is a positive number.',
          correct: false,
          explanation: '0 is neither positive nor negative. It is the dividing point between positive and negative numbers.',
          smartTip: 'Draw a number line',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   6. Algebraic expressions and equations
   ══════════════════════════════════════════════ */

const algebra: Topic = {
  id: 'g6-algebra',
  grade: 6,
  name: 'Expressions and Equations',
  color: 'teal',
  icon: 'Variable',
  summary: 'Evaluate algebraic expressions, solve more complex equations, and use equations to solve real problems.',
  explanation: [
    {
      title: 'Algebraic expressions and evaluating',
      body: 'An expression made of numbers and letters joined by operation signs is called an algebraic expression. To evaluate it, replace each letter with the given number and follow the order of operations.',
      example: 'When a = 3, 2a + 5 = 2 × 3 + 5 = 11',
    },
    {
      title: 'How to approach solving equations',
      body: 'Solving an equation is like peeling an onion: treat the part with x as one piece, remove the extra numbers around x one step at a time, and finally find x.',
      example: '3x + 6 = 21 → 3x = 15 → x = 5',
    },
    {
      title: 'Writing equations for word problems',
      body: 'First let the unknown be x, then find the equal relationship in the problem and write an equation. After solving, check the answer and write the conclusion.',
      example: '"5 more than twice a number is 21" → 2x + 5 = 21 → x = 8',
    },
  ],
  smartMethods: [
    {
      name: 'Treat it as one piece first',
      when: 'The x in an equation is multiplied and added at the same time',
      steps: ['First treat the whole part with x as one big term', 'Use addition or subtraction to remove the number beside it', 'Then use multiplication or division to find x'],
      example: '3x + 6 = 21 → 3x = 15 → x = 5',
    },
    {
      name: 'Find the equation sentence',
      when: 'Writing equations for word problems',
      steps: ['Look in the problem for key words like "is", "equals", "total" and "more than"', 'Translate that sentence into an equation', 'Use x for the unknown'],
      example: '"A is 5 more than twice B" → A = 2 × B + 5',
    },
    {
      name: 'Check by substituting',
      when: 'After you have an answer',
      steps: ['Put the value of x into the original equation', 'Work out the left and right sides separately', 'The solution is right only if they are equal'],
      example: '2 × 8 + 5 = 21 ✓',
    },
  ],
  levels: buildLevels(6, [
    'Evaluate algebraic expressions',
    'Solve ax + b = c equations',
    'Solve equations with parentheses',
    'Write equations for word problems',
    'Equation word problems',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const coeff = rng.int(2, 9)
      const value = rng.int(2, [5, 8, 10, 12, 15][level - 1])
      const constant = rng.int(1, 20)
      return makeFill({
        prompt: `When a = ${value}, what is the value of the expression ${coeff}a + ${constant}?`,
        answer: coeff * value + constant,
        explanation: `Put a = ${value} in: ${coeff} × ${value} + ${constant} = ${coeff * value} + ${constant} = ${coeff * value + constant}.`,
        smartTip: 'Treat it as one piece first',
      })
    })

    makers.push(() => {
      const a = rng.int(2, 9)
      const x = rng.int(2, [8, 10, 15, 20, 25][level - 1])
      const b = rng.int(1, 25)
      return makeFill({
        prompt: `Solve the equation: ${a}x + ${b} = ${a * x + b}. What is x?`,
        answer: x,
        explanation: `First treat ${a}x as one piece: ${a}x = ${a * x + b} − ${b} = ${a * x}. Then divide by ${a}: x = ${x}. Check: ${a} × ${x} + ${b} = ${a * x + b} ✓`,
        smartTip: 'Treat it as one piece first',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const a = rng.int(2, 9)
        const x = rng.int(2, 15)
        const b = rng.int(1, 20)
        return makeFill({
          prompt: `Solve the equation: ${a}x − ${b} = ${a * x - b}. What is x?`,
          answer: x,
          explanation: `First treat ${a}x as one piece: ${a}x = ${a * x - b} + ${b} = ${a * x}. Then divide by ${a}: x = ${x}.`,
          smartTip: 'Treat it as one piece first',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const a = rng.int(2, 8)
        const x = rng.int(2, 12)
        const b = rng.int(1, 9)
        const total = a * (x + b)
        return makeFill({
          prompt: `Solve the equation: ${a}(x + ${b}) = ${total}. What is x?`,
          answer: x,
          explanation: `First treat (x + ${b}) as one piece: x + ${b} = ${total} ÷ ${a} = ${x + b}, so x = ${x + b} − ${b} = ${x}.`,
          smartTip: 'Treat it as one piece first',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const x = rng.int(2, 12)
        const a = rng.int(2, 6)
        const b = rng.int(1, 10)
        return makeChoice({
          prompt: `Which is the solution of ${a}x + ${b} = ${a * x + b}?`,
          answer: `x = ${x}`,
          wrong: [`x = ${x + 1}`, `x = ${x + b}`, `x = ${x * a}`],
          explanation: `Check by substituting: ${a} × ${x} + ${b} = ${a * x + b}. Both sides are equal, so x = ${x}.`,
          smartTip: 'Check by substituting',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const x = rng.int(3, 30)
        const multiplier = rng.int(2, 6)
        const extra = rng.int(1, 20)
        return makeFill({
          prompt: `${multiplier} times a number plus ${extra} equals ${multiplier * x + extra}. What is the number?`,
          answer: x,
          explanation: `Let the number be x: ${multiplier}x + ${extra} = ${multiplier * x + extra}, so ${multiplier}x = ${multiplier * x} and x = ${x}.`,
          smartTip: 'Find the equation sentence',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const price = rng.int(3, 15)
        const count = rng.int(3, 15)
        const extra = rng.int(2, 20)
        return makeFill({
          prompt: `You buy ${count} pens at x dollars each and pay ${extra} dollars extra for packaging. You pay ${price * count + extra} dollars in all. How many dollars does each pen cost?`,
          answer: price,
          unit: 'dollars',
          explanation: `Write the equation: ${count}x + ${extra} = ${price * count + extra}, so ${count}x = ${price * count} and x = ${price}.`,
          smartTip: 'Find the equation sentence',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const x = rng.int(4, 25)
        const ratio = rng.int(2, 5)
        return makeFill({
          prompt: `The sum of two numbers is ${x * (ratio + 1)}, and the first number is ${ratio} times the second number. What is the second number?`,
          answer: x,
          explanation: `Let the second number be x, so the first is ${ratio}x: x + ${ratio}x = ${x * (ratio + 1)}, so ${ratio + 1}x = ${x * (ratio + 1)} and x = ${x}.`,
          smartTip: 'Find the equation sentence',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const x = rng.int(2, 15)
        const a = rng.int(2, 7)
        const b = rng.int(1, 15)
        return makeJudge({
          prompt: `True or false: x = ${x + 1} is the solution of the equation ${a}x + ${b} = ${a * x + b}.`,
          correct: false,
          explanation: `Check by substituting: ${a} × ${x + 1} + ${b} = ${a * (x + 1) + b}, which is not ${a * x + b}, so x = ${x + 1} is not the solution. The correct solution is x = ${x}.`,
          smartTip: 'Check by substituting',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

export const grade6Topics: Topic[] = [
  fractionMixed,
  ratio,
  percentApp,
  circle,
  negative,
  algebra,
]

/** Fraction simplification helper for display on pages */
export const simplifyDisplay = (n: number, d: number): string => {
  const [a, b] = simplify(n, d)
  return b === 1 ? String(a) : `${a}/${b}`
}
