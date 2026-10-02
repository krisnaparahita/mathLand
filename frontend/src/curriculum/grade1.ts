import { buildLevels, buildQuestionSet, makeChoice, makeFill, makeJudge, rng } from './core'
import type { Question, Topic } from './types'

const dots = (n: number): string => Array.from({ length: n }, () => '●').join(' ')

const SHAPES = {
  圆形: '●',
  三角形: '▲',
  正方形: '■',
  长方形: '▬',
  五边形: '⬟',
} as const

/* ══════════════════════════════════════════════
   1. 数数与认识数字
   ══════════════════════════════════════════════ */

const counting: Topic = {
  id: 'g1-counting',
  grade: 1,
  name: '数数与认识数字',
  color: 'indigo',
  icon: 'Hash',
  summary: '从 1 数到 100，认识数位，学会按规律填数和分与合。',
  explanation: [
    {
      title: '一个一个地数',
      body: '数数时要按照顺序一个一个点着数，数到最后一个物体时，那个数就是总数。数的时候不要重复、不要漏掉。',
      example: '● ● ● ● ●  →  5 个',
    },
    {
      title: '数位：几个十和几个一',
      body: '两位数左边是「十位」，右边是「个位」。十位上是几就表示几个十，个位上是几就表示几个一。',
      example: '3 个十和 5 个一  →  35',
    },
    {
      title: '数的分与合',
      body: '一个数可以分成两个数，反过来两个数也能合成一个数。把 10 分成几和几，是后面学加减法的基础。',
      example: '10 可以分成 3 和 7，也可以分成 6 和 4',
    },
  ],
  smartMethods: [
    {
      name: '两个两个数',
      when: '物体比较多、排得比较整齐时',
      steps: ['先把物体两两圈在一起', '每圈算 2 个', '最后如果剩 1 个就再加 1'],
      example: '● ● | ● ● | ● ● | ●  →  2+2+2+1 = 7',
    },
    {
      name: '五个五个数',
      when: '数量在 10 以上，想数得又快又准',
      steps: ['每 5 个分成一组', '一组一组地加 5', '剩下不够 5 个再一个一个数'],
      example: '5、10、15、20 …… 又快又不容易错',
    },
    {
      name: '看数位写数',
      when: '已知「几个十和几个一」要写成数字',
      steps: ['十位上写「几个十」的数字', '个位上写「几个一」的数字', '个位没有就写 0 占位'],
      example: '4 个十和 0 个一 → 40',
    },
  ],
  levels: buildLevels(1, [
    '数出 10 以内物体的数量',
    '数出 20 以内物体的数量',
    '认识数位：几个十和几个一',
    '按规律填数',
    '掌握 10 的分与合',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const n = rng.int(1, [10, 12, 15, 18, 20][level - 1])
      return makeFill({
        prompt: `数一数，一共有多少个圆点？\n${dots(n)}`,
        answer: n,
        unit: '个',
        explanation: `一个一个地点着数，数到最后一个是 ${n}，所以一共有 ${n} 个。`,
        smartTip: '两个两个数',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const tens = rng.int(1, 5)
        const ones = rng.int(0, 9)
        const value = tens * 10 + ones
        return makeFill({
          prompt: `一个数由 ${tens} 个十和 ${ones} 个一组成，这个数是多少？`,
          answer: value,
          explanation: `${tens} 个十是 ${tens * 10}，加上 ${ones} 个一，合起来是 ${value}。`,
          smartTip: '看数位写数',
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
          prompt: `按规律填数：${seq.join('、')}、（  ）、${start + 4 * step}`,
          answer,
          explanation: `每次都加 ${step}，${start + 2 * step} + ${step} = ${answer}，再检查 ${answer} + ${step} = ${start + 4 * step}，正确。`,
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const a = rng.int(1, 9)
        const b = 10 - a
        return makeFill({
          prompt: `10 可以分成 ${a} 和几？`,
          answer: b,
          explanation: `10 - ${a} = ${b}，所以 10 可以分成 ${a} 和 ${b}。`,
          smartTip: '五个五个数',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const value = rng.int(11, 99)
        const tens = Math.floor(value / 10)
        const ones = value % 10
        const answer = `${tens} 个十和 ${ones} 个一`
        const wrongPool = [
          `${ones} 个十和 ${tens} 个一`,
          `${(tens % 9) + 1} 个十和 ${ones} 个一`,
          `${tens} 个十和 ${(ones + 1) % 10} 个一`,
          `${(tens + 1) % 10} 个十和 ${(ones + 2) % 10} 个一`,
          `${ones} 个十和 ${(ones + 1) % 10} 个一`,
        ]
        const wrong = Array.from(new Set(wrongPool.filter((w) => w !== answer))).slice(0, 3)
        return makeChoice({
          prompt: `${value} 里面有（  ）个十和（  ）个一？`,
          answer,
          wrong,
          explanation: `${value} 的十位是 ${tens}，个位是 ${ones}，所以是 ${tens} 个十和 ${ones} 个一。`,
          smartTip: '看数位写数',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const value = rng.int(20, 90)
        const delta = rng.pick([1, 10])
        const answer = value + delta
        return makeChoice({
          prompt: `${value} 后面的第 ${delta === 1 ? 1 : 10} 个数是几？`,
          answer: String(answer),
          wrong: [String(value - delta), String(value + (delta === 1 ? 10 : 1)), String(value)],
          explanation: delta === 1
            ? `一个一个往后数，${value} 后面就是 ${answer}。`
            : `十个十个往后数，${value} 加 10 是 ${answer}。`,
          smartTip: '看数位写数',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   2. 10 以内加法
   ══════════════════════════════════════════════ */

const addition: Topic = {
  id: 'g1-addition',
  grade: 1,
  name: '10 以内加法',
  color: 'orange',
  icon: 'Plus',
  summary: '理解「合起来」的意思，从 5 以内加法一路练到 20 以内进位加。',
  explanation: [
    {
      title: '加法就是把两部分合起来',
      body: '「+」读作加号，表示把两个数合在一起求总数。a + b = c 中，a 和 b 都叫加数，c 叫和。',
      example: '3 + 4 = 7，表示 3 个和 4 个合起来是 7 个',
    },
    {
      title: '凑十法',
      body: '两个数相加超过 10 时，先把其中一个数补成 10，再加上剩下的部分，算得又快又准。',
      example: '9 + 5 = 9 + 1 + 4 = 10 + 4 = 14',
    },
    {
      title: '加数交换，和不变',
      body: '两个数相加，交换位置结果一样。遇到大数加小数，可以换成小数加大数更好算。',
      example: '3 + 8 = 8 + 3 = 11',
    },
  ],
  smartMethods: [
    {
      name: '凑十法',
      when: '两个数相加满十（进位加）时',
      steps: ['看大数，想它补几能凑成 10', '把小数拆成「补数 + 剩下」', '先凑成 10，再加剩下的数'],
      example: '8 + 7：8 补 2 凑十，7 拆成 2 和 5，10 + 5 = 15',
    },
    {
      name: '接着数',
      when: '加的数比较小（1、2、3）时',
      steps: ['记住大的那个数', '在它后面一个一个接着数', '数几个就加几'],
      example: '7 + 2：从 7 往后数两个 → 8、9，所以等于 9',
    },
    {
      name: '交换加数',
      when: '看到「小数 + 大数」觉得不好算时',
      steps: ['把两个加数交换位置', '变成「大数 + 小数」', '再用凑十法或接着数'],
      example: '4 + 9 换成 9 + 4 = 13',
    },
  ],
  levels: buildLevels(1, [
    '5 以内加法，看图列式',
    '10 以内加法，熟练口算',
    '20 以内进位加（凑十法）',
    '三个数连加',
    '填未知加数与加法应用',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []
    const max = [5, 10, 10, 10, 10][level - 1]

    makers.push(() => {
      const a = rng.int(1, max)
      const b = rng.int(1, max)
      return makeFill({
        prompt: `${a} + ${b} = ？`,
        answer: a + b,
        explanation: `${a} 和 ${b} 合起来是 ${a + b}。`,
        smartTip: a + b > 10 ? '凑十法' : '接着数',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const big = rng.int(6, 9)
        const small = rng.int(2, 9)
        const sum = big + small
        const complement = 10 - big
        return makeFill({
          prompt: `${big} + ${small} = ？`,
          answer: sum,
          explanation: `用凑十法：${big} 补 ${complement} 凑成 10，把 ${small} 拆成 ${complement} 和 ${small - complement}，10 + ${small - complement} = ${sum}。`,
          smartTip: '凑十法',
        })
      })
    }

    if (level >= 2) {
      makers.push(() => {
        const a = rng.int(1, 4)
        const b = rng.int(5, 9)
        const sum = a + b
        return makeChoice({
          prompt: `${a} + ${b} = ？`,
          answer: String(sum),
          wrong: [String(sum - 1), String(sum + 1), String(sum + 2)],
          explanation: `交换加数更方便：${a} + ${b} = ${b} + ${a} = ${sum}。`,
          smartTip: '交换加数',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const a = rng.int(1, 5)
        const b = rng.int(1, 5)
        const c = rng.int(1, 5)
        return makeFill({
          prompt: `${a} + ${b} + ${c} = ？`,
          answer: a + b + c,
          explanation: `先算 ${a} + ${b} = ${a + b}，再算 ${a + b} + ${c} = ${a + b + c}。`,
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const a = rng.int(2, 9)
        const total = rng.int(a + 1, Math.min(20, a + 9))
        const b = total - a
        return makeFill({
          prompt: `${a} + （  ） = ${total}`,
          answer: b,
          explanation: `用减法想：${total} - ${a} = ${b}，所以括号里填 ${b}。`,
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const a = rng.int(3, 12)
        const b = rng.int(2, 9)
        const total = a + b
        return makeFill({
          prompt: `小明有 ${a} 颗糖，妈妈又给了他 ${b} 颗，他现在一共有多少颗糖？`,
          answer: total,
          unit: '颗',
          explanation: `「又给了」表示合起来用加法：${a} + ${b} = ${total} 颗。`,
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   3. 10 以内减法
   ══════════════════════════════════════════════ */

const subtraction: Topic = {
  id: 'g1-subtraction',
  grade: 1,
  name: '10 以内减法',
  color: 'green',
  icon: 'Minus',
  summary: '理解「去掉、还剩、相差」，掌握破十法与想加算减。',
  explanation: [
    {
      title: '减法是去掉一部分',
      body: '「−」读作减号，表示从总数里去掉一部分，求剩下多少。a − b = c 中，a 是被减数，b 是减数，c 是差。',
      example: '7 − 3 = 4，表示从 7 个里去掉 3 个，还剩 4 个',
    },
    {
      title: '破十法',
      body: '个位不够减时，先把被减数拆成 10 和几，用 10 去减，再把结果和剩下的几合起来。',
      example: '13 − 8 = 10 − 8 + 3 = 2 + 3 = 5',
    },
    {
      title: '想加算减',
      body: '减法可以反过来想加法：想「几加减数等于被减数」，那个数就是差。',
      example: '12 − 5：想 5 + 7 = 12，所以 12 − 5 = 7',
    },
  ],
  smartMethods: [
    {
      name: '破十法',
      when: '20 以内退位减（个位不够减）时',
      steps: ['把被减数拆成 10 和个位', '先用 10 减去减数', '再把差和个位合起来'],
      example: '14 − 9：10 − 9 = 1，1 + 4 = 5',
    },
    {
      name: '想加算减',
      when: '看到减法一时想不出答案时',
      steps: ['把算式改写成「几 + 减数 = 被减数」', '用加法口诀想一想', '想出来的数就是差'],
      example: '11 − 6：想 6 + 5 = 11，所以差是 5',
    },
    {
      name: '倒着数',
      when: '减数比较小（1、2、3）时',
      steps: ['记住被减数', '往前倒着数几个', '数到的数就是差'],
      example: '9 − 2：从 9 往前数两个 → 8、7，等于 7',
    },
  ],
  levels: buildLevels(1, [
    '5 以内减法',
    '10 以内减法',
    '20 以内退位减（破十法）',
    '连减与加减混合',
    '填未知减数与减法应用',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []
    const max = [5, 10, 10, 12, 15][level - 1]

    makers.push(() => {
      const a = rng.int(2, max)
      const b = rng.int(1, a - 1)
      return makeFill({
        prompt: `${a} − ${b} = ？`,
        answer: a - b,
        explanation: `从 ${a} 里去掉 ${b}，还剩 ${a - b}。也可以想 ${b} + ${a - b} = ${a}。`,
        smartTip: b <= 3 ? '倒着数' : '想加算减',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const a = rng.int(11, 18)
        const b = rng.int(5, 9)
        const diff = a - b
        const ones = a - 10
        return makeFill({
          prompt: `${a} − ${b} = ？`,
          answer: diff,
          explanation: `用破十法：把 ${a} 拆成 10 和 ${ones}，10 − ${b} = ${10 - b}，${10 - b} + ${ones} = ${diff}。`,
          smartTip: '破十法',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const a = rng.int(10, 18)
        const b = rng.int(2, 9)
        const diff = a - b
        return makeChoice({
          prompt: `哪个算式的结果和 ${a} − ${b} 相同？`,
          answer: `${a} = ${b} + ${diff}`,
          wrong: [`${a} = ${b} + ${diff + 1}`, `${a} = ${b} + ${diff - 1}`, `${a} = ${b} + ${diff + 2}`],
          explanation: `想加算减：${b} + ${diff} = ${a}，所以 ${a} − ${b} = ${diff}。`,
          smartTip: '想加算减',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const a = rng.int(8, 15)
        const b = rng.int(1, 5)
        const c = rng.int(1, 5)
        return makeFill({
          prompt: `${a} − ${b} − ${c} = ？`,
          answer: a - b - c,
          explanation: `先算 ${a} − ${b} = ${a - b}，再算 ${a - b} − ${c} = ${a - b - c}。`,
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const total = rng.int(8, 18)
        const left = rng.int(1, total - 1)
        return makeFill({
          prompt: `盘子里有 ${total} 个饺子，吃掉一些后还剩 ${left} 个，吃掉了多少个？`,
          answer: total - left,
          unit: '个',
          explanation: `总数 − 剩下 = 吃掉，${total} − ${left} = ${total - left} 个。`,
          smartTip: '想加算减',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   4. 比较大小
   ══════════════════════════════════════════════ */

const compare: Topic = {
  id: 'g1-compare',
  grade: 1,
  name: '比较大小',
  color: 'pink',
  icon: 'ArrowLeftRight',
  summary: '认识 >、<、=，会比较数、算式和数量的多少。',
  explanation: [
    {
      title: '大于号、小于号、等于号',
      body: '「>」是大于号，「<」是小于号，「=」是等于号。开口朝大数，尖角朝小数。',
      example: '8 > 5（开口对着 8）；5 < 8（尖角对着 5）',
    },
    {
      title: '先算再比',
      body: '比较算式时，要先把两边的算式算出结果，再比较结果的大小。',
      example: '3 + 4 ○ 9：左边 = 7，7 < 9',
    },
    {
      title: '比多少用减法',
      body: '求「一个数比另一个数多（少）多少」，用大数减小数。',
      example: '12 比 7 多 5：12 − 7 = 5',
    },
  ],
  smartMethods: [
    {
      name: '开口朝大数',
      when: '写 > 或 < 时总是搞反',
      steps: ['先找出大的那个数', '把符号的开口对着大数', '尖角自然就对着小数'],
      example: '9 和 6：开口对 9，写作 9 > 6',
    },
    {
      name: '先算后比',
      when: '两边是算式而不是数字时',
      steps: ['分别算出两边的结果', '把结果写在算式下面', '再比较结果'],
      example: '5 + 3 ○ 7 → 8 ○ 7 → 8 > 7',
    },
    {
      name: '数位比较法',
      when: '比较两位数大小时',
      steps: ['先看十位，十位大的数就大', '十位相同再看个位', '个位也相同就相等'],
      example: '47 和 39：十位 4 > 3，所以 47 > 39',
    },
  ],
  levels: buildLevels(1, [
    '比较 20 以内两个数的大小',
    '比较算式与数的大小',
    '比较两位数的大小',
    '找出最大数和最小数',
    '比较多少与判断对错',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []
    const max = [10, 20, 20, 99, 99][level - 1]

    makers.push(() => {
      let a = rng.int(1, max)
      let b = rng.int(1, max)
      while (a === b) b = rng.int(1, max)
      const symbol = a > b ? '>' : '<'
      return makeChoice({
        prompt: `${a} ○ ${b}，○ 里应该填什么？`,
        answer: symbol,
        wrong: [a > b ? '<' : '>', '=', '≠'],
        explanation: `${Math.max(a, b)} 更大，开口朝大数，所以填 ${symbol}。`,
        smartTip: '开口朝大数',
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
          prompt: `${a} + ${b} ○ ${c}，○ 里应该填什么？`,
          answer: symbol,
          wrong: [symbol === '>' ? '<' : symbol === '<' ? '>' : '>', '=', '≠'],
          explanation: `先算左边：${a} + ${b} = ${left}，再比较 ${left} 和 ${c}，填 ${symbol}。`,
          smartTip: '先算后比',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const a = rng.int(10, 99)
        const b = rng.int(10, 99)
        if (a === b) return makers[0]()
        return makeChoice({
          prompt: `${a} 和 ${b} 相比，哪个更大？`,
          answer: String(Math.max(a, b)),
          wrong: [String(Math.min(a, b)), String(a + 10), String(b - 10)],
          explanation: `先比十位：${a} 的十位是 ${Math.floor(a / 10)}，${b} 的十位是 ${Math.floor(b / 10)}，所以 ${Math.max(a, b)} 更大。`,
          smartTip: '数位比较法',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const nums = rng.sample([12, 25, 38, 41, 56, 63, 74, 87, 90], 4)
        return makeChoice({
          prompt: `下面四个数中，最大的是哪个？\n${nums.join('   ')}`,
          answer: String(Math.max(...nums)),
          wrong: nums.filter((n) => n !== Math.max(...nums)).map(String),
          explanation: `先比十位，十位大的数更大；十位相同再比个位。最大的是 ${Math.max(...nums)}。`,
          smartTip: '数位比较法',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const a = rng.int(10, 40)
        const b = rng.int(1, 9)
        return makeFill({
          prompt: `${a} 比 ${a + b} 少多少？`,
          answer: b,
          explanation: `用大数减小数：${a + b} − ${a} = ${b}。`,
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const a = rng.int(2, 9)
        const b = rng.int(2, 9)
        const correct = a + b > 12
        return makeJudge({
          prompt: `判断：${a} + ${b} ${correct ? '>' : '<'} 12 —— 这句话对吗？`,
          correct,
          explanation: `${a} + ${b} = ${a + b}，12 与 ${a + b} 相比 ${a + b > 12 ? '更小' : '更大'}，所以这句话${correct ? '正确' : '错误'}。`,
          smartTip: '先算后比',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   5. 认识图形
   ══════════════════════════════════════════════ */

const shapes: Topic = {
  id: 'g1-shapes',
  grade: 1,
  name: '认识图形',
  color: 'purple',
  icon: 'Shapes',
  summary: '认识圆、三角形、正方形、长方形，会数边和角，了解图形的拼组。',
  explanation: [
    {
      title: '四种基本图形',
      body: '圆形是圆圆的、没有角；三角形有 3 条边 3 个角；正方形 4 条边都相等，4 个角都是直角；长方形对边相等，4 个角都是直角。',
      example: `圆形 ${SHAPES.圆形}　三角形 ${SHAPES.三角形}　正方形 ${SHAPES.正方形}　长方形 ${SHAPES.长方形}`,
    },
    {
      title: '边和角',
      body: '图形的边是直直的线段，两条边相交的地方就是角。数边和角时要按顺序数，做到不重复不遗漏。',
      example: '三角形：3 条边、3 个角；正方形：4 条边、4 个角',
    },
    {
      title: '图形的拼组',
      body: '几个相同的图形可以拼成新的图形，一个图形也可以分割成几个小图形。',
      example: '两个一样的三角形可以拼成一个平行四边形',
    },
  ],
  smartMethods: [
    {
      name: '看角数形状',
      when: '分不清三角形和正方形时',
      steps: ['数一数有几个尖尖的角', '3 个角是三角形', '4 个方方的角是正方形或长方形'],
      example: `${SHAPES.三角形} 有 3 个角 → 三角形`,
    },
    {
      name: '对边相等法',
      when: '区分正方形和长方形时',
      steps: ['先看 4 个角是不是都一样', '再看 4 条边是不是都相等', '四边都相等是正方形，否则是长方形'],
      example: '长长方方、对边相等 → 长方形',
    },
    {
      name: '标记法数图形',
      when: '图形混在一起要数个数时',
      steps: ['按形状分类', '数一种就在旁边做个记号', '最后把记号加起来'],
      example: `▲ ▲ □ ▲ → 三角形 3 个，正方形 1 个`,
    },
  ],
  levels: buildLevels(1, [
    '认出四种基本图形',
    '数边和角',
    '找出不同类的图形',
    '生活中的图形',
    '图形的拼组与分割',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const target = rng.pick(['圆形', '三角形', '正方形', '长方形'] as const)
      const others = (['圆形', '三角形', '正方形', '长方形'] as const).filter((s) => s !== target)
      return makeChoice({
        prompt: `下面哪个是${target}？`,
        answer: SHAPES[target],
        wrong: others.map((s) => SHAPES[s]),
        explanation: `${target}的样子是 ${SHAPES[target]}。`,
        smartTip: '看角数形状',
      })
    })

    makers.push(() => {
      const target = rng.pick(['圆形', '三角形', '正方形', '长方形'] as const)
      return makeChoice({
        prompt: `${SHAPES[target]} 是什么图形？`,
        answer: target,
        wrong: (['圆形', '三角形', '正方形', '长方形'] as const).filter((s) => s !== target),
        explanation: `${SHAPES[target]} 是${target}。`,
        smartTip: '看角数形状',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const target = rng.pick(['三角形', '正方形', '长方形'] as const)
        const sides = target === '三角形' ? 3 : 4
        return makeFill({
          prompt: `${target}有几条边？`,
          answer: sides,
          unit: '条',
          explanation: `${target}有 ${sides} 条边，也有 ${sides} 个角。`,
        })
      })
    }

    if (level >= 2) {
      makers.push(() => {
        const target = rng.pick(['三角形', '正方形', '长方形'] as const)
        const corners = target === '三角形' ? 3 : 4
        return makeFill({
          prompt: `${target}有几个角？`,
          answer: corners,
          unit: '个',
          explanation: `${target}有 ${corners} 个角。`,
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const odd = rng.pick(['圆形', '三角形', '正方形', '长方形'] as const)
        const same = rng.pick((['三角形', '正方形', '长方形'] as const).filter((s) => s !== odd))
        return makeChoice({
          prompt: `下面四个图形中，哪一个和其他三个不是同一类？\n${SHAPES[same]}  ${SHAPES[same]}  ${SHAPES[odd]}  ${SHAPES[same]}`,
          answer: SHAPES[odd],
          wrong: [SHAPES[same], SHAPES[same], SHAPES[same]],
          explanation: `其他三个都是${same}，只有 ${SHAPES[odd]} 是${odd}，所以它不同类。`,
          smartTip: '标记法数图形',
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
          target === '▲' ? '三角形' : target === '■' ? '正方形' : target === '●' ? '圆形' : '长方形'
        const total = list.filter((s) => s === target).length
        return makeFill({
          prompt: `数一数下面的图形中，${name}有多少个？\n${list.join(' ')}`,
          answer: total,
          unit: '个',
          explanation: `按形状分类数，${name}一共有 ${total} 个。`,
          smartTip: '标记法数图形',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const map: Array<[string, string]> = [
          ['钟表的表盘', '圆形'],
          ['红领巾', '三角形'],
          ['方桌的桌面', '正方形'],
          ['教室的门', '长方形'],
          ['车轮', '圆形'],
          ['魔方的一个面', '正方形'],
        ]
        const [thing, answer] = rng.pick(map)
        return makeChoice({
          prompt: `${thing}通常是什么形状？`,
          answer,
          wrong: (['圆形', '三角形', '正方形', '长方形'] as const).filter((s) => s !== answer),
          explanation: `${thing}的形状接近${answer}。`,
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const cases: Array<[string, string, string[]]> = [
          ['两个完全一样的三角形可以拼成一个什么图形？', '平行四边形', ['圆形', '五边形', '梯形']],
          ['4 个相同的小正方形可以拼成一个什么图形？', '大正方形', ['三角形', '圆形', '五边形']],
          ['一个正方形对折一次，可以得到两个什么图形？', '长方形', ['圆形', '三角形', '五边形']],
          ['一个长方形沿对角线剪开，可以得到两个什么图形？', '三角形', ['正方形', '圆形', '梯形']],
        ]
        const [prompt, answer, wrong] = rng.pick(cases)
        return makeChoice({
          prompt,
          answer,
          wrong,
          explanation: `动手拼一拼就知道：答案是${answer}。`,
          smartTip: '对边相等法',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   6. 简单应用题
   ══════════════════════════════════════════════ */

const wordProblems: Topic = {
  id: 'g1-word',
  grade: 1,
  name: '简单应用题',
  color: 'teal',
  icon: 'BookOpen',
  summary: '把生活里的故事变成算式，学会求一共、求还剩、求相差。',
  explanation: [
    {
      title: '求一共用加法',
      body: '题目里出现「一共」「合起来」「又来了」「增加了」，表示把两部分合起来，用加法。',
      example: '原来有 5 只，又来了 3 只 → 5 + 3 = 8',
    },
    {
      title: '求还剩用减法',
      body: '题目里出现「还剩」「剩下」「拿走了」「用掉了」「飞走了」，表示去掉一部分，用减法。',
      example: '一共 10 个，拿走 4 个 → 10 − 4 = 6',
    },
    {
      title: '求相差用减法',
      body: '题目问「多多少」「少多少」「相差多少」，用大数减小数。',
      example: '小红 12 朵，小明 7 朵 → 12 − 7 = 5',
    },
  ],
  smartMethods: [
    {
      name: '找关键词',
      when: '不知道该用加法还是减法时',
      steps: ['圈出题目里的关键词', '「一共、又、合起来」→ 加法', '「还剩、拿走、飞走」→ 减法'],
      example: '「又买了」→ 加法',
    },
    {
      name: '画线段图',
      when: '题目比较长、关系理不清时',
      steps: ['画一条线表示较大的量', '再画一条线表示较小的量', '标出问号的位置'],
      example: '多多少就是两条线的差',
    },
    {
      name: '回头检查',
      when: '算出答案后',
      steps: ['把答案代回题目读一遍', '看看是否符合常理', '检查单位有没有写'],
      example: '算出「还剩 12 个」但原来只有 10 个 → 一定算错了',
    },
  ],
  levels: buildLevels(1, [
    '一步加法应用题',
    '一步减法应用题',
    '求相差多少',
    '两步应用题',
    '综合应用与判断',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const a = rng.int(2, [9, 12, 15, 20, 30][level - 1])
      const b = rng.int(1, [8, 10, 12, 15, 20][level - 1])
      return makeFill({
        prompt: `树上有 ${a} 只小鸟，又飞来 ${b} 只，现在一共有多少只小鸟？`,
        answer: a + b,
        unit: '只',
        explanation: `「又飞来」用加法：${a} + ${b} = ${a + b} 只。`,
        smartTip: '找关键词',
      })
    })

    makers.push(() => {
      const total = rng.int([6, 10, 15, 20, 30][level - 1], [12, 18, 25, 35, 50][level - 1])
      const gone = rng.int(1, Math.max(1, Math.floor(total / 2)))
      return makeFill({
        prompt: `妈妈买了 ${total} 个苹果，吃掉了 ${gone} 个，还剩多少个？`,
        answer: total - gone,
        unit: '个',
        explanation: `「吃掉了」用减法：${total} − ${gone} = ${total - gone} 个。`,
        smartTip: '找关键词',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const a = rng.int(8, 25)
        const diff = rng.int(2, 8)
        const b = a - diff
        return makeFill({
          prompt: `小红折了 ${a} 只纸鹤，小明折了 ${b} 只，小红比小明多折多少只？`,
          answer: diff,
          unit: '只',
          explanation: `求相差用减法：${a} − ${b} = ${diff} 只。`,
          smartTip: '画线段图',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const a = rng.int(5, 20)
        const b = rng.int(2, 9)
        const c = rng.int(1, Math.max(1, a + b - 1))
        return makeFill({
          prompt: `公交车上原来有 ${a} 人，到站后上来 ${b} 人，又下去 ${c} 人，现在车上有多少人？`,
          answer: a + b - c,
          unit: '人',
          explanation: `上车的加、下车的减：${a} + ${b} − ${c} = ${a + b - c} 人。`,
          smartTip: '找关键词',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const each = rng.int(2, 6)
        const groups = rng.int(2, 5)
        return makeFill({
          prompt: `每盒装 ${each} 支铅笔，${groups} 盒一共装多少支铅笔？`,
          answer: each * groups,
          unit: '支',
          explanation: `每份同样多，可以连加：${Array.from({ length: groups }, () => each).join(' + ')} = ${each * groups} 支。`,
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
          prompt: `有 ${total} 块饼干，每 ${each} 块装一袋，最多可以装满几袋？`,
          answer: groups,
          unit: '袋',
          explanation: `${each} × ${groups} = ${used}，剩下 ${total - used} 块不够装一袋，所以最多装 ${groups} 袋。`,
          smartTip: '回头检查',
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
          prompt: `判断：小明有 ${a} 张卡片，小红有 ${b} 张，两人一共有 ${shown} 张。—— 对吗？`,
          correct: shown === total,
          explanation: `${a} + ${b} = ${total}，所以两人一共有 ${total} 张，题目说 ${shown} 张是${shown === total ? '对的' : '错的'}。`,
          smartTip: '回头检查',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

export const grade1Topics: Topic[] = [counting, addition, subtraction, compare, shapes, wordProblems]
