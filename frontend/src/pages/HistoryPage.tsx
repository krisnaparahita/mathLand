import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Clock, Filter, Sparkles, Target, Trash2, TrendingUp, Trophy } from 'lucide-react'
import { FadeIn, Stagger } from '@/components/MotionPrimitives'
import { Stars } from '@/components/Stars'
import { TopicIcon } from '@/components/TopicIcon'
import { GRADES, getTopic, topicColor, topicSoft } from '@/curriculum'
import { useProfile } from '@/context/ProfileContext'
import { resultsApi } from '@/lib/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const formatDateTime = (iso: string): string => {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const formatDuration = (ms: number): string => {
  const total = Math.max(0, Math.round(ms / 1000))
  return `${Math.floor(total / 60)} min ${total % 60} sec`
}

export default function HistoryPage() {
  const { profile } = useProfile()
  const queryClient = useQueryClient()
  const [gradeFilter, setGradeFilter] = useState<number | 'all'>('all')
  const [topicFilter, setTopicFilter] = useState<string>('all')

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['results', profile?.id],
    queryFn: () => resultsApi.list({ userId: profile!.id, limit: 200 }),
    enabled: Boolean(profile),
  })

  const { data: stats } = useQuery({
    queryKey: ['stats', profile?.id],
    queryFn: () => resultsApi.stats(profile!.id),
    enabled: Boolean(profile),
  })

  const { data: topics = [] } = useQuery({
    queryKey: ['topic-progress', profile?.id],
    queryFn: () => resultsApi.topicProgress(profile!.id),
    enabled: Boolean(profile),
  })

  const removeMutation = useMutation({
    mutationFn: (id: number) => resultsApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['results'] })
      void queryClient.invalidateQueries({ queryKey: ['stats'] })
      void queryClient.invalidateQueries({ queryKey: ['topic-progress'] })
      void queryClient.invalidateQueries({ queryKey: ['level-progress'] })
    },
  })

  const topicOptions = useMemo(
    () => topics.filter((t) => gradeFilter === 'all' || t.grade === gradeFilter),
    [topics, gradeFilter]
  )

  const filtered = useMemo(
    () =>
      results.filter(
        (r) =>
          (gradeFilter === 'all' || r.grade === gradeFilter) &&
          (topicFilter === 'all' || r.topicId === topicFilter)
      ),
    [results, gradeFilter, topicFilter]
  )

  return (
    <main className="container" style={{ maxWidth: 960, paddingBottom: 'var(--spacing-3xl)' }}>
      <FadeIn>
        <header style={{ marginTop: 'var(--spacing-xl)' }}>
          <h1 className="font-bold text-display">Result History</h1>
          <p style={{ color: 'var(--muted-foreground)', marginTop: 'var(--spacing-xs)' }}>
            {profile ? `Every level ${profile.name} plays is recorded here. See how far you have come!` : 'Loading profile…'}
          </p>
        </header>
      </FadeIn>

      {stats && (
        <Stagger
          className="flex flex-wrap"
          style={{ gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}
          stagger={0.06}
        >
          <StatCard icon={<Trophy size={18} />} label="Levels played" value={String(stats.totalGames)} tone="var(--theme-gold)" />
          <StatCard icon={<Target size={18} />} label="Overall accuracy" value={`${stats.accuracy}%`} tone="var(--theme-green)" />
          <StatCard icon={<Sparkles size={18} />} label="Stars earned" value={String(stats.totalStars)} tone="var(--theme-gold)" />
          <StatCard icon={<TrendingUp size={18} />} label="Questions answered" value={String(stats.totalQuestions)} tone="var(--primary)" />
          <StatCard icon={<Clock size={18} />} label="Practice time" value={formatDuration(stats.totalTimeMs)} tone="var(--theme-blue)" />
          <StatCard icon={<CalendarDays size={18} />} label="Practice streak" value={`${stats.streakDays} ${stats.streakDays === 1 ? 'day' : 'days'}`} tone="var(--accent)" />
        </Stagger>
      )}

      {/* ── Topic mastery ── */}
      {topics.length > 0 && (
        <FadeIn>
          <section className="clay" style={{ marginTop: 'var(--spacing-lg)', padding: 'var(--spacing-lg)' }}>
            <h2 className="font-bold text-title">Topic mastery</h2>
            <div className="flex flex-wrap" style={{ gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)' }}>
              {topics.slice(0, 12).map((t) => {
                const topic = getTopic(t.grade, t.topicId)
                const acc = t.total ? Math.round((t.correct / t.total) * 100) : 0
                return (
                  <Link
                    key={`${t.grade}-${t.topicId}`}
                    to={`/levels/${t.grade}/${t.topicId}`}
                    className="clay-inset cursor-pointer"
                    style={{
                      padding: 'var(--spacing-sm) var(--spacing-md)',
                      borderRadius: 'var(--radius)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-xs)',
                    }}
                  >
                    {topic && <TopicIcon icon={topic.icon} color={topic.color} size={22} />}
                    <div>
                      <div className="font-semibold" style={{ fontSize: 'var(--font-size-small)' }}>
                        {t.topicName}
                      </div>
                      <div
                        className="flex items-center"
                        style={{ gap: 6, fontSize: 'var(--font-size-small)', color: 'var(--muted-foreground)' }}
                      >
                        <Stars value={t.bestStars} size={12} /> {acc}% · {t.plays} {t.plays === 1 ? 'play' : 'plays'}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        </FadeIn>
      )}

      {/* ── Filters ── */}
      <div
        className="clay flex items-center flex-wrap"
        style={{ marginTop: 'var(--spacing-lg)', padding: 'var(--spacing-md)', gap: 'var(--spacing-sm)' }}
      >
        <span className="inline-flex items-center font-semibold" style={{ gap: 6, fontSize: 'var(--font-size-small)', color: 'var(--muted-foreground)' }}>
          <Filter size={14} /> Filter
        </span>
        <Chip active={gradeFilter === 'all'} onClick={() => { setGradeFilter('all'); setTopicFilter('all') }}>
          All grades
        </Chip>
        {GRADES.map((g) => (
          <Chip
            key={g.grade}
            active={gradeFilter === g.grade}
            onClick={() => {
              setGradeFilter(g.grade)
              setTopicFilter('all')
            }}
          >
            {g.name}
          </Chip>
        ))}
        {topicOptions.length > 0 && (
          <>
            <span style={{ width: 1, height: 20, background: 'var(--border)' }} />
            <Chip active={topicFilter === 'all'} onClick={() => setTopicFilter('all')}>
              All topics
            </Chip>
            {topicOptions.slice(0, 8).map((t) => (
              <Chip key={t.topicId} active={topicFilter === t.topicId} onClick={() => setTopicFilter(t.topicId)}>
                {t.topicName}
              </Chip>
            ))}
          </>
        )}
      </div>

      {/* ── Result list ── */}
      {isLoading ? (
        <p style={{ marginTop: 'var(--spacing-lg)', color: 'var(--muted-foreground)' }}>Loading results…</p>
      ) : filtered.length === 0 ? (
        <div className="clay" style={{ marginTop: 'var(--spacing-lg)', padding: 'var(--spacing-xl)', textAlign: 'center' }}>
          <p className="font-bold" style={{ fontSize: 'var(--font-size-body)' }}>
            No results yet
          </p>
          <p style={{ color: 'var(--muted-foreground)', marginTop: 4, fontSize: 'var(--font-size-small)' }}>
            Pick a topic you like and get started!
          </p>
          <Link
            to="/"
            className="clay-solid cursor-pointer inline-block font-bold"
            style={{
              marginTop: 'var(--spacing-md)',
              background: 'var(--primary)',
              color: 'var(--card)',
              paddingInline: 'var(--spacing-lg)',
              paddingBlock: 'var(--spacing-sm)',
              borderRadius: 'var(--radius)',
            }}
          >
            Start playing
          </Link>
        </div>
      ) : (
        <Stagger className="flex flex-col" style={{ gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)' }} stagger={0.04}>
          {filtered.map((r) => {
            const topic = getTopic(r.grade, r.topicId)
            const color = topic ? topicColor(topic.color) : 'var(--primary)'
            const soft = topic ? topicSoft(topic.color) : 'var(--muted)'
            const acc = Math.round((r.correct / r.total) * 100)
            return (
              <div
                key={r.id}
                className="clay"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-md)',
                  padding: 'var(--spacing-md)',
                  flexWrap: 'wrap',
                  borderLeft: `8px solid ${color}`,
                }}
              >
                {topic && <TopicIcon icon={topic.icon} color={topic.color} size={40} />}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div className="font-bold" style={{ fontSize: 'var(--font-size-body)', color }}>
                    {r.topicName} · Level {r.level}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-small)', color: 'var(--muted-foreground)', marginTop: 2 }}>
                    {GRADES[r.grade - 1]?.name} · {formatDateTime(r.createdAt)} · Time {formatDuration(r.durationMs)}
                    {!r.timed && ' · Untimed'}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="font-bold" style={{ fontSize: 'var(--font-size-title)', fontVariantNumeric: 'tabular-nums' }}>
                    {r.score}
                    <span style={{ fontSize: 'var(--font-size-small)', color: 'var(--muted-foreground)' }}> pts</span>
                  </div>
                  <div style={{ fontSize: 'var(--font-size-small)', color: 'var(--muted-foreground)' }}>
                    Correct {r.correct}/{r.total} · {acc}%
                  </div>
                </div>

                <Stars value={r.stars} size={16} />

                <button
                  type="button"
                  onClick={() => removeMutation.mutate(r.id)}
                  title="Delete this result"
                  className="cursor-pointer"
                  style={{
                    background: soft,
                    border: 'none',
                    borderRadius: 999,
                    width: 34,
                    height: 34,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--muted-foreground)',
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            )
          })}
        </Stagger>
      )}
    </main>
  )
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: string
  tone: string
}) {
  return (
    <div
      className="clay-inset"
      style={{
        padding: 'var(--spacing-md)',
        borderRadius: 'var(--radius)',
        minWidth: 130,
        flex: '1 1 130px',
      }}
    >
      <div className="inline-flex items-center font-semibold" style={{ gap: 6, fontSize: 'var(--font-size-small)', color: tone }}>
        {icon} {label}
      </div>
      <div className="font-bold" style={{ fontSize: 'var(--font-size-headline)', marginTop: 2 }}>
        {value}
      </div>
    </div>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer font-semibold"
      style={{
        paddingInline: 'var(--spacing-md)',
        paddingBlock: 'var(--spacing-xs)',
        borderRadius: 999,
        fontSize: 'var(--font-size-small)',
        background: active ? 'var(--primary)' : 'var(--muted)',
        color: active ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
        border: `2px solid ${active ? 'var(--primary)' : 'transparent'}`,
      }}
    >
      {children}
    </button>
  )
}
