import { Link } from 'react-router-dom'
import { ArrowRight, Brain, Sparkles, Timer, Trophy, Wand2 } from 'lucide-react'
import { FadeIn, HoverLift, Stagger } from '@/components/MotionPrimitives'
import { FloatingShapes } from '@/components/FloatingShapes'
import { QuickQuestion } from '@/components/QuickQuestion'
import { Stars } from '@/components/Stars'
import { GRADES, topicColor, topicEdge, topicInk, topicSoft, topicText } from '@/curriculum'
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

/** Stars a player can earn in one grade: 6 topics × 5 levels × 3 stars */
const MAX_GRADE_STARS = 90

export default function Index() {
  const { profile } = useProfile()

  const { data: recent = [] } = useQuery({
    queryKey: ['recent-results', profile?.id],
    queryFn: () => resultsApi.list({ userId: profile!.id, limit: 5 }),
    enabled: Boolean(profile),
  })

  const { data: levelProgress = [] } = useQuery({
    queryKey: ['level-progress', profile?.id, 'all'],
    queryFn: () => resultsApi.levelProgress(profile!.id),
    enabled: Boolean(profile),
  })

  /** Best stars per level, added up for each grade (topic ids look like "g3-fraction") */
  const starsByGrade = new Map<number, number>()
  for (const lp of levelProgress) {
    const grade = Number(lp.topicId.slice(1, 2))
    starsByGrade.set(grade, (starsByGrade.get(grade) ?? 0) + lp.bestStars)
  }

  return (
    <main className="container" style={{ paddingBottom: 'var(--spacing-3xl)' }}>
      {/* ── Hero ── */}
      <section
        className="relative grid lg:grid-cols-[1.1fr_1fr] items-center"
        style={{ marginTop: 'var(--spacing-xl)', gap: 'var(--spacing-xl)', paddingBlock: 'var(--spacing-md)' }}
      >
        <FloatingShapes />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <span
            className="inline-flex items-center rounded-full font-bold"
            style={{
              gap: 'var(--spacing-xs)',
              paddingInline: 'var(--spacing-sm)',
              paddingBlock: 6,
              background: 'color-mix(in oklch, var(--c-grape) 20%, white)',
              color: 'oklch(0.4 0.14 300)',
              fontSize: 'var(--font-size-small)',
            }}
          >
            <Sparkles size={14} /> Primary grades 1–6 · 36 topics · 180 levels
          </span>
          <h1
            className="font-bold"
            style={{ fontSize: 'clamp(2.4rem, 7vw, 3.9rem)', lineHeight: 1.08, marginTop: 'var(--spacing-md)' }}
          >
            Math, but make it <span className="highlight">a game!</span>
          </h1>
          <p
            style={{
              color: 'var(--muted-foreground)',
              marginTop: 'var(--spacing-md)',
              maxWidth: '46ch',
              fontSize: 'var(--font-size-body)',
              lineHeight: 1.7,
            }}
          >
            Learn a trick, play a level, collect stars. Every round has new questions, and a wrong answer shows you how to fix it.
          </p>
          <div className="flex flex-wrap" style={{ gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-lg)' }}>
            <Link
              to={profile ? `/grades/${profile.grade}` : '/profile'}
              className="clay-solid cursor-pointer font-bold inline-flex items-center"
              style={{
                gap: 'var(--spacing-xs)',
                paddingInline: 'var(--spacing-lg)',
                paddingBlock: 'var(--spacing-sm)',
                background: 'var(--primary)',
                color: 'var(--primary-foreground)',
                borderRadius: '999px',
                fontSize: 'var(--font-size-body)',
              }}
            >
              {profile ? `Go to Grade ${profile.grade}` : 'Create profile'} <ArrowRight size={18} />
            </Link>
            <Link
              to="/history"
              className="clay clay-hover cursor-pointer font-bold inline-flex items-center"
              style={{
                gap: 'var(--spacing-xs)',
                paddingInline: 'var(--spacing-lg)',
                paddingBlock: 'var(--spacing-sm)',
                borderRadius: '999px',
                fontSize: 'var(--font-size-body)',
                fontFamily: 'var(--font-display)',
              }}
            >
              See my stars
            </Link>
          </div>

          {profile && recent.length > 0 && (
            <div
              className="flex flex-wrap items-center"
              style={{ gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-lg)' }}
            >
              <span className="font-bold" style={{ fontSize: 'var(--font-size-small)', color: 'var(--muted-foreground)' }}>
                Recent
              </span>
              {recent.slice(0, 3).map((r) => (
                <span
                  key={r.id}
                  className="inline-flex items-center rounded-full"
                  style={{
                    gap: 'var(--spacing-xs)',
                    background: 'var(--card)',
                    border: '2px solid var(--border)',
                    paddingInline: 'var(--spacing-sm)',
                    paddingBlock: 4,
                    fontSize: 'var(--font-size-small)',
                    fontWeight: 700,
                  }}
                >
                  {r.topicName || r.topicId} · L{r.level} <Stars value={r.stars} size={13} />
                </span>
              ))}
            </div>
          )}
        </div>

        <QuickQuestion />
      </section>

      {/* ── Grade picker ── */}
      <section style={{ marginTop: 'var(--spacing-2xl)' }}>
        <FadeIn>
          <h2 className="font-bold text-title">Choose a grade</h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--font-size-label)' }}>
            Each grade has 6 topics, and each topic has 5 levels of rising difficulty.
          </p>
        </FadeIn>

        <Stagger
          className="grid sm:grid-cols-2 lg:grid-cols-3"
          style={{ gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}
          stagger={0.07}
        >
          {GRADES.map((g) => {
            const stars = starsByGrade.get(g.grade) ?? 0
            return (
              <HoverLift key={g.grade} lift={-6}>
                <Link
                  to={`/grades/${g.grade}`}
                  className="block cursor-pointer h-full"
                  style={{
                    padding: 'var(--spacing-lg)',
                    background: topicSoft(g.color),
                    border: `3px solid color-mix(in oklch, ${topicColor(g.color)} 55%, white)`,
                    borderRadius: 'var(--radius)',
                    boxShadow: `0 6px 0 color-mix(in oklch, ${topicColor(g.color)} 55%, white)`,
                  }}
                >
                  <div className="flex items-start justify-between" style={{ gap: 'var(--spacing-sm)' }}>
                    <span
                      className="font-display inline-flex items-center justify-center"
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 20,
                        background: topicColor(g.color),
                        color: topicInk(g.color),
                        fontSize: '2rem',
                        fontWeight: 700,
                        transform: 'rotate(-5deg)',
                        boxShadow: `0 4px 0 ${topicEdge(g.color)}`,
                      }}
                    >
                      {g.grade}
                    </span>
                    <span
                      className="rounded-full font-bold"
                      style={{
                        paddingInline: 'var(--spacing-sm)',
                        paddingBlock: 2,
                        background: 'oklch(1 0 0 / 0.75)',
                        color: topicText(g.color),
                        fontSize: 'var(--font-size-small)',
                      }}
                    >
                      {g.topics.length} topics
                    </span>
                  </div>
                  <h3 className="font-bold" style={{ fontSize: 'var(--font-size-title)', marginTop: 'var(--spacing-sm)' }}>
                    {g.name}
                  </h3>
                  <div className="font-semibold" style={{ fontSize: 'var(--font-size-label)' }}>
                    {g.tagline}
                  </div>
                  <p
                    style={{
                      color: 'var(--muted-foreground)',
                      fontSize: 'var(--font-size-small)',
                      marginTop: 'var(--spacing-xs)',
                      lineHeight: 1.6,
                    }}
                  >
                    {g.description}
                  </p>

                  {profile ? (
                    <div style={{ marginTop: 'var(--spacing-md)' }}>
                      <div
                        role="progressbar"
                        aria-label={`${g.name} stars`}
                        aria-valuemin={0}
                        aria-valuemax={MAX_GRADE_STARS}
                        aria-valuenow={stars}
                        style={{ height: 12, borderRadius: 999, background: 'oklch(1 0 0 / 0.8)', overflow: 'hidden' }}
                      >
                        <div
                          style={{
                            width: `${Math.min(100, (stars / MAX_GRADE_STARS) * 100)}%`,
                            height: '100%',
                            borderRadius: 999,
                            background: topicColor(g.color),
                          }}
                        />
                      </div>
                      <div
                        className="flex justify-between font-bold"
                        style={{ marginTop: 6, fontSize: 'var(--font-size-small)', color: 'var(--muted-foreground)' }}
                      >
                        <span>★ {stars} / {MAX_GRADE_STARS}</span>
                        <span style={{ color: topicText(g.color), display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          {stars > 0 ? 'Keep going' : 'Start practicing'} <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="flex items-center font-bold"
                      style={{
                        gap: 'var(--spacing-xs)',
                        marginTop: 'var(--spacing-md)',
                        color: topicText(g.color),
                        fontSize: 'var(--font-size-label)',
                      }}
                    >
                      Start practicing <ArrowRight size={16} />
                    </div>
                  )}
                </Link>
              </HoverLift>
            )
          })}
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
                  className="inline-flex items-center justify-center rounded-2xl"
                  style={{
                    width: 48,
                    height: 48,
                    background: topicColor(color),
                    color: topicInk(color),
                    transform: 'rotate(-4deg)',
                    boxShadow: `0 3px 0 ${topicEdge(color)}`,
                  }}
                >
                  <Icon size={24} strokeWidth={2.3} />
                </span>
                <h3 className="font-bold" style={{ fontSize: 'var(--font-size-body)', marginTop: 'var(--spacing-sm)' }}>
                  {title}
                </h3>
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
