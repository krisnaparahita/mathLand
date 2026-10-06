import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BookOpen, Clock, Infinity as InfinityIcon, Lock, Play, RotateCcw } from 'lucide-react'
import { FadeIn, HoverLift, Stagger } from '@/components/MotionPrimitives'
import { Stars } from '@/components/Stars'
import { TopicIcon } from '@/components/TopicIcon'
import { getGrade, getTopic, topicColor, topicEdge, topicInk, topicSoft, topicText } from '@/curriculum'
import { useProfile } from '@/context/ProfileContext'
import { resultsApi } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import NotFound from './NotFound'

export default function LevelsPage() {
  const { grade: gradeParam, topicId } = useParams()
  const gradeNumber = Number(gradeParam)
  const gradeInfo = getGrade(gradeNumber)
  const topic = topicId ? getTopic(gradeNumber, topicId) : undefined
  const { profile } = useProfile()
  const navigate = useNavigate()

  const { data: levels = [] } = useQuery({
    queryKey: ['level-progress', profile?.id, gradeNumber, topicId],
    queryFn: () => resultsApi.levelProgress(profile!.id, gradeNumber),
    enabled: Boolean(profile) && Boolean(topic),
  })

  if (!gradeInfo || !topic) return <NotFound />

  const bestMap = new Map(levels.filter((l) => l.topicId === topic.id).map((l) => [l.level, l]))

  const isUnlocked = (level: number): boolean => {
    if (level === 1) return true
    return (bestMap.get(level - 1)?.bestStars ?? 0) >= 1
  }

  return (
    <main className="container" style={{ paddingBottom: 'var(--spacing-3xl)', maxWidth: 960 }}>
      <Link
        to={`/grades/${gradeNumber}`}
        className="inline-flex items-center cursor-pointer font-semibold"
        style={{
          gap: 'var(--spacing-xs)',
          marginTop: 'var(--spacing-lg)',
          color: 'var(--muted-foreground)',
          fontSize: 'var(--font-size-label)',
        }}
      >
        <ArrowLeft size={16} /> Back to {gradeInfo.name}
      </Link>

      <FadeIn>
        <section
          className="clay flex items-center justify-between flex-wrap"
          style={{
            marginTop: 'var(--spacing-md)',
            padding: 'var(--spacing-lg)',
            gap: 'var(--spacing-md)',
            background: topicSoft(topic.color),
            borderColor: `color-mix(in oklch, ${topicColor(topic.color)} 55%, white)`,
            boxShadow: `0 6px 0 color-mix(in oklch, ${topicColor(topic.color)} 55%, white)`,
          }}
        >
          <div className="flex items-center" style={{ gap: 'var(--spacing-md)' }}>
            <TopicIcon icon={topic.icon} color={topic.color} size={56} />
            <div>
              <div style={{ fontSize: 'var(--font-size-small)', color: 'var(--muted-foreground)' }}>
                {gradeInfo.name} · {topic.name}
              </div>
              <h1 className="font-bold text-title">Choose a level</h1>
              <div style={{ fontSize: 'var(--font-size-small)', color: 'var(--muted-foreground)', marginTop: 4 }}>
                Questions are regenerated every time, so a level never repeats the previous round
              </div>
            </div>
          </div>
          <Link
            to={`/study/${gradeNumber}/${topic.id}`}
            className="clay cursor-pointer inline-flex items-center font-semibold"
            style={{
              gap: 'var(--spacing-xs)',
              paddingInline: 'var(--spacing-md)',
              paddingBlock: 'var(--spacing-xs)',
              fontSize: 'var(--font-size-label)',
              color: topicText(topic.color),
              borderRadius: '999px',
            }}
          >
            <BookOpen size={15} /> Review concepts and smart tricks
          </Link>
        </section>
      </FadeIn>

      {/* ── Level trail ── */}
      <FadeIn>
        <ol
          aria-label="Levels"
          className="relative flex justify-between items-start"
          style={{
            listStyle: 'none',
            margin: 'var(--spacing-xl) 0 0',
            padding: 'var(--spacing-md) var(--spacing-xs) 0',
            gap: 'var(--spacing-xs)',
          }}
        >
          <span
            aria-hidden="true"
            className="hidden sm:block"
            style={{
              position: 'absolute',
              left: '8%',
              right: '8%',
              top: 54,
              borderTop: `6px dotted color-mix(in oklch, ${topicColor(topic.color)} 45%, white)`,
            }}
          />
          {topic.levels.map((meta, i) => {
            const best = bestMap.get(meta.level)
            const unlocked = isUnlocked(meta.level)
            const isCurrent = unlocked && (best?.bestStars ?? 0) === 0
            return (
              <li
                key={meta.level}
                className="flex flex-col items-center"
                style={{ flex: 1, minWidth: 0, gap: 6, position: 'relative', marginTop: i % 2 === 1 ? 24 : 0 }}
              >
                <button
                  type="button"
                  disabled={!unlocked}
                  onClick={() => navigate(`/play/${gradeNumber}/${topic.id}/${meta.level}`)}
                  aria-label={
                    unlocked
                      ? `Level ${meta.level}, ${meta.name}, ${best?.bestStars ?? 0} stars`
                      : `Level ${meta.level}, locked`
                  }
                  className={`font-display ${unlocked ? 'clay-solid cursor-pointer' : ''} ${isCurrent ? 'animate-wiggle' : ''}`}
                  style={{
                    width: 'clamp(54px, 13vw, 76px)',
                    height: 'clamp(54px, 13vw, 76px)',
                    borderRadius: '50%',
                    fontSize: 'clamp(1.4rem, 4vw, 1.9rem)',
                    fontWeight: 700,
                    display: 'grid',
                    placeItems: 'center',
                    background: unlocked ? topicColor(topic.color) : 'var(--muted)',
                    color: unlocked ? topicInk(topic.color) : 'var(--muted-foreground)',
                    border: unlocked ? undefined : '3px solid var(--border)',
                    boxShadow: unlocked ? `0 6px 0 ${topicEdge(topic.color)}` : '0 4px 0 var(--border)',
                    cursor: unlocked ? 'pointer' : 'not-allowed',
                  }}
                >
                  {unlocked ? meta.level : <Lock size={22} />}
                </button>
                <span className="font-display font-semibold text-center" style={{ fontSize: 'var(--font-size-small)' }}>
                  {meta.name}
                </span>
                {unlocked ? (
                  <Stars value={best?.bestStars ?? 0} size={13} />
                ) : (
                  <span style={{ fontSize: 11, color: 'var(--muted-foreground)', textAlign: 'center' }}>Locked</span>
                )}
              </li>
            )
          })}
        </ol>
      </FadeIn>

      <Stagger className="flex flex-col" style={{ gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }} stagger={0.07}>
        {topic.levels.map((meta) => {
          const best = bestMap.get(meta.level)
          const unlocked = isUnlocked(meta.level)
          const totalSeconds = meta.questionCount * meta.secondsPerQuestion
          return (
            <HoverLift key={meta.level} lift={unlocked ? -5 : 0}>
              <div
                className="clay"
                style={{
                  padding: 'var(--spacing-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-md)',
                  flexWrap: 'wrap',
                  opacity: unlocked ? 1 : 0.62,
                  borderColor: unlocked ? `color-mix(in oklch, ${topicColor(topic.color)} 45%, white)` : undefined,
                  boxShadow: unlocked ? `0 5px 0 color-mix(in oklch, ${topicColor(topic.color)} 45%, white)` : undefined,
                }}
              >
                <div
                  className="inline-flex items-center justify-center rounded-2xl font-bold"
                  style={{
                    width: 56,
                    height: 56,
                    background: unlocked ? topicSoft(topic.color) : 'var(--muted)',
                    color: unlocked ? topicText(topic.color) : 'var(--muted-foreground)',
                    fontSize: 'var(--font-size-title)',
                    flexShrink: 0,
                  }}
                >
                  {meta.level}
                </div>

                <div style={{ flex: 1, minWidth: 220 }}>
                  <div className="flex items-center" style={{ gap: 'var(--spacing-sm)' }}>
                    <span className="font-bold" style={{ fontSize: 'var(--font-size-body)' }}>
                      {meta.name}
                    </span>
                    <Stars value={best?.bestStars ?? 0} size={15} />
                  </div>
                  <div
                    style={{
                      fontSize: 'var(--font-size-small)',
                      color: 'var(--muted-foreground)',
                      marginTop: 2,
                    }}
                  >
                    {meta.goal}
                  </div>
                  <div
                    className="flex items-center flex-wrap"
                    style={{
                      gap: 'var(--spacing-sm)',
                      marginTop: 'var(--spacing-xs)',
                      fontSize: 'var(--font-size-small)',
                      color: 'var(--muted-foreground)',
                    }}
                  >
                    <span className="inline-flex items-center" style={{ gap: 4 }}>
                      <Clock size={13} /> {meta.questionCount} questions · {meta.secondsPerQuestion} sec each
                    </span>
                    <span>Total {Math.floor(totalSeconds / 60)} min {totalSeconds % 60} sec</span>
                    {best && <span>Best {best.bestScore} pts</span>}
                  </div>
                </div>

                {unlocked ? (
                  <div className="flex flex-col items-stretch" style={{ gap: 'var(--spacing-xs)' }}>
                    <button
                      type="button"
                      onClick={() => navigate(`/play/${gradeNumber}/${topic.id}/${meta.level}`)}
                      className="clay-solid cursor-pointer inline-flex items-center justify-center font-bold"
                      style={{
                        gap: 'var(--spacing-xs)',
                        paddingInline: 'var(--spacing-lg)',
                        paddingBlock: 'var(--spacing-sm)',
                        background: topicColor(topic.color),
                        color: topicInk(topic.color),
                        borderRadius: '999px',
                        fontSize: 'var(--font-size-body)',
                      }}
                    >
                      {best ? <RotateCcw size={16} /> : <Play size={16} />}
                      {best ? 'Play again' : 'Start'}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/play/${gradeNumber}/${topic.id}/${meta.level}?mode=relax`)}
                      className="cursor-pointer inline-flex items-center justify-center font-semibold"
                      style={{
                        gap: 4,
                        fontSize: 'var(--font-size-small)',
                        color: 'var(--muted-foreground)',
                      }}
                    >
                      <InfinityIcon size={13} /> Untimed practice
                    </button>
                  </div>
                ) : (
                  <span
                    className="inline-flex items-center font-semibold"
                    style={{
                      gap: 'var(--spacing-xs)',
                      paddingInline: 'var(--spacing-md)',
                      paddingBlock: 'var(--spacing-sm)',
                      background: 'var(--muted)',
                      color: 'var(--muted-foreground)',
                      borderRadius: '999px',
                      fontSize: 'var(--font-size-label)',
                    }}
                  >
                    <Lock size={15} /> Pass level {meta.level - 1} first
                  </span>
                )}
              </div>
            </HoverLift>
          )
        })}
      </Stagger>
    </main>
  )
}
