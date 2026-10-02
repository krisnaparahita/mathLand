import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BookOpen, Play } from 'lucide-react'
import { FadeIn, HoverLift, Stagger } from '@/components/MotionPrimitives'
import { Stars } from '@/components/Stars'
import { TopicIcon } from '@/components/TopicIcon'
import { getGrade, topicColor, topicSoft } from '@/curriculum'
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
        <ArrowLeft size={16} /> 返回首页
      </Link>

      <FadeIn>
        <section
          className="clay"
          style={{
            marginTop: 'var(--spacing-md)',
            padding: 'var(--spacing-xl)',
            background: `linear-gradient(120deg, ${topicSoft(gradeInfo.color)}, var(--card))`,
            borderLeft: `8px solid ${topicColor(gradeInfo.color)}`,
          }}
        >
          <div
            className="flex flex-wrap items-center justify-between"
            style={{ gap: 'var(--spacing-md)' }}
          >
            <div>
              <h1 className="font-bold text-headline" style={{ color: topicColor(gradeInfo.color) }}>
                {gradeInfo.name}
              </h1>
              <p style={{ fontSize: 'var(--font-size-body)', marginTop: 'var(--spacing-xs)' }}>
                {gradeInfo.description}
              </p>
            </div>
            <div
              className="clay"
              style={{ padding: 'var(--spacing-md)', minWidth: 150, textAlign: 'center' }}
            >
              <div style={{ fontSize: 'var(--font-size-small)', color: 'var(--muted-foreground)' }}>
                本年级累计星星
              </div>
              <div
                className="font-bold"
                style={{ fontSize: 'var(--font-size-title)', color: topicColor(gradeInfo.color) }}
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
          <h2 className="font-bold text-title">选择专题</h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--font-size-label)' }}>
            先点「学习方法」看懂巧算技巧，再点「开始闯关」练手。
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
                <div className="clay clay-hover h-full flex flex-col" style={{ padding: 'var(--spacing-lg)' }}>
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
                    <span>已练 {p?.plays ?? 0} 次</span>
                    {p ? <span>最佳 {p.bestScore} 分</span> : <span>还没有成绩</span>}
                  </div>

                  <div className="flex" style={{ gap: 'var(--spacing-xs)', marginTop: 'var(--spacing-sm)' }}>
                    <Link
                      to={`/study/${gradeNumber}/${topic.id}`}
                      className="clay cursor-pointer flex-1 inline-flex items-center justify-center font-semibold"
                      style={{
                        gap: 'var(--spacing-xs)',
                        paddingBlock: 'var(--spacing-xs)',
                        fontSize: 'var(--font-size-label)',
                        color: topicColor(topic.color),
                        borderRadius: 'var(--radius)',
                      }}
                    >
                      <BookOpen size={15} /> 学习方法
                    </Link>
                    <Link
                      to={`/levels/${gradeNumber}/${topic.id}`}
                      className="clay-solid cursor-pointer flex-1 inline-flex items-center justify-center font-semibold"
                      style={{
                        gap: 'var(--spacing-xs)',
                        paddingBlock: 'var(--spacing-xs)',
                        fontSize: 'var(--font-size-label)',
                        background: topicColor(topic.color),
                        color: 'var(--card)',
                        borderRadius: 'var(--radius)',
                      }}
                    >
                      <Play size={15} /> 开始闯关
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
          className="clay cursor-pointer inline-flex items-center font-semibold"
          style={{
            gap: 'var(--spacing-xs)',
            paddingInline: 'var(--spacing-lg)',
            paddingBlock: 'var(--spacing-sm)',
            fontSize: 'var(--font-size-label)',
          }}
        >
          换个年级看看 <ArrowRight size={16} />
        </Link>
      </div>
    </main>
  )
}
