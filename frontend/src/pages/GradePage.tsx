import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BookOpen, Play } from 'lucide-react'
import { FadeIn, HoverLift, Stagger } from '@/components/MotionPrimitives'
import { Stars } from '@/components/Stars'
import { TopicIcon } from '@/components/TopicIcon'
import { getGrade, topicColor, topicEdge, topicInk, topicSoft, topicText } from '@/curriculum'
import { useProfile } from '@/context/ProfileContext'
import { resultsApi } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import NotFound from './NotFound'

export default function GradePage() {
  const { grade: gradeParam } = useParams()
  const gradeNumber = Number(gradeParam)
  const gradeInfo = getGrade(gradeNumber)
  const { profile } = useProfile()

  const { data: progress = [] } = useQuery({
    queryKey: ['topic-progress', profile?.id, gradeNumber],
    queryFn: () => resultsApi.topicProgress(profile!.id, gradeNumber),
    enabled: Boolean(profile) && Boolean(gradeInfo),
  })

  if (!gradeInfo) return <NotFound />

  const progressMap = new Map(progress.map((p) => [p.topicId, p]))
  const totalStars = progress.reduce((sum, p) => sum + p.bestStars, 0)
  const maxStars = gradeInfo.topics.length * 3

  return (
    <main className="container" style={{ paddingBottom: 'var(--spacing-3xl)' }}>
      <Link
        to="/"
        className="inline-flex items-center cursor-pointer font-semibold"
        style={{
          gap: 'var(--spacing-xs)',
          marginTop: 'var(--spacing-lg)',
          color: 'var(--muted-foreground)',
          fontSize: 'var(--font-size-label)',
        }}
      >
        <ArrowLeft size={16} /> Back to home
      </Link>

      <FadeIn>
        <section
          className="clay"
          style={{
            marginTop: 'var(--spacing-md)',
            padding: 'var(--spacing-xl)',
            background: topicSoft(gradeInfo.color),
            borderColor: `color-mix(in oklch, ${topicColor(gradeInfo.color)} 55%, white)`,
            boxShadow: `0 6px 0 color-mix(in oklch, ${topicColor(gradeInfo.color)} 55%, white)`,
          }}
        >
          <div
            className="flex flex-wrap items-center justify-between"
            style={{ gap: 'var(--spacing-md)' }}
          >
            <div className="flex items-center" style={{ gap: 'var(--spacing-md)' }}>
              <span
                className="font-display inline-flex items-center justify-center shrink-0"
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 24,
                  background: topicColor(gradeInfo.color),
                  color: topicInk(gradeInfo.color),
                  fontSize: '2.4rem',
                  fontWeight: 700,
                  transform: 'rotate(-5deg)',
                  boxShadow: `0 5px 0 ${topicEdge(gradeInfo.color)}`,
                }}
              >
                {gradeInfo.grade}
              </span>
              <div>
                <h1 className="font-bold text-headline">{gradeInfo.name}</h1>
                <p style={{ fontSize: 'var(--font-size-body)', marginTop: 'var(--spacing-xs)', maxWidth: '52ch' }}>
                  {gradeInfo.description}
                </p>
              </div>
            </div>
            <div
              className="clay"
              style={{ padding: 'var(--spacing-md)', minWidth: 150, textAlign: 'center' }}
            >
              <div style={{ fontSize: 'var(--font-size-small)', color: 'var(--muted-foreground)' }}>
                Stars earned this grade
              </div>
              <div
                className="font-bold"
                style={{ fontSize: 'var(--font-size-title)', color: topicText(gradeInfo.color) }}
              >
                {totalStars} / {maxStars}
              </div>
              <div className="flex justify-center" style={{ marginTop: 'var(--spacing-xs)' }}>
                <Stars value={Math.round((totalStars / maxStars) * 3)} size={16} />
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      <section style={{ marginTop: 'var(--spacing-xl)' }}>
        <FadeIn>
          <h2 className="font-bold text-title">Choose a topic</h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--font-size-label)' }}>
            Open the Study Guide first to learn the smart tricks, then press Play to practice.
          </p>
        </FadeIn>

        <Stagger
          className="grid md:grid-cols-2 lg:grid-cols-3"
          style={{ gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}
          stagger={0.07}
        >
          {gradeInfo.topics.map((topic) => {
            const p = progressMap.get(topic.id)
            return (
              <HoverLift key={topic.id} lift={-6}>
                <div
                  className="clay clay-hover h-full flex flex-col"
                  style={{
                    padding: 'var(--spacing-lg)',
                    borderColor: `color-mix(in oklch, ${topicColor(topic.color)} 45%, white)`,
                    boxShadow: `0 5px 0 color-mix(in oklch, ${topicColor(topic.color)} 45%, white)`,
                  }}
                >
                  <div className="flex items-start" style={{ gap: 'var(--spacing-sm)' }}>
                    <TopicIcon icon={topic.icon} color={topic.color} size={52} />
                    <div className="flex-1">
                      <div className="font-bold" style={{ fontSize: 'var(--font-size-body)' }}>
                        {topic.name}
                      </div>
                      <div style={{ marginTop: 2 }}>
                        <Stars value={p?.bestStars ?? 0} size={14} />
                      </div>
                    </div>
                  </div>

                  <p
                    style={{
                      color: 'var(--muted-foreground)',
                      fontSize: 'var(--font-size-small)',
                      marginTop: 'var(--spacing-sm)',
                      lineHeight: 1.7,
                      flex: 1,
                    }}
                  >
                    {topic.summary}
                  </p>

                  <div
                    className="flex items-center justify-between"
                    style={{
                      marginTop: 'var(--spacing-md)',
                      paddingTop: 'var(--spacing-sm)',
                      borderTop: '2px dashed var(--border)',
                      fontSize: 'var(--font-size-small)',
                      color: 'var(--muted-foreground)',
                    }}
                  >
                    <span className="font-semibold">Played {p?.plays ?? 0} {p?.plays === 1 ? 'time' : 'times'}</span>
                    {p ? <span>Best {p.bestScore} pts</span> : <span>No results yet</span>}
                  </div>

                  <div className="flex" style={{ gap: 'var(--spacing-xs)', marginTop: 'var(--spacing-sm)' }}>
                    <Link
                      to={`/study/${gradeNumber}/${topic.id}`}
                      className="clay cursor-pointer flex-1 inline-flex items-center justify-center font-semibold"
                      style={{
                        gap: 'var(--spacing-xs)',
                        paddingBlock: 'var(--spacing-xs)',
                        fontSize: 'var(--font-size-label)',
                        color: topicText(topic.color),
                        borderRadius: '999px',
                      }}
                    >
                      <BookOpen size={15} /> Study Guide
                    </Link>
                    <Link
                      to={`/levels/${gradeNumber}/${topic.id}`}
                      className="clay-solid cursor-pointer flex-1 inline-flex items-center justify-center font-semibold"
                      style={{
                        gap: 'var(--spacing-xs)',
                        paddingBlock: 'var(--spacing-xs)',
                        fontSize: 'var(--font-size-label)',
                        background: topicColor(topic.color),
                        color: topicInk(topic.color),
                        borderRadius: '999px',
                      }}
                    >
                      <Play size={15} /> Play
                    </Link>
                  </div>
                </div>
              </HoverLift>
            )
          })}
        </Stagger>
      </section>

      <div className="flex justify-center" style={{ marginTop: 'var(--spacing-xl)' }}>
        <Link
          to={profile ? `/grades/${gradeNumber === 6 ? 1 : gradeNumber + 1}` : '/profile'}
          className="clay clay-hover cursor-pointer inline-flex items-center font-bold"
          style={{
            borderRadius: '999px',
            gap: 'var(--spacing-xs)',
            paddingInline: 'var(--spacing-lg)',
            paddingBlock: 'var(--spacing-sm)',
            fontSize: 'var(--font-size-label)',
          }}
        >
          Try another grade <ArrowRight size={16} />
        </Link>
      </div>
    </main>
  )
}
