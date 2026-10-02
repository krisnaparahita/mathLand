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
   1. 小数乘除法
   ══════════════════════════════════════════════ */

const decimalOps: Topic = {
  id: 'g5-decimal-ops',
  grade: 5,
  name: '小数乘除法',
  color: 'indigo',
  icon: 'Calculator',
  summary: '掌握小数乘除法的计算方法，会用积、商的近似值与循环小数。',
  explanation: [
    {
      title: '小数乘法',
      body: '先按整数乘法算出积，再看两个乘数一共有几位小数，就从积的右边起数出几位点上小数点。位数不够时在前面补 0。',
      example: '0.8 × 3 = 2.4；0.25 × 0.4 = 0.1',
    },
    {
      title: '小数除法',
      body: '除数是小数时，先把除数变成整数（除数的小数点向右移几位，被除数也向右移几位），再按整数除法计算，商的小数点要和被除数对齐。',
      example: '7.5 ÷ 0.5 = 75 ÷ 5 = 15',
    },
    {
      title: '积与商的近似值',
      body: '求近似值时要比需要保留的位数多算一位，再用四舍五入法取近似值。保留两位小数就要算到第三位。',
      example: '0.67 × 3.4 = 2.278 ≈ 2.28（保留两位小数）',
    },
  ],
  smartMethods: [
    {
      name: '数小数点位数',
      when: '做小数乘法时',
      steps: ['先忽略小数点按整数相乘', '数一数两个乘数一共有几位小数', '从积的右边起数出几位点小数点'],
      example: '1.2 × 0.3：12 × 3 = 36，共 2 位小数 → 0.36',
    },
    {
      name: '除数变整数',
      when: '除数是小数时',
      steps: ['把除数的小数点向右移到变成整数', '被除数的小数点也向右移相同的位数', '按整数除法计算'],
      example: '7.5 ÷ 0.5 → 75 ÷ 5 = 15',
    },
    {
      name: '多算一位再四舍五入',
      when: '要求保留几位小数时',
      steps: ['按题目要求多算一位', '看多出的那一位', '满 5 进 1，不满 5 舍去'],
      example: '2.278 保留两位 → 2.28',
    },
  ],
  levels: buildLevels(5, [
    '小数乘整数',
    '小数乘小数',
    '小数除以整数',
    '小数除以小数',
    '积与商的近似值',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const a = Math.round((rng.int(1, 9) + rng.pick([0.1, 0.2, 0.5, 0.25, 0.4])) * 100) / 100
      const b = rng.int(2, [9, 12, 20, 30, 40][level - 1])
      return makeFill({
        prompt: `${a} × ${b} = ？`,
        answer: round2(a * b),
        explanation: `先按整数算，再看 ${a} 有 ${(String(a).split('.')[1] || '').length} 位小数，从积的右边数出相同的位数点上小数点，得 ${round2(a * b)}。`,
        smartTip: '数小数点位数',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const a = rng.pick([0.2, 0.4, 0.5, 0.8, 1.2, 1.5, 2.4, 3.6])
        const b = rng.pick([0.2, 0.5, 0.4, 0.25, 1.5, 2.5, 0.8])
        return makeFill({
          prompt: `${a} × ${b} = ？`,
          answer: round2(a * b),
          explanation: `两个乘数一共有 ${((String(a).split('.')[1] || '').length) + ((String(b).split('.')[1] || '').length)} 位小数，从整数积的右边起数出这么多位点上小数点，得 ${round2(a * b)}。`,
          smartTip: '数小数点位数',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const divisor = rng.int(2, 9)
        const quotient = rng.pick([0.5, 1.5, 2.5, 3.5, 4.5, 1.2, 2.4])
        const dividend = round2(divisor * quotient)
        return makeFill({
          prompt: `${dividend} ÷ ${divisor} = ？`,
          answer: round2(dividend / divisor),
          explanation: `按整数除法的方法算，商的小数点要和被除数的小数点对齐：${dividend} ÷ ${divisor} = ${round2(dividend / divisor)}。`,
          smartTip: '除数变整数',
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
          prompt: `${dividend} ÷ ${divisor} = ？`,
          answer: quotient,
          explanation: `把除数 ${divisor} 的小数点向右移 ${shift} 位变成 ${divisor * 10 ** shift}，被除数也移 ${shift} 位变成 ${round2(dividend * 10 ** shift)}，${round2(dividend * 10 ** shift)} ÷ ${divisor * 10 ** shift} = ${quotient}。`,
          smartTip: '除数变整数',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const a = rng.pick([0.67, 1.23, 2.34, 3.56, 4.78])
        const b = rng.int(2, 9)
        const raw = a * b
        return makeFill({
          prompt: `${a} × ${b} 保留一位小数是多少？`,
          answer: Math.round(raw * 10) / 10,
          explanation: `先算出 ${a} × ${b} = ${round2(raw)}，保留一位小数看第二位，四舍五入得 ${Math.round(raw * 10) / 10}。`,
          smartTip: '多算一位再四舍五入',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const price = rng.pick([1.5, 2.5, 3.6, 4.8, 5.5])
        const count = rng.int(2, 9)
        return makeFill({
          prompt: `每千克苹果 ${price} 元，买 ${count} 千克要付多少元？`,
          answer: round2(price * count),
          unit: '元',
          explanation: `单价 × 数量 = 总价：${price} × ${count} = ${round2(price * count)} 元。`,
          smartTip: '数小数点位数',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   2. 分数乘除法
   ══════════════════════════════════════════════ */

const fractionMulDiv: Topic = {
  id: 'g5-fraction-muldiv',
  grade: 5,
  name: '分数乘除法',
  color: 'orange',
  icon: 'PieChart',
  summary: '掌握分数乘整数、分数乘分数，以及除以一个数等于乘它的倒数。',
  explanation: [
    {
      title: '分数乘整数',
      body: '分数乘整数，用分子和整数相乘的积作分子，分母不变。能约分的先约分更简便。',
      example: '2/7 × 3 = 6/7',
    },
    {
      title: '分数乘分数',
      body: '分数乘分数，用分子相乘的积作分子，分母相乘的积作分母。计算前先约分，算起来更快。',
      example: '2/3 × 3/4 = 6/12 = 1/2',
    },
    {
      title: '分数除法',
      body: '除以一个不等于 0 的数，等于乘这个数的倒数。求一个数的倒数就是把这个数的分子分母调换位置。',
      example: '3/4 ÷ 2/5 = 3/4 × 5/2 = 15/8',
    },
  ],
  smartMethods: [
    {
      name: '先约分再乘',
      when: '做分数乘法时',
      steps: ['先看分子和分母有没有公因数', '交叉约分', '再分子乘分子、分母乘分母'],
      example: '2/3 × 3/4 → 约掉 3 → 2/4 = 1/2',
    },
    {
      name: '除转乘倒数',
      when: '看到分数除法时',
      steps: ['把除号后面的分数倒过来（分子分母互换）', '把除号改成乘号', '按分数乘法计算'],
      example: '3/4 ÷ 2/5 = 3/4 × 5/2 = 15/8',
    },
    {
      name: '整数看作分母 1',
      when: '分数和整数相乘除时',
      steps: ['把整数写成分母是 1 的分数', '再按分数乘除法计算', '整数 n 的倒数是 1/n'],
      example: '6 ÷ 2/3 = 6 × 3/2 = 9',
    },
  ],
  levels: buildLevels(5, [
    '分数乘整数',
    '分数乘分数',
    '分数除以整数',
    '一个数除以分数',
    '分数乘除混合应用',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const d = rng.int(2, 9)
      const n = rng.int(1, d - 1)
      const k = rng.int(2, [5, 6, 8, 9, 12][level - 1])
      return makeFill({
        prompt: `${n}/${d} × ${k} = ？请写成最简的「分子/分母」形式（整数就直接写整数）。`,
        answer: fracStr(n * k, d),
        explanation: `分子 ${n} 与整数 ${k} 相乘得 ${n * k}，分母 ${d} 不变，得到 ${n * k}/${d}，约分后是 ${fracStr(n * k, d)}。`,
        smartTip: '先约分再乘',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const d1 = rng.int(2, 6)
        const d2 = rng.int(2, 6)
        const n1 = rng.int(1, d1 - 1)
        const n2 = rng.int(1, d2 - 1)
        return makeFill({
          prompt: `${n1}/${d1} × ${n2}/${d2} = ？请写成最简的「分子/分母」形式。`,
          answer: fracStr(n1 * n2, d1 * d2),
          explanation: `分子相乘：${n1} × ${n2} = ${n1 * n2}；分母相乘：${d1} × ${d2} = ${d1 * d2}，得 ${n1 * n2}/${d1 * d2}，约分后是 ${fracStr(n1 * n2, d1 * d2)}。`,
          smartTip: '先约分再乘',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const k = rng.int(2, [4, 6, 8, 9, 12][level - 1])
        const d = rng.int(2, 9)
        const n = rng.int(1, d - 1)
        return makeFill({
          prompt: `${n}/${d} ÷ ${k} = ？请写成最简的「分子/分母」形式。`,
          answer: fracStr(n, d * k),
          explanation: `除以 ${k} 等于乘 1/${k}：${n}/${d} × 1/${k} = ${n}/${d * k}，约分后是 ${fracStr(n, d * k)}。`,
          smartTip: '除转乘倒数',
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
          prompt: `${n1}/${d1} ÷ ${n2}/${d2} = ？请写成最简的「分子/分母」形式。`,
          answer: fracStr(n1 * d2, d1 * n2),
          explanation: `除以 ${n2}/${d2} 等于乘 ${d2}/${n2}：${n1}/${d1} × ${d2}/${n2} = ${n1 * d2}/${d1 * n2}，约分后是 ${fracStr(n1 * d2, d1 * n2)}。`,
          smartTip: '除转乘倒数',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const k = rng.int(2, 9)
        const d = rng.int(2, 6)
        const n = rng.int(1, d - 1)
        return makeFill({
          prompt: `${k} ÷ ${n}/${d} = ？请写成最简的「分子/分母」形式（整数就直接写整数）。`,
          answer: fracStr(k * d, n),
          explanation: `${k} 除以 ${n}/${d} 等于 ${k} × ${d}/${n} = ${k * d}/${n}，约分后是 ${fracStr(k * d, n)}。`,
          smartTip: '整数看作分母 1',
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
          prompt: `一根绳子长 ${total} 米，用去了它的 ${n}/${d}，用去了多少米？`,
          answer: round2(part),
          unit: '米',
          explanation: `求一个数的几分之几用乘法：${total} × ${n}/${d} = ${round2(part)} 米。`,
          smartTip: '先约分再乘',
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
          prompt: `一堆煤用去了 ${part} 吨，正好是原来重量的 ${n}/${d}，原来有多少吨？`,
          answer: round2(total),
          unit: '吨',
          explanation: `已知一个数的 ${n}/${d} 是 ${part}，求这个数用除法：${part} ÷ ${n}/${d} = ${part} × ${d}/${n} = ${round2(total)} 吨。`,
          smartTip: '除转乘倒数',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   3. 因数与倍数
   ══════════════════════════════════════════════ */

const factors: Topic = {
  id: 'g5-factors',
  grade: 5,
  name: '因数与倍数',
  color: 'green',
  icon: 'Grid3x3',
  summary: '掌握 2、3、5 的倍数特征，会求最大公因数与最小公倍数，认识质数与合数。',
  explanation: [
    {
      title: '倍数与因数',
      body: '如果 a × b = c（a、b、c 都是非零自然数），那么 a 和 b 是 c 的因数，c 是 a 和 b 的倍数。一个数的因数个数有限，倍数个数无限。',
      example: '3 × 4 = 12，3 和 4 是 12 的因数，12 是 3 和 4 的倍数',
    },
    {
      title: '2、3、5 的倍数特征',
      body: '个位上是 0、2、4、6、8 的数是 2 的倍数；个位上是 0 或 5 的数是 5 的倍数；各位上数字之和是 3 的倍数，这个数就是 3 的倍数。',
      example: '123：1 + 2 + 3 = 6，6 是 3 的倍数，所以 123 是 3 的倍数',
    },
    {
      title: '质数与合数',
      body: '只有 1 和它本身两个因数的数叫质数（素数）；除了 1 和它本身还有别的因数的数叫合数。1 既不是质数也不是合数。',
      example: '2、3、5、7、11 是质数；4、6、8、9 是合数',
    },
  ],
  smartMethods: [
    {
      name: '看个位判 2、5',
      when: '判断一个数是不是 2 或 5 的倍数',
      steps: ['只看个位数字', '个位是 0、2、4、6、8 → 2 的倍数', '个位是 0 或 5 → 5 的倍数'],
      example: '340 的个位是 0 → 既是 2 的倍数也是 5 的倍数',
    },
    {
      name: '数字求和判 3',
      when: '判断一个数是不是 3 的倍数',
      steps: ['把各位上的数字相加', '看和是不是 3 的倍数', '是则原数也是 3 的倍数'],
      example: '123：1 + 2 + 3 = 6 → 是 3 的倍数',
    },
    {
      name: '短除法求公因数公倍数',
      when: '求最大公因数或最小公倍数时',
      steps: ['用两个数的公因数连续去除', '除到两个数互质为止', '左侧除数相乘是最大公因数，左侧与下边全部相乘是最小公倍数'],
      example: '12 和 18：最大公因数 6，最小公倍数 36',
    },
  ],
  levels: buildLevels(5, [
    '认识因数与倍数',
    '2、5、3 的倍数特征',
    '质数与合数',
    '最大公因数与最小公倍数',
    '因数倍数综合应用',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const a = rng.int(2, 9)
      const b = rng.int(2, 9)
      const product = a * b
      return makeFill({
        prompt: `${a} × ${b} = ${product}，那么 ${product} ÷ ${a} 等于多少？`,
        answer: b,
        explanation: `由 ${a} × ${b} = ${product} 可知，${a} 和 ${b} 都是 ${product} 的因数，反过来 ${product} ÷ ${a} = ${b}。`,
        smartTip: '看个位判 2、5',
      })
    })

    makers.push(() => {
      const n = rng.int(10, 99)
      const isEven = n % 2 === 0
      return makeJudge({
        prompt: `判断：${n} 是 2 的倍数。—— 对吗？`,
        correct: isEven,
        explanation: `${n} 的个位是 ${n % 10}，${isEven ? '是偶数，所以是 2 的倍数' : '不是 0、2、4、6、8，所以不是 2 的倍数'}。`,
        smartTip: '看个位判 2、5',
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
          prompt: `判断：${n} 是 3 的倍数。—— 对吗？`,
          correct: isMultiple3,
          explanation: `各位数字之和：${String(n).split('').join(' + ')} = ${digitSum}，${digitSum} ${isMultiple3 ? '是' : '不是'} 3 的倍数，所以 ${n} ${isMultiple3 ? '是' : '不是'} 3 的倍数。`,
          smartTip: '数字求和判 3',
        })
      })
    }

    if (level >= 2) {
      makers.push(() => {
        const n = rng.int(11, 200)
        return makeFill({
          prompt: `${n} 的最小倍数是几？`,
          answer: n,
          explanation: `一个数的最小倍数是它本身，最大的倍数不存在。`,
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
          prompt: `${n} 是质数还是合数？`,
          answer: isPrime ? '质数' : '合数',
          wrong: [isPrime ? '合数' : '质数', '既不是质数也不是合数', '无法确定'],
          explanation: isPrime
            ? `${n} 只有 1 和 ${n} 两个因数，所以是质数。`
            : `${n} 除了 1 和它本身还有别的因数，所以是合数。`,
          smartTip: '数字求和判 3',
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
          prompt: `${a} 和 ${b} 的最大公因数是多少？`,
          answer: g,
          explanation: `${a} 和 ${b} 的公因数中最大的是 ${g}（最小公倍数是 ${l}）。`,
          smartTip: '短除法求公因数公倍数',
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
          prompt: `${a} 和 ${b} 的最小公倍数是多少？`,
          answer: l,
          explanation: `最小公倍数 = 两数之积 ÷ 最大公因数 = ${a} × ${b} ÷ ${g} = ${l}。`,
          smartTip: '短除法求公因数公倍数',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const a = rng.int(2, 9)
        const b = rng.int(2, 9)
        const l = (a * b) / gcd(a, b)
        return makeFill({
          prompt: `甲每 ${a} 天去一次图书馆，乙每 ${b} 天去一次，今天两人同时去了，至少再过多少天两人又同时去？`,
          answer: l,
          unit: '天',
          explanation: `这就是求 ${a} 和 ${b} 的最小公倍数：${l}，所以至少再过 ${l} 天。`,
          smartTip: '短除法求公因数公倍数',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   4. 面积与体积
   ══════════════════════════════════════════════ */

const areaVolume: Topic = {
  id: 'g5-area-volume',
  grade: 5,
  name: '面积与体积',
  color: 'pink',
  icon: 'Box',
  summary: '掌握平行四边形、三角形、梯形的面积，以及长方体、正方体的体积。',
  explanation: [
    {
      title: '三种图形的面积',
      body: '平行四边形面积 = 底 × 高；三角形面积 = 底 × 高 ÷ 2；梯形面积 = (上底 + 下底) × 高 ÷ 2。',
      example: '三角形底 6、高 4 → 6 × 4 ÷ 2 = 12',
    },
    {
      title: '面积公式的来历',
      body: '两个完全一样的三角形可以拼成一个平行四边形，所以三角形面积是等底等高平行四边形面积的一半。梯形同理。',
      example: '拼一拼就明白为什么要除以 2',
    },
    {
      title: '体积与容积',
      body: '长方体体积 = 长 × 宽 × 高，正方体体积 = 棱长³，也可以统一用「底面积 × 高」计算。1 升 = 1000 毫升 = 1 立方分米。',
      example: '长 5、宽 4、高 3 → 体积 60 立方厘米',
    },
  ],
  smartMethods: [
    {
      name: '割补成已知图形',
      when: '遇到不规则或没学过的图形时',
      steps: ['把图形分割成几个学过的图形', '分别算出面积', '再把结果相加（或相减）'],
      example: 'L 形可以分成两个长方形',
    },
    {
      name: '等底等高一半',
      when: '算三角形面积时',
      steps: ['先想等底等高的平行四边形面积', '平行四边形面积 = 底 × 高', '再除以 2 就是三角形面积'],
      example: '底 6 高 4 → 24 ÷ 2 = 12',
    },
    {
      name: '底面积乘高',
      when: '算柱体体积时',
      steps: ['先算出底面的面积', '再乘高', '单位要统一成立方单位'],
      example: '底面积 20、高 5 → 体积 100',
    },
  ],
  levels: buildLevels(5, [
    '平行四边形的面积',
    '三角形的面积',
    '梯形的面积',
    '长方体与正方体的体积',
    '面积体积综合应用',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const base = rng.int(3, [9, 12, 15, 20, 25][level - 1])
      const height = rng.int(2, [8, 10, 12, 15, 18][level - 1])
      return makeFill({
        prompt: `一个平行四边形底 ${base} 厘米，高 ${height} 厘米，面积是多少平方厘米？`,
        answer: base * height,
        unit: '平方厘米',
        explanation: `平行四边形面积 = 底 × 高 = ${base} × ${height} = ${base * height} 平方厘米。`,
        smartTip: '割补成已知图形',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const base = rng.int(4, [10, 14, 18, 24, 30][level - 1])
        const height = rng.int(2, 12) * 2
        return makeFill({
          prompt: `一个三角形底 ${base} 厘米，高 ${height} 厘米，面积是多少平方厘米？`,
          answer: (base * height) / 2,
          unit: '平方厘米',
          explanation: `三角形面积 = 底 × 高 ÷ 2 = ${base} × ${height} ÷ 2 = ${(base * height) / 2} 平方厘米。`,
          smartTip: '等底等高一半',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const top = rng.int(3, 12)
        const bottom = top + rng.int(2, 12)
        const height = rng.int(2, 10) * 2
        return makeFill({
          prompt: `一个梯形上底 ${top} 厘米，下底 ${bottom} 厘米，高 ${height} 厘米，面积是多少平方厘米？`,
          answer: ((top + bottom) * height) / 2,
          unit: '平方厘米',
          explanation: `梯形面积 = (上底 + 下底) × 高 ÷ 2 = (${top} + ${bottom}) × ${height} ÷ 2 = ${((top + bottom) * height) / 2} 平方厘米。`,
          smartTip: '割补成已知图形',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const triangleArea = rng.pick([12, 18, 24, 30, 36])
        return makeChoice({
          prompt: `一个三角形和一个平行四边形等底等高，三角形面积 ${triangleArea} 平方厘米，平行四边形面积是多少？`,
          answer: `${triangleArea * 2} 平方厘米`,
          wrong: [`${triangleArea} 平方厘米`, `${triangleArea / 2} 平方厘米`, `${triangleArea + 12} 平方厘米`],
          explanation: `等底等高时，三角形面积是平行四边形的一半，所以平行四边形面积 = ${triangleArea} × 2 = ${triangleArea * 2} 平方厘米。`,
          smartTip: '等底等高一半',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const l = rng.int(3, 12)
        const w = rng.int(2, 10)
        const h = rng.int(2, 8)
        return makeFill({
          prompt: `一个长方体长 ${l} 厘米、宽 ${w} 厘米、高 ${h} 厘米，体积是多少立方厘米？`,
          answer: l * w * h,
          unit: '立方厘米',
          explanation: `长方体体积 = 长 × 宽 × 高 = ${l} × ${w} × ${h} = ${l * w * h} 立方厘米。`,
          smartTip: '底面积乘高',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const edge = rng.int(2, 12)
        return makeFill({
          prompt: `一个正方体棱长 ${edge} 厘米，体积是多少立方厘米？`,
          answer: edge ** 3,
          unit: '立方厘米',
          explanation: `正方体体积 = 棱长 × 棱长 × 棱长 = ${edge} × ${edge} × ${edge} = ${edge ** 3} 立方厘米。`,
          smartTip: '底面积乘高',
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
          prompt: `一个长方体水池长 ${l} 米、宽 ${w} 米、深 ${h} 米，最多能装水多少立方米？`,
          answer: volume,
          unit: '立方米',
          explanation: `容积 = 长 × 宽 × 高 = ${l} × ${w} × ${h} = ${volume} 立方米。`,
          smartTip: '底面积乘高',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const baseArea = rng.int(5, 30)
        const height = rng.int(3, 10)
        return makeJudge({
          prompt: `判断：一个长方体的底面积是 ${baseArea} 平方厘米，高 ${height} 厘米，体积是 ${baseArea + height} 立方厘米。—— 对吗？`,
          correct: false,
          explanation: `体积 = 底面积 × 高 = ${baseArea} × ${height} = ${baseArea * height} 立方厘米，不是 ${baseArea + height}。`,
          smartTip: '底面积乘高',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   5. 百分数
   ══════════════════════════════════════════════ */

const percent: Topic = {
  id: 'g5-percent',
  grade: 5,
  name: '百分数',
  color: 'purple',
  icon: 'Percent',
  summary: '理解百分数的意义，会做百分数与小数、分数的互化和简单计算。',
  explanation: [
    {
      title: '百分数的意义',
      body: '表示一个数是另一个数的百分之几的数叫百分数，也叫百分率或百分比。百分数只表示两个数的倍比关系，不能带单位。',
      example: '六（1）班的出勤率是 98%',
    },
    {
      title: '百分数与小数、分数互化',
      body: '百分数化小数：去掉百分号，小数点向左移两位；小数化百分数：小数点向右移两位，加上百分号。百分数化分数：写成分母是 100 的分数再约分。',
      example: '25% = 0.25 = 1/4；0.6 = 60%',
    },
    {
      title: '求一个数的百分之几',
      body: '求一个数的百分之几是多少，用这个数乘百分数（先把百分数化成小数或分数再算）。',
      example: '200 的 15% = 200 × 0.15 = 30',
    },
  ],
  smartMethods: [
    {
      name: '小数点移两位',
      when: '百分数与小数互化时',
      steps: ['百分数化小数：去百分号，小数点左移两位', '小数化百分数：小数点右移两位，加百分号', '位数不够就补 0'],
      example: '3% = 0.03；1.2 = 120%',
    },
    {
      name: '先化成分母 100 再约分',
      when: '百分数化分数时',
      steps: ['把百分数写成分母是 100 的分数', '分子分母同时除以公因数', '化成最简分数'],
      example: '45% = 45/100 = 9/20',
    },
    {
      name: '化成小数再乘',
      when: '求一个数的百分之几时',
      steps: ['把百分数化成小数', '用这个数乘得到的小数', '检查单位'],
      example: '80 的 25% = 80 × 0.25 = 20',
    },
  ],
  levels: buildLevels(5, [
    '百分数的意义与读写',
    '百分数与小数互化',
    '百分数与分数互化',
    '求一个数的百分之几',
    '百分率的实际应用',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const p = rng.pick([5, 8, 12, 15, 20, 25, 30, 36, 45, 50, 60, 75, 80, 90])
      return makeFill({
        prompt: `${p}% 化成小数是多少？`,
        answer: p / 100,
        explanation: `去掉百分号，小数点向左移两位：${p}% = ${p / 100}。`,
        smartTip: '小数点移两位',
      })
    })

    makers.push(() => {
      const d = rng.pick([0.05, 0.08, 0.12, 0.25, 0.4, 0.6, 0.75, 0.9, 1.2])
      return makeFill({
        prompt: `${d} 化成百分数，百分号前面的数是多少？`,
        answer: Math.round(d * 100),
        unit: '%',
        explanation: `小数点向右移两位，加上百分号：${d} = ${Math.round(d * 100)}%。`,
        smartTip: '小数点移两位',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const p = rng.pick([20, 25, 40, 50, 60, 75, 80])
        return makeFill({
          prompt: `${p}% 化成最简分数，分子是多少？`,
          answer: simplify(p, 100)[0],
          explanation: `${p}% = ${p}/100 = ${fracStr(p, 100)}，分子是 ${simplify(p, 100)[0]}。`,
          smartTip: '先化成分母 100 再约分',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const n = rng.int(20, 200)
        const p = rng.pick([10, 20, 25, 50, 75])
        return makeFill({
          prompt: `${n} 的 ${p}% 是多少？`,
          answer: round2((n * p) / 100),
          explanation: `${n} × ${p}% = ${n} × ${p / 100} = ${round2((n * p) / 100)}。`,
          smartTip: '化成小数再乘',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const total = rng.int(20, 200)
        const part = rng.int(1, total - 1)
        const p = round2((part / total) * 100)
        return makeFill({
          prompt: `全班 ${total} 人，其中男生 ${part} 人，男生占全班的百分之几？（保留一位小数，只填数字）`,
          answer: Math.round(p * 10) / 10,
          unit: '%',
          explanation: `${part} ÷ ${total} = ${round2(part / total)} = ${Math.round(p * 10) / 10}%。`,
          smartTip: '化成小数再乘',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const total = rng.int(50, 400)
        const p = rng.pick([20, 25, 40, 60, 75, 80])
        return makeFill({
          prompt: `一本书共 ${total} 页，已经读了 ${p}%，读了多少页？`,
          answer: round2((total * p) / 100),
          unit: '页',
          explanation: `${total} × ${p / 100} = ${round2((total * p) / 100)} 页。`,
          smartTip: '化成小数再乘',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const total = rng.pick([200, 400, 500, 800, 1000])
        const p = rng.pick([10, 15, 20, 25, 30])
        return makeJudge({
          prompt: `判断：${total} 元的 ${p}% 是 ${round2((total * p) / 100) + total} 元。—— 对吗？`,
          correct: false,
          explanation: `${total} × ${p}% = ${total} × ${p / 100} = ${round2((total * p) / 100)} 元，不是 ${round2((total * p) / 100) + total} 元。`,
          smartTip: '化成小数再乘',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const total = rng.pick([40, 50, 80, 100, 200])
        const correct = rng.int(1, total - 1)
        return makeFill({
          prompt: `一次数学测验共 ${total} 道题，小明做对了 ${correct} 道，正确率是多少？（只填百分号前的数字）`,
          answer: round2((correct / total) * 100),
          unit: '%',
          explanation: `正确率 = 做对题数 ÷ 总题数 × 100% = ${correct} ÷ ${total} × 100% = ${round2((correct / total) * 100)}%。`,
          smartTip: '化成小数再乘',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   6. 简易方程
   ══════════════════════════════════════════════ */

const equation: Topic = {
  id: 'g5-equation',
  grade: 5,
  name: '简易方程',
  color: 'teal',
  icon: 'Variable',
  summary: '用字母表示数，理解等式性质，会解形如 x ± a = b、ax = b 的方程。',
  explanation: [
    {
      title: '用字母表示数',
      body: '用字母可以表示数、数量和数量关系。数字和字母相乘时，乘号可以省略，数字写在字母前面。',
      example: 'a × 3 写作 3a；1 × a 写作 a',
    },
    {
      title: '方程与等式性质',
      body: '含有未知数的等式叫方程。等式两边同时加上（减去）同一个数，或同时乘（除以）同一个不为 0 的数，等式仍然成立。',
      example: 'x + 5 = 12 → 两边同时减 5 → x = 7',
    },
    {
      title: '解方程的格式',
      body: '解方程要写「解」字，每一步等号要对齐，最后要检验：把求出的 x 代入原方程，看左右两边是否相等。',
      example: '3x = 15 → x = 5，检验 3 × 5 = 15 ✓',
    },
  ],
  smartMethods: [
    {
      name: '天平平衡法',
      when: '不理解等式性质时',
      steps: ['把等号想成天平', '左边加多少右边也要加多少', '保持天平平衡'],
      example: 'x + 5 = 12，两边同时拿走 5',
    },
    {
      name: '移项变号',
      when: '解 x ± a = b 型方程时',
      steps: ['把含有 x 的项留在左边', '把常数项移到右边', '加变减、减变加'],
      example: 'x + 8 = 20 → x = 20 − 8 = 12',
    },
    {
      name: '代入检验',
      when: '解出 x 之后',
      steps: ['把 x 的值代入原方程左边', '算出结果', '看是否等于右边'],
      example: 'x = 7 代入 x + 5 = 12 → 7 + 5 = 12 ✓',
    },
  ],
  levels: buildLevels(5, [
    '用字母表示数',
    '解 x + a = b 与 x − a = b',
    '解 ax = b',
    '解 ax + b = c',
    '列方程解决问题',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const coeff = rng.int(2, 9)
      return makeFill({
        prompt: `用字母表示：每支铅笔 ${coeff} 元，买 a 支需要多少元？请写出 a 前面的数字。`,
        answer: coeff,
        explanation: `总价 = 单价 × 数量 = ${coeff} × a = ${coeff}a，a 前面的数字是 ${coeff}。`,
        smartTip: '天平平衡法',
      })
    })

    makers.push(() => {
      const a = rng.int(2, [20, 30, 50, 80, 100][level - 1])
      const x = rng.int(1, [18, 28, 48, 78, 98][level - 1])
      return makeFill({
        prompt: `解方程：x + ${a} = ${x + a}，x 是多少？`,
        answer: x,
        explanation: `等式两边同时减去 ${a}：x = ${x + a} − ${a} = ${x}。检验：${x} + ${a} = ${x + a} ✓`,
        smartTip: '移项变号',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const a = rng.int(2, [20, 30, 50, 80, 100][level - 1])
        const x = rng.int(a + 1, a + [20, 30, 50, 80, 100][level - 1])
        return makeFill({
          prompt: `解方程：x − ${a} = ${x - a}，x 是多少？`,
          answer: x,
          explanation: `等式两边同时加上 ${a}：x = ${x - a} + ${a} = ${x}。检验：${x} − ${a} = ${x - a} ✓`,
          smartTip: '移项变号',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const a = rng.int(2, [5, 7, 9, 12, 12][level - 1])
        const x = rng.int(2, [9, 12, 15, 20, 25][level - 1])
        return makeFill({
          prompt: `解方程：${a}x = ${a * x}，x 是多少？`,
          answer: x,
          explanation: `等式两边同时除以 ${a}：x = ${a * x} ÷ ${a} = ${x}。检验：${a} × ${x} = ${a * x} ✓`,
          smartTip: '天平平衡法',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const x = rng.int(2, 12)
        const a = rng.int(2, 9)
        return makeChoice({
          prompt: `下面哪个是方程 ${a}x = ${a * x} 的解？`,
          answer: `x = ${x}`,
          wrong: [`x = ${x + 1}`, `x = ${x + a}`, `x = ${x * a}`],
          explanation: `把 x = ${x} 代入：${a} × ${x} = ${a * x}，左右相等，所以 x = ${x} 是方程的解。`,
          smartTip: '代入检验',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const a = rng.int(2, 9)
        const x = rng.int(2, 15)
        const b = rng.int(1, 30)
        return makeFill({
          prompt: `解方程：${a}x + ${b} = ${a * x + b}，x 是多少？`,
          answer: x,
          explanation: `先把 ${a}x 看成一个整体：${a}x = ${a * x + b} − ${b} = ${a * x}，再两边除以 ${a}：x = ${x}。`,
          smartTip: '移项变号',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const price = rng.int(3, 12)
        const count = rng.int(3, 12)
        const total = price * count + rng.int(1, 20)
        return makeFill({
          prompt: `每本笔记本 ${price} 元，买了 x 本，付了 ${total} 元后找回 ${total - price * count} 元。请列出方程 ${price}x + ${total - price * count} = ${total} 的解，x 是多少？`,
          answer: count,
          explanation: `${price}x = ${total} − ${total - price * count} = ${price * count}，x = ${price * count} ÷ ${price} = ${count}。`,
          smartTip: '代入检验',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const x = rng.int(3, 20)
        const a = rng.int(2, 8)
        const b = rng.int(1, 20)
        return makeJudge({
          prompt: `判断：x = ${x} 是方程 ${a}x + ${b} = ${a * x + b} 的解。—— 对吗？`,
          correct: true,
          explanation: `代入检验：${a} × ${x} + ${b} = ${a * x} + ${b} = ${a * x + b}，左右相等，所以正确。`,
          smartTip: '代入检验',
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
