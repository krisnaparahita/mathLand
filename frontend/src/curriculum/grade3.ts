import { buildLevels, buildQuestionSet, fracStr, makeChoice, makeFill, makeJudge, rng } from './core'
import type { Question, Topic } from './types'

/* ══════════════════════════════════════════════
   1. 表内乘法
   ══════════════════════════════════════════════ */

const multTable: Topic = {
  id: 'g3-multable',
  grade: 3,
  name: '表内乘法',
  color: 'indigo',
  icon: 'X',
  summary: '熟练掌握 1～9 的乘法口诀，做到脱口而出。',
  explanation: [
    {
      title: '乘法口诀表',
      body: '乘法口诀一共有 45 句，涵盖了 1～9 的所有乘法。横着背、竖着背都要会。',
      example: '一一得一、一二得二 …… 九九八十一',
    },
    {
      title: '一句口诀两道算式',
      body: '除了两个乘数相同的口诀（如「三三得九」），其余每句口诀都能写出两道乘法算式。',
      example: '六七四十二 → 6 × 7 = 42，7 × 6 = 42',
    },
    {
      title: '积的变化',
      body: '一个乘数不变，另一个乘数扩大几倍，积也扩大几倍。利用这个规律可以推算不熟的口诀。',
      example: '知道 6 × 4 = 24，那么 6 × 8 = 24 × 2 = 48',
    },
  ],
  smartMethods: [
    {
      name: '拆数口诀法',
      when: '遇到不熟的大数乘法时',
      steps: ['把一个乘数拆成两个较小的数', '分别相乘', '再把两个积相加'],
      example: '7 × 8 = 7 × 5 + 7 × 3 = 35 + 21 = 56',
    },
    {
      name: '翻倍推算',
      when: '记住小乘数、忘了大乘数时',
      steps: ['先算出一半的乘数对应的积', '把积乘 2', '得到最终答案'],
      example: '6 × 4 = 24 → 6 × 8 = 48',
    },
    {
      name: '九的手指法',
      when: '算 9 的乘法时',
      steps: ['伸出十根手指', '弯下第几根手指就是几九', '左边手指数是十位，右边是个位'],
      example: '9 × 7：弯下第 7 根，左边 6 根、右边 3 根 → 63',
    },
  ],
  levels: buildLevels(3, [
    '1～5 的乘法口诀',
    '6～9 的乘法口诀',
    '口诀填空与推算',
    '乘法算式比较',
    '乘法综合应用',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []
    const maxA = [5, 9, 9, 9, 9][level - 1]
    const maxB = [5, 9, 9, 9, 9][level - 1]

    makers.push(() => {
      const a = rng.int(2, maxA)
      const b = rng.int(2, maxB)
      return makeFill({
        prompt: `${a} × ${b} = ？`,
        answer: a * b,
        explanation: `口诀：${a} × ${b} = ${a * b}。`,
        smartTip: a === 9 || b === 9 ? '九的手指法' : '拆数口诀法',
      })
    })

    makers.push(() => {
      const a = rng.int(2, maxA)
      const b = rng.int(2, maxB)
      const product = a * b
      return makeFill({
        prompt: `${b} × ${a} = ？`,
        answer: product,
        explanation: `交换乘数位置，积不变：${b} × ${a} = ${a} × ${b} = ${product}。`,
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const a = rng.int(6, 9)
        const b = rng.int(6, 9)
        const product = a * b
        return makeChoice({
          prompt: `${a} × ${b} = ？`,
          answer: String(product),
          wrong: [String(product - a), String(product + a), String(product - b)],
          explanation: `口诀：${a} × ${b} = ${product}。也可以用 ${a} × ${b - 5} + ${a} × 5 = ${a * (b - 5)} + ${a * 5} = ${product}。`,
          smartTip: '拆数口诀法',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const a = rng.int(3, 9)
        const b = rng.int(3, 9)
        const product = a * b
        return makeFill({
          prompt: `${a} × （  ） = ${product}`,
          answer: b,
          explanation: `想口诀：${a} 乘几等于 ${product}？${a} × ${b} = ${product}。`,
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const a = rng.int(3, 8)
        const b = rng.int(3, 8)
        const half = b % 2 === 0 ? b / 2 : b
        return makeFill({
          prompt: `已知 ${a} × ${half} = ${a * half}，那么 ${a} × ${half * 2} = ？`,
          answer: a * half * 2,
          explanation: `乘数扩大 2 倍，积也扩大 2 倍：${a * half} × 2 = ${a * half * 2}。`,
          smartTip: '翻倍推算',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const a = rng.int(2, 9)
        const b = rng.int(2, 9)
        const c = rng.int(2, 9)
        return makeChoice({
          prompt: `下面哪个算式的积最大？\nA. ${a} × ${b}　　B. ${a} × ${c}　　C. ${b} × ${c}`,
          answer: a * b >= a * c && a * b >= b * c ? 'A' : a * c >= b * c ? 'B' : 'C',
          wrong: ['A', 'B', 'C'],
          explanation: `A = ${a * b}，B = ${a * c}，C = ${b * c}，最大的是 ${Math.max(a * b, a * c, b * c)}。`,
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const each = rng.int(3, 9)
        const groups = rng.int(3, 9)
        const extra = rng.int(1, 9)
        return makeFill({
          prompt: `有 ${groups} 盒彩笔，每盒 ${each} 支，另外还有 ${extra} 支散装的，一共有多少支彩笔？`,
          answer: each * groups + extra,
          unit: '支',
          explanation: `先算盒装：${each} × ${groups} = ${each * groups} 支，再加散装 ${extra} 支，一共 ${each * groups + extra} 支。`,
          smartTip: '拆数口诀法',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   2. 表内除法
   ══════════════════════════════════════════════ */

const division: Topic = {
  id: 'g3-division',
  grade: 3,
  name: '除法入门',
  color: 'orange',
  icon: 'Divide',
  summary: '理解平均分，用乘法口诀求商，认识余数和有余数的除法。',
  explanation: [
    {
      title: '平均分',
      body: '每份分得同样多，叫平均分。把一个数平均分成几份，求每份是多少，用除法计算。',
      example: '12 个苹果平均分成 3 份，每份 12 ÷ 3 = 4 个',
    },
    {
      title: '除法算式各部分名称',
      body: 'a ÷ b = c 中，a 是被除数，b 是除数，c 是商。除法是乘法的逆运算。',
      example: '18 ÷ 3 = 6，因为 3 × 6 = 18',
    },
    {
      title: '余数一定要比除数小',
      body: '平均分后有剩余，剩下的数叫余数。余数必须比除数小，否则说明还能再分。',
      example: '14 ÷ 4 = 3 …… 2，余数 2 < 除数 4',
    },
  ],
  smartMethods: [
    {
      name: '想乘算除',
      when: '计算表内除法时',
      steps: ['把除法改写成「除数 × 几 = 被除数」', '想对应的乘法口诀', '口诀里的另一个数就是商'],
      example: '56 ÷ 7：想 7 × 8 = 56，所以商是 8',
    },
    {
      name: '分物画图法',
      when: '不理解除法含义时',
      steps: ['画出被除数个物品', '按除数的份数一圈一圈地分', '数每圈里有几个'],
      example: '12 个 ○ 分成 3 圈 → 每圈 4 个',
    },
    {
      name: '余数检验法',
      when: '算完有余数的除法后',
      steps: ['检查余数是否小于除数', '用「商 × 除数 + 余数」验算', '看是否等于被除数'],
      example: '14 ÷ 4 = 3 余 2，验算 3 × 4 + 2 = 14 ✓',
    },
  ],
  levels: buildLevels(3, [
    '认识平均分',
    '用口诀求商',
    '除法算式填空',
    '有余数的除法',
    '除法综合应用',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const b = rng.int(2, 9)
      const c = rng.int(2, 9)
      const a = b * c
      return makeFill({
        prompt: `${a} ÷ ${b} = ？`,
        answer: c,
        explanation: `想乘算除：${b} × ${c} = ${a}，所以 ${a} ÷ ${b} = ${c}。`,
        smartTip: '想乘算除',
      })
    })

    makers.push(() => {
      const groups = rng.pick([2, 3, 4, 5, 6])
      const each = rng.int(2, 9)
      const total = groups * each
      return makeFill({
        prompt: `把 ${total} 块饼干平均分给 ${groups} 个小朋友，每人分到几块？`,
        answer: total / groups,
        unit: '块',
        explanation: `平均分用除法：${total} ÷ ${groups} = ${total / groups} 块。`,
        smartTip: '分物画图法',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const b = rng.int(2, 9)
        const c = rng.int(2, 9)
        const a = b * c
        return makeChoice({
          prompt: `${a} ÷ ${b} = ？`,
          answer: String(c),
          wrong: [String(c + 1), String(c - 1), String(b)],
          explanation: `想乘算除：${b} × ${c} = ${a}，所以商是 ${c}。`,
          smartTip: '想乘算除',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const b = rng.int(2, 9)
        const c = rng.int(2, 9)
        const a = b * c
        return makeFill({
          prompt: `${a} ÷ （  ） = ${c}`,
          answer: b,
          explanation: `除数 = 被除数 ÷ 商：${a} ÷ ${c} = ${b}。`,
          smartTip: '想乘算除',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const each = rng.int(2, 9)
        const groups = rng.int(2, 9)
        const total = each * groups
        return makeFill({
          prompt: `每 ${each} 个装一袋，${total} 个可以装几袋？`,
          answer: groups,
          unit: '袋',
          explanation: `求份数用除法：${total} ÷ ${each} = ${groups} 袋。`,
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
          prompt: `${dividend} ÷ ${divisor} = 商（  ），余（  ）。请先填商。`,
          answer: quotient,
          explanation: `${divisor} × ${quotient} = ${divisor * quotient}，${dividend} − ${divisor * quotient} = ${remainder}，所以商 ${quotient} 余 ${remainder}，且余数 ${remainder} < 除数 ${divisor}。`,
          smartTip: '余数检验法',
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
          prompt: `${dividend} ÷ ${divisor} 的余数是多少？`,
          answer: remainder,
          explanation: `${divisor} × ${quotient} = ${divisor * quotient}，${dividend} − ${divisor * quotient} = ${remainder}，余数是 ${remainder}（比除数 ${divisor} 小）。`,
          smartTip: '余数检验法',
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
          prompt: `判断：${dividend} ÷ ${divisor} = ${quotient} …… ${remainder + divisor} 这个结果对吗？`,
          correct: false,
          explanation: `余数必须比除数小，${remainder + divisor} > ${divisor}，说明还能再分一份，正确的结果是 ${quotient + 1} …… ${remainder}。`,
          smartTip: '余数检验法',
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
          prompt: `有 ${dividend} 个同学去划船，每条船最多坐 ${divisor} 人，至少需要几条船？`,
          answer: quotient + 1,
          unit: '条',
          explanation: `${dividend} ÷ ${divisor} = ${quotient} …… ${remainder}，剩下的 ${remainder} 人也要坐一条船，所以是 ${quotient + 1} 条。`,
          smartTip: '余数检验法',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   3. 两步混合运算
   ══════════════════════════════════════════════ */

const mixedOps: Topic = {
  id: 'g3-mixed',
  grade: 3,
  name: '两步混合运算',
  color: 'green',
  icon: 'Sigma',
  summary: '掌握运算顺序：先乘除后加减，有小括号先算小括号。',
  explanation: [
    {
      title: '同级运算从左往右',
      body: '一个算式里只有加减法，或者只有乘除法，要按照从左到右的顺序计算。',
      example: '18 − 5 + 7：先算 18 − 5 = 13，再算 13 + 7 = 20',
    },
    {
      title: '先乘除，后加减',
      body: '算式里既有加减法又有乘除法时，要先算乘除法，再算加减法。',
      example: '5 + 3 × 4 = 5 + 12 = 17（不是 8 × 4 = 32）',
    },
    {
      title: '小括号优先',
      body: '算式里有小括号，要先算小括号里面的。小括号能改变运算顺序。',
      example: '(5 + 3) × 4 = 8 × 4 = 32',
    },
  ],
  smartMethods: [
    {
      name: '画线标顺序',
      when: '算式较长怕算错顺序时',
      steps: ['在要先算的部分下面画一条横线', '算出结果写在横线下方', '再算剩下的部分'],
      example: '5 + 3 × 4 → 先算 3 × 4 = 12，再算 5 + 12',
    },
    {
      name: '括号优先法',
      when: '算式里有小括号时',
      steps: ['第一步只看括号里的', '把括号里算出的结果代入原式', '再按先乘除后加减计算'],
      example: '(12 − 4) × 5 = 8 × 5 = 40',
    },
    {
      name: '还原验算法',
      when: '想检查混合运算结果时',
      steps: ['把算出的结果代回原式', '按相反顺序倒推', '看能否回到已知的数'],
      example: '5 + 3 × 4 = 17 → 17 − 12 = 5 ✓',
    },
  ],
  levels: buildLevels(3, [
    '只有加减或只有乘除',
    '先乘除后加减',
    '有小括号的算式',
    '比较运算结果',
    '混合运算应用题',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const a = rng.int(20, 80)
      const b = rng.int(5, 20)
      const c = rng.int(3, 15)
      return makeFill({
        prompt: `${a} − ${b} + ${c} = ？`,
        answer: a - b + c,
        explanation: `只有加减法，从左往右：${a} − ${b} = ${a - b}，${a - b} + ${c} = ${a - b + c}。`,
        smartTip: '画线标顺序',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const a = rng.int(5, 30)
        const b = rng.int(2, 9)
        const c = rng.int(2, 9)
        return makeFill({
          prompt: `${a} + ${b} × ${c} = ？`,
          answer: a + b * c,
          explanation: `先算乘法：${b} × ${c} = ${b * c}，再算加法：${a} + ${b * c} = ${a + b * c}。`,
          smartTip: '画线标顺序',
        })
      })
    }

    if (level >= 2) {
      makers.push(() => {
        const a = rng.int(30, 90)
        const b = rng.int(2, 9)
        const c = rng.int(2, 9)
        return makeFill({
          prompt: `${a} − ${b} × ${c} = ？`,
          answer: a - b * c,
          explanation: `先算乘法：${b} × ${c} = ${b * c}，再算减法：${a} − ${b * c} = ${a - b * c}。`,
          smartTip: '画线标顺序',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const a = rng.int(10, 40)
        const b = rng.int(5, 20)
        const c = rng.int(2, 8)
        return makeFill({
          prompt: `(${a} − ${b}) × ${c} = ？`,
          answer: (a - b) * c,
          explanation: `先算小括号：${a} − ${b} = ${a - b}，再算乘法：${a - b} × ${c} = ${(a - b) * c}。`,
          smartTip: '括号优先法',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const a = rng.int(20, 60)
        const b = rng.int(10, 30)
        const c = rng.int(2, 9)
        return makeFill({
          prompt: `(${a} + ${b}) ÷ ${c} = ？`,
          answer: Math.round(((a + b) / c) * 100) / 100,
          explanation: `先算小括号：${a} + ${b} = ${a + b}，再算除法：${a + b} ÷ ${c} = ${Math.round(((a + b) / c) * 100) / 100}。`,
          smartTip: '括号优先法',
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
          prompt: `下面哪个更大？\nA. (${a} + ${b}) × ${c}　　B. ${a} + ${b} × ${c}`,
          answer: withBracket >= without ? 'A' : 'B',
          wrong: [withBracket >= without ? 'B' : 'A', '一样大', '无法比较'],
          explanation: `A = ${a + b} × ${c} = ${withBracket}，B = ${a} + ${b * c} = ${without}，${withBracket >= without ? 'A 更大' : 'B 更大'}。`,
          smartTip: '括号优先法',
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
          prompt: `判断：每盒 ${each} 元，买 ${groups} 盒，再付 ${extra} 元运费，一共要 ${total + each} 元。—— 对吗？`,
          correct: false,
          explanation: `${each} × ${groups} + ${extra} = ${each * groups} + ${extra} = ${total} 元，不是 ${total + each} 元。`,
          smartTip: '还原验算法',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const price = rng.int(3, 9)
        const count = rng.int(3, 8)
        const paid = price * count + rng.int(10, 40)
        return makeFill({
          prompt: `每本练习本 ${price} 元，买了 ${count} 本，付了 ${paid} 元，应找回多少元？`,
          answer: paid - price * count,
          unit: '元',
          explanation: `先算总价：${price} × ${count} = ${price * count} 元，再算找零：${paid} − ${price * count} = ${paid - price * count} 元。`,
          smartTip: '画线标顺序',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   4. 分数初步
   ══════════════════════════════════════════════ */

const fractionIntro: Topic = {
  id: 'g3-fraction',
  grade: 3,
  name: '分数初步',
  color: 'pink',
  icon: 'PieChart',
  summary: '认识几分之一和几分之几，会比较同分母分数的大小，会做简单分数加减。',
  explanation: [
    {
      title: '分数的意义',
      body: '把一个整体平均分成若干份，其中的一份或几份可以用分数表示。分数线下方的数是分母，表示平均分成的份数；上方的数是分子，表示取了几份。',
      example: '把一个蛋糕平均分成 4 份，取 1 份就是 1/4',
    },
    {
      title: '同分母分数比大小',
      body: '分母相同时，分子大的分数就大。因为分的份数一样，取的份数越多就越大。',
      example: '3/5 > 2/5（都是 5 份里面取，3 份比 2 份多）',
    },
    {
      title: '同分母分数加减法',
      body: '同分母分数相加减，分母不变，只把分子相加减。',
      example: '2/7 + 3/7 = 5/7；6/8 − 2/8 = 4/8',
    },
  ],
  smartMethods: [
    {
      name: '画图分份法',
      when: '不理解分数含义时',
      steps: ['画一个图形代表整体', '按分母平均分成几份', '按分子给几份涂上颜色'],
      example: '3/4：把圆分成 4 份，涂 3 份',
    },
    {
      name: '同分母只看分子',
      when: '比较同分母分数大小时',
      steps: ['确认分母是否相同', '分母相同就只比分子', '分子大的分数更大'],
      example: '5/9 和 7/9 → 7 > 5，所以 7/9 更大',
    },
    {
      name: '分子相加分母不变',
      when: '做同分母分数加减时',
      steps: ['确认分母相同', '把分子相加（减）', '分母照抄，最后约分'],
      example: '3/8 + 2/8 = 5/8',
    },
  ],
  levels: buildLevels(3, [
    '认识几分之一',
    '认识几分之几',
    '比较同分母分数大小',
    '同分母分数加减法',
    '分数的简单应用',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const d = rng.int(2, [5, 8, 9, 12, 12][level - 1])
      const n = rng.int(1, d - 1)
      return makeChoice({
        prompt: `把一个西瓜平均分成 ${d} 份，取其中的 ${n} 份，用分数怎么表示？`,
        answer: `${n}/${d}`,
        wrong: [`${d}/${n}`, `${n}/${d + 1}`, `${n + 1}/${d}`],
        explanation: `平均分成 ${d} 份，分母就是 ${d}；取了 ${n} 份，分子就是 ${n}，所以是 ${n}/${d}。`,
        smartTip: '画图分份法',
      })
    })

    makers.push(() => {
      const d = rng.int(2, 9)
      return makeFill({
        prompt: `1 里面有（  ）个 1/${d}？`,
        answer: d,
        explanation: `把 1 平均分成 ${d} 份，每份是 1/${d}，${d} 个 1/${d} 合起来就是 1。`,
        smartTip: '画图分份法',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const d = rng.int(3, 9)
        const a = rng.int(1, d - 2)
        const b = rng.int(a + 1, d - 1)
        const symbol = a > b ? '>' : '<'
        return makeChoice({
          prompt: `${a}/${d} ○ ${b}/${d}，○ 里应填什么？`,
          answer: symbol,
          wrong: [a > b ? '<' : '>', '=', '≠'],
          explanation: `分母相同只比分子：${Math.max(a, b)} > ${Math.min(a, b)}，所以 ${Math.max(a, b)}/${d} 更大，填 ${a > b ? '>' : '<'}。`,
          smartTip: '同分母只看分子',
        })
      })
    }

    if (level >= 2) {
      makers.push(() => {
        const d = rng.int(3, 9)
        const n = rng.int(1, d - 1)
        return makeJudge({
          prompt: `判断：把一个饼平均分成 ${d} 份，吃了 ${n} 份，就是吃了这个饼的 ${n}/${d}。—— 对吗？`,
          correct: true,
          explanation: `平均分成 ${d} 份，取 ${n} 份就是 ${n}/${d}，说法正确。`,
          smartTip: '画图分份法',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const d = rng.int(4, 12)
        const a = rng.int(1, d - 2)
        const b = rng.int(1, d - a - 1)
        return makeFill({
          prompt: `${a}/${d} + ${b}/${d} = ？答案请写成「分子/分母」的形式，若能约分请约分。`,
          answer: fracStr(a + b, d),
          explanation: `分母不变，分子相加：${a} + ${b} = ${a + b}，所以是 ${a + b}/${d}${a + b === d ? ' = 1' : ''}，约分后是 ${fracStr(a + b, d)}。`,
          smartTip: '分子相加分母不变',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const d = rng.int(4, 12)
        const a = rng.int(2, d - 1)
        const b = rng.int(1, a - 1)
        return makeFill({
          prompt: `${a}/${d} − ${b}/${d} = ？答案请写成「分子/分母」的形式，若能约分请约分。`,
          answer: fracStr(a - b, d),
          explanation: `分母不变，分子相减：${a} − ${b} = ${a - b}，所以是 ${a - b}/${d}，约分后是 ${fracStr(a - b, d)}。`,
          smartTip: '分子相加分母不变',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const d = rng.int(3, 9)
        const taken = rng.int(1, d - 1)
        return makeFill({
          prompt: `一根绳子平均分成 ${d} 段，用去了 ${taken} 段，还剩这根绳子的几分之几？分子是多少？`,
          answer: d - taken,
          explanation: `一共 ${d} 段，用去 ${taken} 段，还剩 ${d - taken} 段，就是 ${d - taken}/${d}，分子是 ${d - taken}。`,
          smartTip: '画图分份法',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   5. 周长
   ══════════════════════════════════════════════ */

const perimeter: Topic = {
  id: 'g3-perimeter',
  grade: 3,
  name: '周长',
  color: 'purple',
  icon: 'Square',
  summary: '理解封闭图形一周的长度，掌握长方形和正方形的周长公式。',
  explanation: [
    {
      title: '什么是周长',
      body: '封闭图形一周的长度，就是它的周长。测量周长就是把图形所有边的长度加起来。',
      example: '三角形三边分别是 3、4、5 厘米，周长 = 3 + 4 + 5 = 12 厘米',
    },
    {
      title: '长方形的周长',
      body: '长方形有 2 条长和 2 条宽，周长 = (长 + 宽) × 2。',
      example: '长 8 厘米、宽 5 厘米，周长 = (8 + 5) × 2 = 26 厘米',
    },
    {
      title: '正方形的周长',
      body: '正方形 4 条边都相等，周长 = 边长 × 4。反过来，边长 = 周长 ÷ 4。',
      example: '边长 6 厘米，周长 = 6 × 4 = 24 厘米',
    },
  ],
  smartMethods: [
    {
      name: '绳子围一圈',
      when: '不理解周长概念时',
      steps: ['想象用一根绳子沿图形边缘围一圈', '把绳子拉直', '拉直后的长度就是周长'],
      example: '围着课本绕一圈再量绳子 → 课本的周长',
    },
    {
      name: '配对相加',
      when: '算长方形周长时',
      steps: ['先把一条长和一条宽配成一对', '一对的长度是 长 + 宽', '长方形有两对，所以再乘 2'],
      example: '长 8、宽 5 → 一对 13，两对 26',
    },
    {
      name: '逆推边长',
      when: '已知周长求边长时',
      steps: ['正方形：周长 ÷ 4 = 边长', '长方形：周长 ÷ 2 = 长 + 宽', '再用和减去已知的一边'],
      example: '周长 24 的正方形 → 边长 6',
    },
  ],
  levels: buildLevels(3, [
    '认识周长，求简单图形周长',
    '长方形的周长',
    '正方形的周长',
    '已知周长求边长',
    '周长的实际应用',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const a = rng.int(3, 15)
      const b = rng.int(3, 15)
      const c = rng.int(3, 15)
      return makeFill({
        prompt: `一个三角形三条边分别是 ${a} 厘米、${b} 厘米、${c} 厘米，它的周长是多少厘米？`,
        answer: a + b + c,
        unit: '厘米',
        explanation: `周长 = 三边之和：${a} + ${b} + ${c} = ${a + b + c} 厘米。`,
        smartTip: '绳子围一圈',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const length = rng.int(5, [12, 15, 20, 25, 30][level - 1])
        const width = rng.int(2, Math.max(3, length - 2))
        return makeFill({
          prompt: `一个长方形长 ${length} 厘米，宽 ${width} 厘米，周长是多少厘米？`,
          answer: (length + width) * 2,
          unit: '厘米',
          explanation: `周长 = (长 + 宽) × 2 = (${length} + ${width}) × 2 = ${(length + width) * 2} 厘米。`,
          smartTip: '配对相加',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const side = rng.int(3, [9, 12, 15, 20, 25][level - 1])
        return makeFill({
          prompt: `一个正方形边长 ${side} 厘米，周长是多少厘米？`,
          answer: side * 4,
          unit: '厘米',
          explanation: `周长 = 边长 × 4 = ${side} × 4 = ${side * 4} 厘米。`,
          smartTip: '配对相加',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const side = rng.int(3, 20)
        return makeFill({
          prompt: `一个正方形的周长是 ${side * 4} 厘米，它的边长是多少厘米？`,
          answer: side,
          unit: '厘米',
          explanation: `边长 = 周长 ÷ 4 = ${side * 4} ÷ 4 = ${side} 厘米。`,
          smartTip: '逆推边长',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const length = rng.int(6, 20)
        const width = rng.int(2, Math.max(3, length - 1))
        const p = (length + width) * 2
        return makeFill({
          prompt: `一个长方形周长 ${p} 厘米，长 ${length} 厘米，宽是多少厘米？`,
          answer: width,
          unit: '厘米',
          explanation: `长 + 宽 = 周长 ÷ 2 = ${p / 2}，所以宽 = ${p / 2} − ${length} = ${width} 厘米。`,
          smartTip: '逆推边长',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const length = rng.int(10, 40)
        const width = rng.int(5, Math.max(6, length - 3))
        return makeChoice({
          prompt: `给一个长 ${length} 米、宽 ${width} 米的花园围一圈栅栏，需要多长的栅栏？`,
          answer: `${(length + width) * 2} 米`,
          wrong: [
            `${length * width} 米`,
            `${length + width} 米`,
            `${(length + width) * 2 + 10} 米`,
          ],
          explanation: `围一圈就是求周长：(长 + 宽) × 2 = (${length} + ${width}) × 2 = ${(length + width) * 2} 米。`,
          smartTip: '配对相加',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const side = rng.int(4, 12)
        return makeFill({
          prompt: `用 4 个边长 ${side} 厘米的小正方形拼成一个大正方形，大正方形的周长是多少厘米？`,
          answer: side * 2 * 4,
          unit: '厘米',
          explanation: `4 个小正方形拼成大正方形，边长变成 ${side * 2} 厘米，周长 = ${side * 2} × 4 = ${side * 8} 厘米。`,
          smartTip: '绳子围一圈',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   6. 年、月、日
   ══════════════════════════════════════════════ */

const calendar: Topic = {
  id: 'g3-calendar',
  grade: 3,
  name: '年、月、日',
  color: 'teal',
  icon: 'Calendar',
  summary: '认识年、月、日的大小月与平闰年，掌握 24 时计时法。',
  explanation: [
    {
      title: '大月和小月',
      body: '一年有 12 个月。大月 31 天：1、3、5、7、8、10、12 月；小月 30 天：4、6、9、11 月；2 月平年 28 天，闰年 29 天。',
      example: '拳头记忆法：凸起的是大月，凹下的是小月',
    },
    {
      title: '平年和闰年',
      body: '公历年份是 4 的倍数一般是闰年；整百年必须是 400 的倍数才是闰年。平年 365 天，闰年 366 天。',
      example: '2024 ÷ 4 = 506，能整除，所以 2024 年是闰年',
    },
    {
      title: '24 时计时法',
      body: '从 0 时到 24 时，下午的时间要加上 12。24 时计时法不用写「上午/下午」，更不容易搞混。',
      example: '下午 3 时 = 15 时，晚上 8 时 = 20 时',
    },
  ],
  smartMethods: [
    {
      name: '拳头记忆法',
      when: '记不住哪个月是大月时',
      steps: ['握紧拳头，从食指关节开始数', '凸起的地方是大月（31 天）', '凹下的地方是小月（2 月除外）'],
      example: '一月大、二月平、三月大、四月小 ……',
    },
    {
      name: '闰年除法判定',
      when: '判断某年是不是闰年时',
      steps: ['普通年份除以 4', '能整除就是闰年', '整百年要除以 400'],
      example: '2024 ÷ 4 = 506 → 闰年；1900 ÷ 400 不整除 → 平年',
    },
    {
      name: '下午加 12',
      when: '普通计时法转 24 时计时法时',
      steps: ['上午时间不变（去掉「上午」）', '下午和晚上的时间加 12', '去掉「下午/晚上」字样'],
      example: '下午 4 时 → 4 + 12 = 16 时',
    },
  ],
  levels: buildLevels(3, [
    '认识大月和小月',
    '一年有多少天',
    '判断平年和闰年',
    '24 时计时法',
    '日期与时间综合',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []
    const BIG_MONTHS = [1, 3, 5, 7, 8, 10, 12]

    makers.push(() => {
      const month = rng.int(1, 12)
      const isBig = BIG_MONTHS.includes(month)
      return makeFill({
        prompt: `${month} 月有多少天？`,
        answer: isBig ? 31 : month === 2 ? 28 : 30,
        unit: '天',
        explanation: month === 2
          ? '2 月比较特殊：平年 28 天，闰年 29 天，这里按平年算 28 天。'
          : `${BIG_MONTHS.join('、')} 月是大月，每月 31 天；4、6、9、11 月是小月，每月 30 天。${month} 月是${isBig ? '大' : '小'}月。`,
        smartTip: '拳头记忆法',
      })
    })

    makers.push(() => {
      const cases: Array<[string, number, string]> = [
        ['一年有多少个月？', 12, '个'],
        ['一个星期有多少天？', 7, '天'],
        ['一年有几个大月（31 天）？', 7, '个'],
        ['一年有几个小月（30 天）？', 4, '个'],
      ]
      const [prompt, answer, unit] = rng.pick(cases)
      return makeFill({
        prompt,
        answer,
        unit,
        explanation: `正确答案是 ${answer} ${unit}。大月有 1、3、5、7、8、10、12 月共 7 个，小月有 4、6、9、11 月共 4 个。`,
        smartTip: '拳头记忆法',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const cases: Array<[string, number, string]> = [
          ['平年一年有多少天？', 365, '天'],
          ['闰年一年有多少天？', 366, '天'],
          ['平年的 2 月有多少天？', 28, '天'],
        ]
        const [prompt, answer, unit] = rng.pick(cases)
        return makeFill({
          prompt,
          answer,
          unit,
          explanation: `正确答案是 ${answer} ${unit}。`,
          smartTip: '拳头记忆法',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const base = rng.pick([1996, 2000, 2004, 2008, 2012, 2016, 2020, 2024])
        const year = rng.bool() ? base : base + rng.pick([1, 2, 3])
        const isLeap = year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0)
        return makeJudge({
          prompt: `判断：${year} 年是闰年。—— 对吗？`,
          correct: isLeap,
          explanation: isLeap
            ? `${year} ÷ 4 = ${year / 4}，能整除，所以是闰年，全年 366 天。`
            : `${year} 不能被 4 整除，所以是平年，全年 365 天。`,
          smartTip: '闰年除法判定',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const year = rng.pick([2020, 2024, 2028])
        return makeFill({
          prompt: `${year} 年（闰年）的 2 月有多少天？`,
          answer: 29,
          unit: '天',
          explanation: `${year} 是闰年，2 月有 29 天。`,
          smartTip: '闰年除法判定',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const hour = rng.int(1, 11)
        return makeFill({
          prompt: `下午 ${hour} 时，用 24 时计时法表示是多少时？`,
          answer: hour + 12,
          unit: '时',
          explanation: `下午的时间加 12：${hour} + 12 = ${hour + 12} 时。`,
          smartTip: '下午加 12',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const h24 = rng.int(13, 23)
        return makeFill({
          prompt: `${h24} 时是下午（晚上）几时？`,
          answer: h24 - 12,
          unit: '时',
          explanation: `24 时计时法转回普通计时法要减 12：${h24} − 12 = ${h24 - 12} 时。`,
          smartTip: '下午加 12',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const start = rng.int(1, 11)
        const hours = rng.int(2, 10)
        const end24 = start + 12 + hours
        return makeFill({
          prompt: `一列火车下午 ${start} 时出发，行驶 ${hours} 小时，到达时间是 24 时计时法的几时？`,
          answer: end24,
          unit: '时',
          explanation: `下午 ${start} 时 = ${start + 12} 时，${start + 12} + ${hours} = ${end24} 时。`,
          smartTip: '下午加 12',
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
