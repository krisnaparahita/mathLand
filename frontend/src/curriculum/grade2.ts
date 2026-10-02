import { buildLevels, buildQuestionSet, fmt, makeChoice, makeFill, makeJudge, rng } from './core'
import type { Question, Topic } from './types'

/* ══════════════════════════════════════════════
   1. 100 以内加减法
   ══════════════════════════════════════════════ */

const add100: Topic = {
  id: 'g2-add100',
  grade: 2,
  name: '100 以内加减法',
  color: 'indigo',
  icon: 'Plus',
  summary: '两位数加减两位数与整十数，掌握相同数位对齐的计算规则。',
  explanation: [
    {
      title: '相同数位要对齐',
      body: '做加减法时，个位和个位相加减，十位和十位相加减。竖式计算一定要把相同数位对齐。',
      example: '23 + 45：个位 3 + 5 = 8，十位 20 + 40 = 60，合起来 68',
    },
    {
      title: '整十数相加减',
      body: '整十数就是个位是 0 的数，比如 20、50、80。计算时只看十位上的数，最后添一个 0。',
      example: '30 + 50：想 3 + 5 = 8，所以是 80',
    },
    {
      title: '两位数加两位数',
      body: '可以把一个数拆成整十数和个位数，先加整十数，再加个位数，这样口算更快。',
      example: '36 + 27：36 + 20 = 56，56 + 7 = 63',
    },
  ],
  smartMethods: [
    {
      name: '拆分法',
      when: '两位数加减两位数，想口算时',
      steps: ['把第二个数的十位和个位拆开', '先加（减）整十数', '再加（减）个位数'],
      example: '48 + 35：48 + 30 = 78，78 + 5 = 83',
    },
    {
      name: '补整法',
      when: '加数接近整十数（如 29、48）时',
      steps: ['把接近整十的数看成整十数', '先按整十数算', '多算了就减去，少算了就加上'],
      example: '56 + 29：看成 56 + 30 = 86，多算 1，所以 86 − 1 = 85',
    },
    {
      name: '两头凑',
      when: '减法中被减数个位较小不好减时',
      steps: ['先把减数拆成两部分', '先减到整十数', '再减剩下的部分'],
      example: '73 − 28：73 − 23 = 50，50 − 5 = 45',
    },
  ],
  levels: buildLevels(2, [
    '两位数加减整十数',
    '两位数加减两位数（不进位不退位）',
    '两位数加法（含进位）',
    '两位数减法（含退位）',
    '加减混合与填未知数',
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
          prompt: `${a} ${isPlus ? '+' : '−'} ${b} = ？`,
          answer: value,
          explanation: isPlus
            ? `先算十位：${Math.floor(a / 10) * 10} + ${b} = ${Math.floor(a / 10) * 10 + b}，再加上个位 ${a % 10}，得 ${value}。`
            : `先算十位：${Math.floor(a / 10) * 10} − ${b} = ${Math.floor(a / 10) * 10 - b}，再加上个位 ${a % 10}，得 ${value}。`,
          smartTip: '拆分法',
        })
      })
    }

    makers.push(() => {
      const a = rng.int(11, 88)
      const b = rng.int(11, 88)
      const isPlus = rng.bool()
      if (!isPlus && a < b) {
        return makeFill({
          prompt: `${b} − ${a} = ？`,
          answer: b - a,
          explanation: `个位 ${b % 10} − ${a % 10}，十位 ${Math.floor(b / 10)} − ${Math.floor(a / 10)}，结果是 ${b - a}。`,
          smartTip: '拆分法',
        })
      }
      const value = isPlus ? a + b : a - b
      return makeFill({
        prompt: `${a} ${isPlus ? '+' : '−'} ${b} = ？`,
        answer: value,
        explanation: isPlus
          ? `拆分：${a} + ${Math.floor(b / 10) * 10} = ${a + Math.floor(b / 10) * 10}，再加 ${b % 10} 得 ${value}。`
          : `拆分：${a} − ${Math.floor(b / 10) * 10} = ${a - Math.floor(b / 10) * 10}，再减 ${b % 10} 得 ${value}。`,
        smartTip: '拆分法',
      })
    })

    if (level >= 3) {
      makers.push(() => {
        const near = rng.pick([19, 29, 39, 49, 59, 69, 79])
        const a = rng.int(12, 60)
        const sum = a + near
        const round = near + 1
        return makeFill({
          prompt: `${a} + ${near} = ？`,
          answer: sum,
          explanation: `补整法：把 ${near} 看成 ${round}，${a} + ${round} = ${a + round}，多算了 1，所以是 ${sum}。`,
          smartTip: '补整法',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const a = rng.int(40, 95)
        const b = rng.int(15, 39)
        const value = a - b
        return makeFill({
          prompt: `${a} − ${b} = ？`,
          answer: value,
          explanation: `两头凑：${a} − ${a % 10} = ${a - (a % 10)}，再减去剩下的 ${b - (a % 10)}，得 ${value}。`,
          smartTip: '两头凑',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const a = rng.int(20, 90)
        const b = rng.int(10, 40)
        const c = rng.int(5, 30)
        return makeFill({
          prompt: `${a} − ${b} + ${c} = ？`,
          answer: a - b + c,
          explanation: `按从左到右的顺序：${a} − ${b} = ${a - b}，${a - b} + ${c} = ${a - b + c}。`,
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const a = rng.int(15, 70)
        const total = rng.int(a + 11, 99)
        const b = total - a
        return makeFill({
          prompt: `${a} + （  ） = ${total}`,
          answer: b,
          explanation: `用减法求未知加数：${total} − ${a} = ${b}。`,
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const a = rng.int(11, 45)
        const b = rng.int(11, 45)
        const sum = a + b
        return makeJudge({
          prompt: `判断：${a} + ${b} = ${sum + rng.pick([-1, 1])} —— 对吗？`,
          correct: false,
          explanation: `${a} + ${b} = ${sum}，所以原题的说法是错误的。`,
          smartTip: '拆分法',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   2. 进位加与退位减
   ══════════════════════════════════════════════ */

const carryBorrow: Topic = {
  id: 'g2-carryborrow',
  grade: 2,
  name: '进位加与退位减',
  color: 'orange',
  icon: 'ArrowUpDown',
  summary: '竖式计算的核心：满十进一、退一当十，做到又快又准。',
  explanation: [
    {
      title: '满十进一',
      body: '个位相加满十，就要向十位进 1；十位相加满十，就要向百位进 1。进上来的 1 别忘了加。',
      example: '58 + 27：个位 8 + 7 = 15，写 5 进 1；十位 5 + 2 + 1 = 8，结果 85',
    },
    {
      title: '退一当十',
      body: '个位不够减时，从十位退 1，在个位上当 10 用；十位被退走 1 后要记得减 1。',
      example: '62 − 37：个位 2 不够减 7，退 1 当 10，12 − 7 = 5；十位 6 − 1 − 3 = 2，结果 25',
    },
    {
      title: '验算习惯',
      body: '加法可以用交换加数或减法验算；减法可以用加法验算（差 + 减数 = 被减数）。',
      example: '85 − 27 = 58，验算：58 + 27 = 85 ✓',
    },
  ],
  smartMethods: [
    {
      name: '进位标记法',
      when: '个位相加满十时',
      steps: ['个位相加，结果满十就在十位旁写个小「1」', '个位写结果的个位数', '十位相加时别忘加上小 1'],
      example: '58 + 27 → 个位进 1，十位 5 + 2 + 1 = 8',
    },
    {
      name: '退位点法',
      when: '个位不够减时',
      steps: ['在被减数十位上点一个点表示退 1', '个位加上 10 再减', '十位计算时先减掉退走的 1'],
      example: '62 − 37 → 十位 6 变成 5，5 − 3 = 2',
    },
    {
      name: '加减互验',
      when: '算完想确认对不对时',
      steps: ['减法用加法验：差 + 减数', '看是否等于被减数', '不相等就重新算一遍'],
      example: '71 − 46 = 25，验算 25 + 46 = 71 ✓',
    },
  ],
  levels: buildLevels(2, [
    '个位进位加法',
    '十位也进位的加法',
    '个位退位减法',
    '连续退位减法',
    '进位退位综合与验算',
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
        prompt: `竖式计算：${a} + ${b} = ？`,
        answer: sum,
        explanation: `个位 ${aOnes} + ${bOnes} = ${aOnes + bOnes}，写 ${(aOnes + bOnes) % 10} 进 1；十位 ${Math.floor(a / 10)} + ${Math.floor(b / 10)} + 1 = ${Math.floor(a / 10) + Math.floor(b / 10) + 1}，结果是 ${sum}。`,
        smartTip: '进位标记法',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const a = rng.int(55, 89)
        const b = rng.int(55, 89)
        const sum = a + b
        return makeFill({
          prompt: `${a} + ${b} = ？`,
          answer: sum,
          explanation: `个位 ${a % 10} + ${b % 10} = ${(a % 10) + (b % 10)}，进 1；十位 ${Math.floor(a / 10)} + ${Math.floor(b / 10)} + 1 = ${Math.floor(a / 10) + Math.floor(b / 10) + 1}，满十再进 1，结果是 ${sum}。`,
          smartTip: '进位标记法',
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
          prompt: `${a} − ${b} = ？`,
          answer: diff,
          explanation: `个位 ${aOnes} 不够减 ${bOnes}，从十位退 1：${aOnes + 10} − ${bOnes} = ${aOnes + 10 - bOnes}；十位 ${Math.floor(a / 10)} − 1 − ${Math.floor(b / 10)} = ${Math.floor(a / 10) - 1 - Math.floor(b / 10)}，结果是 ${diff}。`,
          smartTip: '退位点法',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const a = rng.int(100, 400)
        const b = rng.int(50, a - 1)
        const diff = a - b
        return makeFill({
          prompt: `${a} − ${b} = ？`,
          answer: diff,
          explanation: `按位退位计算，结果是 ${diff}。可以用加法验算：${diff} + ${b} = ${a}。`,
          smartTip: '加减互验',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const a = rng.int(30, 95)
        const b = rng.int(15, Math.max(16, a - 1))
        const diff = a - b
        return makeJudge({
          prompt: `判断：${a} − ${b} = ${diff} 对吗？`,
          correct: true,
          explanation: `用加法验算：${diff} + ${b} = ${diff + b}，正好等于 ${a}，所以正确。`,
          smartTip: '加减互验',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const a = rng.int(24, 78)
        const b = rng.int(16, 59)
        const sum = a + b
        return makeChoice({
          prompt: `${a} + ${b} = ？`,
          answer: String(sum),
          wrong: [String(sum - 10), String(sum + 10), String(sum - 1)],
          explanation: `个位 ${a % 10} + ${b % 10} = ${(a % 10) + (b % 10)}，满十进 1；十位加上进位的 1，结果是 ${sum}。`,
          smartTip: '进位标记法',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const total = 100
        const a = rng.int(23, 89)
        const b = total - a
        return makeFill({
          prompt: `${a} + （  ） = 100`,
          answer: b,
          explanation: `凑百：100 − ${a} = ${b}，可以先凑到整十再加剩下的。`,
          smartTip: '补整法',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   3. 乘法入门
   ══════════════════════════════════════════════ */

const multiplyIntro: Topic = {
  id: 'g2-multintro',
  grade: 2,
  name: '乘法入门',
  color: 'green',
  icon: 'X',
  summary: '从「几个几」认识乘法，熟记 2～5 的乘法口诀。',
  explanation: [
    {
      title: '乘法是求几个相同加数的和',
      body: '求几个相同加数的和，用乘法计算更简便。相同加数 × 个数 = 总数。',
      example: '3 + 3 + 3 + 3 = 3 × 4 = 12',
    },
    {
      title: '乘法算式的读法',
      body: '「×」读作乘号，a × b = c 中 a 和 b 都叫乘数，c 叫积。读的时候从左往右读。',
      example: '3 × 4 = 12 读作「三乘四等于十二」',
    },
    {
      title: '乘法口诀',
      body: '乘法口诀是计算乘法的捷径。口诀中较小的数在前，较大的数在后，一句口诀可以算两道算式。',
      example: '三四十二 → 3 × 4 = 12，4 × 3 = 12',
    },
  ],
  smartMethods: [
    {
      name: '几个几 → 乘法',
      when: '看到连加算式想改写时',
      steps: ['数一数相同的加数是几', '数一数一共出现了几次', '写成「几 × 几」'],
      example: '5 + 5 + 5 = 5 × 3 = 15',
    },
    {
      name: '交换乘数',
      when: '口诀想不起来时',
      steps: ['把两个乘数交换位置', '换成你更熟的那一句口诀', '积不变'],
      example: '7 × 3 想不起来？想 3 × 7 = 21',
    },
    {
      name: '分组数数',
      when: '看图列乘法算式时',
      steps: ['先数每组有几个', '再数一共有几组', '每份数 × 份数 = 总数'],
      example: '每组 4 个，共 3 组 → 4 × 3 = 12',
    },
  ],
  levels: buildLevels(2, [
    '把连加改写成乘法',
    '看图列乘法算式',
    '2～5 的乘法口诀',
    '乘法算式填空',
    '乘法与加法对比应用',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const a = rng.int(2, [5, 6, 8, 9, 9][level - 1])
      const times = rng.int(2, [5, 6, 7, 8, 9][level - 1])
      return makeFill({
        prompt: `${Array.from({ length: times }, () => a).join(' + ')} = ？（写成乘法结果）`,
        answer: a * times,
        explanation: `${times} 个 ${a} 相加，写成乘法是 ${a} × ${times} = ${a * times}。`,
        smartTip: '几个几 → 乘法',
      })
    })

    makers.push(() => {
      const a = rng.int(2, [5, 7, 9, 9, 9][level - 1])
      const times = rng.int(2, [5, 6, 8, 9, 9][level - 1])
      return makeFill({
        prompt: `${a} × ${times} = ？`,
        answer: a * times,
        explanation: `口诀：${a} × ${times} = ${a * times}。也可以想 ${times} 个 ${a} 相加。`,
        smartTip: '交换乘数',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const each = rng.int(2, 6)
        const groups = rng.int(2, 6)
        return makeFill({
          prompt: `有 ${groups} 盘苹果，每盘放 ${each} 个，一共有多少个苹果？`,
          answer: each * groups,
          unit: '个',
          explanation: `每份数 × 份数：${each} × ${groups} = ${each * groups} 个。`,
          smartTip: '分组数数',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const a = rng.int(2, 9)
        const b = rng.int(2, 9)
        const product = a * b
        return makeChoice({
          prompt: `${a} × ${b} = ？`,
          answer: String(product),
          wrong: [String(product + a), String(product - a), String(product + b)],
          explanation: `口诀：${a} × ${b} = ${product}。${b} 个 ${a} 相加也等于 ${product}。`,
          smartTip: '交换乘数',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const a = rng.int(2, 9)
        const b = rng.int(2, 9)
        const product = a * b
        return makeFill({
          prompt: `${a} × （  ） = ${product}`,
          answer: b,
          explanation: `想口诀：${a} × ${b} = ${product}，所以括号里填 ${b}。`,
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
          prompt: `下面哪个算式的结果最大？\nA. ${a} × ${b}　　B. ${a} + ${b}　　C. ${a} × 2　　D. ${b} + ${b}`,
          answer: 'A',
          wrong: ['B', 'C', 'D'],
          explanation: `A = ${product}，B = ${sum}，C = ${a * 2}，D = ${b * 2}，最大的是 A（${product}）。`,
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const a = rng.int(3, 8)
        const b = rng.int(3, 8)
        const product = a * b
        return makeJudge({
          prompt: `判断：${a} × ${b} 和 ${b} × ${a} 的结果相同。—— 对吗？`,
          correct: true,
          explanation: `交换两个乘数的位置，积不变：${a} × ${b} = ${b} × ${a} = ${product}。`,
          smartTip: '交换乘数',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   4. 认识时间
   ══════════════════════════════════════════════ */

const time: Topic = {
  id: 'g2-time',
  grade: 2,
  name: '认识时间',
  color: 'pink',
  icon: 'Clock',
  summary: '会认几时几分，掌握时分秒的换算和经过时间的计算。',
  explanation: [
    {
      title: '钟面上的大格和小格',
      body: '钟面上一共有 12 个大格、60 个小格。时针走一大格是 1 小时，分针走一小格是 1 分钟，走一大格是 5 分钟。',
      example: '分针从 12 走到 3，走了 3 大格 = 15 分钟',
    },
    {
      title: '认读几时几分',
      body: '看时针过了几就是几时，再看分针从 12 起走了多少小格就是多少分。',
      example: '时针过 8，分针指到 30 分 → 8:30',
    },
    {
      title: '时间单位换算',
      body: '1 时 = 60 分，1 分 = 60 秒，半小时 = 30 分。大单位换小单位乘 60，小单位换大单位除以 60。',
      example: '2 时 = 120 分，180 秒 = 3 分',
    },
  ],
  smartMethods: [
    {
      name: '分针跳格法',
      when: '读分钟数时',
      steps: ['看分针指在第几个数字上', '用这个数字乘 5', '再看多出的小格加几'],
      example: '分针指着 7 → 7 × 5 = 35 分',
    },
    {
      name: '经过时间分段算',
      when: '求从几点到几点经过多久',
      steps: ['先算到下一个整时经过多少分', '再算整时到整时经过多少时', '最后加上零头的分钟'],
      example: '7:40 → 8:20：20 分 + 20 分 = 40 分',
    },
    {
      name: '大化小乘 60',
      when: '时、分、秒互换时',
      steps: ['大单位换小单位就乘 60', '小单位换大单位就除以 60', '写答案时别忘带单位'],
      example: '3 时 = 3 × 60 = 180 分',
    },
  ],
  levels: buildLevels(2, [
    '认读整时和半时',
    '认读几时几分',
    '时、分、秒的换算',
    '计算经过的时间',
    '时间的综合应用',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const hour = rng.int(1, 12)
      const minuteMark = rng.pick([0, 6])
      const minute = minuteMark === 0 ? 0 : 30
      return makeChoice({
        prompt: `钟面上分针指着 ${minuteMark === 0 ? '12' : '6'}，时针指着 ${hour}，这时是几时？`,
        answer: minute === 0 ? `${hour} 时` : `${hour} 时 30 分`,
        wrong: [
          minute === 0 ? `${hour} 时 30 分` : `${hour} 时`,
          `${hour + 1 > 12 ? 1 : hour + 1} 时`,
          `${hour} 时 15 分`,
        ],
        explanation: `分针指着 ${minuteMark === 0 ? '12' : '6'} 是 ${minute} 分，时针指着 ${hour} 就是 ${hour} 时，所以是 ${hour} 时${minute === 0 ? '' : ' 30 分'}。`,
        smartTip: '分针跳格法',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const hour = rng.int(1, 11)
        const mark = rng.int(1, 11)
        const minute = mark * 5
        return makeFill({
          prompt: `分针指着 ${mark}，时针刚过 ${hour}，现在的分钟数是多少？`,
          answer: minute,
          unit: '分',
          explanation: `分针跳格法：${mark} × 5 = ${minute} 分。`,
          smartTip: '分针跳格法',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const hours = rng.int(1, 5)
        return makeFill({
          prompt: `${hours} 时 = （  ）分`,
          answer: hours * 60,
          unit: '分',
          explanation: `1 时 = 60 分，${hours} × 60 = ${hours * 60} 分。`,
          smartTip: '大化小乘 60',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const minutes = rng.int(2, 6) * 60
        return makeFill({
          prompt: `${minutes} 分 = （  ）时`,
          answer: minutes / 60,
          unit: '时',
          explanation: `小单位换大单位除以 60：${minutes} ÷ 60 = ${minutes / 60} 时。`,
          smartTip: '大化小乘 60',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const seconds = rng.int(2, 6) * 60
        return makeFill({
          prompt: `${seconds} 秒 = （  ）分`,
          answer: seconds / 60,
          unit: '分',
          explanation: `1 分 = 60 秒，${seconds} ÷ 60 = ${seconds / 60} 分。`,
          smartTip: '大化小乘 60',
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
          prompt: `一场电影 ${startHour}:${String(startMin).padStart(2, '0')} 开始，放映 ${duration} 分钟，结束时间是几时几分？（只填分钟数）`,
          answer: endMin,
          unit: '分',
          explanation: `${startHour}:${String(startMin).padStart(2, '0')} 加上 ${duration} 分 = ${endHour}:${String(endMin).padStart(2, '0')}，分钟数是 ${endMin}。`,
          smartTip: '经过时间分段算',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const startMin = rng.pick([10, 15, 20, 25, 30])
        const endMin = startMin + rng.pick([20, 30, 40])
        return makeFill({
          prompt: `小红从 7:${String(startMin).padStart(2, '0')} 开始写作业，写到 7:${String(endMin).padStart(2, '0')}，一共写了多少分钟？`,
          answer: endMin - startMin,
          unit: '分钟',
          explanation: `同一个小时内，直接用后面的分钟减前面的：${endMin} − ${startMin} = ${endMin - startMin} 分钟。`,
          smartTip: '经过时间分段算',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const cases: Array<[string, string, string[]]> = [
          ['时针走一大格是多久？', '1 小时', ['5 分钟', '1 分钟', '12 小时']],
          ['分针走一小格是多久？', '1 分钟', ['5 分钟', '1 小时', '1 秒']],
          ['分针走一圈，时针走了多远？', '1 大格', ['1 小格', '一圈', '6 大格']],
          ['1 小时 30 分等于多少分钟？', '90 分钟', ['130 分钟', '60 分钟', '100 分钟']],
        ]
        const [prompt, answer, wrong] = rng.pick(cases)
        return makeChoice({
          prompt,
          answer,
          wrong,
          explanation: `正确答案是${answer}。记住 1 时 = 60 分，钟面 12 个大格、60 个小格。`,
          smartTip: '大化小乘 60',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   5. 长度与测量
   ══════════════════════════════════════════════ */

const measure: Topic = {
  id: 'g2-measure',
  grade: 2,
  name: '长度与测量',
  color: 'purple',
  icon: 'Ruler',
  summary: '认识厘米和米，会选单位、换算单位、做简单的长度计算。',
  explanation: [
    {
      title: '厘米和米',
      body: '量比较短的物体用「厘米（cm）」，量比较长的物体用「米（m）」。1 米 = 100 厘米。',
      example: '铅笔长约 18 厘米，教室长约 9 米',
    },
    {
      title: '正确测量',
      body: '测量时要把尺子的 0 刻度对准物体的一端，再看另一端对着刻度几。尺子要放平、贴紧。',
      example: '从 0 到 7 就是 7 厘米',
    },
    {
      title: '从任意刻度开始量',
      body: '如果物体一端没对准 0 刻度，就用「末端刻度 − 起点刻度」求长度。',
      example: '从刻度 3 到刻度 10：10 − 3 = 7 厘米',
    },
  ],
  smartMethods: [
    {
      name: '身体尺估算法',
      when: '没有尺子要估长度时',
      steps: ['记住一拃大约 10 厘米', '记住一步大约 50 厘米', '张开双臂大约 1 米'],
      example: '课桌大约 6 拃 → 约 60 厘米',
    },
    {
      name: '末端减起点',
      when: '物体不是从 0 刻度开始量时',
      steps: ['读出起点的刻度', '读出末端的刻度', '末端 − 起点 = 长度'],
      example: '10 − 3 = 7 厘米',
    },
    {
      name: '单位换算进率',
      when: '米和厘米互换时',
      steps: ['记住 1 米 = 100 厘米', '米换厘米添两个 0', '厘米换米去掉两个 0'],
      example: '3 米 = 300 厘米，500 厘米 = 5 米',
    },
  ],
  levels: buildLevels(2, [
    '认识厘米，正确测量',
    '选择合适的长度单位',
    '米和厘米的换算',
    '长度的简单计算',
    '测量的综合应用',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const start = rng.int(0, 5)
      const length = rng.int(3, [10, 15, 20, 25, 30][level - 1])
      return makeFill({
        prompt: `用尺子量一根铅笔，一端对着刻度 ${start}，另一端对着刻度 ${start + length}，铅笔长多少厘米？`,
        answer: length,
        unit: '厘米',
        explanation: `末端减起点：${start + length} − ${start} = ${length} 厘米。`,
        smartTip: '末端减起点',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const cases: Array<[string, string]> = [
          ['一支铅笔的长度', '厘米'],
          ['教室的长', '米'],
          ['一根跳绳的长', '米'],
          ['数学书封面的宽', '厘米'],
          ['一棵大树的高度', '米'],
          ['一枚硬币的厚度', '毫米'],
        ]
        const [thing, answer] = rng.pick(cases)
        return makeChoice({
          prompt: `测量「${thing}」，用哪个单位最合适？`,
          answer,
          wrong: (['厘米', '米', '分米', '毫米'] as const).filter((u) => u !== answer),
          explanation: `${thing}用${answer}作单位最合适。`,
          smartTip: '身体尺估算法',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const meters = rng.int(1, [5, 8, 10, 20, 50][level - 1])
        return makeFill({
          prompt: `${meters} 米 = （  ）厘米`,
          answer: meters * 100,
          unit: '厘米',
          explanation: `1 米 = 100 厘米，${meters} × 100 = ${meters * 100} 厘米。`,
          smartTip: '单位换算进率',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const meters = rng.int(2, 9)
        return makeFill({
          prompt: `${meters * 100} 厘米 = （  ）米`,
          answer: meters,
          unit: '米',
          explanation: `100 厘米 = 1 米，${meters * 100} ÷ 100 = ${meters} 米。`,
          smartTip: '单位换算进率',
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const a = rng.int(10, 90)
        const b = rng.int(10, 90)
        return makeFill({
          prompt: `一根绳子长 ${a} 厘米，另一根长 ${b} 厘米，两根接在一起一共长多少厘米？`,
          answer: a + b,
          unit: '厘米',
          explanation: `求总长用加法：${a} + ${b} = ${a + b} 厘米。`,
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const total = rng.int(50, 200)
        const used = rng.int(10, total - 5)
        return makeFill({
          prompt: `一根铁丝长 ${total} 厘米，用去 ${used} 厘米，还剩多少厘米？`,
          answer: total - used,
          unit: '厘米',
          explanation: `求剩下用减法：${total} − ${used} = ${total - used} 厘米。`,
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const total = rng.int(2, 8)
        const each = rng.pick([10, 20, 25, 50])
        const pieces = (total * 100) / each
        return makeFill({
          prompt: `一根 ${total} 米长的绳子，每 ${each} 厘米剪一段，可以剪成多少段？`,
          answer: pieces,
          unit: '段',
          explanation: `先统一单位：${total} 米 = ${total * 100} 厘米，再算 ${total * 100} ÷ ${each} = ${pieces} 段。`,
          smartTip: '单位换算进率',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

/* ══════════════════════════════════════════════
   6. 人民币与购物
   ══════════════════════════════════════════════ */

const money: Topic = {
  id: 'g2-money',
  grade: 2,
  name: '人民币与购物',
  color: 'teal',
  icon: 'Coins',
  summary: '认识元、角、分，学会换算、付钱和找零。',
  explanation: [
    {
      title: '元、角、分',
      body: '人民币的单位有元、角、分。1 元 = 10 角，1 角 = 10 分，1 元 = 100 分。',
      example: '3 元 = 30 角，5 角 = 50 分',
    },
    {
      title: '付钱与找零',
      body: '买东西时，付出的钱减去商品的价格就是应找回的钱；商品的价格加起来就是应付的钱。',
      example: '买 8 元的本子，付 10 元，找回 10 − 8 = 2 元',
    },
    {
      title: '比较价格',
      body: '比较价格要先统一单位，再比较数字大小。单位不同不能直接比。',
      example: '3 元 5 角 = 35 角 > 30 角',
    },
  ],
  smartMethods: [
    {
      name: '统一单位再算',
      when: '元、角混在一起计算时',
      steps: ['先把所有金额换成同一个单位', '统一计算', '最后再换回需要的单位'],
      example: '2 元 5 角 + 3 角 = 25 角 + 3 角 = 28 角 = 2 元 8 角',
    },
    {
      name: '凑整付款',
      when: '思考怎么付钱最方便时',
      steps: ['看价格离哪个整元数最近', '先付到整元', '再加上零头'],
      example: '价格 8 元 6 角：付 10 元，找回 1 元 4 角',
    },
    {
      name: '分步找零',
      when: '计算找回多少钱时',
      steps: ['先算到整元差多少', '再算零头还差多少', '两部分合起来就是找零'],
      example: '付 20 元买 13 元 5 角 → 找 6 元 5 角',
    },
  ],
  levels: buildLevels(2, [
    '认识元、角、分',
    '元与角的换算',
    '简单的购物计算',
    '付钱与找零',
    '购物综合应用',
  ]),
  generate(level, count, exclude?: string[]) {
    const makers: Array<() => Question> = []

    makers.push(() => {
      const yuan = rng.int(1, [5, 9, 20, 50, 100][level - 1])
      return makeFill({
        prompt: `${yuan} 元 = （  ）角`,
        answer: yuan * 10,
        unit: '角',
        explanation: `1 元 = 10 角，${yuan} × 10 = ${yuan * 10} 角。`,
        smartTip: '统一单位再算',
      })
    })

    makers.push(() => {
      const jiao = rng.int(2, 9) * 10
      return makeFill({
        prompt: `${jiao} 角 = （  ）元`,
        answer: jiao / 10,
        unit: '元',
        explanation: `10 角 = 1 元，${jiao} ÷ 10 = ${jiao / 10} 元。`,
        smartTip: '统一单位再算',
      })
    })

    if (level >= 2) {
      makers.push(() => {
        const yuan = rng.int(1, 9)
        const jiao = rng.int(1, 9)
        return makeFill({
          prompt: `${yuan} 元 ${jiao} 角 = （  ）角`,
          answer: yuan * 10 + jiao,
          unit: '角',
          explanation: `${yuan} 元 = ${yuan * 10} 角，加上 ${jiao} 角，一共 ${yuan * 10 + jiao} 角。`,
          smartTip: '统一单位再算',
        })
      })
    }

    if (level >= 3) {
      makers.push(() => {
        const a = rng.int(1, 20)
        const b = rng.int(1, 20)
        return makeFill({
          prompt: `买一支笔 ${a} 元，买一个本子 ${b} 元，一共要付多少元？`,
          answer: a + b,
          unit: '元',
          explanation: `求一共用加法：${a} + ${b} = ${a + b} 元。`,
        })
      })
    }

    if (level >= 4) {
      makers.push(() => {
        const price = rng.int(3, 45)
        const pay = rng.pick([50, 20, 100, 10].filter((p) => p > price))
        return makeFill({
          prompt: `一个书包 ${price} 元，付了 ${pay} 元，应找回多少元？`,
          answer: pay - price,
          unit: '元',
          explanation: `付出的钱 − 价格 = 找零：${pay} − ${price} = ${pay - price} 元。`,
          smartTip: '分步找零',
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
          prompt: `一块橡皮 ${priceYuan} 元 ${priceJiao} 角，付了 ${payYuan} 元，应找回多少角？`,
          answer: change,
          unit: '角',
          explanation: `${payYuan} 元 = ${payTotalJiao} 角，${priceYuan} 元 ${priceJiao} 角 = ${priceTotalJiao} 角，找零 ${payTotalJiao} − ${priceTotalJiao} = ${change} 角。`,
          smartTip: '分步找零',
        })
      })
    }

    if (level >= 5) {
      makers.push(() => {
        const price = rng.int(2, 9)
        const count = rng.int(2, 6)
        return makeFill({
          prompt: `每支铅笔 ${price} 元，买 ${count} 支要付多少元？`,
          answer: price * count,
          unit: '元',
          explanation: `单价 × 数量 = 总价：${price} × ${count} = ${price * count} 元。`,
          smartTip: '凑整付款',
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
          prompt: `下面哪个价格更贵？\nA. ${a} 元 5 角　　B. ${b} 元`,
          answer: priceA > priceB ? 'A' : 'B',
          wrong: [priceA > priceB ? 'B' : 'A', '一样贵', '无法比较'],
          explanation: `${a} 元 5 角 = ${priceA} 角，${b} 元 = ${priceB} 角，${priceA > priceB ? `${priceA} > ${priceB}，A 更贵` : `${priceB} > ${priceA}，B 更贵`}。`,
          smartTip: '统一单位再算',
        })
      })
    }

    return buildQuestionSet(count, makers, exclude)
  },
}

export const grade2Topics: Topic[] = [add100, carryBorrow, multiplyIntro, time, measure, money]

/** 供其它模块复用的工具 */
export const moneyFormat = (yuan: number): string => `¥${fmt(yuan)}`
