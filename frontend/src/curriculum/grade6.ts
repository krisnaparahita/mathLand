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
   1. 分数混合运算
   ══════════════════════════════════════════════ */

const fractionMixed: Topic = {
  id: 'g6-fraction-mixed',
  grade: 6,
  name: '分数混合运算',
  color: 'indigo',
  icon: 'Sigma',
  summary: '掌握分数四则混合运算与简便计算，理解运算定律在分数中的应用。',
  explanation: [
    {
      title: '运算顺序同样适用',
      body: '分数混合运算的顺序和整数一样：先乘除后加减，有括号先算括号里的，同级运算从左往右。',
      example: '1/2 + 1/3 × 3/4 = 1/2 + 1/4 = 3/4',
    },
    {
      title: '运算定律推广到分数',
      body: '加法交换律、结合律，乘法交换律、结合律、分配律对分数同样适用。合理运用能让计算变简单。',
      example: '(1/4 + 2/3) × 12 = 1/4 × 12 + 2/3 × 12 = 3 + 8 = 11',
    },
    {
      title: '倒数与约分技巧',
      body: '除以一个分数等于乘它的倒数。计算过程中先约分再相乘，可以大大减少计算量。',
      example: '5/6 ÷ 10 = 5/6 × 1/10 = 1/12',
    },
  ],
  smartMethods: [
    {
      name: '乘法分配律',
      when: '看到「两个数的和 × 一个数」时',
      steps: ['把括号外的数分别与括号内的每一项相乘', '再把两个积相加', '往往能凑成整数'],
      example: '(1/4 + 2/3) × 12 = 3 + 8 = 11',
    },
    {
      name: '先约分后计算',
      when: '分数乘法中分子分母有公因数时',
      steps: ['先交叉找公因数', '约掉之后再相乘', '避免算出很大的数'],
      example: '7/8 × 4/21 → 约掉 7 和 4 → 1/6',
    },
    {
      name: '除转乘倒数',
      when: '算式里有除法时',
      steps: ['把除号后的数取倒数', '除号改乘号', '全部变成乘法再计算'],
      example: '2/3 ÷ 4/5 ÷ 5 = 2/3 × 5/4 × 1/5 = 1/6',
    },
  ],
  levels: buildLevels(6, [
    '分数加减混合',
    '分数乘除混合',
    '分数四则混合',
    '运用运算定律简便计算',
    '分数混合运算应用题',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const d = rng.int(4, 12)
      const a = rng.int(1, d - 1)
      const b = rng.int(1, d - 1)
      return makeFill({
        prompt: `${a}/${d} + ${b}/${d} − 1/${d} = ？请写成最简的「分子/分母」形式（整数就直接写整数）。`,
        answer: fracStr(a + b - 1, d),
        explanation: `同分母，分子直接加减：${a} + ${b} − 1 = ${a + b - 1}，得 ${a + b - 1}/${d}，约分后是 ${fracStr(a + b - 1, d)}。`,
        smartTip: '先约分后计算',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const d1 = rng.int(2, 5)
        const d2 = rng.int(2, 5)
        const n1 = rng.int(1, d1 - 1)
        const n2 = rng.int(1, d2 - 1)
        return makeFill({
          prompt: `${n1}/${d1} × ${n2}/${d2} = ？请写成最简的「分子/分母」形式。`,
          answer: fracStr(n1 * n2, d1 * d2),
          explanation: `分子相乘 ${n1} × ${n2} = ${n1 * n2}，分母相乘 ${d1} × ${d2} = ${d1 * d2}，得 ${n1 * n2}/${d1 * d2}，约分后是 ${fracStr(n1 * n2, d1 * d2)}。`,
          smartTip: '先约分后计算',
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
          prompt: `${n1}/${d1} ÷ ${n2}/${d2} = ？请写成最简的「分子/分母」形式。`,
          answer: fracStr(n1 * d2, d1 * n2),
          explanation: `除以 ${n2}/${d2} 等于乘 ${d2}/${n2}：${n1}/${d1} × ${d2}/${n2} = ${n1 * d2}/${d1 * n2}，约分后是 ${fracStr(n1 * d2, d1 * n2)}。`,
          smartTip: '除转乘倒数',
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
          prompt: `${n}/${d} × ${k} + ${add}/${d} = ？请写成最简的「分子/分母」形式（整数就直接写整数）。`,
          answer: fracStr(n * k + add, d),
          explanation: `先算乘法：${n}/${d} × ${k} = ${n * k}/${d}，再加 ${add}/${d} 得 ${n * k + add}/${d}，约分后是 ${fracStr(n * k + add, d)}。`,
          smartTip: '除转乘倒数',
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
          prompt: `用乘法分配律计算：(${n1}/${d1} + ${n2}/${d2}) × ${factor} = ？`,
          answer: round2(result),
          explanation: `分配律：${n1}/${d1} × ${factor} + ${n2}/${d2} × ${factor} = ${round2((n1 / d1) * factor)} + ${round2((n2 / d2) * factor)} = ${round2(result)}。`,
          smartTip: '乘法分配律',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const d = rng.int(2, 6)
        const n = rng.int(1, d - 1)
        const k = rng.int(2, 9)
        return makeFill({
          prompt: `简便计算：${n}/${d} × ${k} ÷ ${k} = ？请写成最简的「分子/分母」形式。`,
          answer: fracStr(n, d),
          explanation: `乘 ${k} 再除以 ${k} 相互抵消，结果还是 ${fracStr(n, d)}。`,
          smartTip: '除转乘倒数',
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
          prompt: `一批货物共 ${total} 吨，第一次运走 ${n1}/${d}，第二次运走 ${n2}/${d}，还剩多少吨？`,
          answer: round2((total * (d - n1 - n2)) / d),
          unit: '吨',
          explanation: `两次共运走 ${n1 + n2}/${d}，还剩 ${d - n1 - n2}/${d}：${total} × ${d - n1 - n2}/${d} = ${round2((total * (d - n1 - n2)) / d)} 吨。`,
          smartTip: '先约分后计算',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const d = rng.int(2, 6)
        const n = rng.int(1, d - 1)
        const k = rng.int(2, 8)
        return makeJudge({
          prompt: `判断：${n}/${d} × ${k} ÷ ${k} = ${n}/${d} —— 对吗？`,
          correct: true,
          explanation: `乘一个数再除以同一个数，结果不变，所以 ${n}/${d} × ${k} ÷ ${k} = ${fracStr(n, d)}。`,
          smartTip: '除转乘倒数',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   2. 比与比例
   ══════════════════════════════════════════════ */

const ratio: Topic = {
  id: 'g6-ratio',
  grade: 6,
  name: '比与比例',
  color: 'orange',
  icon: 'Scale',
  summary: '理解比的意义与基本性质，会化简比、求比值和按比例分配。',
  explanation: [
    {
      title: '比的意义',
      body: '两个数相除又叫两个数的比。「:」是比号，a : b 中 a 叫前项，b 叫后项，a ÷ b 的结果叫比值。比的后项不能为 0。',
      example: '3 : 5 = 3 ÷ 5 = 0.6，前项 3、后项 5、比值 0.6',
    },
    {
      title: '比的基本性质',
      body: '比的前项和后项同时乘或除以相同的数（0 除外），比值不变。利用这个性质可以化简比。',
      example: '12 : 18 = 2 : 3（前后项同时除以 6）',
    },
    {
      title: '按比例分配',
      body: '把一个数量按照一定比例分成几部分。先求出总份数，再算出每一份是多少，最后分别乘各自的份数。',
      example: '60 按 2 : 3 分配 → 每份 12 → 24 和 36',
    },
  ],
  smartMethods: [
    {
      name: '同除最大公因数',
      when: '化简整数比时',
      steps: ['找出前项和后项的最大公因数', '前后项同时除以它', '得到最简整数比'],
      example: '18 : 24 → 同除 6 → 3 : 4',
    },
    {
      name: '先通分再化简',
      when: '比的前项或后项是分数、小数时',
      steps: ['先把小数化成整数（同乘 10、100 ……）', '或把分数通分成同分母', '再按整数比化简'],
      example: '0.4 : 0.6 → 4 : 6 → 2 : 3',
    },
    {
      name: '总份数法分配',
      when: '按比例分配问题时',
      steps: ['把比的各项相加得到总份数', '总数 ÷ 总份数 = 每份是多少', '每份 × 各自份数 = 各自的数量'],
      example: '60 按 2 : 3 → 总份数 5，每份 12 → 24、36',
    },
  ],
  levels: buildLevels(6, [
    '认识比与求比值',
    '化简比',
    '比的基本性质',
    '按比例分配',
    '比与比例综合应用',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const a = rng.int(2, 9)
      const b = rng.int(2, 9)
      return makeFill({
        prompt: `${a} : ${b} 的比值是多少？（保留两位小数）`,
        answer: round2(a / b),
        explanation: `比值 = 前项 ÷ 后项 = ${a} ÷ ${b} = ${round2(a / b)}。`,
        smartTip: '同除最大公因数',
      })
    })

    makers.push(() => {
      const factor = rng.int(2, [3, 5, 7, 9, 12][level - 1])
      const a = rng.int(1, 9)
      const b = rng.int(1, 9)
      const g = gcd(a * factor, b * factor)
      return makeFill({
        prompt: `把 ${a * factor} : ${b * factor} 化成最简整数比，前项是多少？`,
        answer: (a * factor) / g,
        explanation: `前后项同时除以最大公因数 ${g}：${a * factor} : ${b * factor} = ${(a * factor) / g} : ${(b * factor) / g}，前项是 ${(a * factor) / g}。`,
        smartTip: '同除最大公因数',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const base = rng.pick([0.2, 0.4, 0.5, 0.6, 0.8, 1.2, 1.5, 2.5])
        const a = Math.round(base * 10)
        const b = rng.int(2, 9) * 5
        const g = gcd(a, b)
        return makeFill({
          prompt: `把 ${base} : ${b / 10} 化成最简整数比，前项是多少？`,
          answer: a / g,
          explanation: `先把小数化成整数（都乘 10）：${a} : ${b}，再同除以最大公因数 ${g}，得 ${a / g} : ${b / g}，前项是 ${a / g}。`,
          smartTip: '先通分再化简',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const k = rng.int(2, 6)
        return makeFill({
          prompt: `比的前项乘 ${k}，要使比值不变，后项应该乘几？`,
          answer: k,
          explanation: `比的前项和后项同时乘或除以相同的数（0 除外），比值不变，所以后项也要乘 ${k}。`,
          smartTip: '同除最大公因数',
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
          prompt: `把 ${total} 按 ${a} : ${b} 分配，较大的那份是多少？`,
          answer: Math.max(a, b) * per,
          explanation: `总份数 = ${a} + ${b} = ${parts}，每份 = ${total} ÷ ${parts} = ${per}，较大的那份 = ${Math.max(a, b)} × ${per} = ${Math.max(a, b) * per}。`,
          smartTip: '总份数法分配',
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
          prompt: `把 ${total} 按 ${a} : ${b} 分配，较小的那份是多少？`,
          answer: Math.min(a, b) * per,
          explanation: `总份数 = ${parts}，每份 = ${per}，较小的那份 = ${Math.min(a, b)} × ${per} = ${Math.min(a, b) * per}。`,
          smartTip: '总份数法分配',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const scale = rng.pick([50, 100, 200, 500, 1000])
        const mapDist = rng.int(2, 12)
        return makeFill({
          prompt: `一幅地图的比例尺是 1 : ${scale}，图上距离 ${mapDist} 厘米，实际距离是多少厘米？`,
          answer: mapDist * scale,
          unit: '厘米',
          explanation: `实际距离 = 图上距离 × 比例尺分母 = ${mapDist} × ${scale} = ${mapDist * scale} 厘米。`,
          smartTip: '总份数法分配',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const a = rng.int(2, 6)
        const b = rng.int(2, 6)
        const c = rng.int(2, 9)
        return makeJudge({
          prompt: `判断：如果 ${a} : ${b} 的比值等于 ${a * c} : ${b * c} 的比值。—— 对吗？`,
          correct: true,
          explanation: `比的前项和后项同时乘 ${c}，比值不变：${a} : ${b} = ${a * c} : ${b * c} = ${round2(a / b)}。`,
          smartTip: '同除最大公因数',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   3. 百分数应用
   ══════════════════════════════════════════════ */

const percentApp: Topic = {
  id: 'g6-percent-app',
  grade: 6,
  name: '百分数应用',
  color: 'green',
  icon: 'TrendingUp',
  summary: '解决折扣、成数、税率、利率和增减百分数等实际问题。',
  explanation: [
    {
      title: '折扣与成数',
      body: '几折就是原价的十分之几（百分之几十），如八折 = 80%。成数：一成 = 10%，三成五 = 35%。',
      example: '原价 200 元打八折 → 200 × 80% = 160 元',
    },
    {
      title: '税率与利率',
      body: '应纳税额 = 收入 × 税率；利息 = 本金 × 利率 × 存期；取回总钱数 = 本金 + 利息。',
      example: '本金 1000 元，年利率 2%，存 1 年 → 利息 20 元',
    },
    {
      title: '增减百分之几',
      body: '求「比一个数多（少）百分之几」，先求出多（少）的部分，再除以单位「1」的量。找准单位「1」是关键。',
      example: '从 50 增加到 60，增加 (60−50) ÷ 50 = 20%',
    },
  ],
  smartMethods: [
    {
      name: '找准单位「1」',
      when: '做百分数应用题时',
      steps: ['在「是、占、比、相当于」后面找单位「1」', '已知单位「1」用乘法', '未知单位「1」用除法或列方程'],
      example: '「比原价降低了 20%」→ 原价是单位「1」',
    },
    {
      name: '折扣直接乘',
      when: '求打折后的价格时',
      steps: ['把几折化成百分数', '原价 × 百分数 = 现价', '求便宜了多少就用原价 − 现价'],
      example: '200 × 80% = 160，便宜 40 元',
    },
    {
      name: '增减幅度公式',
      when: '求增加或减少了百分之几时',
      steps: ['先算相差的量', '再除以原来的量（单位「1」）', '最后化成百分数'],
      example: '(60 − 50) ÷ 50 = 20%',
    },
  ],
  levels: buildLevels(6, [
    '折扣问题',
    '成数与增减百分数',
    '税率问题',
    '利率问题',
    '百分数综合应用',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const price = rng.pick([50, 80, 100, 120, 150, 200, 240, 300, 360, 400])
      const discount = rng.pick([5, 6, 7, 8, 9])
      return makeFill({
        prompt: `一件商品原价 ${price} 元，打 ${discount} 折出售，现价是多少元？`,
        answer: round2((price * discount) / 10),
        unit: '元',
        explanation: `${discount} 折 = ${discount * 10}%，现价 = ${price} × ${discount * 10}% = ${round2((price * discount) / 10)} 元。`,
        smartTip: '折扣直接乘',
      })
    })

    makers.push(() => {
      const price = rng.pick([50, 80, 100, 120, 150, 200, 240, 300, 360, 400])
      const discount = rng.pick([5, 6, 7, 8, 9])
      return makeFill({
        prompt: `一件商品原价 ${price} 元，打 ${discount} 折出售，比原价便宜了多少元？`,
        answer: round2(price - (price * discount) / 10),
        unit: '元',
        explanation: `现价 = ${price} × ${discount * 10}% = ${round2((price * discount) / 10)} 元，便宜了 ${price} − ${round2((price * discount) / 10)} = ${round2(price - (price * discount) / 10)} 元。`,
        smartTip: '折扣直接乘',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const base = rng.int(20, 200)
        const p = rng.pick([10, 20, 25, 50])
        const isUp = rng.bool()
        const value = isUp ? round2(base * (1 + p / 100)) : round2(base * (1 - p / 100))
        return makeFill({
          prompt: `一个数 ${base}，${isUp ? '增加' : '减少'} ${p}% 后是多少？`,
          answer: value,
          explanation: `${base} × (1 ${isUp ? '+' : '−'} ${p / 100}) = ${base} × ${round2(isUp ? 1 + p / 100 : 1 - p / 100)} = ${value}。`,
          smartTip: '增减幅度公式',
        })
      })
    }

    if (level >= 2) {
      makers.push(() => {
        const base = rng.pick([50, 80, 100, 120, 200])
        const p = rng.pick([20, 25, 50])
        const now = round2(base * (1 + p / 100))
        return makeFill({
          prompt: `某数原来是 ${base}，现在是 ${now}，增加了百分之几？（只填数字）`,
          answer: p,
          unit: '%',
          explanation: `(现在 − 原来) ÷ 原来 = (${now} − ${base}) ÷ ${base} = ${round2(now - base)} ÷ ${base} = ${p / 100} = ${p}%。`,
          smartTip: '增减幅度公式',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const income = rng.pick([2000, 3000, 4000, 5000, 6000, 8000])
        const rate = rng.pick([3, 5, 10])
        return makeFill({
          prompt: `月收入 ${income} 元，按 ${rate}% 的税率缴纳个人所得税，应缴税多少元？`,
          answer: round2((income * rate) / 100),
          unit: '元',
          explanation: `应纳税额 = 收入 × 税率 = ${income} × ${rate}% = ${round2((income * rate) / 100)} 元。`,
          smartTip: '找准单位「1」',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const principal = rng.pick([1000, 2000, 5000, 8000, 10000])
        const rate = rng.pick([1.5, 2, 2.5, 3])
        const years = rng.int(1, 3)
        return makeFill({
          prompt: `把 ${principal} 元存入银行，年利率 ${rate}%，存 ${years} 年，到期可得利息多少元？`,
          answer: round2((principal * (rate / 100) * years)),
          unit: '元',
          explanation: `利息 = 本金 × 利率 × 存期 = ${principal} × ${rate}% × ${years} = ${round2(principal * (rate / 100) * years)} 元。`,
          smartTip: '找准单位「1」',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const total = rng.pick([200, 300, 400, 500, 600])
        const p = rng.pick([20, 25, 40, 60, 75])
        return makeFill({
          prompt: `六年级有学生 ${total} 人，其中男生占 ${p}%，女生有多少人？`,
          answer: round2((total * (100 - p)) / 100),
          unit: '人',
          explanation: `女生占 ${100 - p}%：${total} × ${100 - p}% = ${round2((total * (100 - p)) / 100)} 人。`,
          smartTip: '找准单位「1」',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const now = rng.pick([80, 90, 120, 150, 180])
        const p = rng.pick([20, 25, 50])
        const original = round2(now / (1 - p / 100))
        return makeFill({
          prompt: `一件商品降价 ${p}% 后售价 ${now} 元，原价是多少元？`,
          answer: original,
          unit: '元',
          explanation: `现价 = 原价 × (1 − ${p}%)，所以原价 = ${now} ÷ ${round2(1 - p / 100)} = ${original} 元。`,
          smartTip: '找准单位「1」',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   4. 圆
   ══════════════════════════════════════════════ */

const circle: Topic = {
  id: 'g6-circle',
  grade: 6,
  name: '圆',
  color: 'pink',
  icon: 'Circle',
  summary: '认识圆的各部分名称，掌握圆的周长和面积计算（π 取 3.14）。',
  explanation: [
    {
      title: '圆的各部分',
      body: '圆心用 O 表示，连接圆心和圆上任意一点的线段叫半径 r，通过圆心且两端都在圆上的线段叫直径 d。同一个圆里 d = 2r，r = d ÷ 2。',
      example: '半径 3 厘米的圆，直径是 6 厘米',
    },
    {
      title: '圆的周长',
      body: '圆的周长 C = πd = 2πr。圆周率 π 是周长与直径的比值，是一个无限不循环小数，计算时通常取 3.14。',
      example: '半径 5 → C = 2 × 3.14 × 5 = 31.4',
    },
    {
      title: '圆的面积',
      body: '把圆等分拼成一个近似的长方形，长方形的长是周长的一半（πr），宽是半径 r，所以圆的面积 S = πr²。',
      example: '半径 5 → S = 3.14 × 5² = 78.5',
    },
  ],
  smartMethods: [
    {
      name: '见直径想半径',
      when: '题目给的是直径时',
      steps: ['先把直径除以 2 得到半径', '再代入周长或面积公式', '别把 d 当成 r 直接用'],
      example: 'd = 8 → r = 4，S = 3.14 × 16 = 50.24',
    },
    {
      name: 'π 放最后乘',
      when: '手算圆的周长和面积时',
      steps: ['先把 r 或 r² 算出来', '再乘 3.14', '这样不容易算错'],
      example: 'r = 5 → r² = 25 → 25 × 3.14 = 78.5',
    },
    {
      name: '圆环大减小',
      when: '求圆环（阴影）面积时',
      steps: ['先算外圆面积', '再算内圆面积', '两者相减'],
      example: 'R = 5、r = 3 → 3.14 × (25 − 9) = 50.24',
    },
  ],
  levels: buildLevels(6, [
    '认识圆的各部分',
    '圆的周长',
    '圆的面积',
    '圆环与组合图形',
    '圆的实际应用',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const r = rng.int(2, [5, 8, 10, 12, 15][level - 1])
      return makeFill({
        prompt: `一个圆的半径是 ${r} 厘米，直径是多少厘米？`,
        answer: r * 2,
        unit: '厘米',
        explanation: `同一个圆里，直径 = 半径 × 2 = ${r} × 2 = ${r * 2} 厘米。`,
        smartTip: '见直径想半径',
      })
    })

    makers.push(() => {
      const d = rng.int(1, [5, 8, 10, 12, 15][level - 1]) * 2
      return makeFill({
        prompt: `一个圆的直径是 ${d} 厘米，半径是多少厘米？`,
        answer: d / 2,
        unit: '厘米',
        explanation: `同一个圆里，半径 = 直径 ÷ 2 = ${d} ÷ 2 = ${d / 2} 厘米。`,
        smartTip: '见直径想半径',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const r = rng.int(1, [5, 8, 10, 12, 15][level - 1])
        return makeFill({
          prompt: `一个圆的半径是 ${r} 厘米，周长是多少厘米？（π 取 3.14）`,
          answer: round2(2 * PI * r),
          unit: '厘米',
          explanation: `C = 2πr = 2 × 3.14 × ${r} = ${round2(2 * PI * r)} 厘米。`,
          smartTip: 'π 放最后乘',
        })
      })
    }

    if (level >= 2) {
      makers.push(() => {
        const d = rng.int(2, [6, 10, 14, 18, 20][level - 1]) * 2
        return makeFill({
          prompt: `一个圆的直径是 ${d} 厘米，周长是多少厘米？（π 取 3.14）`,
          answer: round2(PI * d),
          unit: '厘米',
          explanation: `C = πd = 3.14 × ${d} = ${round2(PI * d)} 厘米。`,
          smartTip: '见直径想半径',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const r = rng.int(1, [5, 8, 10, 12, 15][level - 1])
        return makeFill({
          prompt: `一个圆的半径是 ${r} 厘米，面积是多少平方厘米？（π 取 3.14）`,
          answer: round2(PI * r * r),
          unit: '平方厘米',
          explanation: `S = πr² = 3.14 × ${r}² = 3.14 × ${r * r} = ${round2(PI * r * r)} 平方厘米。`,
          smartTip: 'π 放最后乘',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const d = rng.int(1, 10) * 2
        const r = d / 2
        return makeFill({
          prompt: `一个圆的直径是 ${d} 厘米，面积是多少平方厘米？（π 取 3.14）`,
          answer: round2(PI * r * r),
          unit: '平方厘米',
          explanation: `先求半径：${d} ÷ 2 = ${r} 厘米，再求面积：3.14 × ${r}² = ${round2(PI * r * r)} 平方厘米。`,
          smartTip: '见直径想半径',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const R = rng.int(4, 10)
        const r = rng.int(1, R - 1)
        return makeFill({
          prompt: `一个圆环外圆半径 ${R} 厘米，内圆半径 ${r} 厘米，面积是多少平方厘米？（π 取 3.14）`,
          answer: round2(PI * (R * R - r * r)),
          unit: '平方厘米',
          explanation: `S = π(R² − r²) = 3.14 × (${R * R} − ${r * r}) = 3.14 × ${R * R - r * r} = ${round2(PI * (R * R - r * r))} 平方厘米。`,
          smartTip: '圆环大减小',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const r = rng.int(2, 9)
        const laps = rng.int(2, 10)
        return makeFill({
          prompt: `一个圆形花坛半径 ${r} 米，绕它走 ${laps} 圈一共走了多少米？（π 取 3.14）`,
          answer: round2(2 * PI * r * laps),
          unit: '米',
          explanation: `一圈周长 = 2 × 3.14 × ${r} = ${round2(2 * PI * r)} 米，${laps} 圈 = ${round2(2 * PI * r)} × ${laps} = ${round2(2 * PI * r * laps)} 米。`,
          smartTip: 'π 放最后乘',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const c = round2(2 * PI * rng.int(2, 9))
        const r = round2(c / (2 * PI))
        return makeJudge({
          prompt: `判断：圆的半径扩大 2 倍，周长也扩大 2 倍，面积扩大 2 倍。—— 对吗？`,
          correct: false,
          explanation: `半径扩大 2 倍，周长扩大 2 倍是对的，但面积会扩大 2² = 4 倍。例如 r = ${r} 时周长约 ${c}，面积是 πr²，半径翻倍后面积变 4 倍。`,
          smartTip: 'π 放最后乘',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   5. 负数
   ══════════════════════════════════════════════ */

const negative: Topic = {
  id: 'g6-negative',
  grade: 6,
  name: '负数',
  color: 'purple',
  icon: 'Thermometer',
  summary: '认识正数和负数，会在数轴上表示数并比较大小，理解相反意义的量。',
  explanation: [
    {
      title: '正数和负数',
      body: '像 3、+5、1.2 这样的数叫正数（正号可以省略）；像 −3、−5.5 这样带负号的数叫负数。0 既不是正数也不是负数，它是正数与负数的分界。',
      example: '零上 5℃ 记作 +5℃，零下 5℃ 记作 −5℃',
    },
    {
      title: '用正负数表示相反意义的量',
      body: '如果两个量意义相反，可以用正数和负数分别表示。先规定哪一个为正，那么相反意义的量就记为负。',
      example: '向东走 5 米记作 +5 米，向西走 5 米记作 −5 米',
    },
    {
      title: '数轴上比较大小',
      body: '在数轴上，左边的数总比右边的数小。正数都大于 0，负数都小于 0，正数大于一切负数。两个负数相比，绝对值大的反而小。',
      example: '−5 < −3 < 0 < 2',
    },
  ],
  smartMethods: [
    {
      name: '画数轴定位',
      when: '比较正负数大小时',
      steps: ['画一条数轴，标出 0 的位置', '把各个数标在数轴上', '越靠右越大，越靠左越小'],
      example: '−5 −3 0 2 → 从左到右越来越大',
    },
    {
      name: '负数比大小看绝对值',
      when: '比较两个负数时',
      steps: ['先比较它们的绝对值', '绝对值大的那个负数更小', '也就是「离 0 越远越小」'],
      example: '|−8| > |−3|，所以 −8 < −3',
    },
    {
      name: '先定正方向',
      when: '用正负数表示实际问题时',
      steps: ['先规定哪个方向（哪种情况）为正', '相反的就记为负', '0 表示起点或标准'],
      example: '规定收入为正 → 支出 100 元记作 −100 元',
    },
  ],
  levels: buildLevels(6, [
    '认识正数与负数',
    '用正负数表示相反意义的量',
    '数轴上表示数与比较大小',
    '正负数的简单计算',
    '负数综合应用',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const n = rng.int(1, 20)
      return makeFill({
        prompt: `零下 ${n}℃ 用负数表示是多少？`,
        answer: -n,
        unit: '℃',
        explanation: `以 0℃ 为标准，零下 ${n}℃ 记作 −${n}℃。`,
        smartTip: '先定正方向',
      })
    })

    makers.push(() => {
      const n = rng.int(1, 100)
      const isIncome = rng.bool()
      return makeChoice({
        prompt: `规定收入为正，${isIncome ? '收入' : '支出'} ${n} 元应该记作什么？`,
        answer: `${isIncome ? '+' : '−'}${n} 元`,
        wrong: [
          `${isIncome ? '−' : '+'}${n} 元`,
          `${n} 元`,
          `0 元`,
        ],
        explanation: `收入为正，那么${isIncome ? '收入' : '支出'} ${n} 元记作 ${isIncome ? '+' : '−'}${n} 元。`,
        smartTip: '先定正方向',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const cases: Array<[string, string, string[]]> = [
          ['如果向东走记为正，那么向西走 8 米记作什么？', '−8 米', ['+8 米', '8 米', '0 米']],
          ['如果水位上升记为正，那么水位下降 3 厘米记作什么？', '−3 厘米', ['+3 厘米', '3 厘米', '0 厘米']],
          ['如果答对得分记为正，那么答错扣 5 分记作什么？', '−5 分', ['+5 分', '5 分', '0 分']],
          ['如果高于海平面记为正，那么低于海平面 155 米记作什么？', '−155 米', ['+155 米', '155 米', '0 米']],
        ]
        const [prompt, answer, wrong] = rng.pick(cases)
        return makeChoice({
          prompt,
          answer,
          wrong,
          explanation: `正确答案：${answer}。相反意义的量用负号表示。`,
          smartTip: '先定正方向',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const a = -rng.int(1, 20)
        const b = rng.int(0, 20)
        return makeChoice({
          prompt: `${a} 和 ${b} 相比，哪个更大？`,
          answer: String(Math.max(a, b)),
          wrong: [String(Math.min(a, b)), '0', '一样大'],
          explanation: `正数大于负数，${Math.max(a, b)} > ${Math.min(a, b)}。在数轴上 ${Math.max(a, b)} 在右边。`,
          smartTip: '画数轴定位',
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
          prompt: `${a} ○ ${b}，○ 里应填什么？`,
          answer: symbol,
          wrong: [symbol === '>' ? '<' : '>', '=', '≠'],
          explanation: `两个负数相比，绝对值 ${Math.abs(a)} 和 ${Math.abs(b)} 中${Math.abs(a) > Math.abs(b) ? ` ${Math.abs(a)} 更大，所以 ${a} 更小` : ` ${Math.abs(b)} 更大，所以 ${b} 更小`}，填 ${symbol}。`,
          smartTip: '负数比大小看绝对值',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const a = rng.int(1, 15)
        const b = rng.int(1, 15)
        return makeFill({
          prompt: `从 ${-a}℃ 上升 ${a + b}℃，温度变为多少？`,
          answer: b,
          unit: '℃',
          explanation: `−${a} + ${a + b} = ${b}，所以温度是 ${b}℃。`,
          smartTip: '画数轴定位',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const a = rng.int(1, 15)
        const b = rng.int(1, 15)
        return makeFill({
          prompt: `${a} + （−${b}） = ？`,
          answer: a - b,
          explanation: `加一个负数等于减去它的绝对值：${a} − ${b} = ${a - b}。`,
          smartTip: '画数轴定位',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const start = -rng.int(5, 15)
        const up = rng.int(3, 20)
        const down = rng.int(1, 10)
        return makeFill({
          prompt: `电梯从 ${start} 层上升 ${up} 层，再下降 ${down} 层，最后在第几层？`,
          answer: start + up - down,
          unit: '层',
          explanation: `${start} + ${up} − ${down} = ${start + up - down}，所以在第 ${start + up - down} 层。`,
          smartTip: '画数轴定位',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        return makeJudge({
          prompt: '判断：0 是正数。—— 对吗？',
          correct: false,
          explanation: '0 既不是正数也不是负数，它是正数和负数的分界点。',
          smartTip: '画数轴定位',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   6. 代数式与方程
   ══════════════════════════════════════════════ */

const algebra: Topic = {
  id: 'g6-algebra',
  grade: 6,
  name: '代数式与方程',
  color: 'teal',
  icon: 'Variable',
  summary: '会化简求值代数式，解稍复杂的方程，并用方程解决实际问题。',
  explanation: [
    {
      title: '代数式与求值',
      body: '用运算符号把数和字母连接起来的式子叫代数式。求代数式的值时，把字母换成指定的数，再按运算顺序计算。',
      example: '当 a = 3 时，2a + 5 = 2 × 3 + 5 = 11',
    },
    {
      title: '解方程的思路',
      body: '解方程就像「剥洋葱」：先把含有 x 的部分看成一个整体，一步步把 x 旁边多余的数去掉，最后求出 x。',
      example: '3x + 6 = 21 → 3x = 15 → x = 5',
    },
    {
      title: '列方程解应用题',
      body: '先把未知量设为 x，再根据题意找出等量关系列出方程，解方程后检验并作答。',
      example: '「比一个数的 2 倍多 5 是 21」→ 2x + 5 = 21 → x = 8',
    },
  ],
  smartMethods: [
    {
      name: '先整体后局部',
      when: '方程里 x 旁边又乘又加时',
      steps: ['先把含 x 的整块看成一大项', '用加减消掉旁边的常数', '再用乘除求出 x'],
      example: '3x + 6 = 21 → 3x = 15 → x = 5',
    },
    {
      name: '找等量关系句',
      when: '列方程解应用题时',
      steps: ['在题目中找「是、等于、共、比」等关键词', '把这句话翻译成等式', '未知量用 x 表示'],
      example: '「甲比乙的 2 倍多 5」→ 甲 = 2 × 乙 + 5',
    },
    {
      name: '代入检验',
      when: '解出答案后',
      steps: ['把 x 的值代入原方程', '分别算左右两边', '相等才说明解正确'],
      example: '2 × 8 + 5 = 21 ✓',
    },
  ],
  levels: buildLevels(6, [
    '代数式求值',
    '解 ax + b = c 型方程',
    '解含有括号的方程',
    '列方程解应用题',
    '方程综合应用',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const coeff = rng.int(2, 9)
      const value = rng.int(2, [5, 8, 10, 12, 15][level - 1])
      const constant = rng.int(1, 20)
      return makeFill({
        prompt: `当 a = ${value} 时，代数式 ${coeff}a + ${constant} 的值是多少？`,
        answer: coeff * value + constant,
        explanation: `把 a = ${value} 代入：${coeff} × ${value} + ${constant} = ${coeff * value} + ${constant} = ${coeff * value + constant}。`,
        smartTip: '先整体后局部',
      })
    })

    makers.push(() => {
      const a = rng.int(2, 9)
      const x = rng.int(2, [8, 10, 15, 20, 25][level - 1])
      const b = rng.int(1, 25)
      return makeFill({
        prompt: `解方程：${a}x + ${b} = ${a * x + b}，x 是多少？`,
        answer: x,
        explanation: `先把 ${a}x 看成整体：${a}x = ${a * x + b} − ${b} = ${a * x}，再除以 ${a}：x = ${x}。检验：${a} × ${x} + ${b} = ${a * x + b} ✓`,
        smartTip: '先整体后局部',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const a = rng.int(2, 9)
        const x = rng.int(2, 15)
        const b = rng.int(1, 20)
        return makeFill({
          prompt: `解方程：${a}x − ${b} = ${a * x - b}，x 是多少？`,
          answer: x,
          explanation: `先把 ${a}x 看成整体：${a}x = ${a * x - b} + ${b} = ${a * x}，再除以 ${a}：x = ${x}。`,
          smartTip: '先整体后局部',
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
          prompt: `解方程：${a}(x + ${b}) = ${total}，x 是多少？`,
          answer: x,
          explanation: `先把 (x + ${b}) 看成整体：x + ${b} = ${total} ÷ ${a} = ${x + b}，所以 x = ${x + b} − ${b} = ${x}。`,
          smartTip: '先整体后局部',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const x = rng.int(2, 12)
        const a = rng.int(2, 6)
        const b = rng.int(1, 10)
        return makeChoice({
          prompt: `${a}x + ${b} = ${a * x + b} 的解是哪个？`,
          answer: `x = ${x}`,
          wrong: [`x = ${x + 1}`, `x = ${x + b}`, `x = ${x * a}`],
          explanation: `代入检验：${a} × ${x} + ${b} = ${a * x + b}，左右相等，所以 x = ${x}。`,
          smartTip: '代入检验',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const x = rng.int(3, 30)
        const multiplier = rng.int(2, 6)
        const extra = rng.int(1, 20)
        return makeFill({
          prompt: `一个数的 ${multiplier} 倍加上 ${extra} 等于 ${multiplier * x + extra}，这个数是多少？`,
          answer: x,
          explanation: `设这个数为 x：${multiplier}x + ${extra} = ${multiplier * x + extra}，${multiplier}x = ${multiplier * x}，x = ${x}。`,
          smartTip: '找等量关系句',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const price = rng.int(3, 15)
        const count = rng.int(3, 15)
        const extra = rng.int(2, 20)
        return makeFill({
          prompt: `买 ${count} 支笔，每支 x 元，另付 ${extra} 元包装费，一共付了 ${price * count + extra} 元。每支笔多少元？`,
          answer: price,
          unit: '元',
          explanation: `列方程：${count}x + ${extra} = ${price * count + extra}，${count}x = ${price * count}，x = ${price}。`,
          smartTip: '找等量关系句',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const x = rng.int(4, 25)
        const ratio = rng.int(2, 5)
        return makeFill({
          prompt: `甲乙两数之和是 ${x * (ratio + 1)}，甲数是乙数的 ${ratio} 倍，乙数是多少？`,
          answer: x,
          explanation: `设乙数为 x，则甲数为 ${ratio}x：x + ${ratio}x = ${x * (ratio + 1)}，${ratio + 1}x = ${x * (ratio + 1)}，x = ${x}。`,
          smartTip: '找等量关系句',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const x = rng.int(2, 15)
        const a = rng.int(2, 7)
        const b = rng.int(1, 15)
        return makeJudge({
          prompt: `判断：x = ${x + 1} 是方程 ${a}x + ${b} = ${a * x + b} 的解。—— 对吗？`,
          correct: false,
          explanation: `代入检验：${a} × ${x + 1} + ${b} = ${a * (x + 1) + b} ≠ ${a * x + b}，所以 x = ${x + 1} 不是解，正确的解是 x = ${x}。`,
          smartTip: '代入检验',
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

/** 分数化简工具，供页面展示使用 */
export const simplifyDisplay = (n: number, d: number): string => {
  const [a, b] = simplify(n, d)
  return b === 1 ? String(a) : `${a}/${b}`
}
