import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Lightbulb, Play, ScrollText, Sparkles } from 'lucide-react'
import { FadeIn, HoverLift, Stagger } from '@/components/MotionPrimitives'
import { TopicIcon } from '@/components/TopicIcon'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getGrade, getTopic, topicColor, topicSoft } from '@/curriculum'
import NotFound from './NotFound'

export default function StudyPage() {
  const { grade: gradeParam, topicId } = useParams()
  const gradeNumber = Number(gradeParam)
  const gradeInfo = getGrade(gradeNumber)
  const topic = topicId ? getTopic(gradeNumber, topicId) : undefined

  if (!gradeInfo || !topic) return <NotFound />

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
          className="clay flex items-start"
          style={{
            marginTop: 'var(--spacing-md)',
            padding: 'var(--spacing-lg)',
            gap: 'var(--spacing-md)',
            background: `linear-gradient(120deg, ${topicSoft(topic.color)}, var(--card))`,
          }}
        >
          <TopicIcon icon={topic.icon} color={topic.color} size={64} />
          <div>
            <div style={{ fontSize: 'var(--font-size-small)', color: 'var(--muted-foreground)' }}>
              {gradeInfo.name} · {topic.name}
            </div>
            <h1 className="font-bold text-title" style={{ color: topicColor(topic.color) }}>
              {topic.name}
            </h1>
            <p style={{ fontSize: 'var(--font-size-body)', marginTop: 'var(--spacing-xs)' }}>
              {topic.summary}
            </p>
          </div>
        </section>
      </FadeIn>

      <section style={{ marginTop: 'var(--spacing-lg)' }}>
        <Tabs defaultValue="explain">
          <TabsList
            style={{
              background: 'var(--muted)',
              borderRadius: 'var(--radius)',
              padding: 'var(--spacing-xs)',
              gap: 'var(--spacing-xs)',
            }}
          >
            <TabsTrigger
              value="explain"
              className="cursor-pointer font-semibold"
              style={{ borderRadius: 'var(--radius)', fontSize: 'var(--font-size-label)' }}
            >
              <span className="inline-flex items-center" style={{ gap: 'var(--spacing-xs)' }}>
                <ScrollText size={15} /> Concepts
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="smart"
              className="cursor-pointer font-semibold"
              style={{ borderRadius: 'var(--radius)', fontSize: 'var(--font-size-label)' }}
            >
              <span className="inline-flex items-center" style={{ gap: 'var(--spacing-xs)' }}>
                <Lightbulb size={15} /> Smart tricks
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="explain" style={{ marginTop: 'var(--spacing-md)' }}>
            <Stagger className="flex flex-col" style={{ gap: 'var(--spacing-md)' }} stagger={0.08}>
              {topic.explanation.map((block, index) => (
                <HoverLift key={block.title} lift={-3}>
                  <article className="clay" style={{ padding: 'var(--spacing-lg)' }}>
                    <div className="flex items-center" style={{ gap: 'var(--spacing-sm)' }}>
                      <span
                        className="inline-flex items-center justify-center rounded-full font-bold"
                        style={{
                          width: 28,
                          height: 28,
                          background: topicSoft(topic.color),
                          color: topicColor(topic.color),
                          fontSize: 'var(--font-size-small)',
                        }}
                      >
                        {index + 1}
                      </span>
                      <h2 className="font-bold" style={{ fontSize: 'var(--font-size-body)' }}>
                        {block.title}
                      </h2>
                    </div>
                    <p
                      style={{
                        marginTop: 'var(--spacing-sm)',
                        lineHeight: 1.8,
                        fontSize: 'var(--font-size-body)',
                      }}
                    >
                      {block.body}
                    </p>
                    {block.example && (
                      <div
                        className="clay-inset"
                        style={{
                          marginTop: 'var(--spacing-sm)',
                          padding: 'var(--spacing-md)',
                          background: topicSoft(topic.color),
                          fontSize: 'var(--font-size-label)',
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                        }}
                      >
                        <span style={{ color: 'var(--muted-foreground)' }}>Example: </span>
                        {block.example}
                      </div>
                    )}
                  </article>
                </HoverLift>
              ))}
            </Stagger>
          </TabsContent>

          <TabsContent value="smart" style={{ marginTop: 'var(--spacing-md)' }}>
            <Stagger className="flex flex-col" style={{ gap: 'var(--spacing-md)' }} stagger={0.08}>
              {topic.smartMethods.map((method, index) => (
                <HoverLift key={method.name} lift={-3}>
                  <article
                    className="clay"
                    style={{
                      padding: 'var(--spacing-lg)',
                      borderLeft: `6px solid ${topicColor(topic.color)}`,
                    }}
                  >
                    <div className="flex items-center" style={{ gap: 'var(--spacing-sm)' }}>
                      <Sparkles size={18} color={topicColor(topic.color)} />
                      <h2 className="font-bold" style={{ fontSize: 'var(--font-size-body)' }}>
                        Smart trick {index + 1}: {method.name}
                      </h2>
                    </div>

                    <div
                      style={{
                        marginTop: 'var(--spacing-sm)',
                        fontSize: 'var(--font-size-label)',
                        color: 'var(--muted-foreground)',
                      }}
                    >
                      <span className="font-semibold" style={{ color: 'var(--foreground)' }}>
                        When to use it:
                      </span>
                      {method.when}
                    </div>

                    <ol
                      style={{
                        marginTop: 'var(--spacing-sm)',
                        paddingLeft: 'var(--spacing-lg)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--spacing-xs)',
                        fontSize: 'var(--font-size-body)',
                      }}
                    >
                      {method.steps.map((step, i) => (
                        <li key={i} style={{ lineHeight: 1.7 }}>
                          {step}
                        </li>
                      ))}
                    </ol>

                    <div
                      className="clay-inset"
                      style={{
                        marginTop: 'var(--spacing-sm)',
                        padding: 'var(--spacing-md)',
                        background: topicSoft(topic.color),
                        fontSize: 'var(--font-size-label)',
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                      }}
                    >
                      <span style={{ color: 'var(--muted-foreground)' }}>Example: </span>
                      {method.example}
                    </div>
                  </article>
                </HoverLift>
              ))}
            </Stagger>
          </TabsContent>
        </Tabs>
      </section>

      <FadeIn>
        <section
          className="clay flex flex-wrap items-center justify-between"
          style={{
            marginTop: 'var(--spacing-xl)',
            padding: 'var(--spacing-lg)',
            gap: 'var(--spacing-md)',
            background: `linear-gradient(120deg, var(--card), ${topicSoft(topic.color)})`,
          }}
        >
          <div>
            <div className="font-bold" style={{ fontSize: 'var(--font-size-body)' }}>
              Ready? Try it out in the levels!
            </div>
            <div style={{ fontSize: 'var(--font-size-small)', color: 'var(--muted-foreground)' }}>
              {topic.levels.length} levels with rising difficulty, and the questions change every time.
            </div>
          </div>
          <Link
            to={`/levels/${gradeNumber}/${topic.id}`}
            className="clay-solid cursor-pointer inline-flex items-center font-bold"
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
            <Play size={18} /> Play levels <ArrowRight size={16} />
          </Link>
        </section>
      </FadeIn>
    </main>
  )
}
