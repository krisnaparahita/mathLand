import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BookOpen, Clock, Infinity as InfinityIcon, Lock, Play, RotateCcw } from 'lucide-react'
import { FadeIn, HoverLift, Stagger } from '@/components/MotionPrimitives'
import { Stars } from '@/components/Stars'
import { TopicIcon } from '@/components/TopicIcon'
import { getGrade, getTopic, topicColor, topicSoft } from '@/curriculum'
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
            background: `linear-gradient(120deg, ${topicSoft(topic.color)}, var(--card))`,
          }}
        >
          <div className="flex items-center" style={{ gap: 'var(--spacing-md)' }}>
            <TopicIcon icon={topic.icon} color={topic.color} size={56} />
            <div>
              <div style={{ fontSize: 'var(--font-size-small)', color: 'var(--muted-foreground)' }}>
                {gradeInfo.name} · {topic.name}
              </div>
              <h1 className="font-bold text-title" style={{ color: topicColor(topic.color) }}>
                Choose a level
              </h1>
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
              color: topicColor(topic.color),
              borderRadius: 'var(--radius)',
            }}
          >
            <BookOpen size={15} /> Review concepts and smart tricks
          </Link>
        </section>
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
                  borderLeft: `8px solid ${unlocked ? topicColor(topic.color) : 'var(--border)'}`,
                }}
              >
                <div
                  className="inline-flex items-center justify-center rounded-2xl font-bold"
                  style={{
                    width: 56,
                    height: 56,
                    background: unlocked ? topicSoft(topic.color) : 'var(--muted)',
                    color: unlocked ? topicColor(topic.color) : 'var(--muted-foreground)',
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
                        color: 'var(--card)',
                        borderRadius: 'var(--radius)',
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
                      borderRadius: 'var(--radius)',
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
