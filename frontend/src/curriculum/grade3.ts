import { buildLevels, buildQuestionSet, fracStr, makeChoice, makeFill, makeJudge, rng } from './core'
import type { Question, Topic } from './types'

/* ══════════════════════════════════════════════
   1. Multiplication tables
   ══════════════════════════════════════════════ */

const multTable: Topic = {
  id: 'g3-multable',
  grade: 3,
  name: 'Multiplication Tables',
  color: 'indigo',
  icon: 'X',
  summary: 'Master the times tables from 1 to 9 until you can say them without thinking.',
  explanation: [
    {
      title: 'The times table',
      body: 'The times table has 45 facts that cover all the multiplication from 1 to 9. Learn to recite it across the rows and down the columns.',
      example: '1 × 1 = 1, 1 × 2 = 2 … 9 × 9 = 81',
    },
    {
      title: 'One fact, two multiplication sentences',
      body: 'Except for facts where both factors are the same (like 3 × 3 = 9), every fact gives you two multiplication sentences.',
      example: '6 × 7 = 42 and 7 × 6 = 42',
    },
    {
      title: 'How the product changes',
      body: 'If one factor stays the same and the other factor becomes several times bigger, the product becomes the same number of times bigger. Use this to work out facts you do not know well.',
      example: 'If you know 6 × 4 = 24, then 6 × 8 = 24 × 2 = 48',
    },
  ],
  smartMethods: [
    {
      name: 'Split a factor',
      when: 'You meet a big multiplication you do not know well',
      steps: ['Split one factor into two smaller numbers', 'Multiply each part separately', 'Add the two products'],
      example: '7 × 8 = 7 × 5 + 7 × 3 = 35 + 21 = 56',
    },
    {
      name: 'Double it',
      when: 'You remember the small fact but forgot the bigger one',
      steps: ['First find the product for half of the factor', 'Multiply that product by 2', 'That is the final answer'],
      example: '6 × 4 = 24 → 6 × 8 = 48',
    },
    {
      name: 'The finger trick for nines',
      when: 'Multiplying by 9',
      steps: ['Hold up all ten fingers', 'Fold down the finger that matches the number you multiply by', 'Fingers on the left are the tens, fingers on the right are the ones'],
      example: '9 × 7: fold down finger 7, 6 fingers on the left and 3 on the right → 63',
    },
  ],
  levels: buildLevels(3, [
    'Times tables for 1 to 5',
    'Times tables for 6 to 9',
    'Fill in the blank and work out facts',
    'Compare multiplication sentences',
    'Multiplication word problems',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []
    const maxA = [5, 9, 9, 9, 9][level - 1]
    const maxB = [5, 9, 9, 9, 9][level - 1]

    makers.push(() => {
      const a = rng.int(2, maxA)
      const b = rng.int(2, maxB)
      return makeFill({
        prompt: `${a} × ${b} = ?`,
        answer: a * b,
        explanation: `Times table: ${a} × ${b} = ${a * b}.`,
        smartTip: a === 9 || b === 9 ? 'The finger trick for nines' : 'Split a factor',
      })
    })

    makers.push(() => {
      const a = rng.int(2, maxA)
      const b = rng.int(2, maxB)
      const product = a * b
      return makeFill({
        prompt: `${b} × ${a} = ?`,
        answer: product,
        explanation: `Swapping the factors does not change the product: ${b} × ${a} = ${a} × ${b} = ${product}.`,
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const a = rng.int(6, 9)
        const b = rng.int(6, 9)
        const product = a * b
        return makeChoice({
          prompt: `${a} × ${b} = ?`,
          answer: String(product),
          wrong: [String(product - a), String(product + a), String(product - b)],
          explanation: `Times table: ${a} × ${b} = ${product}. You can also use ${a} × ${b - 5} + ${a} × 5 = ${a * (b - 5)} + ${a * 5} = ${product}.`,
          smartTip: 'Split a factor',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const a = rng.int(3, 9)
        const b = rng.int(3, 9)
        const product = a * b
        return makeFill({
          prompt: `${a} × (  ) = ${product}`,
          answer: b,
          explanation: `Think of the times table: ${a} times what equals ${product}? ${a} × ${b} = ${product}.`,
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const a = rng.int(3, 8)
        const b = rng.int(3, 8)
        const half = b % 2 === 0 ? b / 2 : b
        return makeFill({
          prompt: `Given ${a} × ${half} = ${a * half}, what is ${a} × ${half * 2}?`,
          answer: a * half * 2,
          explanation: `One factor becomes 2 times bigger, so the product becomes 2 times bigger too: ${a * half} × 2 = ${a * half * 2}.`,
          smartTip: 'Double it',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const a = rng.int(2, 9)
        const b = rng.int(2, 9)
        const c = rng.int(2, 9)
        return makeChoice({
          prompt: `Which expression has the biggest product?\nA. ${a} × ${b} | B. ${a} × ${c} | C. ${b} × ${c}`,
          answer: a * b >= a * c && a * b >= b * c ? 'A' : a * c >= b * c ? 'B' : 'C',
          wrong: ['A', 'B', 'C'],
          explanation: `A = ${a * b}, B = ${a * c}, C = ${b * c}. The biggest is ${Math.max(a * b, a * c, b * c)}.`,
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const each = rng.int(3, 9)
        const groups = rng.int(3, 9)
        const extra = rng.int(1, 9)
        return makeFill({
          prompt: `There are ${groups} boxes of colored pencils with ${each} pencils in each box, plus ${extra} loose pencils. How many colored pencils are there in all?`,
          answer: each * groups + extra,
          unit: 'pencils',
          explanation: `First the boxes: ${each} × ${groups} = ${each * groups} pencils. Then add the ${extra} loose ones for ${each * groups + extra} pencils in all.`,
          smartTip: 'Split a factor',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   2. Division
   ══════════════════════════════════════════════ */

const division: Topic = {
  id: 'g3-division',
  grade: 3,
  name: 'Introduction to Division',
  color: 'orange',
  icon: 'Divide',
  summary: 'Understand equal sharing, use the times tables to find quotients, and learn remainders and division with a remainder.',
  explanation: [
    {
      title: 'Equal sharing',
      body: 'When every share gets the same amount, it is called equal sharing. To share a number equally into some groups and find how many are in each group, use division.',
      example: '12 apples shared equally into 3 groups gives 12 ÷ 3 = 4 apples in each group',
    },
    {
      title: 'Parts of a division sentence',
      body: 'In a ÷ b = c, a is the dividend, b is the divisor and c is the quotient. Division is the inverse of multiplication.',
      example: '18 ÷ 3 = 6 because 3 × 6 = 18',
    },
    {
      title: 'The remainder must be smaller than the divisor',
      body: 'If there is something left over after sharing equally, it is called the remainder. The remainder must be smaller than the divisor, otherwise you can still share more.',
      example: '14 ÷ 4 = 3 R 2, and the remainder 2 < the divisor 4',
    },
  ],
  smartMethods: [
    {
      name: 'Think multiplication',
      when: 'Doing division facts',
      steps: ['Rewrite the division as "divisor × what = dividend"', 'Think of the matching times table fact', 'The other number in the fact is the quotient'],
      example: '56 ÷ 7: think 7 × 8 = 56, so the quotient is 8',
    },
    {
      name: 'Draw and share',
      when: 'You do not understand what division means',
      steps: ['Draw as many objects as the dividend', 'Share them into circles, one for each part of the divisor', 'Count how many are in each circle'],
      example: '12 ○ shared into 3 circles → 4 in each circle',
    },
    {
      name: 'Check the remainder',
      when: 'After finishing a division with a remainder',
      steps: ['Check that the remainder is smaller than the divisor', 'Check with "quotient × divisor + remainder"', 'See whether it equals the dividend'],
      example: '14 ÷ 4 = 3 R 2. Check: 3 × 4 + 2 = 14 ✓',
    },
  ],
  levels: buildLevels(3, [
    'Understand equal sharing',
    'Find quotients with the times tables',
    'Fill in division sentences',
    'Division with a remainder',
    'Division word problems',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const b = rng.int(2, 9)
      const c = rng.int(2, 9)
      const a = b * c
      return makeFill({
        prompt: `${a} ÷ ${b} = ?`,
        answer: c,
        explanation: `Think multiplication: ${b} × ${c} = ${a}, so ${a} ÷ ${b} = ${c}.`,
        smartTip: 'Think multiplication',
      })
    })

    makers.push(() => {
      const groups = rng.pick([2, 3, 4, 5, 6])
      const each = rng.int(2, 9)
      const total = groups * each
      return makeFill({
        prompt: `${total} cookies are shared equally among ${groups} children. How many cookies does each child get?`,
        answer: total / groups,
        unit: 'cookies',
        explanation: `Equal sharing uses division: ${total} ÷ ${groups} = ${total / groups} cookies.`,
        smartTip: 'Draw and share',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const b = rng.int(2, 9)
        const c = rng.int(2, 9)
        const a = b * c
        return makeChoice({
          prompt: `${a} ÷ ${b} = ?`,
          answer: String(c),
          wrong: [String(c + 1), String(c - 1), String(b)],
          explanation: `Think multiplication: ${b} × ${c} = ${a}, so the quotient is ${c}.`,
          smartTip: 'Think multiplication',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const b = rng.int(2, 9)
        const c = rng.int(2, 9)
        const a = b * c
        return makeFill({
          prompt: `${a} ÷ (  ) = ${c}`,
          answer: b,
          explanation: `Divisor = dividend ÷ quotient: ${a} ÷ ${c} = ${b}.`,
          smartTip: 'Think multiplication',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const each = rng.int(2, 9)
        const groups = rng.int(2, 9)
        const total = each * groups
        return makeFill({
          prompt: `Every bag holds ${each} items. How many bags are needed for ${total} items?`,
          answer: groups,
          unit: 'bags',
          explanation: `To find the number of groups, divide: ${total} ÷ ${each} = ${groups} bags.`,
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const divisor = rng.int(3, 9)
        const quotient = rng.int(2, 8)
        const remainder = rng.int(1, divisor - 1)
        const dividend = divisor * quotient + remainder
        return makeFill({
          prompt: `${dividend} ÷ ${divisor} = quotient (  ), remainder (  ). Enter the quotient first.`,
          answer: quotient,
          explanation: `${divisor} × ${quotient} = ${divisor * quotient} and ${dividend} − ${divisor * quotient} = ${remainder}, so the quotient is ${quotient} with remainder ${remainder}, and the remainder ${remainder} < the divisor ${divisor}.`,
          smartTip: 'Check the remainder',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const divisor = rng.int(3, 9)
        const quotient = rng.int(2, 8)
        const remainder = rng.int(1, divisor - 1)
        const dividend = divisor * quotient + remainder
        return makeFill({
          prompt: `What is the remainder of ${dividend} ÷ ${divisor}?`,
          answer: remainder,
          explanation: `${divisor} × ${quotient} = ${divisor * quotient} and ${dividend} − ${divisor * quotient} = ${remainder}, so the remainder is ${remainder} (smaller than the divisor ${divisor}).`,
          smartTip: 'Check the remainder',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const divisor = rng.int(3, 8)
        const quotient = rng.int(2, 8)
        const remainder = rng.int(1, divisor - 1)
        const dividend = divisor * quotient + remainder
        return makeJudge({
          prompt: `True or false: ${dividend} ÷ ${divisor} = ${quotient} R ${remainder + divisor}`,
          correct: false,
          explanation: `The remainder must be smaller than the divisor. ${remainder + divisor} > ${divisor}, so one more share can still be made. The correct result is ${quotient + 1} R ${remainder}.`,
          smartTip: 'Check the remainder',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const divisor = rng.int(3, 8)
        const quotient = rng.int(2, 8)
        const remainder = rng.int(1, divisor - 1)
        const dividend = divisor * quotient + remainder
        return makeFill({
          prompt: `${dividend} students go boating. Each boat holds at most ${divisor} students. What is the least number of boats needed?`,
          answer: quotient + 1,
          unit: 'boats',
          explanation: `${dividend} ÷ ${divisor} = ${quotient} R ${remainder}. The ${remainder} students left over also need a boat, so the answer is ${quotient + 1} boats.`,
          smartTip: 'Check the remainder',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   3. Two-step mixed operations
   ══════════════════════════════════════════════ */

const mixedOps: Topic = {
  id: 'g3-mixed',
  grade: 3,
  name: 'Two-Step Mixed Operations',
  color: 'green',
  icon: 'Sigma',
  summary: 'Master the order of operations: multiply and divide before adding and subtracting, and do parentheses first.',
  explanation: [
    {
      title: 'Same-level operations go left to right',
      body: 'If an expression has only addition and subtraction, or only multiplication and division, work from left to right.',
      example: '18 − 5 + 7: first 18 − 5 = 13, then 13 + 7 = 20',
    },
    {
      title: 'Multiply and divide first, then add and subtract',
      body: 'If an expression has both addition or subtraction and multiplication or division, do the multiplication and division first, then the addition and subtraction.',
      example: '5 + 3 × 4 = 5 + 12 = 17 (not 8 × 4 = 32)',
    },
    {
      title: 'Parentheses come first',
      body: 'If an expression has parentheses, work out what is inside them first. Parentheses can change the order of operations.',
      example: '(5 + 3) × 4 = 8 × 4 = 32',
    },
  ],
  smartMethods: [
    {
      name: 'Underline the order',
      when: 'The expression is long and you worry about the order',
      steps: ['Underline the part you do first', 'Write its result below the line', 'Then work out the rest'],
      example: '5 + 3 × 4 → first 3 × 4 = 12, then 5 + 12',
    },
    {
      name: 'Parentheses first',
      when: 'The expression has parentheses',
      steps: ['Look only at what is inside the parentheses first', 'Put the result back into the original expression', 'Then multiply and divide before adding and subtracting'],
      example: '(12 − 4) × 5 = 8 × 5 = 40',
    },
    {
      name: 'Work backwards to check',
      when: 'You want to check the result of a mixed expression',
      steps: ['Put the result back into the original expression', 'Work backwards in the opposite order', 'See whether you get back to a number you know'],
      example: '5 + 3 × 4 = 17 → 17 − 12 = 5 ✓',
    },
  ],
  levels: buildLevels(3, [
    'Only add and subtract, or only multiply and divide',
    'Multiply and divide before add and subtract',
    'Expressions with parentheses',
    'Compare the results',
    'Mixed operation word problems',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const a = rng.int(20, 80)
      const b = rng.int(5, 20)
      const c = rng.int(3, 15)
      return makeFill({
        prompt: `${a} − ${b} + ${c} = ?`,
        answer: a - b + c,
        explanation: `With only addition and subtraction, go from left to right: ${a} − ${b} = ${a - b}, then ${a - b} + ${c} = ${a - b + c}.`,
        smartTip: 'Underline the order',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const a = rng.int(5, 30)
        const b = rng.int(2, 9)
        const c = rng.int(2, 9)
        return makeFill({
          prompt: `${a} + ${b} × ${c} = ?`,
          answer: a + b * c,
          explanation: `Multiply first: ${b} × ${c} = ${b * c}. Then add: ${a} + ${b * c} = ${a + b * c}.`,
          smartTip: 'Underline the order',
        })
      })
    }

    if (level >= 2) {
      makers.push(() => {
        const a = rng.int(30, 90)
        const b = rng.int(2, 9)
        const c = rng.int(2, 9)
        return makeFill({
          prompt: `${a} − ${b} × ${c} = ?`,
          answer: a - b * c,
          explanation: `Multiply first: ${b} × ${c} = ${b * c}. Then subtract: ${a} − ${b * c} = ${a - b * c}.`,
          smartTip: 'Underline the order',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const a = rng.int(10, 40)
        const b = rng.int(5, 20)
        const c = rng.int(2, 8)
        return makeFill({
          prompt: `(${a} − ${b}) × ${c} = ?`,
          answer: (a - b) * c,
          explanation: `Do the parentheses first: ${a} − ${b} = ${a - b}. Then multiply: ${a - b} × ${c} = ${(a - b) * c}.`,
          smartTip: 'Parentheses first',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const a = rng.int(20, 60)
        const b = rng.int(10, 30)
        const c = rng.int(2, 9)
        return makeFill({
          prompt: `(${a} + ${b}) ÷ ${c} = ?`,
          answer: Math.round(((a + b) / c) * 100) / 100,
          explanation: `Do the parentheses first: ${a} + ${b} = ${a + b}. Then divide: ${a + b} ÷ ${c} = ${Math.round(((a + b) / c) * 100) / 100}.`,
          smartTip: 'Parentheses first',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const a = rng.int(3, 9)
        const b = rng.int(3, 9)
        const c = rng.int(5, 20)
        const withBracket = (a + b) * c
        const without = a + b * c
        return makeChoice({
          prompt: `Which is bigger?\nA. (${a} + ${b}) × ${c} | B. ${a} + ${b} × ${c}`,
          answer: withBracket >= without ? 'A' : 'B',
          wrong: [withBracket >= without ? 'B' : 'A', 'They are equal', 'Cannot be compared'],
          explanation: `A = ${a + b} × ${c} = ${withBracket} and B = ${a} + ${b * c} = ${without}, so ${withBracket >= without ? 'A is bigger' : 'B is bigger'}.`,
          smartTip: 'Parentheses first',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const each = rng.int(3, 9)
        const groups = rng.int(3, 8)
        const extra = rng.int(5, 20)
        const total = each * groups + extra
        return makeJudge({
          prompt: `True or false: Each box costs ${each} dollars. You buy ${groups} boxes and pay ${extra} dollars for delivery. The total is ${total + each} dollars.`,
          correct: false,
          explanation: `${each} × ${groups} + ${extra} = ${each * groups} + ${extra} = ${total} dollars, not ${total + each} dollars.`,
          smartTip: 'Work backwards to check',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const price = rng.int(3, 9)
        const count = rng.int(3, 8)
        const paid = price * count + rng.int(10, 40)
        return makeFill({
          prompt: `Each exercise book costs ${price} dollars. You buy ${count} books and pay ${paid} dollars. How many dollars do you get back in change?`,
          answer: paid - price * count,
          unit: 'dollars',
          explanation: `First the total price: ${price} × ${count} = ${price * count} dollars. Then the change: ${paid} − ${price * count} = ${paid - price * count} dollars.`,
          smartTip: 'Underline the order',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   4. Introduction to fractions
   ══════════════════════════════════════════════ */

const fractionIntro: Topic = {
  id: 'g3-fraction',
  grade: 3,
  name: 'Introduction to Fractions',
  color: 'pink',
  icon: 'PieChart',
  summary: 'Learn unit fractions and fractions in general, compare fractions with the same denominator, and add and subtract simple fractions.',
  explanation: [
    {
      title: 'What a fraction means',
      body: 'When a whole is shared into equal parts, one part or several parts can be written as a fraction. The number below the fraction line is the denominator, which tells how many equal parts the whole is split into. The number above is the numerator, which tells how many parts are taken.',
      example: 'A cake cut into 4 equal parts, take 1 part, is 1/4',
    },
    {
      title: 'Comparing fractions with the same denominator',
      body: 'When the denominators are the same, the fraction with the bigger numerator is bigger. The whole is split into the same number of parts, so taking more parts gives more.',
      example: '3/5 > 2/5 (both are parts out of 5, and 3 parts is more than 2 parts)',
    },
    {
      title: 'Adding and subtracting fractions with the same denominator',
      body: 'When you add or subtract fractions with the same denominator, the denominator stays the same and you only add or subtract the numerators.',
      example: '2/7 + 3/7 = 5/7; 6/8 − 2/8 = 4/8',
    },
  ],
  smartMethods: [
    {
      name: 'Draw and divide',
      when: 'You do not understand what a fraction means',
      steps: ['Draw a shape to stand for the whole', 'Divide it into as many equal parts as the denominator', 'Shade as many parts as the numerator'],
      example: '3/4: divide a circle into 4 parts and shade 3 parts',
    },
    {
      name: 'Same denominator, compare numerators',
      when: 'Comparing fractions with the same denominator',
      steps: ['Check that the denominators are the same', 'If they are, compare only the numerators', 'The fraction with the bigger numerator is bigger'],
      example: '5/9 and 7/9 → 7 > 5, so 7/9 is bigger',
    },
    {
      name: 'Add the numerators, keep the denominator',
      when: 'Adding or subtracting fractions with the same denominator',
      steps: ['Check that the denominators are the same', 'Add (or subtract) the numerators', 'Copy the denominator, then simplify at the end'],
      example: '3/8 + 2/8 = 5/8',
    },
  ],
  levels: buildLevels(3, [
    'Learn unit fractions',
    'Learn fractions in general',
    'Compare fractions with the same denominator',
    'Add and subtract fractions with the same denominator',
    'Simple fraction word problems',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const d = rng.int(2, [5, 8, 9, 12, 12][level - 1])
      const n = rng.int(1, d - 1)
      return makeChoice({
        prompt: `A watermelon is cut into ${d} equal parts and you take ${n} of them. How do you write that as a fraction?`,
        answer: `${n}/${d}`,
        wrong: [`${d}/${n}`, `${n}/${d + 1}`, `${n + 1}/${d}`],
        explanation: `It is cut into ${d} equal parts, so the denominator is ${d}. You take ${n} parts, so the numerator is ${n}. The fraction is ${n}/${d}.`,
        smartTip: 'Draw and divide',
      })
    })

    makers.push(() => {
      const d = rng.int(2, 9)
      return makeFill({
        prompt: `How many 1/${d}s are there in 1?`,
        answer: d,
        explanation: `Cut 1 into ${d} equal parts and each part is 1/${d}. ${d} pieces of 1/${d} make 1.`,
        smartTip: 'Draw and divide',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const d = rng.int(3, 9)
        const a = rng.int(1, d - 2)
        const b = rng.int(a + 1, d - 1)
        const symbol = a > b ? '>' : '<'
        return makeChoice({
          prompt: `${a}/${d} ○ ${b}/${d}. What goes in the circle?`,
          answer: symbol,
          wrong: [a > b ? '<' : '>', '=', '≠'],
          explanation: `With the same denominator, compare only the numerators: ${Math.max(a, b)} > ${Math.min(a, b)}, so ${Math.max(a, b)}/${d} is bigger. Write ${a > b ? '>' : '<'}.`,
          smartTip: 'Same denominator, compare numerators',
        })
      })
    }

    if (level >= 2) {
      makers.push(() => {
        const d = rng.int(3, 9)
        const n = rng.int(1, d - 1)
        return makeJudge({
          prompt: `True or false: A pie is cut into ${d} equal parts and ${n} parts are eaten. That means ${n}/${d} of the pie was eaten.`,
          correct: true,
          explanation: `Cut into ${d} equal parts, taking ${n} parts is ${n}/${d}, so the statement is true.`,
          smartTip: 'Draw and divide',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const d = rng.int(4, 12)
        const a = rng.int(1, d - 2)
        const b = rng.int(1, d - a - 1)
        return makeFill({
          prompt: `${a}/${d} + ${b}/${d} = ? Write the answer as numerator/denominator, and simplify if you can.`,
          answer: fracStr(a + b, d),
          explanation: `The denominator stays the same and the numerators are added: ${a} + ${b} = ${a + b}, so it is ${a + b}/${d}${a + b === d ? ' = 1' : ''}, which simplifies to ${fracStr(a + b, d)}.`,
          smartTip: 'Add the numerators, keep the denominator',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const d = rng.int(4, 12)
        const a = rng.int(2, d - 1)
        const b = rng.int(1, a - 1)
        return makeFill({
          prompt: `${a}/${d} − ${b}/${d} = ? Write the answer as numerator/denominator, and simplify if you can.`,
          answer: fracStr(a - b, d),
          explanation: `The denominator stays the same and the numerators are subtracted: ${a} − ${b} = ${a - b}, so it is ${a - b}/${d}, which simplifies to ${fracStr(a - b, d)}.`,
          smartTip: 'Add the numerators, keep the denominator',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const d = rng.int(3, 9)
        const taken = rng.int(1, d - 1)
        return makeFill({
          prompt: `A rope is cut into ${d} equal pieces and ${taken} pieces are used. What fraction of the rope is left? What is the numerator?`,
          answer: d - taken,
          explanation: `There are ${d} pieces and ${taken} are used, so ${d - taken} are left. That is ${d - taken}/${d}, and the numerator is ${d - taken}.`,
          smartTip: 'Draw and divide',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   5. Perimeter
   ══════════════════════════════════════════════ */

const perimeter: Topic = {
  id: 'g3-perimeter',
  grade: 3,
  name: 'Perimeter',
  color: 'purple',
  icon: 'Square',
  summary: 'Understand the distance around a closed shape, and master the perimeter formulas for rectangles and squares.',
  explanation: [
    {
      title: 'What is perimeter',
      body: 'The distance around a closed shape is its perimeter. To find the perimeter, add up the lengths of all the sides.',
      example: 'A triangle has sides 3, 4 and 5 cm, so the perimeter = 3 + 4 + 5 = 12 cm',
    },
    {
      title: 'Perimeter of a rectangle',
      body: 'A rectangle has 2 lengths and 2 widths, so the perimeter = (length + width) × 2.',
      example: 'Length 8 cm and width 5 cm: perimeter = (8 + 5) × 2 = 26 cm',
    },
    {
      title: 'Perimeter of a square',
      body: 'All 4 sides of a square are equal, so the perimeter = side × 4. Turned around, side = perimeter ÷ 4.',
      example: 'Side 6 cm: perimeter = 6 × 4 = 24 cm',
    },
  ],
  smartMethods: [
    {
      name: 'String around the edge',
      when: 'You do not understand the idea of perimeter',
      steps: ['Imagine a piece of string going once around the edge of the shape', 'Pull the string straight', 'The length of the straight string is the perimeter'],
      example: 'Wrap a string around a textbook and measure it → the perimeter of the textbook',
    },
    {
      name: 'Add in pairs',
      when: 'Finding the perimeter of a rectangle',
      steps: ['First pair one length with one width', 'One pair is length + width', 'A rectangle has two pairs, so multiply by 2'],
      example: 'Length 8, width 5 → one pair is 13, two pairs are 26',
    },
    {
      name: 'Work back to the side',
      when: 'You know the perimeter and need a side',
      steps: ['Square: perimeter ÷ 4 = side', 'Rectangle: perimeter ÷ 2 = length + width', 'Then subtract the known side from the sum'],
      example: 'A square with perimeter 24 → side 6',
    },
  ],
  levels: buildLevels(3, [
    'Learn perimeter and find the perimeter of simple shapes',
    'Perimeter of a rectangle',
    'Perimeter of a square',
    'Find a side from the perimeter',
    'Perimeter in real life',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const a = rng.int(3, 15)
      const b = rng.int(3, 15)
      const c = rng.int(3, 15)
      return makeFill({
        prompt: `A triangle has sides of ${a} cm, ${b} cm and ${c} cm. What is its perimeter in centimeters?`,
        answer: a + b + c,
        unit: 'cm',
        explanation: `Perimeter = the sum of the three sides: ${a} + ${b} + ${c} = ${a + b + c} cm.`,
        smartTip: 'String around the edge',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const length = rng.int(5, [12, 15, 20, 25, 30][level - 1])
        const width = rng.int(2, Math.max(3, length - 2))
        return makeFill({
          prompt: `A rectangle is ${length} cm long and ${width} cm wide. What is its perimeter in centimeters?`,
          answer: (length + width) * 2,
          unit: 'cm',
          explanation: `Perimeter = (length + width) × 2 = (${length} + ${width}) × 2 = ${(length + width) * 2} cm.`,
          smartTip: 'Add in pairs',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const side = rng.int(3, [9, 12, 15, 20, 25][level - 1])
        return makeFill({
          prompt: `A square has a side of ${side} cm. What is its perimeter in centimeters?`,
          answer: side * 4,
          unit: 'cm',
          explanation: `Perimeter = side × 4 = ${side} × 4 = ${side * 4} cm.`,
          smartTip: 'Add in pairs',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const side = rng.int(3, 20)
        return makeFill({
          prompt: `A square has a perimeter of ${side * 4} cm. What is the length of its side in centimeters?`,
          answer: side,
          unit: 'cm',
          explanation: `Side = perimeter ÷ 4 = ${side * 4} ÷ 4 = ${side} cm.`,
          smartTip: 'Work back to the side',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const length = rng.int(6, 20)
        const width = rng.int(2, Math.max(3, length - 1))
        const p = (length + width) * 2
        return makeFill({
          prompt: `A rectangle has a perimeter of ${p} cm and a length of ${length} cm. What is its width in centimeters?`,
          answer: width,
          unit: 'cm',
          explanation: `Length + width = perimeter ÷ 2 = ${p / 2}, so width = ${p / 2} − ${length} = ${width} cm.`,
          smartTip: 'Work back to the side',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const length = rng.int(10, 40)
        const width = rng.int(5, Math.max(6, length - 3))
        return makeChoice({
          prompt: `A garden is ${length} m long and ${width} m wide. How long a fence is needed to go once around it?`,
          answer: `${(length + width) * 2} m`,
          wrong: [
            `${length * width} m`,
            `${length + width} m`,
            `${(length + width) * 2 + 10} m`,
          ],
          explanation: `Going once around means finding the perimeter: (length + width) × 2 = (${length} + ${width}) × 2 = ${(length + width) * 2} m.`,
          smartTip: 'Add in pairs',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const side = rng.int(4, 12)
        return makeFill({
          prompt: `4 small squares with a side of ${side} cm are put together to make one big square. What is the perimeter of the big square in centimeters?`,
          answer: side * 2 * 4,
          unit: 'cm',
          explanation: `4 small squares make a big square whose side is ${side * 2} cm, so the perimeter = ${side * 2} × 4 = ${side * 8} cm.`,
          smartTip: 'String around the edge',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   6. Years, months and days
   ══════════════════════════════════════════════ */

const calendar: Topic = {
  id: 'g3-calendar',
  grade: 3,
  name: 'Years, Months and Days',
  color: 'teal',
  icon: 'Calendar',
  summary: 'Learn long and short months, common and leap years, and the 24-hour clock.',
  explanation: [
    {
      title: 'Long months and short months',
      body: 'A year has 12 months. Long months have 31 days: January, March, May, July, August, October and December (months 1, 3, 5, 7, 8, 10 and 12). Short months have 30 days: April, June, September and November (months 4, 6, 9 and 11). February has 28 days in a common year and 29 days in a leap year.',
      example: 'Knuckle trick: the knuckles are long months and the gaps between them are short months',
    },
    {
      title: 'Common years and leap years',
      body: 'A year that is a multiple of 4 is usually a leap year. A year ending in 00 must be a multiple of 400 to be a leap year. A common year has 365 days and a leap year has 366 days.',
      example: '2024 ÷ 4 = 506 with nothing left over, so 2024 is a leap year',
    },
    {
      title: 'The 24-hour clock',
      body: 'The 24-hour clock runs from 0:00 to 24:00, and times in the afternoon get 12 added. With the 24-hour clock you do not need to write a.m. or p.m., so it is harder to mix up.',
      example: '3 p.m. = 15:00 and 8 p.m. = 20:00',
    },
  ],
  smartMethods: [
    {
      name: 'The knuckle trick',
      when: 'You cannot remember which months are long',
      steps: ['Make a fist and start counting at the first knuckle', 'A knuckle is a long month (31 days)', 'A gap between knuckles is a short month (except February)'],
      example: 'January long, February short, March long, April short …',
    },
    {
      name: 'Divide to find a leap year',
      when: 'Deciding whether a year is a leap year',
      steps: ['Divide an ordinary year by 4', 'If it divides evenly, it is a leap year', 'For a year ending in 00, divide by 400'],
      example: '2024 ÷ 4 = 506 → leap year; 1900 ÷ 400 does not divide evenly → common year',
    },
    {
      name: 'Add 12 for the afternoon',
      when: 'Changing 12-hour time to 24-hour time',
      steps: ['Morning times stay the same (drop the "a.m.")', 'Add 12 to afternoon and evening times', 'Drop the "p.m."'],
      example: '4 p.m. → 4 + 12 = 16:00',
    },
  ],
  levels: buildLevels(3, [
    'Learn long and short months',
    'How many days in a year',
    'Decide between common and leap years',
    'The 24-hour clock',
    'Dates and time together',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []
    const BIG_MONTHS = [1, 3, 5, 7, 8, 10, 12]
    const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

    makers.push(() => {
      const month = rng.int(1, 12)
      const isBig = BIG_MONTHS.includes(month)
      return makeFill({
        prompt: `How many days are in ${MONTH_NAMES[month - 1]} (month ${month})?`,
        answer: isBig ? 31 : month === 2 ? 28 : 30,
        unit: 'days',
        explanation: month === 2
          ? 'February is special: 28 days in a common year and 29 in a leap year. Here we count a common year, so 28 days.'
          : `Months ${BIG_MONTHS.join(', ')} are long months with 31 days each, and months 4, 6, 9 and 11 are short months with 30 days each. ${MONTH_NAMES[month - 1]} is a ${isBig ? 'long' : 'short'} month.`,
        smartTip: 'The knuckle trick',
      })
    })

    makers.push(() => {
      const cases: Array<[string, number, string]> = [
        ['How many months are in a year?', 12, 'months'],
        ['How many days are in a week?', 7, 'days'],
        ['How many long months (31 days) are in a year?', 7, 'months'],
        ['How many short months (30 days) are in a year?', 4, 'months'],
      ]
      const [prompt, answer, unit] = rng.pick(cases)
      return makeFill({
        prompt,
        answer,
        unit,
        explanation: `The correct answer is ${answer} ${unit}. The long months are 1, 3, 5, 7, 8, 10 and 12 (7 in all), and the short months are 4, 6, 9 and 11 (4 in all).`,
        smartTip: 'The knuckle trick',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const cases: Array<[string, number, string]> = [
          ['How many days are in a common year?', 365, 'days'],
          ['How many days are in a leap year?', 366, 'days'],
          ['How many days are in February in a common year?', 28, 'days'],
        ]
        const [prompt, answer, unit] = rng.pick(cases)
        return makeFill({
          prompt,
          answer,
          unit,
          explanation: `The correct answer is ${answer} ${unit}.`,
          smartTip: 'The knuckle trick',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const base = rng.pick([1996, 2000, 2004, 2008, 2012, 2016, 2020, 2024])
        const year = rng.bool() ? base : base + rng.pick([1, 2, 3])
        const isLeap = year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0)
        return makeJudge({
          prompt: `True or false: ${year} is a leap year.`,
          correct: isLeap,
          explanation: isLeap
            ? `${year} ÷ 4 = ${year / 4} with nothing left over, so it is a leap year with 366 days.`
            : `${year} cannot be divided evenly by 4, so it is a common year with 365 days.`,
          smartTip: 'Divide to find a leap year',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const year = rng.pick([2020, 2024, 2028])
        return makeFill({
          prompt: `How many days are in February in ${year} (a leap year)?`,
          answer: 29,
          unit: 'days',
          explanation: `${year} is a leap year, so February has 29 days.`,
          smartTip: 'Divide to find a leap year',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const hour = rng.int(1, 11)
        return makeFill({
          prompt: `Write ${hour} p.m. in 24-hour time. (Enter the hour only.)`,
          answer: hour + 12,
          explanation: `Add 12 to afternoon times: ${hour} + 12 = ${hour + 12}, so it is ${hour + 12}:00.`,
          smartTip: 'Add 12 for the afternoon',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const h24 = rng.int(13, 23)
        return makeFill({
          prompt: `${h24}:00 is what hour in the afternoon or evening (12-hour clock)? (Enter the hour only.)`,
          answer: h24 - 12,
          explanation: `To change 24-hour time back to 12-hour time, subtract 12: ${h24} − 12 = ${h24 - 12}, so it is ${h24 - 12} p.m.`,
          smartTip: 'Add 12 for the afternoon',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const start = rng.int(1, 11)
        const hours = rng.int(2, 10)
        const end24 = start + 12 + hours
        return makeFill({
          prompt: `A train leaves at ${start} p.m. and travels for ${hours} hours. What hour is its arrival time on the 24-hour clock? (Enter the hour only.)`,
          answer: end24,
          explanation: `${start} p.m. = ${start + 12}:00, and ${start + 12} + ${hours} = ${end24}, so it arrives at ${end24}:00.`,
          smartTip: 'Add 12 for the afternoon',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

export const grade3Topics: Topic[] = [
  multTable,
  division,
  mixedOps,
  fractionIntro,
  perimeter,
  calendar,
]
