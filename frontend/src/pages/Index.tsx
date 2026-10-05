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
    title: 'Learn, then practice',
    body: 'Every topic has a concept guide and smart tricks. Understand the method first, then solve problems without guessing.',
    color: 'indigo',
  },
  {
    Icon: Wand2,
    title: 'Fresh questions',
    body: 'Questions are regenerated every time you enter a level, so you can replay the same level without repeats.',
    color: 'purple',
  },
  {
    Icon: Timer,
    title: 'Timed levels',
    body: 'Higher levels have more questions and a faster pace. You can also switch to relax mode and take your time.',
    color: 'orange',
  },
  {
    Icon: Trophy,
    title: 'Scores and stars',
    body: 'Every level records your score, time and star rating, so you can track your progress at any time.',
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
              <Sparkles size={14} /> Primary grades 1–6 · 36 topics · 180 levels
            </span>
            <h1
              className="font-bold text-headline"
              style={{ color: 'var(--primary-foreground)', marginTop: 'var(--spacing-md)', lineHeight: 1.2 }}
            >
              MathLand
            </h1>
            <p
              style={{
                color: 'oklch(0.985 0 0 / 0.9)',
                marginTop: 'var(--spacing-sm)',
                maxWidth: '46ch',
                fontSize: 'var(--font-size-body)',
              }}
            >
              Learn the concepts and smart tricks first, then take on the levels. Questions are different every time, timing gets tighter as levels rise, and every result is saved.
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
                {profile ? `Go to Grade ${profile.grade}` : 'Create profile'} <ArrowRight size={18} />
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
                <Clock size={18} /> View result history
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
                Recent results
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

      {/* ── Grade picker ── */}
      <section style={{ marginTop: 'var(--spacing-2xl)' }}>
        <FadeIn>
          <h2 className="font-bold text-title" style={{ letterSpacing: 'var(--letter-spacing-tight)' }}>
            Choose a grade
          </h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--font-size-label)' }}>
            Each grade has 6 topics, and each topic has 5 levels of rising difficulty.
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
                    {g.topics.length} topics
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
                  Start practicing <ArrowRight size={16} />
                </div>
              </Link>
            </HoverLift>
          ))}
        </Stagger>
      </section>

      {/* ── Features ── */}
      <section style={{ marginTop: 'var(--spacing-2xl)' }}>
        <FadeIn>
          <h2 className="font-bold text-title">Why kids love practicing here</h2>
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
