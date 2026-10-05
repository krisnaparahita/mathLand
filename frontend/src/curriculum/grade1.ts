import { buildLevels, buildQuestionSet, makeChoice, makeFill, makeJudge, rng } from './core'
import type { Question, Topic } from './types'

const dots = (n: number): string => Array.from({ length: n }, () => '●').join(' ')

const SHAPES = {
  circle: '●',
  triangle: '▲',
  square: '■',
  rectangle: '▬',
  pentagon: '⬟',
} as const

/* ══════════════════════════════════════════════
   1. Counting and numbers
   ══════════════════════════════════════════════ */

const counting: Topic = {
  id: 'g1-counting',
  grade: 1,
  name: 'Counting and Numbers',
  color: 'indigo',
  icon: 'Hash',
  summary: 'Count from 1 to 100, learn place value, fill in number patterns, and split and combine numbers.',
  explanation: [
    {
      title: 'Count one by one',
      body: 'Point at each object in order as you count. The last number you say is the total. Do not count anything twice and do not skip any.',
      example: '● ● ● ● ●  →  5 dots',
    },
    {
      title: 'Place value: tens and ones',
      body: 'In a two-digit number, the left digit is the "tens" place and the right digit is the "ones" place. The tens digit tells how many tens there are, and the ones digit tells how many ones.',
      example: '3 tens and 5 ones  →  35',
    },
    {
      title: 'Splitting and combining numbers',
      body: 'One number can be split into two numbers, and two numbers can be combined into one. Knowing how to split 10 is the foundation for adding and subtracting later.',
      example: '10 can be split into 3 and 7, or into 6 and 4',
    },
  ],
  smartMethods: [
    {
      name: 'Count by twos',
      when: 'There are many objects and they are lined up neatly',
      steps: ['Circle the objects in pairs', 'Each circle counts as 2', 'If one is left over at the end, add 1'],
      example: '● ● | ● ● | ● ● | ●  →  2+2+2+1 = 7',
    },
    {
      name: 'Count by fives',
      when: 'There are more than 10 objects and you want to count fast and accurately',
      steps: ['Group the objects in fives', 'Add 5 for each group', 'Count the leftovers one by one when fewer than 5 remain'],
      example: '5, 10, 15, 20 … fast and hard to get wrong',
    },
    {
      name: 'Read the place values',
      when: 'You know "how many tens and how many ones" and need to write the number',
      steps: ['Write the number of tens in the tens place', 'Write the number of ones in the ones place', 'If there are no ones, write 0 as a placeholder'],
      example: '4 tens and 0 ones → 40',
    },
  ],
  levels: buildLevels(1, [
    'Count up to 10 objects',
    'Count up to 20 objects',
    'Learn place value: tens and ones',
    'Fill in number patterns',
    'Master splitting and combining 10',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const n = rng.int(1, [10, 12, 15, 18, 20][level - 1])
      return makeFill({
        prompt: `Count the dots. How many are there in all?\n${dots(n)}`,
        answer: n,
        unit: 'dots',
        explanation: `Point at each dot and count one by one. The last number is ${n}, so there are ${n} dots in all.`,
        smartTip: 'Count by twos',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const tens = rng.int(1, 5)
        const ones = rng.int(0, 9)
        const value = tens * 10 + ones
        return makeFill({
          prompt: `A number is made of ${tens} tens and ${ones} ones. What is the number?`,
          answer: value,
          explanation: `${tens} tens is ${tens * 10}. Add ${ones} ones and you get ${value}.`,
          smartTip: 'Read the place values',
        })
      })
    }

    if (level >= 2) {
      makers.push(() => {
        const start = rng.int(1, 20)
        const step = rng.pick([1, 2, 5, 10])
        const seq = [start, start + step, start + 2 * step]
        const answer = start + 3 * step
        return makeFill({
          prompt: `Fill in the pattern: ${seq.join(', ')}, (  ), ${start + 4 * step}`,
          answer,
          explanation: `Each number goes up by ${step}. ${start + 2 * step} + ${step} = ${answer}. Check: ${answer} + ${step} = ${start + 4 * step}, which is correct.`,
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const a = rng.int(1, 9)
        const b = 10 - a
        return makeFill({
          prompt: `10 can be split into ${a} and what number?`,
          answer: b,
          explanation: `10 - ${a} = ${b}, so 10 can be split into ${a} and ${b}.`,
          smartTip: 'Count by fives',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const value = rng.int(11, 99)
        const tens = Math.floor(value / 10)
        const ones = value % 10
        const answer = `${tens} tens and ${ones} ones`
        const wrongPool = [
          `${ones} tens and ${tens} ones`,
          `${(tens % 9) + 1} tens and ${ones} ones`,
          `${tens} tens and ${(ones + 1) % 10} ones`,
          `${(tens + 1) % 10} tens and ${(ones + 2) % 10} ones`,
          `${ones} tens and ${(ones + 1) % 10} ones`,
        ]
        const wrong = Array.from(new Set(wrongPool.filter((w) => w !== answer))).slice(0, 3)
        return makeChoice({
          prompt: `${value} has (  ) tens and (  ) ones. Which is right?`,
          answer,
          wrong,
          explanation: `In ${value}, the tens digit is ${tens} and the ones digit is ${ones}, so it is ${tens} tens and ${ones} ones.`,
          smartTip: 'Read the place values',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const value = rng.int(20, 90)
        const delta = rng.pick([1, 10])
        const answer = value + delta
        return makeChoice({
          prompt: `What number comes ${delta === 1 ? '1' : '10'} after ${value}?`,
          answer: String(answer),
          wrong: [String(value - delta), String(value + (delta === 1 ? 10 : 1)), String(value)],
          explanation: delta === 1
            ? `Count on one at a time. The number right after ${value} is ${answer}.`
            : `Count on by tens. ${value} plus 10 is ${answer}.`,
          smartTip: 'Read the place values',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   2. Addition within 10
   ══════════════════════════════════════════════ */

const addition: Topic = {
  id: 'g1-addition',
  grade: 1,
  name: 'Addition Within 10',
  color: 'orange',
  icon: 'Plus',
  summary: 'Understand what "putting together" means, and practice from addition within 5 up to carrying within 20.',
  explanation: [
    {
      title: 'Addition puts two parts together',
      body: '"+" is read "plus". It means putting two numbers together to find the total. In a + b = c, a and b are called addends and c is called the sum.',
      example: '3 + 4 = 7 means 3 and 4 put together make 7',
    },
    {
      title: 'Make a ten',
      body: 'When two numbers add up to more than 10, first top one number up to 10, then add the rest. This is quick and accurate.',
      example: '9 + 5 = 9 + 1 + 4 = 10 + 4 = 14',
    },
    {
      title: 'Swap the addends, same sum',
      body: 'You can add two numbers in either order and get the same answer. When a big number is added to a small one, swap them so the big number comes first.',
      example: '3 + 8 = 8 + 3 = 11',
    },
  ],
  smartMethods: [
    {
      name: 'Make a ten',
      when: 'Two numbers add up to more than 10 (addition with carrying)',
      steps: ['Look at the bigger number and ask how much more makes 10', 'Split the smaller number into "the part that makes 10" and "the rest"', 'Make the 10 first, then add the rest'],
      example: '8 + 7: 8 needs 2 to make 10, split 7 into 2 and 5, then 10 + 5 = 15',
    },
    {
      name: 'Count on',
      when: 'The number you add is small (1, 2 or 3)',
      steps: ['Remember the bigger number', 'Count on from it one at a time', 'Count as many steps as the number you add'],
      example: '7 + 2: count on two from 7 → 8, 9, so the answer is 9',
    },
    {
      name: 'Swap the addends',
      when: '"Small + big" feels hard to work out',
      steps: ['Swap the two addends', 'It becomes "big + small"', 'Then use make a ten or count on'],
      example: '4 + 9 becomes 9 + 4 = 13',
    },
  ],
  levels: buildLevels(1, [
    'Addition within 5, from pictures',
    'Addition within 10, mental math',
    'Carrying within 20 (make a ten)',
    'Adding three numbers',
    'Missing addends and addition word problems',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []
    const max = [5, 10, 10, 10, 10][level - 1]

    makers.push(() => {
      const a = rng.int(1, max)
      const b = rng.int(1, max)
      return makeFill({
        prompt: `${a} + ${b} = ?`,
        answer: a + b,
        explanation: `${a} and ${b} put together make ${a + b}.`,
        smartTip: a + b > 10 ? 'Make a ten' : 'Count on',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const big = rng.int(6, 9)
        const small = rng.int(2, 9)
        const sum = big + small
        const complement = 10 - big
        return makeFill({
          prompt: `${big} + ${small} = ?`,
          answer: sum,
          explanation: `Use make a ten: ${big} needs ${complement} to make 10. Split ${small} into ${complement} and ${small - complement}, then 10 + ${small - complement} = ${sum}.`,
          smartTip: 'Make a ten',
        })
      })
    }

    if (level >= 2) {
      makers.push(() => {
        const a = rng.int(1, 4)
        const b = rng.int(5, 9)
        const sum = a + b
        return makeChoice({
          prompt: `${a} + ${b} = ?`,
          answer: String(sum),
          wrong: [String(sum - 1), String(sum + 1), String(sum + 2)],
          explanation: `Swapping the addends is easier: ${a} + ${b} = ${b} + ${a} = ${sum}.`,
          smartTip: 'Swap the addends',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const a = rng.int(1, 5)
        const b = rng.int(1, 5)
        const c = rng.int(1, 5)
        return makeFill({
          prompt: `${a} + ${b} + ${c} = ?`,
          answer: a + b + c,
          explanation: `First ${a} + ${b} = ${a + b}, then ${a + b} + ${c} = ${a + b + c}.`,
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const a = rng.int(2, 9)
        const total = rng.int(a + 1, Math.min(20, a + 9))
        const b = total - a
        return makeFill({
          prompt: `${a} + (  ) = ${total}`,
          answer: b,
          explanation: `Think subtraction: ${total} - ${a} = ${b}, so the blank is ${b}.`,
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const a = rng.int(3, 12)
        const b = rng.int(2, 9)
        const total = a + b
        return makeFill({
          prompt: `Alex has ${a} candies. Mom gives him ${b} more. How many candies does he have now?`,
          answer: total,
          unit: 'candies',
          explanation: `"Gives him more" means putting together, so add: ${a} + ${b} = ${total} candies.`,
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   3. Subtraction within 10
   ══════════════════════════════════════════════ */

const subtraction: Topic = {
  id: 'g1-subtraction',
  grade: 1,
  name: 'Subtraction Within 10',
  color: 'green',
  icon: 'Minus',
  summary: 'Understand "take away, left over, difference", and master breaking a ten and thinking addition.',
  explanation: [
    {
      title: 'Subtraction takes a part away',
      body: '"−" is read "minus". It means taking a part away from the total to find how many are left. In a − b = c, a is the minuend, b is the subtrahend and c is the difference.',
      example: '7 − 3 = 4 means take 3 away from 7 and 4 are left',
    },
    {
      title: 'Break a ten',
      body: 'When the ones digit is too small to subtract from, split the first number into 10 and the rest, subtract from the 10, then add the result to the rest.',
      example: '13 − 8 = 10 − 8 + 3 = 2 + 3 = 5',
    },
    {
      title: 'Think addition',
      body: 'Subtraction can be turned around into addition. Ask "what plus the number I subtract makes the starting number?" That number is the difference.',
      example: '12 − 5: think 5 + 7 = 12, so 12 − 5 = 7',
    },
  ],
  smartMethods: [
    {
      name: 'Break a ten',
      when: 'Subtraction with borrowing within 20 (the ones digit is too small)',
      steps: ['Split the first number into 10 and the ones', 'Subtract from 10 first', 'Then add the difference to the ones'],
      example: '14 − 9: 10 − 9 = 1, then 1 + 4 = 5',
    },
    {
      name: 'Think addition',
      when: 'You cannot work out a subtraction right away',
      steps: ['Rewrite it as "what + subtracted number = starting number"', 'Use your addition facts', 'The number you find is the difference'],
      example: '11 − 6: think 6 + 5 = 11, so the difference is 5',
    },
    {
      name: 'Count back',
      when: 'The number you subtract is small (1, 2 or 3)',
      steps: ['Remember the starting number', 'Count back that many steps', 'The number you land on is the difference'],
      example: '9 − 2: count back two from 9 → 8, 7, so the answer is 7',
    },
  ],
  levels: buildLevels(1, [
    'Subtraction within 5',
    'Subtraction within 10',
    'Borrowing within 20 (break a ten)',
    'Repeated subtraction and mixed add and subtract',
    'Missing subtrahends and subtraction word problems',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []
    const max = [5, 10, 10, 12, 15][level - 1]

    makers.push(() => {
      const a = rng.int(2, max)
      const b = rng.int(1, a - 1)
      return makeFill({
        prompt: `${a} − ${b} = ?`,
        answer: a - b,
        explanation: `Take ${b} away from ${a} and ${a - b} are left. You can also think ${b} + ${a - b} = ${a}.`,
        smartTip: b <= 3 ? 'Count back' : 'Think addition',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const a = rng.int(11, 18)
        const b = rng.int(5, 9)
        const diff = a - b
        const ones = a - 10
        return makeFill({
          prompt: `${a} − ${b} = ?`,
          answer: diff,
          explanation: `Use break a ten: split ${a} into 10 and ${ones}. 10 − ${b} = ${10 - b}, and ${10 - b} + ${ones} = ${diff}.`,
          smartTip: 'Break a ten',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const a = rng.int(10, 18)
        const b = rng.int(2, 9)
        const diff = a - b
        return makeChoice({
          prompt: `Which equation goes with ${a} − ${b}?`,
          answer: `${a} = ${b} + ${diff}`,
          wrong: [`${a} = ${b} + ${diff + 1}`, `${a} = ${b} + ${diff - 1}`, `${a} = ${b} + ${diff + 2}`],
          explanation: `Think addition: ${b} + ${diff} = ${a}, so ${a} − ${b} = ${diff}.`,
          smartTip: 'Think addition',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const a = rng.int(8, 15)
        const b = rng.int(1, 5)
        const c = rng.int(1, 5)
        return makeFill({
          prompt: `${a} − ${b} − ${c} = ?`,
          answer: a - b - c,
          explanation: `First ${a} − ${b} = ${a - b}, then ${a - b} − ${c} = ${a - b - c}.`,
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const total = rng.int(8, 18)
        const left = rng.int(1, total - 1)
        return makeFill({
          prompt: `There are ${total} cookies on a plate. Some are eaten and ${left} are left. How many cookies were eaten?`,
          answer: total - left,
          unit: 'cookies',
          explanation: `Total − left = eaten, so ${total} − ${left} = ${total - left} cookies.`,
          smartTip: 'Think addition',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   4. Comparing numbers
   ══════════════════════════════════════════════ */

const compare: Topic = {
  id: 'g1-compare',
  grade: 1,
  name: 'Comparing Numbers',
  color: 'pink',
  icon: 'ArrowLeftRight',
  summary: 'Learn >, < and =, and compare numbers, expressions and amounts.',
  explanation: [
    {
      title: 'Greater than, less than, equal to',
      body: '">" means greater than, "<" means less than, and "=" means equal to. The open side faces the bigger number and the point faces the smaller number.',
      example: '8 > 5 (open side faces 8); 5 < 8 (point faces 5)',
    },
    {
      title: 'Calculate first, then compare',
      body: 'When you compare expressions, work out each side first, then compare the results.',
      example: '3 + 4 ○ 9: the left side = 7, and 7 < 9',
    },
    {
      title: 'Use subtraction to find "how many more or fewer"',
      body: 'To find how many more or fewer one number is than another, subtract the smaller number from the bigger number.',
      example: '12 is 5 more than 7: 12 − 7 = 5',
    },
  ],
  smartMethods: [
    {
      name: 'Mouth faces the bigger number',
      when: 'You keep writing > or < the wrong way round',
      steps: ['Find the bigger number first', 'Turn the open side of the symbol toward the bigger number', 'The point then faces the smaller number'],
      example: '9 and 6: open side faces 9, so write 9 > 6',
    },
    {
      name: 'Calculate, then compare',
      when: 'Both sides are expressions rather than plain numbers',
      steps: ['Work out the result of each side', 'Write each result under its expression', 'Compare the results'],
      example: '5 + 3 ○ 7 → 8 ○ 7 → 8 > 7',
    },
    {
      name: 'Compare place values',
      when: 'Comparing two-digit numbers',
      steps: ['Look at the tens first. The bigger tens digit means the bigger number', 'If the tens are the same, look at the ones', 'If the ones are the same too, the numbers are equal'],
      example: '47 and 39: tens 4 > 3, so 47 > 39',
    },
  ],
  levels: buildLevels(1, [
    'Compare two numbers within 20',
    'Compare expressions with numbers',
    'Compare two-digit numbers',
    'Find the biggest and smallest number',
    'Compare amounts and judge true or false',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []
    const max = [10, 20, 20, 99, 99][level - 1]

    makers.push(() => {
      const a = rng.int(1, max)
      let b = rng.int(1, max)
      while (a === b) b = rng.int(1, max)
      const symbol = a > b ? '>' : '<'
      return makeChoice({
        prompt: `${a} ○ ${b}. What goes in the circle?`,
        answer: symbol,
        wrong: [a > b ? '<' : '>', '=', '≠'],
        explanation: `${Math.max(a, b)} is bigger and the open side faces the bigger number, so write ${symbol}.`,
        smartTip: 'Mouth faces the bigger number',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const a = rng.int(2, 9)
        const b = rng.int(2, 9)
        const c = rng.int(5, 20)
        const left = a + b
        const symbol = left > c ? '>' : left < c ? '<' : '='
        return makeChoice({
          prompt: `${a} + ${b} ○ ${c}. What goes in the circle?`,
          answer: symbol,
          wrong: [symbol === '>' ? '<' : symbol === '<' ? '>' : '>', '=', '≠'],
          explanation: `Work out the left side first: ${a} + ${b} = ${left}. Then compare ${left} and ${c}, so write ${symbol}.`,
          smartTip: 'Calculate, then compare',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const a = rng.int(10, 99)
        const b = rng.int(10, 99)
        if (a === b) return makers[0]()
        return makeChoice({
          prompt: `Which is bigger, ${a} or ${b}?`,
          answer: String(Math.max(a, b)),
          wrong: [String(Math.min(a, b)), String(a + 10), String(b - 10)],
          explanation: `Compare the tens first: the tens digit of ${a} is ${Math.floor(a / 10)} and the tens digit of ${b} is ${Math.floor(b / 10)}, so ${Math.max(a, b)} is bigger.`,
          smartTip: 'Compare place values',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const nums = rng.sample([12, 25, 38, 41, 56, 63, 74, 87, 90], 4)
        return makeChoice({
          prompt: `Which of these four numbers is the biggest?\n${nums.join('   ')}`,
          answer: String(Math.max(...nums)),
          wrong: nums.filter((n) => n !== Math.max(...nums)).map(String),
          explanation: `Compare the tens first. The bigger tens digit means the bigger number, and if the tens match, compare the ones. The biggest is ${Math.max(...nums)}.`,
          smartTip: 'Compare place values',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const a = rng.int(10, 40)
        const b = rng.int(1, 9)
        return makeFill({
          prompt: `${a} is how much less than ${a + b}?`,
          answer: b,
          explanation: `Subtract the smaller number from the bigger number: ${a + b} − ${a} = ${b}.`,
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const a = rng.int(2, 9)
        const b = rng.int(2, 9)
        const correct = a + b > 12
        return makeJudge({
          prompt: `True or false: ${a} + ${b} ${correct ? '>' : '<'} 12`,
          correct,
          explanation: `${a} + ${b} = ${a + b}. Compared with 12, ${a + b} is ${a + b > 12 ? 'bigger' : 'smaller'}, so the statement is ${correct ? 'true' : 'false'}.`,
          smartTip: 'Calculate, then compare',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   5. Recognizing shapes
   ══════════════════════════════════════════════ */

const shapes: Topic = {
  id: 'g1-shapes',
  grade: 1,
  name: 'Recognizing Shapes',
  color: 'purple',
  icon: 'Shapes',
  summary: 'Know circles, triangles, squares and rectangles, count sides and corners, and learn how shapes fit together.',
  explanation: [
    {
      title: 'Four basic shapes',
      body: 'A circle is round and has no corners. A triangle has 3 sides and 3 corners. A square has 4 equal sides and 4 right angles. A rectangle has equal opposite sides and 4 right angles.',
      example: `Circle ${SHAPES.circle} | Triangle ${SHAPES.triangle} | Square ${SHAPES.square} | Rectangle ${SHAPES.rectangle}`,
    },
    {
      title: 'Sides and corners',
      body: 'The sides of a shape are straight line segments, and a corner is where two sides meet. Count sides and corners in order so you do not repeat or miss any.',
      example: 'Triangle: 3 sides, 3 corners; square: 4 sides, 4 corners',
    },
    {
      title: 'Putting shapes together',
      body: 'Several identical shapes can be joined to make a new shape, and one shape can be cut into smaller shapes.',
      example: 'Two identical triangles can be joined to make a parallelogram',
    },
  ],
  smartMethods: [
    {
      name: 'Count the corners',
      when: 'You cannot tell a triangle from a square',
      steps: ['Count the pointy corners', '3 corners means a triangle', '4 square corners means a square or a rectangle'],
      example: `${SHAPES.triangle} has 3 corners → triangle`,
    },
    {
      name: 'Check the sides',
      when: 'Telling a square from a rectangle',
      steps: ['First check that all 4 corners are square corners', 'Then check whether all 4 sides are equal', 'All sides equal is a square, otherwise it is a rectangle'],
      example: 'Long and narrow, opposite sides equal → rectangle',
    },
    {
      name: 'Tally by marking',
      when: 'Shapes are mixed together and you need to count them',
      steps: ['Sort the shapes by type', 'Make a mark beside each one you count', 'Add up the marks at the end'],
      example: `▲ ▲ □ ▲ → 3 triangles, 1 square`,
    },
  ],
  levels: buildLevels(1, [
    'Recognize the four basic shapes',
    'Count sides and corners',
    'Find the shape that is different',
    'Shapes in everyday life',
    'Putting shapes together and cutting them apart',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const target = rng.pick(['circle', 'triangle', 'square', 'rectangle'] as const)
      const others = (['circle', 'triangle', 'square', 'rectangle'] as const).filter((s) => s !== target)
      return makeChoice({
        prompt: `Which of these is a ${target}?`,
        answer: SHAPES[target],
        wrong: others.map((s) => SHAPES[s]),
        explanation: `A ${target} looks like this: ${SHAPES[target]}.`,
        smartTip: 'Count the corners',
      })
    })

    makers.push(() => {
      const target = rng.pick(['circle', 'triangle', 'square', 'rectangle'] as const)
      return makeChoice({
        prompt: `What shape is ${SHAPES[target]}?`,
        answer: target,
        wrong: (['circle', 'triangle', 'square', 'rectangle'] as const).filter((s) => s !== target),
        explanation: `${SHAPES[target]} is a ${target}.`,
        smartTip: 'Count the corners',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const target = rng.pick(['triangle', 'square', 'rectangle'] as const)
        const sides = target === 'triangle' ? 3 : 4
        return makeFill({
          prompt: `How many sides does a ${target} have?`,
          answer: sides,
          unit: 'sides',
          explanation: `A ${target} has ${sides} sides and also ${sides} corners.`,
        })
      })
    }

    if (level >= 2) {
      makers.push(() => {
        const target = rng.pick(['triangle', 'square', 'rectangle'] as const)
        const corners = target === 'triangle' ? 3 : 4
        return makeFill({
          prompt: `How many corners does a ${target} have?`,
          answer: corners,
          unit: 'corners',
          explanation: `A ${target} has ${corners} corners.`,
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const odd = rng.pick(['circle', 'triangle', 'square', 'rectangle'] as const)
        const same = rng.pick((['triangle', 'square', 'rectangle'] as const).filter((s) => s !== odd))
        return makeChoice({
          prompt: `Which of these four shapes is a different kind from the other three?\n${SHAPES[same]}  ${SHAPES[same]}  ${SHAPES[odd]}  ${SHAPES[same]}`,
          answer: SHAPES[odd],
          wrong: [SHAPES[same], SHAPES[same], SHAPES[same]],
          explanation: `The other three are all ${same}s. Only ${SHAPES[odd]} is a ${odd}, so it is the different one.`,
          smartTip: 'Tally by marking',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const pool = ['▲', '■', '●', '▬'] as const
        const target = rng.pick(pool)
        const base = Array.from({ length: 8 }, () => rng.pick(pool))
        const extra = rng.int(1, 3)
        const list = rng.shuffle([...base, ...Array.from({ length: extra }, () => target)])
        const name =
          target === '▲' ? 'triangles' : target === '■' ? 'squares' : target === '●' ? 'circles' : 'rectangles'
        const total = list.filter((s) => s === target).length
        return makeFill({
          prompt: `Count the shapes below. How many ${name} are there?\n${list.join(' ')}`,
          answer: total,
          unit: name,
          explanation: `Sort by shape and count. There are ${total} ${name} in all.`,
          smartTip: 'Tally by marking',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const map: Array<[string, string]> = [
          ['The face of a clock', 'circle'],
          ['A triangular pennant flag', 'triangle'],
          ['The top of a square table', 'square'],
          ['A classroom door', 'rectangle'],
          ['A wheel', 'circle'],
          ['One face of a Rubik\'s cube', 'square'],
        ]
        const [thing, answer] = rng.pick(map)
        return makeChoice({
          prompt: `What shape is it usually? ${thing}`,
          answer,
          wrong: (['circle', 'triangle', 'square', 'rectangle'] as const).filter((s) => s !== answer),
          explanation: `${thing} is close to a ${answer}.`,
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const cases: Array<[string, string, string[]]> = [
          ['Two identical triangles can be joined to make what shape?', 'parallelogram', ['circle', 'pentagon', 'trapezoid']],
          ['4 identical small squares can be joined to make what shape?', 'big square', ['triangle', 'circle', 'pentagon']],
          ['Fold a square in half once. What two shapes do you get?', 'rectangles', ['circles', 'triangles', 'pentagons']],
          ['Cut a rectangle along its diagonal. What two shapes do you get?', 'triangles', ['squares', 'circles', 'trapezoids']],
        ]
        const [prompt, answer, wrong] = rng.pick(cases)
        return makeChoice({
          prompt,
          answer,
          wrong,
          explanation: `Try putting the shapes together and you will see: the answer is ${answer}.`,
          smartTip: 'Check the sides',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   6. Simple word problems
   ══════════════════════════════════════════════ */

const wordProblems: Topic = {
  id: 'g1-word',
  grade: 1,
  name: 'Simple Word Problems',
  color: 'teal',
  icon: 'BookOpen',
  summary: 'Turn everyday stories into number sentences, and find the total, what is left, and the difference.',
  explanation: [
    {
      title: 'Use addition to find the total',
      body: 'Words like "in all", "together", "more came" and "increased" mean putting two parts together, so use addition.',
      example: '5 at first, 3 more came → 5 + 3 = 8',
    },
    {
      title: 'Use subtraction to find what is left',
      body: 'Words like "left", "remaining", "took away", "used up" and "flew away" mean taking a part away, so use subtraction.',
      example: '10 in all, 4 taken away → 10 − 4 = 6',
    },
    {
      title: 'Use subtraction to find the difference',
      body: 'When the question asks "how many more", "how many fewer" or "what is the difference", subtract the smaller number from the bigger number.',
      example: 'Mia has 12 flowers, Alex has 7 → 12 − 7 = 5',
    },
  ],
  smartMethods: [
    {
      name: 'Find the key words',
      when: 'You are not sure whether to add or subtract',
      steps: ['Circle the key words in the problem', '"In all, more, together" → addition', '"Left, took away, flew away" → subtraction'],
      example: '"bought more" → addition',
    },
    {
      name: 'Draw a bar diagram',
      when: 'The problem is long or the relationships are unclear',
      steps: ['Draw one bar for the bigger amount', 'Draw another bar for the smaller amount', 'Mark where the question mark goes'],
      example: '"How many more" is the gap between the two bars',
    },
    {
      name: 'Check back',
      when: 'After you get an answer',
      steps: ['Put the answer back into the problem and read it again', 'Ask whether it makes sense', 'Check that you wrote the unit'],
      example: 'You get "12 left" but there were only 10 at first → the answer must be wrong',
    },
  ],
  levels: buildLevels(1, [
    'One-step addition word problems',
    'One-step subtraction word problems',
    'Finding the difference',
    'Two-step word problems',
    'Mixed word problems and true or false',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const a = rng.int(2, [9, 12, 15, 20, 30][level - 1])
      const b = rng.int(1, [8, 10, 12, 15, 20][level - 1])
      return makeFill({
        prompt: `There are ${a} birds in a tree, and ${b} more fly over. How many birds are there now?`,
        answer: a + b,
        unit: 'birds',
        explanation: `"More fly over" means add: ${a} + ${b} = ${a + b} birds.`,
        smartTip: 'Find the key words',
      })
    })

    makers.push(() => {
      const total = rng.int([6, 10, 15, 20, 30][level - 1], [12, 18, 25, 35, 50][level - 1])
      const gone = rng.int(1, Math.max(1, Math.floor(total / 2)))
      return makeFill({
        prompt: `Mom bought ${total} apples and the family ate ${gone}. How many apples are left?`,
        answer: total - gone,
        unit: 'apples',
        explanation: `"Ate" means take away, so subtract: ${total} − ${gone} = ${total - gone} apples.`,
        smartTip: 'Find the key words',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const a = rng.int(8, 25)
        const diff = rng.int(2, 8)
        const b = a - diff
        return makeFill({
          prompt: `Mia folded ${a} paper cranes and Alex folded ${b}. How many more cranes did Mia fold than Alex?`,
          answer: diff,
          unit: 'cranes',
          explanation: `To find the difference, subtract: ${a} − ${b} = ${diff} cranes.`,
          smartTip: 'Draw a bar diagram',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const a = rng.int(5, 20)
        const b = rng.int(2, 9)
        const c = rng.int(1, Math.max(1, a + b - 1))
        return makeFill({
          prompt: `There are ${a} people on a bus. At the next stop ${b} get on and ${c} get off. How many people are on the bus now?`,
          answer: a + b - c,
          unit: 'people',
          explanation: `Add the ones who get on and subtract the ones who get off: ${a} + ${b} − ${c} = ${a + b - c} people.`,
          smartTip: 'Find the key words',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const each = rng.int(2, 6)
        const groups = rng.int(2, 5)
        return makeFill({
          prompt: `Each box holds ${each} pencils. How many pencils are in ${groups} boxes?`,
          answer: each * groups,
          unit: 'pencils',
          explanation: `Every group is the same size, so you can add repeatedly: ${Array.from({ length: groups }, () => each).join(' + ')} = ${each * groups} pencils.`,
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const total = rng.int(10, 24)
        const each = rng.pick([2, 3, 4])
        const groups = Math.floor(total / each)
        const used = each * groups
        return makeFill({
          prompt: `There are ${total} biscuits. Every ${each} biscuits go in one bag. How many full bags can you make?`,
          answer: groups,
          unit: 'bags',
          explanation: `${each} × ${groups} = ${used}. The ${total - used} left over are not enough to fill a bag, so you can make at most ${groups} bags.`,
          smartTip: 'Check back',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const a = rng.int(3, 9)
        const b = rng.int(3, 9)
        const total = a + b
        const shown = total + rng.pick([-1, 1, 2])
        return makeJudge({
          prompt: `True or false: Alex has ${a} cards and Mia has ${b}. Together they have ${shown} cards.`,
          correct: shown === total,
          explanation: `${a} + ${b} = ${total}, so together they have ${total} cards. The statement says ${shown}, which is ${shown === total ? 'true' : 'false'}.`,
          smartTip: 'Check back',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

export const grade1Topics: Topic[] = [counting, addition, subtraction, compare, shapes, wordProblems]
