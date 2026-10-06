import { Link } from 'react-router-dom'
import { Bug, ExternalLink, Github, GitPullRequest, Heart, Lightbulb, Users } from 'lucide-react'
import { FadeIn, HoverLift, Stagger } from '@/components/MotionPrimitives'
import { topicColor, topicEdge, topicInk } from '@/curriculum'
import { SITE } from '@/lib/site'

const STORY = [
  {
    Icon: Heart,
    title: 'Why I built MathLand',
    color: 'pink',
    paragraphs: [
      'I built MathLand to help my son learn math step by step. Math sticks when you practice it again and again, one small level at a time, and when every mistake is explained right away instead of being left as a red mark on a page.',
      'So every topic starts with a short explanation and a few smart tricks, then moves through levels that get a little harder each time. Questions are different on every visit, so he can come back to the same level as often as he needs.',
    ],
  },
  {
    Icon: Users,
    title: 'For busy parents, especially fathers',
    color: 'indigo',
    paragraphs: [
      'Many of us are busy with work and cannot sit next to our kids for every study session, but we still want to be part of it. MathLand gives a busy dad a way to stay involved in his child\'s math.',
      'The result history, practice streak and topic mastery show where your child is doing well and where they need a hand. Even five minutes in the evening can turn into a good conversation: "I saw you got three stars on fractions. Show me how you did it!"',
    ],
  },
]

const WAYS_TO_HELP = [
  {
    Icon: Lightbulb,
    color: 'yellow',
    title: 'Share an idea',
    body: 'New topics, clearer explanations, better smart tricks, or a feature that would help your own child or students.',
    href: SITE.issuesUrl,
    label: 'Open an issue',
  },
  {
    Icon: Bug,
    color: 'orange',
    title: 'Report a problem',
    body: 'Found a wrong answer, a confusing question or a bug? Tell us what happened and we will fix it.',
    href: SITE.issuesUrl,
    label: 'Report a bug',
  },
  {
    Icon: GitPullRequest,
    color: 'green',
    title: 'Contribute code',
    body: 'Fix a bug, improve the design, add translations or write new question generators. Pull requests are welcome.',
    href: SITE.pullRequestsUrl,
    label: 'View pull requests',
  },
]

export default function AboutPage() {
  return (
    <main className="container" style={{ paddingBottom: 'var(--spacing-3xl)' }}>
      <FadeIn style={{ marginTop: 'var(--spacing-xl)' }}>
        <h1 className="font-bold text-display" style={{ letterSpacing: 'var(--letter-spacing-tight)' }}>
          About MathLand
        </h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--font-size-body)', marginTop: 'var(--spacing-xs)' }}>
          A free math practice site for primary grades 1–6, built by a father for his son.
        </p>
      </FadeIn>

      <Stagger
        className="grid lg:grid-cols-2"
        style={{ gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}
        stagger={0.1}
      >
        {STORY.map(({ Icon, title, color, paragraphs }) => (
          <div key={title} className="clay h-full" style={{ padding: 'var(--spacing-lg)' }}>
            <span
              className="inline-flex items-center justify-center rounded-xl"
              style={{
                width: 48,
                height: 48,
                background: topicColor(color),
                color: topicInk(color),
                transform: 'rotate(-4deg)',
                boxShadow: `0 3px 0 ${topicEdge(color)}`,
              }}
            >
              <Icon size={22} strokeWidth={2.3} />
            </span>
            <h2 className="font-bold text-title" style={{ marginTop: 'var(--spacing-sm)' }}>
              {title}
            </h2>
            {paragraphs.map((text) => (
              <p
                key={text}
                style={{
                  color: 'var(--muted-foreground)',
                  fontSize: 'var(--font-size-label)',
                  lineHeight: 1.8,
                  marginTop: 'var(--spacing-sm)',
                }}
              >
                {text}
              </p>
            ))}
          </div>
        ))}
      </Stagger>

      <section style={{ marginTop: 'var(--spacing-2xl)' }}>
        <FadeIn>
          <h2 className="font-bold text-title" style={{ letterSpacing: 'var(--letter-spacing-tight)' }}>
            Help us make it better
          </h2>
          <p
            style={{
              color: 'var(--muted-foreground)',
              fontSize: 'var(--font-size-label)',
              lineHeight: 1.8,
              marginTop: 'var(--spacing-xs)',
              maxWidth: '65ch',
            }}
          >
            MathLand is open source and the code is public on GitHub. If you are a parent, teacher or developer and want to
            improve it, you are very welcome to contribute. Every idea, fix and translation helps more kids enjoy math.
          </p>
        </FadeIn>

        <Stagger
          className="grid sm:grid-cols-3"
          style={{ gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}
          stagger={0.08}
        >
          {WAYS_TO_HELP.map(({ Icon, color, title, body, href, label }) => (
            <HoverLift key={title} lift={-5}>
              <div className="clay h-full flex flex-col" style={{ padding: 'var(--spacing-lg)' }}>
                <span
                  className="inline-flex items-center justify-center rounded-xl"
                  style={{
                    width: 48,
                    height: 48,
                    background: topicColor(color),
                    color: topicInk(color),
                    transform: 'rotate(-4deg)',
                    boxShadow: `0 3px 0 ${topicEdge(color)}`,
                  }}
                >
                  <Icon size={22} strokeWidth={2.3} />
                </span>
                <div className="font-bold" style={{ fontSize: 'var(--font-size-body)', marginTop: 'var(--spacing-sm)' }}>
                  {title}
                </div>
                <p
                  className="flex-1"
                  style={{
                    color: 'var(--muted-foreground)',
                    fontSize: 'var(--font-size-small)',
                    lineHeight: 1.7,
                    marginTop: 'var(--spacing-xs)',
                  }}
                >
                  {body}
                </p>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center font-semibold cursor-pointer"
                  style={{
                    gap: 'var(--spacing-xs)',
                    color: 'var(--primary)',
                    fontSize: 'var(--font-size-small)',
                    marginTop: 'var(--spacing-sm)',
                  }}
                >
                  {label} <ExternalLink size={14} />
                </a>
              </div>
            </HoverLift>
          ))}
        </Stagger>

        <FadeIn style={{ marginTop: 'var(--spacing-lg)' }} className="flex flex-wrap items-center" >
          <a
            href={SITE.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="clay-solid inline-flex items-center font-bold cursor-pointer"
            style={{
              gap: 'var(--spacing-xs)',
              paddingInline: 'var(--spacing-lg)',
              paddingBlock: 'var(--spacing-sm)',
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
              borderRadius: '999px',
            }}
          >
            <Github size={18} /> View MathLand on GitHub
          </a>
          <Link
            to="/"
            className="font-semibold cursor-pointer"
            style={{ color: 'var(--primary)', marginLeft: 'var(--spacing-md)' }}
          >
            Back to practice
          </Link>
        </FadeIn>
      </section>
    </main>
  )
}
