import { Link } from 'react-router-dom'
import { ArrowRight, Brain, Clock, Sparkles, Timer, Trophy, Wand2 } from 'lucide-react'
import { FadeIn, HoverLift, Stagger } from '@/components/MotionPrimitives'
import { Stars } from '@/components/Stars'
import { GRADES, topicColor, topicSoft } from '@/curriculum'
import { useProfile } from '@/context/ProfileContext'
import { useQuery } from '@tanstack/react-query'
import { resultsApi } from '@/lib/api'

const FEATURES = [
  {
    Icon: Brain,
    title: '先学后练',
    body: '每个专题都有知识讲解和巧算方法，看懂方法再做题，不再靠猜。',
    color: 'indigo',
  },
  {
    Icon: Wand2,
    title: '题目轮换',
    body: '每次进入关卡都会重新出题，同一关也能反复练习不重样。',
    color: 'purple',
  },
  {
    Icon: Timer,
    title: '随关卡计时',
    body: '关卡越高题量越多、节奏越快，也可以切换「放松模式」慢慢想。',
    color: 'orange',
  },
  {
    Icon: Trophy,
    title: '成绩与星级',
    body: '每次闯关都记录得分、用时和星级，随时查看进步曲线。',
    color: 'green',
  },
]

export default function Index() {
  const { profile } = useProfile()

  const { data: recent = [] } = useQuery({
    queryKey: ['recent-results', profile?.id],
    queryFn: () => resultsApi.list({ userId: profile!.id, limit: 5 }),
    enabled: Boolean(profile),
  })

  return (
    <main className="container" style={{ paddingBottom: 'var(--spacing-3xl)' }}>
      {/* ── Hero ── */}
      <section
        className="clay"
        style={{
          marginTop: 'var(--spacing-xl)',
          padding: 'var(--spacing-2xl)',
          background: 'linear-gradient(135deg, var(--primary), var(--theme-purple))',
          border: '3px solid oklch(0.257 0.09 281.288 / 0.18)',
          overflow: 'hidden',
        }}
      >
        <div
          className="flex flex-col lg:flex-row items-start lg:items-center justify-between"
          style={{ gap: 'var(--spacing-xl)' }}
        >
          <div className="flex-1">
            <span
              className="inline-flex items-center rounded-full font-semibold"
              style={{
                gap: 'var(--spacing-xs)',
                paddingInline: 'var(--spacing-sm)',
                paddingBlock: 'var(--spacing-xs)',
                background: 'oklch(1 0 0 / 0.18)',
                color: 'var(--primary-foreground)',
                fontSize: 'var(--font-size-small)',
              }}
            >
              <Sparkles size={14} /> 小学 1–6 年级 · 36 个专题 · 180 个关卡
            </span>
            <h1
              className="font-bold text-headline"
              style={{ color: 'var(--primary-foreground)', marginTop: 'var(--spacing-md)', lineHeight: 1.2 }}
            >
              数学乐园 MathLand
            </h1>
            <p
              style={{
                color: 'oklch(0.985 0 0 / 0.9)',
                marginTop: 'var(--spacing-sm)',
                maxWidth: '46ch',
                fontSize: 'var(--font-size-body)',
              }}
            >
              先看懂讲解和巧算方法，再进入关卡闯关。题目每次都不一样，计时随关卡升级，成绩全部记录在案。
            </p>
            <div
              className="flex flex-wrap"
              style={{ gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-lg)' }}
            >
              <Link
                to={profile ? `/grades/${profile.grade}` : '/profile'}
                className="clay-solid cursor-pointer font-bold inline-flex items-center"
                style={{
                  gap: 'var(--spacing-xs)',
                  paddingInline: 'var(--spacing-lg)',
                  paddingBlock: 'var(--spacing-sm)',
                  background: 'var(--accent)',
                  color: 'var(--accent-foreground)',
                  borderRadius: 'var(--radius)',
                  fontSize: 'var(--font-size-body)',
                }}
              >
                {profile ? `进入${profile.grade} 年级` : '创建档案'} <ArrowRight size={18} />
              </Link>
              <Link
                to="/history"
                className="clay cursor-pointer font-semibold inline-flex items-center"
                style={{
                  gap: 'var(--spacing-xs)',
                  paddingInline: 'var(--spacing-lg)',
                  paddingBlock: 'var(--spacing-sm)',
                  color: 'var(--primary)',
                  borderRadius: 'var(--radius)',
                  fontSize: 'var(--font-size-body)',
                }}
              >
                <Clock size={18} /> 查看成绩历史
              </Link>
            </div>
          </div>

          {profile && recent.length > 0 && (
            <div
              className="clay"
              style={{
                minWidth: 260,
                padding: 'var(--spacing-md)',
                background: 'oklch(1 0 0 / 0.92)',
                color: 'var(--foreground)',
              }}
            >
              <div
                className="font-bold"
                style={{ fontSize: 'var(--font-size-label)', marginBottom: 'var(--spacing-sm)' }}
              >
                最近战绩
              </div>
              <div className="flex flex-col" style={{ gap: 'var(--spacing-xs)' }}>
                {recent.slice(0, 3).map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between"
                    style={{ gap: 'var(--spacing-sm)' }}
                  >
                    <span
                      style={{ fontSize: 'var(--font-size-small)', color: 'var(--muted-foreground)' }}
                    >
                      {r.topicName || r.topicId} · L{r.level}
                    </span>
                    <Stars value={r.stars} size={14} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 年级选择 ── */}
      <section style={{ marginTop: 'var(--spacing-2xl)' }}>
        <FadeIn>
          <h2 className="font-bold text-title" style={{ letterSpacing: 'var(--letter-spacing-tight)' }}>
            选择年级
          </h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--font-size-label)' }}>
            每个年级有 6 个专题，每个专题 5 个渐进关卡。
          </p>
        </FadeIn>

        <Stagger
          className="grid sm:grid-cols-2 lg:grid-cols-3"
          style={{ gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}
          stagger={0.07}
        >
          {GRADES.map((g) => (
            <HoverLift key={g.grade} lift={-6}>
              <Link
                to={`/grades/${g.grade}`}
                className="clay clay-hover block cursor-pointer h-full"
                style={{
                  padding: 'var(--spacing-lg)',
                  borderTop: `6px solid ${topicColor(g.color)}`,
                  background: 'var(--card)',
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div
                      className="font-bold"
                      style={{ fontSize: 'var(--font-size-title)', color: topicColor(g.color) }}
                    >
                      {g.name}
                    </div>
                    <div className="font-semibold" style={{ fontSize: 'var(--font-size-label)', marginTop: 2 }}>
                      {g.tagline}
                    </div>
                  </div>
                  <span
                    className="rounded-full font-bold"
                    style={{
                      paddingInline: 'var(--spacing-sm)',
                      paddingBlock: 2,
                      background: topicSoft(g.color),
                      color: topicColor(g.color),
                      fontSize: 'var(--font-size-small)',
                    }}
                  >
                    {g.topics.length} 专题
                  </span>
                </div>
                <p
                  style={{
                    color: 'var(--muted-foreground)',
                    fontSize: 'var(--font-size-small)',
                    marginTop: 'var(--spacing-sm)',
                    lineHeight: 1.6,
                  }}
                >
                  {g.description}
                </p>
                <div
                  className="flex items-center font-semibold"
                  style={{
                    gap: 'var(--spacing-xs)',
                    marginTop: 'var(--spacing-md)',
                    color: topicColor(g.color),
                    fontSize: 'var(--font-size-label)',
                  }}
                >
                  开始练习 <ArrowRight size={16} />
                </div>
              </Link>
            </HoverLift>
          ))}
        </Stagger>
      </section>

      {/* ── 特色 ── */}
      <section style={{ marginTop: 'var(--spacing-2xl)' }}>
        <FadeIn>
          <h2 className="font-bold text-title">为什么孩子喜欢在这里练</h2>
        </FadeIn>
        <Stagger
          className="grid sm:grid-cols-2 lg:grid-cols-4"
          style={{ gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}
          stagger={0.07}
        >
          {FEATURES.map(({ Icon, title, body, color }) => (
            <HoverLift key={title} lift={-5}>
              <div className="clay h-full" style={{ padding: 'var(--spacing-lg)' }}>
                <span
                  className="inline-flex items-center justify-center rounded-xl"
                  style={{
                    width: 44,
                    height: 44,
                    background: topicSoft(color),
                    color: topicColor(color),
                  }}
                >
                  <Icon size={22} strokeWidth={2.3} />
                </span>
                <div
                  className="font-bold"
                  style={{ fontSize: 'var(--font-size-body)', marginTop: 'var(--spacing-sm)' }}
                >
                  {title}
                </div>
                <p
                  style={{
                    color: 'var(--muted-foreground)',
                    fontSize: 'var(--font-size-small)',
                    marginTop: 'var(--spacing-xs)',
                    lineHeight: 1.7,
                  }}
                >
                  {body}
                </p>
              </div>
            </HoverLift>
          ))}
        </Stagger>
      </section>
    </main>
  )
}
