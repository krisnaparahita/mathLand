import { buildLevels, buildQuestionSet, fmt, makeChoice, makeFill, makeJudge, rng } from './core'
import type { Question, Topic } from './types'

/* ══════════════════════════════════════════════
   1. Addition and subtraction within 100
   ══════════════════════════════════════════════ */

const add100: Topic = {
  id: 'g2-add100',
  grade: 2,
  name: 'Addition and Subtraction Within 100',
  color: 'indigo',
  icon: 'Plus',
  summary: 'Add and subtract two-digit numbers and multiples of ten, and line up matching place values.',
  explanation: [
    {
      title: 'Line up matching place values',
      body: 'When you add or subtract, work with ones and ones, and tens and tens. In column form, always line up the matching place values.',
      example: '23 + 45: ones 3 + 5 = 8, tens 20 + 40 = 60, together 68',
    },
    {
      title: 'Adding and subtracting multiples of ten',
      body: 'Multiples of ten are numbers whose ones digit is 0, such as 20, 50 and 80. Only look at the tens digits, then put a 0 on the end.',
      example: '30 + 50: think 3 + 5 = 8, so the answer is 80',
    },
    {
      title: 'Adding two-digit numbers',
      body: 'Split one number into tens and ones. Add the tens first, then the ones. This makes mental math faster.',
      example: '36 + 27: 36 + 20 = 56, then 56 + 7 = 63',
    },
  ],
  smartMethods: [
    {
      name: 'Split and add',
      when: 'Adding or subtracting two-digit numbers in your head',
      steps: ['Split the second number into tens and ones', 'Add (or subtract) the tens first', 'Then add (or subtract) the ones'],
      example: '48 + 35: 48 + 30 = 78, then 78 + 5 = 83',
    },
    {
      name: 'Round and adjust',
      when: 'A number is close to a multiple of ten (like 29 or 48)',
      steps: ['Treat the number as the nearby multiple of ten', 'Calculate with the multiple of ten', 'If you added too much, subtract the extra; if too little, add it back'],
      example: '56 + 29: think 56 + 30 = 86, that is 1 too many, so 86 − 1 = 85',
    },
    {
      name: 'Step down to a ten',
      when: 'In subtraction, the ones digit of the first number is too small',
      steps: ['Split the number you subtract into two parts', 'Subtract the first part to land on a multiple of ten', 'Subtract the remaining part'],
      example: '73 − 28: 73 − 23 = 50, then 50 − 5 = 45',
    },
  ],
  levels: buildLevels(2, [
    'Add and subtract multiples of ten',
    'Two-digit add and subtract (no carrying or borrowing)',
    'Two-digit addition (with carrying)',
    'Two-digit subtraction (with borrowing)',
    'Mixed add and subtract, and missing numbers',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    if (level <= 2) {
      makers.push(() => {
        const a = rng.int(11, 89)
        const b = rng.int(1, 8) * 10
        const isPlus = rng.bool()
        const value = isPlus ? a + b : a - b
        return makeFill({
          prompt: `${a} ${isPlus ? '+' : '−'} ${b} = ?`,
          answer: value,
          explanation: isPlus
            ? `Do the tens first: ${Math.floor(a / 10) * 10} + ${b} = ${Math.floor(a / 10) * 10 + b}. Then add the ones digit ${a % 10} to get ${value}.`
            : `Do the tens first: ${Math.floor(a / 10) * 10} − ${b} = ${Math.floor(a / 10) * 10 - b}. Then add the ones digit ${a % 10} to get ${value}.`,
          smartTip: 'Split and add',
        })
      })
    }

    makers.push(() => {
      const a = rng.int(11, 88)
      const b = rng.int(11, 88)
      const isPlus = rng.bool()
      if (!isPlus && a < b) {
        return makeFill({
          prompt: `${b} − ${a} = ?`,
          answer: b - a,
          explanation: `Ones: ${b % 10} − ${a % 10}. Tens: ${Math.floor(b / 10)} − ${Math.floor(a / 10)}. The result is ${b - a}.`,
          smartTip: 'Split and add',
        })
      }
      const value = isPlus ? a + b : a - b
      return makeFill({
        prompt: `${a} ${isPlus ? '+' : '−'} ${b} = ?`,
        answer: value,
        explanation: isPlus
          ? `Split: ${a} + ${Math.floor(b / 10) * 10} = ${a + Math.floor(b / 10) * 10}, then add ${b % 10} to get ${value}.`
          : `Split: ${a} − ${Math.floor(b / 10) * 10} = ${a - Math.floor(b / 10) * 10}, then subtract ${b % 10} to get ${value}.`,
        smartTip: 'Split and add',
      })
    })

    if (level >= 3) {
      makers.push(() => {
        const near = rng.pick([19, 29, 39, 49, 59, 69, 79])
        const a = rng.int(12, 60)
        const sum = a + near
        const round = near + 1
        return makeFill({
          prompt: `${a} + ${near} = ?`,
          answer: sum,
          explanation: `Round and adjust: treat ${near} as ${round}. ${a} + ${round} = ${a + round}, which is 1 too many, so the answer is ${sum}.`,
          smartTip: 'Round and adjust',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const a = rng.int(40, 95)
        const b = rng.int(15, 39)
        const value = a - b
        return makeFill({
          prompt: `${a} − ${b} = ?`,
          answer: value,
          explanation: `Step down to a ten: ${a} − ${a % 10} = ${a - (a % 10)}, then subtract the remaining ${b - (a % 10)} to get ${value}.`,
          smartTip: 'Step down to a ten',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const a = rng.int(20, 90)
        const b = rng.int(10, 40)
        const c = rng.int(5, 30)
        return makeFill({
          prompt: `${a} − ${b} + ${c} = ?`,
          answer: a - b + c,
          explanation: `Work from left to right: ${a} − ${b} = ${a - b}, then ${a - b} + ${c} = ${a - b + c}.`,
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const a = rng.int(15, 70)
        const total = rng.int(a + 11, 99)
        const b = total - a
        return makeFill({
          prompt: `${a} + (  ) = ${total}`,
          answer: b,
          explanation: `Use subtraction to find the missing addend: ${total} − ${a} = ${b}.`,
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const a = rng.int(11, 45)
        const b = rng.int(11, 45)
        const sum = a + b
        return makeJudge({
          prompt: `True or false: ${a} + ${b} = ${sum + rng.pick([-1, 1])}`,
          correct: false,
          explanation: `${a} + ${b} = ${sum}, so the statement is false.`,
          smartTip: 'Split and add',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   2. Carrying and borrowing
   ══════════════════════════════════════════════ */

const carryBorrow: Topic = {
  id: 'g2-carryborrow',
  grade: 2,
  name: 'Carrying and Borrowing',
  color: 'orange',
  icon: 'ArrowUpDown',
  summary: 'The heart of column math: carry when you reach ten and borrow a ten when you need one, quickly and accurately.',
  explanation: [
    {
      title: 'Carry when you reach ten',
      body: 'When the ones add up to 10 or more, carry 1 to the tens place. When the tens add up to 10 or more, carry 1 to the hundreds place. Do not forget to add the carried 1.',
      example: '58 + 27: ones 8 + 7 = 15, write 5 and carry 1; tens 5 + 2 + 1 = 8, so the answer is 85',
    },
    {
      title: 'Borrow a ten',
      body: 'When the ones digit is too small to subtract from, borrow 1 from the tens place and use it as 10 in the ones place. After borrowing, remember to subtract 1 from the tens.',
      example: '62 − 37: 2 is too small to subtract 7, so borrow 1 to make 12, and 12 − 7 = 5; tens 6 − 1 − 3 = 2, so the answer is 25',
    },
    {
      title: 'The habit of checking',
      body: 'Check addition by swapping the addends or by subtracting. Check subtraction by adding (difference + subtracted number = starting number).',
      example: '85 − 27 = 58. Check: 58 + 27 = 85 ✓',
    },
  ],
  smartMethods: [
    {
      name: 'Mark the carry',
      when: 'The ones add up to 10 or more',
      steps: ['Add the ones. If the result is 10 or more, write a small "1" beside the tens', 'Write the ones digit of the result in the ones place', 'When you add the tens, remember to add the small 1'],
      example: '58 + 27 → carry 1 from the ones, tens 5 + 2 + 1 = 8',
    },
    {
      name: 'Mark the borrow',
      when: 'The ones digit is too small to subtract from',
      steps: ['Put a dot over the tens digit of the first number to show you borrowed 1', 'Add 10 to the ones digit, then subtract', 'When you do the tens, subtract the 1 you borrowed first'],
      example: '62 − 37 → the tens digit 6 becomes 5, and 5 − 3 = 2',
    },
    {
      name: 'Check with the inverse',
      when: 'You want to make sure your answer is right',
      steps: ['Check subtraction with addition: difference + subtracted number', 'See whether it equals the starting number', 'If not, work it out again'],
      example: '71 − 46 = 25. Check: 25 + 46 = 71 ✓',
    },
  ],
  levels: buildLevels(2, [
    'Addition with carrying in the ones',
    'Addition that also carries in the tens',
    'Subtraction with borrowing in the ones',
    'Subtraction with repeated borrowing',
    'Carrying, borrowing and checking',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const aOnes = rng.int(2, 9)
      const bOnes = rng.int(11 - aOnes > 0 ? 11 - aOnes : 2, 9)
      const a = rng.int(1, 8) * 10 + aOnes
      const b = rng.int(1, 8) * 10 + bOnes
      const sum = a + b
      return makeFill({
        prompt: `Use column addition: ${a} + ${b} = ?`,
        answer: sum,
        explanation: `Ones: ${aOnes} + ${bOnes} = ${aOnes + bOnes}, write ${(aOnes + bOnes) % 10} and carry 1. Tens: ${Math.floor(a / 10)} + ${Math.floor(b / 10)} + 1 = ${Math.floor(a / 10) + Math.floor(b / 10) + 1}. The result is ${sum}.`,
        smartTip: 'Mark the carry',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const a = rng.int(55, 89)
        const b = rng.int(55, 89)
        const sum = a + b
        return makeFill({
          prompt: `${a} + ${b} = ?`,
          answer: sum,
          explanation: `Ones: ${a % 10} + ${b % 10} = ${(a % 10) + (b % 10)}, carry 1. Tens: ${Math.floor(a / 10)} + ${Math.floor(b / 10)} + 1 = ${Math.floor(a / 10) + Math.floor(b / 10) + 1}, which reaches ten so carry 1 again. The result is ${sum}.`,
          smartTip: 'Mark the carry',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const aOnes = rng.int(0, 7)
        const bOnes = rng.int(aOnes + 1, 9)
        const a = rng.int(3, 9) * 10 + aOnes
        const b = rng.int(1, Math.floor(a / 10) - 1) * 10 + bOnes
        const diff = a - b
        return makeFill({
          prompt: `${a} − ${b} = ?`,
          answer: diff,
          explanation: `The ones digit ${aOnes} is too small to subtract ${bOnes}, so borrow 1 from the tens: ${aOnes + 10} − ${bOnes} = ${aOnes + 10 - bOnes}. Tens: ${Math.floor(a / 10)} − 1 − ${Math.floor(b / 10)} = ${Math.floor(a / 10) - 1 - Math.floor(b / 10)}. The result is ${diff}.`,
          smartTip: 'Mark the borrow',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const a = rng.int(100, 400)
        const b = rng.int(50, a - 1)
        const diff = a - b
        return makeFill({
          prompt: `${a} − ${b} = ?`,
          answer: diff,
          explanation: `Borrow place by place and the result is ${diff}. You can check by adding: ${diff} + ${b} = ${a}.`,
          smartTip: 'Check with the inverse',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const a = rng.int(30, 95)
        const b = rng.int(15, Math.max(16, a - 1))
        const diff = a - b
        return makeJudge({
          prompt: `True or false: ${a} − ${b} = ${diff}`,
          correct: true,
          explanation: `Check with addition: ${diff} + ${b} = ${diff + b}, which equals ${a}, so the statement is true.`,
          smartTip: 'Check with the inverse',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const a = rng.int(24, 78)
        const b = rng.int(16, 59)
        const sum = a + b
        return makeChoice({
          prompt: `${a} + ${b} = ?`,
          answer: String(sum),
          wrong: [String(sum - 10), String(sum + 10), String(sum - 1)],
          explanation: `Ones: ${a % 10} + ${b % 10} = ${(a % 10) + (b % 10)}, carry 1. Add the carried 1 to the tens, and the result is ${sum}.`,
          smartTip: 'Mark the carry',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const total = 100
        const a = rng.int(23, 89)
        const b = total - a
        return makeFill({
          prompt: `${a} + (  ) = 100`,
          answer: b,
          explanation: `Make 100: 100 − ${a} = ${b}. You can also go up to the next ten first, then add the rest.`,
          smartTip: 'Round and adjust',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   3. Introduction to multiplication
   ══════════════════════════════════════════════ */

const multiplyIntro: Topic = {
  id: 'g2-multintro',
  grade: 2,
  name: 'Introduction to Multiplication',
  color: 'green',
  icon: 'X',
  summary: 'Meet multiplication as "groups of", and memorize the times tables for 2 to 5.',
  explanation: [
    {
      title: 'Multiplication adds equal groups',
      body: 'To find the total of several equal groups, multiplication is quicker. Number in each group × number of groups = total.',
      example: '3 + 3 + 3 + 3 = 3 × 4 = 12',
    },
    {
      title: 'How to read a multiplication sentence',
      body: '"×" is read "times". In a × b = c, a and b are called factors and c is called the product. Read it from left to right.',
      example: '3 × 4 = 12 is read "three times four equals twelve"',
    },
    {
      title: 'Times tables',
      body: 'Times tables are a shortcut for multiplying. Each fact works both ways, so one fact gives you two multiplication sentences.',
      example: '3 × 4 = 12 and 4 × 3 = 12',
    },
  ],
  smartMethods: [
    {
      name: 'Groups of → multiplication',
      when: 'You see a repeated addition and want to rewrite it',
      steps: ['Find the number that repeats', 'Count how many times it appears', 'Write it as "number × times"'],
      example: '5 + 5 + 5 = 5 × 3 = 15',
    },
    {
      name: 'Swap the factors',
      when: 'You cannot remember a times table fact',
      steps: ['Swap the two factors', 'Use the fact you know better', 'The product stays the same'],
      example: 'Cannot remember 7 × 3? Think 3 × 7 = 21',
    },
    {
      name: 'Count the groups',
      when: 'Writing a multiplication sentence from a picture',
      steps: ['Count how many are in each group', 'Count how many groups there are', 'Number in each group × number of groups = total'],
      example: '4 in each group, 3 groups → 4 × 3 = 12',
    },
  ],
  levels: buildLevels(2, [
    'Rewrite repeated addition as multiplication',
    'Write multiplication sentences from pictures',
    'Times tables for 2 to 5',
    'Fill in multiplication sentences',
    'Compare multiplication and addition',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const a = rng.int(2, [5, 6, 8, 9, 9][level - 1])
      const times = rng.int(2, [5, 6, 7, 8, 9][level - 1])
      return makeFill({
        prompt: `${Array.from({ length: times }, () => a).join(' + ')} = ? (give the result as a multiplication)`,
        answer: a * times,
        explanation: `Adding ${a} ${times} times is written as ${a} × ${times} = ${a * times}.`,
        smartTip: 'Groups of → multiplication',
      })
    })

    makers.push(() => {
      const a = rng.int(2, [5, 7, 9, 9, 9][level - 1])
      const times = rng.int(2, [5, 6, 8, 9, 9][level - 1])
      return makeFill({
        prompt: `${a} × ${times} = ?`,
        answer: a * times,
        explanation: `Times table: ${a} × ${times} = ${a * times}. You can also think of adding ${a} ${times} times.`,
        smartTip: 'Swap the factors',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const each = rng.int(2, 6)
        const groups = rng.int(2, 6)
        return makeFill({
          prompt: `There are ${groups} plates of apples with ${each} apples on each plate. How many apples are there in all?`,
          answer: each * groups,
          unit: 'apples',
          explanation: `Number in each group × number of groups: ${each} × ${groups} = ${each * groups} apples.`,
          smartTip: 'Count the groups',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const a = rng.int(2, 9)
        const b = rng.int(2, 9)
        const product = a * b
        return makeChoice({
          prompt: `${a} × ${b} = ?`,
          answer: String(product),
          wrong: [String(product + a), String(product - a), String(product + b)],
          explanation: `Times table: ${a} × ${b} = ${product}. Adding ${a} ${b} times also gives ${product}.`,
          smartTip: 'Swap the factors',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const a = rng.int(2, 9)
        const b = rng.int(2, 9)
        const product = a * b
        return makeFill({
          prompt: `${a} × (  ) = ${product}`,
          answer: b,
          explanation: `Think of the times table: ${a} × ${b} = ${product}, so the blank is ${b}.`,
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const a = rng.int(2, 9)
        const b = rng.int(2, 9)
        const product = a * b
        const sum = a + b
        return makeChoice({
          prompt: `Which expression has the biggest result?\nA. ${a} × ${b} | B. ${a} + ${b} | C. ${a} × 2 | D. ${b} + ${b}`,
          answer: 'A',
          wrong: ['B', 'C', 'D'],
          explanation: `A = ${product}, B = ${sum}, C = ${a * 2}, D = ${b * 2}. The biggest is A (${product}).`,
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const a = rng.int(3, 8)
        const b = rng.int(3, 8)
        const product = a * b
        return makeJudge({
          prompt: `True or false: ${a} × ${b} and ${b} × ${a} have the same result.`,
          correct: true,
          explanation: `Swapping the two factors does not change the product: ${a} × ${b} = ${b} × ${a} = ${product}.`,
          smartTip: 'Swap the factors',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   4. Telling time
   ══════════════════════════════════════════════ */

const time: Topic = {
  id: 'g2-time',
  grade: 2,
  name: 'Telling Time',
  color: 'pink',
  icon: 'Clock',
  summary: 'Read the time in hours and minutes, convert hours, minutes and seconds, and work out elapsed time.',
  explanation: [
    {
      title: 'Big marks and small marks on a clock',
      body: 'A clock face has 12 big marks and 60 small marks. The hour hand moving one big mark is 1 hour. The minute hand moving one small mark is 1 minute, and moving one big mark is 5 minutes.',
      example: 'The minute hand goes from 12 to 3, which is 3 big marks = 15 minutes',
    },
    {
      title: 'Reading hours and minutes',
      body: 'Look at which number the hour hand has passed to get the hour. Then count how many small marks the minute hand is past 12 to get the minutes.',
      example: 'Hour hand just past 8, minute hand at 30 minutes → 8:30',
    },
    {
      title: 'Converting time units',
      body: '1 hour = 60 minutes, 1 minute = 60 seconds, and half an hour = 30 minutes. To change a big unit to a small unit, multiply by 60. To change a small unit to a big unit, divide by 60.',
      example: '2 hours = 120 minutes, 180 seconds = 3 minutes',
    },
  ],
  smartMethods: [
    {
      name: 'Count the minute marks',
      when: 'Reading the minutes',
      steps: ['See which number the minute hand points to', 'Multiply that number by 5', 'Then add any extra small marks'],
      example: 'The minute hand points to 7 → 7 × 5 = 35 minutes',
    },
    {
      name: 'Split the elapsed time',
      when: 'Finding how long it is from one time to another',
      steps: ['First work out the minutes to the next whole hour', 'Then work out the whole hours to the final hour', 'Finally add the leftover minutes'],
      example: '7:40 → 8:20: 20 minutes + 20 minutes = 40 minutes',
    },
    {
      name: 'Big to small: multiply by 60',
      when: 'Converting between hours, minutes and seconds',
      steps: ['Big unit to small unit: multiply by 60', 'Small unit to big unit: divide by 60', 'Do not forget to write the unit in your answer'],
      example: '3 hours = 3 × 60 = 180 minutes',
    },
  ],
  levels: buildLevels(2, [
    'Read whole hours and half hours',
    'Read hours and minutes',
    'Convert hours, minutes and seconds',
    'Work out elapsed time',
    'Time word problems',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const hour = rng.int(1, 12)
      const minuteMark = rng.pick([0, 6])
      const minute = minuteMark === 0 ? 0 : 30
      return makeChoice({
        prompt: `On a clock the minute hand points to ${minuteMark === 0 ? '12' : '6'} and the hour hand points to ${hour}. What time is it?`,
        answer: minute === 0 ? `${hour}:00` : `${hour}:30`,
        wrong: [
          minute === 0 ? `${hour}:30` : `${hour}:00`,
          `${hour + 1 > 12 ? 1 : hour + 1}:00`,
          `${hour}:15`,
        ],
        explanation: `The minute hand at ${minuteMark === 0 ? '12' : '6'} means ${minute} minutes, and the hour hand at ${hour} means ${hour} o'clock, so the time is ${hour}:${minute === 0 ? '00' : '30'}.`,
        smartTip: 'Count the minute marks',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const hour = rng.int(1, 11)
        const mark = rng.int(1, 11)
        const minute = mark * 5
        return makeFill({
          prompt: `The minute hand points to ${mark} and the hour hand has just passed ${hour}. How many minutes past the hour is it?`,
          answer: minute,
          unit: 'minutes',
          explanation: `Count the minute marks: ${mark} × 5 = ${minute} minutes.`,
          smartTip: 'Count the minute marks',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const hours = rng.int(1, 5)
        return makeFill({
          prompt: `${hours} hours = (  ) minutes`,
          answer: hours * 60,
          unit: 'minutes',
          explanation: `1 hour = 60 minutes, so ${hours} × 60 = ${hours * 60} minutes.`,
          smartTip: 'Big to small: multiply by 60',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const minutes = rng.int(2, 6) * 60
        return makeFill({
          prompt: `${minutes} minutes = (  ) hours`,
          answer: minutes / 60,
          unit: 'hours',
          explanation: `Small unit to big unit: divide by 60. ${minutes} ÷ 60 = ${minutes / 60} hours.`,
          smartTip: 'Big to small: multiply by 60',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const seconds = rng.int(2, 6) * 60
        return makeFill({
          prompt: `${seconds} seconds = (  ) minutes`,
          answer: seconds / 60,
          unit: 'minutes',
          explanation: `1 minute = 60 seconds, so ${seconds} ÷ 60 = ${seconds / 60} minutes.`,
          smartTip: 'Big to small: multiply by 60',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const startHour = rng.int(1, 10)
        const startMin = rng.pick([10, 20, 30, 40, 50])
        const duration = rng.pick([20, 30, 40, 50, 60, 90])
        const totalMin = startHour * 60 + startMin + duration
        const endHour = Math.floor(totalMin / 60) % 24
        const endMin = totalMin % 60
        return makeFill({
          prompt: `A movie starts at ${startHour}:${String(startMin).padStart(2, '0')} and runs for ${duration} minutes. What time does it end? (Enter only the minutes.)`,
          answer: endMin,
          unit: 'minutes',
          explanation: `${startHour}:${String(startMin).padStart(2, '0')} plus ${duration} minutes = ${endHour}:${String(endMin).padStart(2, '0')}, so the minutes are ${endMin}.`,
          smartTip: 'Split the elapsed time',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const startMin = rng.pick([10, 15, 20, 25, 30])
        const endMin = startMin + rng.pick([20, 30, 40])
        return makeFill({
          prompt: `Mia started her homework at 7:${String(startMin).padStart(2, '0')} and finished at 7:${String(endMin).padStart(2, '0')}. How many minutes did she work?`,
          answer: endMin - startMin,
          unit: 'minutes',
          explanation: `Within the same hour, subtract the earlier minutes from the later minutes: ${endMin} − ${startMin} = ${endMin - startMin} minutes.`,
          smartTip: 'Split the elapsed time',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const cases: Array<[string, string, string[]]> = [
          ['How long does the hour hand take to move one big mark?', '1 hour', ['5 minutes', '1 minute', '12 hours']],
          ['How long does the minute hand take to move one small mark?', '1 minute', ['5 minutes', '1 hour', '1 second']],
          ['When the minute hand goes once around, how far does the hour hand move?', '1 big mark', ['1 small mark', 'once around', '6 big marks']],
          ['How many minutes are in 1 hour 30 minutes?', '90 minutes', ['130 minutes', '60 minutes', '100 minutes']],
        ]
        const [prompt, answer, wrong] = rng.pick(cases)
        return makeChoice({
          prompt,
          answer,
          wrong,
          explanation: `The correct answer is ${answer}. Remember 1 hour = 60 minutes, and a clock face has 12 big marks and 60 small marks.`,
          smartTip: 'Big to small: multiply by 60',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   5. Length and measuring
   ══════════════════════════════════════════════ */

const measure: Topic = {
  id: 'g2-measure',
  grade: 2,
  name: 'Length and Measuring',
  color: 'purple',
  icon: 'Ruler',
  summary: 'Learn centimeters and meters, choose units, convert units, and do simple length calculations.',
  explanation: [
    {
      title: 'Centimeters and meters',
      body: 'Use centimeters (cm) to measure shorter objects and meters (m) to measure longer ones. 1 meter = 100 centimeters.',
      example: 'A pencil is about 18 cm long and a classroom is about 9 m long',
    },
    {
      title: 'Measuring correctly',
      body: 'Line up the 0 mark of the ruler with one end of the object, then read the mark at the other end. Keep the ruler flat and tight against the object.',
      example: 'From 0 to 7 is 7 cm',
    },
    {
      title: 'Measuring from any mark',
      body: 'If one end of the object is not at the 0 mark, find the length with "end mark − start mark".',
      example: 'From mark 3 to mark 10: 10 − 3 = 7 cm',
    },
  ],
  smartMethods: [
    {
      name: 'Body ruler estimation',
      when: 'You have no ruler and need to estimate a length',
      steps: ['Remember that a hand span is about 10 cm', 'Remember that one big step is about 50 cm', 'Arms stretched wide are about 1 m'],
      example: 'A desk is about 6 hand spans → about 60 cm',
    },
    {
      name: 'End minus start',
      when: 'The object is not measured from the 0 mark',
      steps: ['Read the mark at the start', 'Read the mark at the end', 'End − start = length'],
      example: '10 − 3 = 7 cm',
    },
    {
      name: 'Unit conversion rates',
      when: 'Converting between meters and centimeters',
      steps: ['Remember 1 m = 100 cm', 'Meters to centimeters: add two zeros', 'Centimeters to meters: remove two zeros'],
      example: '3 m = 300 cm, 500 cm = 5 m',
    },
  ],
  levels: buildLevels(2, [
    'Learn centimeters and measure correctly',
    'Choose a suitable unit of length',
    'Convert meters and centimeters',
    'Simple length calculations',
    'Measuring word problems',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const start = rng.int(0, 5)
      const length = rng.int(3, [10, 15, 20, 25, 30][level - 1])
      return makeFill({
        prompt: `A pencil is measured with a ruler. One end is at mark ${start} and the other end is at mark ${start + length}. How many centimeters long is the pencil?`,
        answer: length,
        unit: 'cm',
        explanation: `End minus start: ${start + length} − ${start} = ${length} cm.`,
        smartTip: 'End minus start',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const cases: Array<[string, string]> = [
          ['the length of a pencil', 'centimeters'],
          ['the length of a classroom', 'meters'],
          ['the length of a jump rope', 'meters'],
          ['the width of a math book cover', 'centimeters'],
          ['the height of a big tree', 'meters'],
          ['the thickness of a coin', 'millimeters'],
        ]
        const [thing, answer] = rng.pick(cases)
        return makeChoice({
          prompt: `Which unit is best for measuring ${thing}?`,
          answer,
          wrong: (['centimeters', 'meters', 'decimeters', 'millimeters'] as const).filter((u) => u !== answer),
          explanation: `${answer.charAt(0).toUpperCase()}${answer.slice(1)} is the best unit for measuring ${thing}.`,
          smartTip: 'Body ruler estimation',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const meters = rng.int(1, [5, 8, 10, 20, 50][level - 1])
        return makeFill({
          prompt: `${meters} m = (  ) cm`,
          answer: meters * 100,
          unit: 'cm',
          explanation: `1 m = 100 cm, so ${meters} × 100 = ${meters * 100} cm.`,
          smartTip: 'Unit conversion rates',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const meters = rng.int(2, 9)
        return makeFill({
          prompt: `${meters * 100} cm = (  ) m`,
          answer: meters,
          unit: 'm',
          explanation: `100 cm = 1 m, so ${meters * 100} ÷ 100 = ${meters} m.`,
          smartTip: 'Unit conversion rates',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const a = rng.int(10, 90)
        const b = rng.int(10, 90)
        return makeFill({
          prompt: `One rope is ${a} cm long and another is ${b} cm long. If they are tied end to end, how many centimeters long are they together?`,
          answer: a + b,
          unit: 'cm',
          explanation: `Use addition to find the total length: ${a} + ${b} = ${a + b} cm.`,
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const total = rng.int(50, 200)
        const used = rng.int(10, total - 5)
        return makeFill({
          prompt: `A piece of wire is ${total} cm long. ${used} cm is used. How many centimeters are left?`,
          answer: total - used,
          unit: 'cm',
          explanation: `Use subtraction to find what is left: ${total} − ${used} = ${total - used} cm.`,
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const total = rng.int(2, 8)
        const each = rng.pick([10, 20, 25, 50])
        const pieces = (total * 100) / each
        return makeFill({
          prompt: `A rope is ${total} m long. It is cut into pieces of ${each} cm each. How many pieces can be cut?`,
          answer: pieces,
          unit: 'pieces',
          explanation: `Use the same unit first: ${total} m = ${total * 100} cm. Then ${total * 100} ÷ ${each} = ${pieces} pieces.`,
          smartTip: 'Unit conversion rates',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   6. Money and shopping
   ══════════════════════════════════════════════ */

const money: Topic = {
  id: 'g2-money',
  grade: 2,
  name: 'Money and Shopping',
  color: 'teal',
  icon: 'Coins',
  summary: 'Learn dollars, dimes and cents, and practice converting, paying and making change.',
  explanation: [
    {
      title: 'Dollars, dimes and cents',
      body: 'Money here is counted in dollars, dimes and cents. 1 dollar = 10 dimes, 1 dime = 10 cents, and 1 dollar = 100 cents.',
      example: '3 dollars = 30 dimes, 5 dimes = 50 cents',
    },
    {
      title: 'Paying and making change',
      body: 'When you buy something, the money you pay minus the price is the change you get back. Adding up the prices gives the amount you must pay.',
      example: 'Buy a notebook for 8 dollars and pay 10 dollars, so the change is 10 − 8 = 2 dollars',
    },
    {
      title: 'Comparing prices',
      body: 'To compare prices, first use the same unit, then compare the numbers. You cannot compare directly when the units are different.',
      example: '3 dollars 5 dimes = 35 dimes > 30 dimes',
    },
  ],
  smartMethods: [
    {
      name: 'Convert to one unit first',
      when: 'Dollars and dimes are mixed together in a calculation',
      steps: ['First change every amount to the same unit', 'Calculate with that unit', 'Change back to the unit you need at the end'],
      example: '2 dollars 5 dimes + 3 dimes = 25 dimes + 3 dimes = 28 dimes = 2 dollars 8 dimes',
    },
    {
      name: 'Pay with round amounts',
      when: 'Thinking about the easiest way to pay',
      steps: ['See which whole dollar amount the price is closest to', 'Pay up to the whole dollar first', 'Then add the small change'],
      example: 'Price 8 dollars 6 dimes: pay 10 dollars, get back 1 dollar 4 dimes',
    },
    {
      name: 'Make change step by step',
      when: 'Working out how much change you get back',
      steps: ['First find how far it is up to the next whole dollar', 'Then find the remaining small change', 'Put the two parts together to get the change'],
      example: 'Pay 20 dollars for 13 dollars 5 dimes → change is 6 dollars 5 dimes',
    },
  ],
  levels: buildLevels(2, [
    'Learn dollars, dimes and cents',
    'Convert dollars and dimes',
    'Simple shopping calculations',
    'Paying and making change',
    'Shopping word problems',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const yuan = rng.int(1, [5, 9, 20, 50, 100][level - 1])
      return makeFill({
        prompt: `${yuan} dollars = (  ) dimes`,
        answer: yuan * 10,
        unit: 'dimes',
        explanation: `1 dollar = 10 dimes, so ${yuan} × 10 = ${yuan * 10} dimes.`,
        smartTip: 'Convert to one unit first',
      })
    })

    makers.push(() => {
      const jiao = rng.int(2, 9) * 10
      return makeFill({
        prompt: `${jiao} dimes = (  ) dollars`,
        answer: jiao / 10,
        unit: 'dollars',
        explanation: `10 dimes = 1 dollar, so ${jiao} ÷ 10 = ${jiao / 10} dollars.`,
        smartTip: 'Convert to one unit first',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const yuan = rng.int(1, 9)
        const jiao = rng.int(1, 9)
        return makeFill({
          prompt: `${yuan} dollars ${jiao} dimes = (  ) dimes`,
          answer: yuan * 10 + jiao,
          unit: 'dimes',
          explanation: `${yuan} dollars = ${yuan * 10} dimes. Add ${jiao} dimes and you get ${yuan * 10 + jiao} dimes in all.`,
          smartTip: 'Convert to one unit first',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const a = rng.int(1, 20)
        const b = rng.int(1, 20)
        return makeFill({
          prompt: `A pen costs ${a} dollars and a notebook costs ${b} dollars. How many dollars do you have to pay in all?`,
          answer: a + b,
          unit: 'dollars',
          explanation: `Use addition to find the total: ${a} + ${b} = ${a + b} dollars.`,
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const price = rng.int(3, 45)
        const pay = rng.pick([50, 20, 100, 10].filter((p) => p > price))
        return makeFill({
          prompt: `A backpack costs ${price} dollars. You pay ${pay} dollars. How many dollars do you get back in change?`,
          answer: pay - price,
          unit: 'dollars',
          explanation: `Money paid − price = change: ${pay} − ${price} = ${pay - price} dollars.`,
          smartTip: 'Make change step by step',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const priceYuan = rng.int(1, 9)
        const priceJiao = rng.int(1, 9)
        const payYuan = priceYuan + 1
        const priceTotalJiao = priceYuan * 10 + priceJiao
        const payTotalJiao = payYuan * 10
        const change = payTotalJiao - priceTotalJiao
        return makeFill({
          prompt: `An eraser costs ${priceYuan} dollars ${priceJiao} dimes. You pay ${payYuan} dollars. How many dimes do you get back in change?`,
          answer: change,
          unit: 'dimes',
          explanation: `${payYuan} dollars = ${payTotalJiao} dimes and ${priceYuan} dollars ${priceJiao} dimes = ${priceTotalJiao} dimes, so the change is ${payTotalJiao} − ${priceTotalJiao} = ${change} dimes.`,
          smartTip: 'Make change step by step',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const price = rng.int(2, 9)
        const count = rng.int(2, 6)
        return makeFill({
          prompt: `Each pencil costs ${price} dollars. How many dollars do ${count} pencils cost?`,
          answer: price * count,
          unit: 'dollars',
          explanation: `Unit price × quantity = total price: ${price} × ${count} = ${price * count} dollars.`,
          smartTip: 'Pay with round amounts',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const a = rng.int(2, 9)
        const b = rng.int(2, 9)
        const priceA = a * 10 + 5
        const priceB = b * 10
        return makeChoice({
          prompt: `Which price is higher?\nA. ${a} dollars 5 dimes | B. ${b} dollars`,
          answer: priceA > priceB ? 'A' : 'B',
          wrong: [priceA > priceB ? 'B' : 'A', 'They are the same', 'Cannot be compared'],
          explanation: `${a} dollars 5 dimes = ${priceA} dimes and ${b} dollars = ${priceB} dimes. ${priceA > priceB ? `${priceA} > ${priceB}, so A is higher` : `${priceB} > ${priceA}, so B is higher`}.`,
          smartTip: 'Convert to one unit first',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

export const grade2Topics: Topic[] = [add100, carryBorrow, multiplyIntro, time, measure, money]

/** Helper reused by other modules */
export const moneyFormat = (yuan: number): string => `$${fmt(yuan)}`
