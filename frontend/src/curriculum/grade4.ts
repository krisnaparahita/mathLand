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

/* ══════════════════════════════════════════════
   1. 大数的认识
   ══════════════════════════════════════════════ */

const bigNumber: Topic = {
  id: 'g4-bignum',
  grade: 4,
  name: '大数的认识',
  color: 'indigo',
  icon: 'Hash',
  summary: '认识万以上的数，会读会写，掌握改写与四舍五入求近似数。',
  explanation: [
    {
      title: '数位顺序表',
      body: '每相邻两个计数单位之间的进率都是 10。数位从右往左依次是个位、十位、百位、千位、万位、十万位、百万位、千万位、亿位……',
      example: '12345678 → 1 个千万、2 个百万、3 个十万、4 个万、5 个千、6 个百、7 个十、8 个一',
    },
    {
      title: '数的读法',
      body: '读数时从高位读起，一级一级地读。每级末尾的 0 都不读，其他数位连续几个 0 都只读一个零。',
      example: '40080030 读作「四千零八万零三十」',
    },
    {
      title: '改写与近似数',
      body: '改写整万（整亿）的数时，去掉末尾的 4 个（8 个）0，加上「万」（「亿」）字。求近似数用四舍五入法：看要省略的尾数最高位，小于 5 就舍去，大于等于 5 就进 1。',
      example: '384400 ≈ 38 万（千位是 4，舍去）',
    },
  ],
  smartMethods: [
    {
      name: '四位分级法',
      when: '读、写大数时',
      steps: ['从右往左每四位分一级', '先读万级再读个级', '每级末尾的 0 不读'],
      example: '38|4400 → 三十八万四千四百',
    },
    {
      name: '四舍五入看一位',
      when: '求近似数时',
      steps: ['确定要省略到哪一位', '看它的下一位数字', '小于 5 舍去，大于等于 5 进 1'],
      example: '384400 省略万位后面的尾数：看千位 4，舍去 → 38 万',
    },
    {
      name: '去零加万字',
      when: '整万数改写成用「万」作单位时',
      steps: ['数一数末尾有几个 0', '去掉 4 个 0', '在后面写上「万」字'],
      example: '560000 → 56 万',
    },
  ],
  levels: buildLevels(4, [
    '认识数位与计数单位',
    '大数的读法与写法',
    '整万数的改写',
    '四舍五入求近似数',
    '大数综合应用',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const base = level >= 3 ? 10000 : 1000
      const unitName = level >= 3 ? '万' : '千'
      const answerName = level >= 3 ? '十万' : '万'
      return makeFill({
        prompt: `10 个一${unitName}是多少？请填数字。`,
        answer: base * 10,
        explanation: `相邻计数单位之间的进率是 10，10 × ${base} = ${base * 10}，也就是十${unitName === '万' ? '万' : '个千'}是 ${answerName}。`,
        smartTip: '四位分级法',
      })
    })

    makers.push(() => {
      const wan = rng.int(1, [9, 99, 999, 9999, 9999][level - 1])
      return makeFill({
        prompt: `${wan} 万 = （  ）？请填完整数字。`,
        answer: wan * 10000,
        explanation: `1 万 = 10000，${wan} × 10000 = ${wan * 10000}。`,
        smartTip: '去零加万字',
      })
    })

    makers.push(() => {
      const value = rng.int(1, [9, 99, 999, 9999, 9999][level - 1]) * 10000
      return makeFill({
        prompt: `${value} 改写成用「万」作单位的数是多少万？`,
        answer: value / 10000,
        unit: '万',
        explanation: `去掉末尾 4 个 0 加上「万」字：${value} = ${value / 10000} 万。`,
        smartTip: '去零加万字',
      })
    })

    makers.push(() => {
      const wan = rng.int(1, [9, 99, 999, 9999, 9999][level - 1])
      const rest = rng.int(1, 9999)
      return makeFill({
        prompt: `一个数由 ${wan} 个万和 ${rest} 个一组成，这个数是多少？`,
        answer: wan * 10000 + rest,
        explanation: `${wan} 个万是 ${wan * 10000}，加上 ${rest} 个一，合起来是 ${wan * 10000 + rest}。`,
        smartTip: '四位分级法',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const value = rng.int(1, 9999) * 10000 + rng.int(0, 9999)
        return makeFill({
          prompt: `${value} 改写成用「万」作单位的数是多少万？`,
          answer: value / 10000,
          unit: '万',
          explanation: `把小数点向左移动 4 位：${value} → ${value / 10000} 万。`,
          smartTip: '去零加万字',
        })
      })
    }

    if (level >= 2) {
      makers.push(() => {
        const wan = rng.int(12, 98)
        const rest = rng.int(1, 9999)
        const value = wan * 10000 + rest
        const thousandDigit = Math.floor(rest / 1000)
        const rounded = thousandDigit >= 5 ? wan + 1 : wan
        return makeFill({
          prompt: `${value} 省略「万」后面的尾数，约是多少万？`,
          answer: rounded,
          unit: '万',
          explanation: `看千位数字 ${thousandDigit}，${thousandDigit >= 5 ? '满 5 进 1' : '小于 5 舍去'}，所以约是 ${rounded} 万。`,
          smartTip: '四舍五入看一位',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const value = rng.int(100, 999) * 10000
        return makeFill({
          prompt: `${value} 改写成用「万」作单位的数是多少万？`,
          answer: value / 10000,
          unit: '万',
          explanation: `去掉末尾 4 个 0，加上「万」字：${value} = ${value / 10000} 万。`,
          smartTip: '去零加万字',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const digit = rng.int(0, 9)
        const base = rng.int(10, 99) * 10000
        const value = base + digit * 1000 + rng.int(0, 999)
        const rounded = digit >= 5 ? base / 10000 + 1 : base / 10000
        return makeChoice({
          prompt: `${value} ≈ （  ）万`,
          answer: `${rounded} 万`,
          wrong: [`${rounded + 1} 万`, `${base / 10000} 万`, `${rounded - 1} 万`],
          explanation: `千位是 ${digit}，${digit >= 5 ? '大于等于 5 要进 1' : '小于 5 直接舍去'}，所以约是 ${rounded} 万。`,
          smartTip: '四舍五入看一位',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const cases: Array<[string, string, string[]]> = [
          ['一个数的最高位是百万位，这个数是几位数？', '七位数', ['六位数', '八位数', '五位数']],
          ['10 个十万是多少？', '一百万', ['十万', '一千万', '一亿']],
          ['一亿里面有多少个万？', '10000 个', ['1000 个', '100 个', '100000 个']],
          ['比最大的八位数多 1 的数是？', '100000000', ['99999999', '10000001', '9999999']],
        ]
        const [prompt, answer, wrong] = rng.pick(cases)
        return makeChoice({
          prompt,
          answer,
          wrong,
          explanation: `正确答案是${answer}。记住数位顺序：个、十、百、千、万、十万、百万、千万、亿。`,
          smartTip: '四位分级法',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   2. 三位数乘两位数
   ══════════════════════════════════════════════ */

const multiDigit: Topic = {
  id: 'g4-multidigit',
  grade: 4,
  name: '多位数乘法',
  color: 'orange',
  icon: 'X',
  summary: '掌握三位数乘两位数的笔算，理解积的变化规律与估算。',
  explanation: [
    {
      title: '笔算乘法',
      body: '先用两位数个位上的数去乘三位数，再用两位数十位上的数去乘三位数（得数末位要和十位对齐），最后把两次的积相加。',
      example: '145 × 12 = 145 × 2 + 145 × 10 = 290 + 1450 = 1740',
    },
    {
      title: '积的变化规律',
      body: '一个乘数不变，另一个乘数乘（除以）几，积也乘（除以）几。',
      example: '6 × 20 = 120，那么 6 × 40 = 240',
    },
    {
      title: '乘法估算',
      body: '估算时把两个乘数分别看成接近的整十、整百数，再相乘。估算结果用「≈」连接。',
      example: '298 × 31 ≈ 300 × 30 = 9000',
    },
  ],
  smartMethods: [
    {
      name: '分步相乘再相加',
      when: '笔算三位数乘两位数时',
      steps: ['用个位去乘，得到第一个积', '用十位去乘，末位对齐十位', '把两个积相加'],
      example: '145 × 12 → 290 + 1450 = 1740',
    },
    {
      name: '积的变化规律',
      when: '已知一个乘积求另一个时',
      steps: ['找出乘数扩大（缩小）了几倍', '把积也扩大（缩小）相同的倍数', '不需要重新算一遍'],
      example: '已知 25 × 4 = 100，那么 25 × 12 = 300',
    },
    {
      name: '四舍五入估整',
      when: '只需要大致结果时',
      steps: ['把两个乘数都看成整十或整百数', '用近似数相乘', '结果写约等号'],
      example: '412 × 19 ≈ 400 × 20 = 8000',
    },
  ],
  levels: buildLevels(4, [
    '两位数乘整十、整百数',
    '三位数乘两位数笔算',
    '积的变化规律',
    '乘法估算',
    '乘法综合应用',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const a = rng.int(11, 99)
      const b = rng.pick([10, 20, 30, 40, 50, 100, 200, 300])
      return makeFill({
        prompt: `${a} × ${b} = ？`,
        answer: a * b,
        explanation: `先算 ${a} × ${b / 10} = ${a * (b / 10)}，再在末尾添 1 个 0（或添相应个数的 0），得 ${a * b}。`,
        smartTip: '分步相乘再相加',
      })
    })

    makers.push(() => {
      const a = rng.int(101, [399, 599, 799, 999, 999][level - 1])
      const b = rng.int(11, [29, 49, 69, 89, 99][level - 1])
      return makeFill({
        prompt: `${a} × ${b} = ？`,
        answer: a * b,
        explanation: `拆开算：${a} × ${b % 10} = ${a * (b % 10)}，${a} × ${Math.floor(b / 10) * 10} = ${a * Math.floor(b / 10) * 10}，相加得 ${a * b}。`,
        smartTip: '分步相乘再相加',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const a = rng.int(11, 99)
        const b = rng.int(11, 99)
        const product = a * b
        return makeChoice({
          prompt: `${a} × ${b} = ？`,
          answer: String(product),
          wrong: [String(product + a), String(product - a), String(product + 10)],
          explanation: `${a} × ${b} = ${product}。可以拆成 ${a} × ${b % 10} + ${a} × ${Math.floor(b / 10) * 10} = ${a * (b % 10)} + ${a * Math.floor(b / 10) * 10} = ${product}。`,
          smartTip: '分步相乘再相加',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const a = rng.int(12, 60)
        const b = rng.int(3, 9)
        const factor = rng.pick([2, 3, 4, 5])
        return makeFill({
          prompt: `已知 ${a} × ${b} = ${a * b}，那么 ${a} × ${b * factor} = ？`,
          answer: a * b * factor,
          explanation: `一个乘数 ${a} 不变，另一个乘数扩大 ${factor} 倍，积也扩大 ${factor} 倍：${a * b} × ${factor} = ${a * b * factor}。`,
          smartTip: '积的变化规律',
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
          prompt: `${a} × ${b} 估算的结果大约是？`,
          answer: String(approxA * approxB),
          wrong: [
            String(Math.round(approxA / 100) * 100 * b),
            String(a * approxB),
            String((approxA + 100) * approxB),
          ],
          explanation: `把 ${a} 看成 ${approxA}，${b} 看成 ${approxB}，${approxA} × ${approxB} = ${approxA * approxB}。`,
          smartTip: '四舍五入估整',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const price = rng.int(101, 499)
        const count = rng.int(11, 49)
        return makeFill({
          prompt: `一台电风扇 ${price} 元，学校买了 ${count} 台，一共花了多少元？`,
          answer: price * count,
          unit: '元',
          explanation: `单价 × 数量 = 总价：${price} × ${count} = ${price * count} 元。`,
          smartTip: '分步相乘再相加',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const speed = rng.int(60, 95)
        const hours = rng.int(11, 29)
        return makeJudge({
          prompt: `判断：一辆汽车每小时行 ${speed} 千米，${hours} 小时可以行 ${speed * hours + speed} 千米。—— 对吗？`,
          correct: false,
          explanation: `路程 = 速度 × 时间 = ${speed} × ${hours} = ${speed * hours} 千米，不是 ${speed * hours + speed} 千米。`,
          smartTip: '积的变化规律',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   3. 除数是两位数的除法
   ══════════════════════════════════════════════ */

const division2: Topic = {
  id: 'g4-division2',
  grade: 4,
  name: '两位数除法',
  color: 'green',
  icon: 'Divide',
  summary: '掌握两位数除法的试商方法，理解商不变规律与有余数除法。',
  explanation: [
    {
      title: '从高位除起',
      body: '除数是两位数时，先看被除数的前两位；前两位不够除就看前三位。除到哪一位，商就写在哪一位上面。',
      example: '576 ÷ 18：前两位 57 够除，商的最高位在十位',
    },
    {
      title: '试商方法',
      body: '把除数看成接近的整十数来试商。「四舍」法把除数看小，商容易偏大要调小；「五入」法把除数看大，商容易偏小要调大。',
      example: '576 ÷ 18：把 18 看成 20 试商，商 2 余 21 说明偏小，调成 3',
    },
    {
      title: '商不变规律',
      body: '被除数和除数同时乘或除以相同的数（0 除外），商不变，但余数会跟着变。',
      example: '80 ÷ 20 = 8 ÷ 2 = 4',
    },
  ],
  smartMethods: [
    {
      name: '四舍五入试商',
      when: '除数是两位数不好直接商时',
      steps: ['把除数看成接近的整十数', '用整十数估一个商', '算一算，商大了就调小，商小了就调大'],
      example: '把 18 看成 20，把 43 看成 40',
    },
    {
      name: '同缩同扩',
      when: '被除数和除数末尾都有 0 时',
      steps: ['被除数和除数同时去掉相同个数的 0', '商不变', '如果有余数，余数要添回相同个数的 0'],
      example: '800 ÷ 20 = 80 ÷ 2 = 40',
    },
    {
      name: '商 × 除数 + 余数验算',
      when: '算完有余数除法时',
      steps: ['用商乘除数', '再加上余数', '看是否等于被除数'],
      example: '商 12 余 5，除数 20 → 12 × 20 + 5 = 245',
    },
  ],
  levels: buildLevels(4, [
    '整十数除两位数、三位数',
    '两位数除法（首位够除）',
    '两位数除法（调商）',
    '商不变规律',
    '除法综合应用',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const divisor = rng.pick([10, 20, 30, 40, 50, 60, 70, 80, 90])
      const quotient = rng.int(2, [9, 9, 12, 15, 20][level - 1])
      const dividend = divisor * quotient
      return makeFill({
        prompt: `${dividend} ÷ ${divisor} = ？`,
        answer: quotient,
        explanation: `想乘算除：${divisor} × ${quotient} = ${dividend}，所以商是 ${quotient}。`,
        smartTip: '同缩同扩',
      })
    })

    makers.push(() => {
      const divisor = rng.int(11, [29, 49, 69, 89, 99][level - 1])
      const quotient = rng.int(2, [9, 12, 15, 20, 25][level - 1])
      const dividend = divisor * quotient
      return makeFill({
        prompt: `${dividend} ÷ ${divisor} = ？`,
        answer: quotient,
        explanation: `试商：把 ${divisor} 看成 ${Math.round(divisor / 10) * 10}，${divisor} × ${quotient} = ${dividend}，商是 ${quotient}。`,
        smartTip: '四舍五入试商',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const divisor = rng.int(11, 49)
        const quotient = rng.int(3, 20)
        const remainder = rng.int(1, divisor - 1)
        const dividend = divisor * quotient + remainder
        return makeFill({
          prompt: `${dividend} ÷ ${divisor} 的商是多少？（只填商）`,
          answer: quotient,
          explanation: `${divisor} × ${quotient} = ${divisor * quotient}，${dividend} − ${divisor * quotient} = ${remainder}（余数 ${remainder} < ${divisor}），所以商是 ${quotient}。`,
          smartTip: '商 × 除数 + 余数验算',
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
          prompt: `${dividend} ÷ ${divisor} 的余数是多少？`,
          answer: remainder,
          explanation: `${divisor} × ${quotient} = ${divisor * quotient}，${dividend} − ${divisor * quotient} = ${remainder}，余数是 ${remainder}。`,
          smartTip: '商 × 除数 + 余数验算',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const divisor = rng.int(12, 45)
        const quotient = rng.int(4, 18)
        const dividend = divisor * quotient
        return makeChoice({
          prompt: `${dividend} ÷ ${divisor} = ？`,
          answer: String(quotient),
          wrong: [String(quotient + 1), String(quotient - 1), String(quotient + 2)],
          explanation: `试商后验算：${divisor} × ${quotient} = ${dividend}，正好除尽，商是 ${quotient}。`,
          smartTip: '四舍五入试商',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const a = rng.int(3, 9)
        const b = rng.int(2, 9)
        const factor = rng.pick([10, 100])
        return makeFill({
          prompt: `已知 ${a * b} ÷ ${b} = ${a}，那么 ${a * b * factor} ÷ ${b * factor} = ？`,
          answer: a,
          explanation: `被除数和除数同时乘 ${factor}，商不变，还是 ${a}。`,
          smartTip: '同缩同扩',
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
          prompt: `有 ${total} 个鸡蛋，每 ${perBox} 个装一箱，可以装满多少箱？`,
          answer: boxes,
          unit: '箱',
          explanation: `${total} ÷ ${perBox} = ${boxes} …… ${remainder}，剩下的 ${remainder} 个不够装一箱，所以能装满 ${boxes} 箱。`,
          smartTip: '商 × 除数 + 余数验算',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const speed = rng.int(45, 85)
        const distance = speed * rng.int(3, 9)
        return makeFill({
          prompt: `两地相距 ${distance} 千米，汽车每小时行 ${speed} 千米，需要几小时到达？`,
          answer: distance / speed,
          unit: '小时',
          explanation: `时间 = 路程 ÷ 速度 = ${distance} ÷ ${speed} = ${distance / speed} 小时。`,
          smartTip: '同缩同扩',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   4. 分数的加减法
   ══════════════════════════════════════════════ */

const fractionOps: Topic = {
  id: 'g4-fraction-ops',
  grade: 4,
  name: '分数加减法',
  color: 'pink',
  icon: 'PieChart',
  summary: '掌握约分、通分与异分母分数加减法，会比较分数大小。',
  explanation: [
    {
      title: '约分与最简分数',
      body: '把一个分数的分子和分母同时除以它们的公因数，分数大小不变，这叫约分。分子和分母只有公因数 1 时，就是最简分数。',
      example: '6/8 = 3/4（分子分母同时除以 2）',
    },
    {
      title: '通分',
      body: '把异分母分数化成和原来相等的同分母分数，叫通分。通常用两个分母的最小公倍数作公分母。',
      example: '1/2 和 1/3 → 3/6 和 2/6',
    },
    {
      title: '异分母分数加减法',
      body: '先通分，化成同分母分数，再按同分母分数加减法计算，最后结果要约成最简分数。',
      example: '1/2 + 1/3 = 3/6 + 2/6 = 5/6',
    },
  ],
  smartMethods: [
    {
      name: '短除法约分',
      when: '需要把分数化到最简时',
      steps: ['找出分子分母的公因数', '同时除以这个公因数', '一直除到只有公因数 1'],
      example: '12/18 → 除以 6 → 2/3',
    },
    {
      name: '最小公倍数通分',
      when: '异分母分数相加减时',
      steps: ['找出两个分母的最小公倍数', '把每个分数化成分母是最小公倍数的分数', '分子相加减，分母不变'],
      example: '2/3 + 1/4 → 8/12 + 3/12 = 11/12',
    },
    {
      name: '交叉相乘比大小',
      when: '比较两个异分母分数时',
      steps: ['把第一个分子乘第二个分母', '把第二个分子乘第一个分母', '比较两个乘积，大的那边分数更大'],
      example: '2/3 和 3/5：2 × 5 = 10，3 × 3 = 9，所以 2/3 > 3/5',
    },
  ],
  levels: buildLevels(4, [
    '约分与最简分数',
    '同分母分数加减',
    '异分母分数加减',
    '比较分数大小',
    '分数综合应用',
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
        prompt: `把 ${n}/${d} 约成最简分数，请写成「分子/分母」形式。`,
        answer: fracStr(n, d),
        explanation: `分子分母同时除以 ${factor}：${n} ÷ ${factor} = ${n / factor}，${d} ÷ ${factor} = ${d / factor}，得到 ${fracStr(n, d)}。`,
        smartTip: '短除法约分',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const d = rng.int(5, 15)
        const a = rng.int(1, d - 2)
        const b = rng.int(1, Math.max(1, d - a - 1))
        return makeFill({
          prompt: `${a}/${d} + ${b}/${d} = ？请写成最简的「分子/分母」形式（整数就直接写整数）。`,
          answer: fracStr(a + b, d),
          explanation: `同分母分数相加，分子相加分母不变：${a} + ${b} = ${a + b}，得 ${a + b}/${d}，约分后是 ${fracStr(a + b, d)}。`,
          smartTip: '最小公倍数通分',
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
          prompt: `${a}/${d1} + ${b}/${d2} = ？请写成最简的「分子/分母」形式。`,
          answer: fracStr(a * (lcm / d1) + b * (lcm / d2), lcm),
          explanation: `先通分成 ${lcm} 作分母：${a}/${d1} = ${a * (lcm / d1)}/${lcm}，${b}/${d2} = ${b * (lcm / d2)}/${lcm}，相加得 ${a * (lcm / d1) + b * (lcm / d2)}/${lcm}，约分后是 ${fracStr(a * (lcm / d1) + b * (lcm / d2), lcm)}。`,
          smartTip: '最小公倍数通分',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const d = rng.int(6, 15)
        const a = rng.int(3, d - 1)
        const b = rng.int(1, a - 1)
        return makeFill({
          prompt: `${a}/${d} − ${b}/${d} = ？请写成最简的「分子/分母」形式。`,
          answer: fracStr(a - b, d),
          explanation: `同分母分数相减，分子相减分母不变：${a} − ${b} = ${a - b}，得 ${a - b}/${d}，约分后是 ${fracStr(a - b, d)}。`,
          smartTip: '最小公倍数通分',
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
          prompt: `${a}/${d1} ○ ${b}/${d2}，○ 里应填什么？`,
          answer: symbol,
          wrong: [symbol === '>' ? '<' : symbol === '<' ? '>' : '>', '=', '≠'],
          explanation: `交叉相乘：${a} × ${d2} = ${left}，${b} × ${d1} = ${right}，${left > right ? `${left} > ${right}` : left < right ? `${left} < ${right}` : '两者相等'}，所以填 ${symbol}。`,
          smartTip: '交叉相乘比大小',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const d = rng.int(4, 12)
        const a = rng.int(1, d - 2)
        const b = rng.int(1, Math.max(1, d - a - 1))
        return makeFill({
          prompt: `一块地，上午耕了 ${a}/${d}，下午耕了 ${b}/${d}，还剩这块地的几分之几没耕？请写成最简的「分子/分母」形式（没有剩余就写 0）。`,
          answer: fracStr(d - a - b, d),
          explanation: `把整块地看成 1 = ${d}/${d}，已耕 ${a + b}/${d}，还剩 ${d}/${d} − ${a + b}/${d} = ${d - a - b}/${d}，约分后是 ${fracStr(d - a - b, d)}。`,
          smartTip: '最小公倍数通分',
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
          prompt: `判断：${a}/${d1} + ${b}/${d2} = ${a + b}/${d1 + d2} —— 对吗？`,
          correct: false,
          explanation: `异分母分数不能直接把分子分母分别相加，要先通分：${a}/${d1} = ${a * (lcm / d1)}/${lcm}，加上 ${b}/${d2} 得 ${fracStr(a * (lcm / d1) + b, lcm)}。`,
          smartTip: '最小公倍数通分',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   5. 小数的意义和加减法
   ══════════════════════════════════════════════ */

const decimal: Topic = {
  id: 'g4-decimal',
  grade: 4,
  name: '小数初步',
  color: 'purple',
  icon: 'Percent',
  summary: '理解小数的意义与性质，会比较小数大小、做小数加减法。',
  explanation: [
    {
      title: '小数的意义',
      body: '分母是 10、100、1000 …… 的分数可以用小数表示。小数点右边第一位是十分位，第二位是百分位，第三位是千分位。',
      example: '3/10 = 0.3，27/100 = 0.27',
    },
    {
      title: '小数的性质',
      body: '在小数的末尾添上 0 或去掉 0，小数的大小不变。利用这个性质可以化简小数。',
      example: '0.50 = 0.5，2.300 = 2.3',
    },
    {
      title: '小数加减法',
      body: '小数加减法要把小数点对齐（也就是相同数位对齐），再按整数加减法计算，最后在得数里点上小数点。',
      example: '3.25 + 1.7 = 3.25 + 1.70 = 4.95',
    },
  ],
  smartMethods: [
    {
      name: '数位对齐法',
      when: '做小数加减法时',
      steps: ['先把小数点对齐', '位数不够就在末尾补 0', '按整数加减法算出结果'],
      example: '3.25 + 1.7 → 3.25 + 1.70 = 4.95',
    },
    {
      name: '去零化简',
      when: '小数末尾有 0 时',
      steps: ['看小数点末尾有没有 0', '把末尾的 0 全部去掉', '小数的大小不变'],
      example: '2.300 = 2.3',
    },
    {
      name: '从左往右比',
      when: '比较小数大小时',
      steps: ['先比较整数部分', '整数部分相同再比十分位', '一位一位往下比'],
      example: '3.25 和 3.3：整数部分相同，十分位 2 < 3，所以 3.25 < 3.3',
    },
  ],
  levels: buildLevels(4, [
    '小数的意义与读写',
    '小数的性质与化简',
    '比较小数大小',
    '小数加减法',
    '小数综合应用',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const n = rng.int(1, 99)
      const denom = rng.pick([10, 100])
      return makeFill({
        prompt: `${n}/${denom} 写成小数是多少？`,
        answer: n / denom,
        explanation: `分母是 ${denom}，写成小数要${denom === 10 ? '一位' : '两位'}小数：${n}/${denom} = ${n / denom}。`,
        smartTip: '去零化简',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const whole = rng.int(1, 9)
        const frac = rng.pick([10, 20, 30, 50, 60, 70, 80, 90, 40])
        return makeFill({
          prompt: `把 ${whole}.${frac} 化简成最简小数是多少？`,
          answer: whole + frac / 100,
          explanation: `去掉小数末尾的 0，大小不变：${whole}.${frac} = ${whole + frac / 100}。`,
          smartTip: '去零化简',
        })
      })
    }

    if (level >= 2) {
      makers.push(() => {
        const whole = rng.int(0, 9)
        const tenths = rng.int(1, 9)
        return makeJudge({
          prompt: `判断：${whole}.${tenths}0 = ${whole}.${tenths} —— 对吗？`,
          correct: true,
          explanation: `小数的末尾添上 0 或去掉 0，小数的大小不变，所以 ${whole}.${tenths}0 = ${whole}.${tenths}。`,
          smartTip: '去零化简',
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
          prompt: `${left} ○ ${right}，○ 里应填什么？`,
          answer: symbol,
          wrong: [symbol === '>' ? '<' : '>', '=', '≠'],
          explanation: `整数部分都是 ${whole}，比十分位：${Math.max(a, b)} > ${Math.min(a, b)}，所以填 ${symbol}。`,
          smartTip: '从左往右比',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const a = Math.round((rng.int(1, 90) + rng.int(0, 99) / 100) * 100) / 100
        const b = Math.round((rng.int(1, 50) + rng.int(0, 99) / 100) * 100) / 100
        const sum = Math.round((a + b) * 100) / 100
        return makeFill({
          prompt: `${a} + ${b} = ？`,
          answer: sum,
          explanation: `小数点对齐后相加：${a} + ${b} = ${sum}。`,
          smartTip: '数位对齐法',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const a = Math.round((rng.int(20, 90) + rng.int(0, 99) / 100) * 100) / 100
        const b = Math.round((rng.int(1, Math.floor(a) - 1) + rng.int(0, 99) / 100) * 100) / 100
        const diff = Math.round((a - b) * 100) / 100
        return makeFill({
          prompt: `${a} − ${b} = ？`,
          answer: diff,
          explanation: `小数点对齐后相减：${a} − ${b} = ${diff}。`,
          smartTip: '数位对齐法',
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
          prompt: `买一支笔 ${priceA} 元和一个本子 ${priceB} 元，付 ${paid} 元，应找回多少元？`,
          answer: Math.round((paid - total) * 10) / 10,
          unit: '元',
          explanation: `先算总价：${priceA} + ${priceB} = ${total} 元，再算找零：${paid} − ${total} = ${Math.round((paid - total) * 10) / 10} 元。`,
          smartTip: '数位对齐法',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   6. 角与线
   ══════════════════════════════════════════════ */

const geometry: Topic = {
  id: 'g4-geometry',
  grade: 4,
  name: '角与线',
  color: 'teal',
  icon: 'Compass',
  summary: '认识线段、射线、直线，会量角和画角，理解平行与垂直。',
  explanation: [
    {
      title: '线段、射线、直线',
      body: '线段有两个端点，可以量出长度；射线只有一个端点，向一端无限延伸；直线没有端点，向两端无限延伸。',
      example: '线段 AB 记作 AB，射线记作射线 AB，直线记作直线 AB',
    },
    {
      title: '角的度量',
      body: '量角要用量角器：把量角器的中心对准角的顶点，0 刻度线对准角的一条边，看另一条边指着的刻度。角的大小与边的长短无关，只与两边张开的大小有关。',
      example: '1 直角 = 90°，1 平角 = 180°，1 周角 = 360°',
    },
    {
      title: '平行与垂直',
      body: '在同一平面内不相交的两条直线互相平行；两条直线相交成直角时，这两条直线互相垂直。',
      example: '黑板的上下两条边互相平行，相邻两条边互相垂直',
    },
  ],
  smartMethods: [
    {
      name: '量角器三步骤',
      when: '量一个角是多少度时',
      steps: ['中心对准顶点', '0 刻度线对准一条边', '读另一条边所指的刻度（注意读内圈还是外圈）'],
      example: '开口向右就读内圈，开口向左就读外圈',
    },
    {
      name: '直角基准法',
      when: '快速判断角的类型时',
      steps: ['想一想直角是 90°', '比直角小的是锐角', '比直角大比平角小的是钝角'],
      example: '120° > 90° → 钝角',
    },
    {
      name: '三角板画垂线',
      when: '要画垂线或检验垂直时',
      steps: ['用三角板的一条直角边贴住已知直线', '沿另一条直角边画线', '标出直角符号'],
      example: '过直线外一点画垂线也是同样的方法',
    },
  ],
  levels: buildLevels(4, [
    '认识线段、射线、直线',
    '角的度量与分类',
    '画角与角的计算',
    '平行与垂直',
    '几何综合应用',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const cases: Array<[string, string, string[]]> = [
        ['手电筒射出的光可以近似看成什么？', '射线', ['线段', '直线', '曲线']],
        ['一根拉紧的绳子可以近似看成什么？', '线段', ['射线', '直线', '折线']],
        ['一条笔直的公路向两端无限延伸，可以看成什么？', '直线', ['线段', '射线', '曲线']],
        ['线段有几个端点？', '2 个', ['1 个', '0 个', '3 个']],
      ]
      const [prompt, answer, wrong] = rng.pick(cases)
      return makeChoice({
        prompt,
        answer,
        wrong,
        explanation: `正确答案是${answer}。线段有 2 个端点可量长度，射线 1 个端点，直线没有端点。`,
        smartTip: '量角器三步骤',
      })
    })

    makers.push(() => {
      const cases: Array<[string, number, string]> = [
        ['一个角有几个顶点？', 1, '个'],
        ['一个角有几条边？', 2, '条'],
      ]
      const [prompt, answer, unit] = rng.pick(cases)
      return makeFill({
        prompt,
        answer,
        unit,
        explanation: `角是从一点引出两条射线所组成的图形，所以有 1 个顶点、2 条边。答案是 ${answer} ${unit}。`,
        smartTip: '量角器三步骤',
      })
    })

    makers.push(() => {
      const angle = rng.pick([30, 45, 60, 75, 100, 120, 135, 150])
      const type = angle < 90 ? '锐角' : angle === 90 ? '直角' : angle < 180 ? '钝角' : '平角'
      return makeChoice({
        prompt: `一个角是 ${angle}°，它是什么角？`,
        answer: type,
        wrong: (['锐角', '直角', '钝角', '平角'] as const).filter((t) => t !== type),
        explanation: `${angle}° ${angle < 90 ? '小于 90°' : angle === 90 ? '等于 90°' : '大于 90° 小于 180°'}，所以是${type}。`,
        smartTip: '直角基准法',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const cases: Array<[string, number, string]> = [
          ['1 个直角是多少度？', 90, '度'],
          ['1 个平角是多少度？', 180, '度'],
          ['1 个周角是多少度？', 360, '度'],
          ['1 个周角等于几个直角？', 4, '个'],
          ['1 个平角等于几个直角？', 2, '个'],
        ]
        const [prompt, answer, unit] = rng.pick(cases)
        return makeFill({
          prompt,
          answer,
          unit,
          explanation: `正确答案是 ${answer} ${unit}。直角 90°、平角 180°、周角 360°。`,
          smartTip: '直角基准法',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const a = rng.pick([30, 45, 60, 90, 120])
        const b = 180 - a
        return makeFill({
          prompt: `一个角是 ${a}°，它与另一个角组成一个平角，另一个角是多少度？`,
          answer: b,
          unit: '度',
          explanation: `平角是 180°，180 − ${a} = ${b}°。`,
          smartTip: '量角器三步骤',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const a = rng.pick([30, 45, 60])
        const b = 90 - a
        return makeFill({
          prompt: `把一个直角分成两个角，其中一个角是 ${a}°，另一个角是多少度？`,
          answer: b,
          unit: '度',
          explanation: `直角是 90°，90 − ${a} = ${b}°。`,
          smartTip: '直角基准法',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const cases: Array<[string, string, string[]]> = [
          ['同一平面内永不相交的两条直线叫什么？', '互相平行', ['互相垂直', '相交', '重合']],
          ['两条直线相交成直角时，这两条直线的关系是？', '互相垂直', ['互相平行', '重合', '无法确定']],
          ['长方形的对边之间是什么关系？', '互相平行', ['互相垂直', '相交但不垂直', '没有关系']],
          ['长方形的相邻两条边之间是什么关系？', '互相垂直', ['互相平行', '无法确定', '没有关系']],
        ]
        const [prompt, answer, wrong] = rng.pick(cases)
        return makeChoice({
          prompt,
          answer,
          wrong,
          explanation: `正确答案是${answer}。平行是永不相交，垂直是相交成 90°。`,
          smartTip: '三角板画垂线',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const parts = rng.int(3, 8)
        const each = 360 / parts
        return makeFill({
          prompt: `一个周角平均分成 ${parts} 份，每份是多少度？`,
          answer: each,
          unit: '度',
          explanation: `周角是 360°，360 ÷ ${parts} = ${each}°。`,
          smartTip: '量角器三步骤',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const cases: Array<[string, number, string]> = [
          ['钟面上 3 时整，时针和分针成多少度的角？', 90, '度'],
          ['钟面上 6 时整，时针和分针成多少度的角？', 180, '度'],
          ['钟面上 12 时整，时针和分针成多少度的角？', 0, '度'],
        ]
        const [prompt, answer, unit] = rng.pick(cases)
        return makeFill({
          prompt,
          answer,
          unit,
          explanation: `钟面一大格是 30°，答案是 ${answer}°。`,
          smartTip: '直角基准法',
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
