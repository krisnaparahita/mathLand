import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  BookOpen,
  History,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Star,
  Timer,
  TrendingUp,
  Trophy,
} from 'lucide-react'
import { FadeIn, HoverLift } from '@/components/MotionPrimitives'
import { StickerBoard } from '@/components/StickerBoard'
import { TopicIcon } from '@/components/TopicIcon'
import { getGrade, getTopic, topicColor, topicSoft, topicText } from '@/curriculum'
import { newlyUnlocked } from '@/lib/stickers'
import { useProfile } from '@/context/ProfileContext'
import { resultsApi } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import NotFound from './NotFound'

const formatDuration = (ms: number): string => {
  const total = Math.max(0, Math.round(ms / 1000))
  return `${Math.floor(total / 60)} min ${total % 60} sec`
}

const ENCOURAGE: Record<number, { title: string; body: string }> = {
  3: { title: 'Amazing! Perfect score 🌟', body: 'You have fully mastered this level. Try a higher level to challenge yourself!' },
  2: { title: 'Well done! Keep it up 💪', body: 'You are just one step from full stars. Review the smart tricks and try again.' },
  1: { title: 'Good job, and another try will be even better 👍', body: 'Read the concepts and smart tricks first. Once the idea clicks, your accuracy will improve a lot.' },
  0: { title: 'Don\'t give up, learning takes time 🌱', body: 'Go through the worked examples in the Study Guide first, then practice again in untimed mode.' },
}

export default function ResultPage() {
  const { resultId } = useParams()
  const navigate = useNavigate()
  const { profile } = useProfile()

  const { data: result, isLoading, isError } = useQuery({
    queryKey: ['result', resultId],
    queryFn: () => resultsApi.get(Number(resultId)),
    enabled: Boolean(resultId),
  })

  const { data: levels = [] } = useQuery({
    queryKey: ['level-progress', profile?.id, result?.grade],
    queryFn: () => resultsApi.levelProgress(profile!.id, result!.grade),
    enabled: Boolean(profile && result),
  })

  const { data: stats, isFetching: statsFetching } = useQuery({
    queryKey: ['stats', profile?.id],
    queryFn: () => resultsApi.stats(profile!.id),
    enabled: Boolean(profile),
  })

  // Time the page opened, used to tell "just played" from an old result opened later
  const [openedAt] = useState(() => Date.now())

  if (isLoading) {
    return (
      <main className="container" style={{ maxWidth: 720, paddingBlock: 'var(--spacing-3xl)', textAlign: 'center' }}>
        <p style={{ color: 'var(--muted-foreground)' }}>Loading result…</p>
      </main>
    )
  }

  if (isError || !result) return <NotFound />

  const gradeInfo = getGrade(result.grade)
  const topic = getTopic(result.grade, result.topicId)
  const color = topic ? topicColor(topic.color) : 'var(--primary)'
  const soft = topic ? topicSoft(topic.color) : 'var(--muted)'
  const accuracy = result.total ? Math.round((result.correct / result.total) * 100) : 0
  const nextLevel = result.level + 1
  const hasNextLevel = Boolean(topic?.levels.some((l) => l.level === nextLevel))
  const nextUnlocked = result.stars >= 1
  const best = levels.find((l) => l.topicId === result.topicId && l.level === result.level)
  const message = ENCOURAGE[result.stars] ?? ENCOURAGE[0]
  const text = topic ? topicText(topic.color) : 'var(--primary)'
  // Wait for fresh totals, otherwise the sticker comparison would use the total from before this result
  const totalStars = stats && !statsFetching ? stats.totalStars : null
  // Only celebrate right after playing: older results opened from the history page are not "new"
  const justPlayed = openedAt - new Date(result.createdAt).getTime() < 2 * 60 * 1000
  const unlockedNow =
    totalStars === null || !justPlayed ? [] : newlyUnlocked(totalStars - result.stars, totalStars)

  return (
    <main className="container" style={{ maxWidth: 760, paddingBottom: 'var(--spacing-3xl)' }}>
      <FadeIn>
        <section
          className="clay"
          style={{
            marginTop: 'var(--spacing-xl)',
            padding: 'var(--spacing-xl)',
            textAlign: 'center',
            background: soft,
            borderColor: `color-mix(in oklch, ${color} 55%, white)`,
            boxShadow: `0 6px 0 color-mix(in oklch, ${color} 55%, white)`,
          }}
        >
          {topic && <TopicIcon icon={topic.icon} color={topic.color} size={64} />}

          <div style={{ fontSize: 'var(--font-size-small)', color: 'var(--muted-foreground)', marginTop: 'var(--spacing-xs)' }}>
            {gradeInfo?.name} · {topic?.name ?? result.topicName} · Level {result.level}
          </div>

          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 18, stiffness: 260, delay: 0.1 }}
            className="font-bold text-display"
            style={{ color: text, marginTop: 'var(--spacing-xs)', fontVariantNumeric: 'tabular-nums' }}
          >
            {result.score}
            <span style={{ fontSize: 'var(--font-size-title)', color: 'var(--muted-foreground)' }}> pts</span>
          </motion.div>

          <div
            className="flex justify-center"
            style={{ marginTop: 'var(--spacing-xs)', gap: 'var(--spacing-xs)' }}
            role="img"
            aria-label={`${result.stars} out of 3 stars`}
          >
            {[0, 1, 2].map((i) => {
              const earned = i < result.stars
              return (
                <span
                  key={i}
                  className="animate-pop-in"
                  style={{
                    animationDelay: `${0.25 + i * 0.18}s`,
                    filter: earned ? 'drop-shadow(0 4px 0 oklch(0.62 0.15 75))' : undefined,
                  }}
                >
                  <Star
                    size={52}
                    strokeWidth={2}
                    fill={earned ? 'var(--theme-gold)' : 'transparent'}
                    color={earned ? 'var(--theme-gold)' : 'var(--border)'}
                  />
                </span>
              )
            })}
          </div>

          <h1 className="font-bold text-title" style={{ marginTop: 'var(--spacing-sm)' }}>
            {message.title}
          </h1>
          <p style={{ color: 'var(--muted-foreground)', marginTop: 4, fontSize: 'var(--font-size-body)' }}>
            {message.body}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: 'var(--spacing-sm)',
              marginTop: 'var(--spacing-lg)',
            }}
          >
            <Metric icon={<Trophy size={16} />} label="Correct answers" value={`${result.correct} / ${result.total}`} />
            <Metric icon={<TrendingUp size={16} />} label="Accuracy" value={`${accuracy}%`} />
            <Metric icon={<Timer size={16} />} label="Time" value={formatDuration(result.durationMs)} />
            <Metric
              icon={<Sparkles size={16} />}
              label="Mode"
              value={result.timed ? 'Timed level' : 'Untimed practice'}
            />
          </div>

          {best && (
            <div style={{ marginTop: 'var(--spacing-sm)', fontSize: 'var(--font-size-small)', color: 'var(--muted-foreground)' }}>
              Best on this level: {best.bestScore} pts · Played {best.plays} {best.plays === 1 ? 'time' : 'times'}
            </div>
          )}
        </section>
      </FadeIn>

      {/* ── Stickers ── */}
      {profile && totalStars !== null && (
        <section style={{ marginTop: 'var(--spacing-lg)' }}>
          {unlockedNow.length > 0 && (
            <div
              role="status"
              className="clay flex items-center flex-wrap"
              style={{
                gap: 'var(--spacing-sm)',
                padding: 'var(--spacing-md)',
                marginBottom: 'var(--spacing-md)',
                background: 'color-mix(in oklch, var(--c-sun) 35%, white)',
                borderColor: 'color-mix(in oklch, var(--c-sun) 70%, white)',
                boxShadow: '0 5px 0 color-mix(in oklch, var(--c-sun) 70%, white)',
              }}
            >
              <span style={{ fontSize: '2rem' }} aria-hidden="true">
                {unlockedNow.map((s) => s.emoji).join(' ')}
              </span>
              <div>
                <div className="font-display font-semibold" style={{ fontSize: 'var(--font-size-body)' }}>
                  New {unlockedNow.length === 1 ? 'sticker' : 'stickers'} unlocked!
                </div>
                <div style={{ fontSize: 'var(--font-size-small)' }}>
                  {unlockedNow.map((s) => s.name).join(', ')} added to your sticker board.
                </div>
              </div>
            </div>
          )}
          <StickerBoard totalStars={totalStars} newIds={unlockedNow.map((s) => s.id)} />
        </section>
      )}

      {/* ── Next steps ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--spacing-md)',
          marginTop: 'var(--spacing-lg)',
        }}
      >
        <HoverLift lift={-5}>
          <button
            type="button"
            onClick={() => navigate(`/play/${result.grade}/${result.topicId}/${result.level}`)}
            className="clay clay-hover cursor-pointer"
            style={{
              width: '100%',
              padding: 'var(--spacing-lg)',
              borderRadius: 'var(--radius)',
              textAlign: 'left',
              background: 'var(--card)',
            }}
          >
            <div className="inline-flex items-center font-bold" style={{ gap: 6, color: text }}>
              <RotateCcw size={17} /> Try again with new questions
            </div>
            <div style={{ fontSize: 'var(--font-size-small)', color: 'var(--muted-foreground)', marginTop: 4 }}>
              Questions are regenerated, so they never repeat the last round
            </div>
          </button>
        </HoverLift>

        {hasNextLevel && (
          <HoverLift lift={nextUnlocked ? -5 : 0}>
            <button
              type="button"
              disabled={!nextUnlocked}
              onClick={() => navigate(`/play/${result.grade}/${result.topicId}/${nextLevel}`)}
              className={nextUnlocked ? 'clay clay-hover cursor-pointer' : 'clay'}
              style={{
                width: '100%',
                padding: 'var(--spacing-lg)',
                borderRadius: 'var(--radius)',
                textAlign: 'left',
                background: nextUnlocked ? 'var(--card)' : 'var(--muted)',
                opacity: nextUnlocked ? 1 : 0.7,
              }}
            >
              <div
                className="inline-flex items-center font-bold"
                style={{ gap: 6, color: nextUnlocked ? 'var(--accent)' : 'var(--muted-foreground)' }}
              >
                <Trophy size={17} /> Take on level {nextLevel}
              </div>
              <div style={{ fontSize: 'var(--font-size-small)', color: 'var(--muted-foreground)', marginTop: 4 }}>
                {nextUnlocked ? 'Harder level: more questions and less time' : 'Earn at least 1 star to unlock the next level'}
              </div>
            </button>
          </HoverLift>
        )}

        <HoverLift lift={-5}>
          <Link
            to={`/study/${result.grade}/${result.topicId}`}
            className="clay clay-hover cursor-pointer"
            style={{
              display: 'block',
              padding: 'var(--spacing-lg)',
              borderRadius: 'var(--radius)',
              background: 'var(--card)',
            }}
          >
            <div className="inline-flex items-center font-bold" style={{ gap: 6, color: 'var(--theme-purple)' }}>
              <BookOpen size={17} /> Review concepts and smart tricks
            </div>
            <div style={{ fontSize: 'var(--font-size-small)', color: 'var(--muted-foreground)', marginTop: 4 }}>
              <Lightbulb size={12} /> Read the examples to score higher next time
            </div>
          </Link>
        </HoverLift>

        <HoverLift lift={-5}>
          <Link
            to="/history"
            className="clay clay-hover cursor-pointer"
            style={{
              display: 'block',
              padding: 'var(--spacing-lg)',
              borderRadius: 'var(--radius)',
              background: 'var(--card)',
            }}
          >
            <div className="inline-flex items-center font-bold" style={{ gap: 6, color: 'var(--theme-blue)' }}>
              <History size={17} /> View result history
            </div>
            <div style={{ fontSize: 'var(--font-size-small)', color: 'var(--muted-foreground)', marginTop: 4 }}>
              Look back at every result and your progress curve
            </div>
          </Link>
        </HoverLift>
      </div>

      <div className="flex justify-center" style={{ marginTop: 'var(--spacing-lg)' }}>
        <Link
          to={`/levels/${result.grade}/${result.topicId}`}
          className="cursor-pointer font-semibold inline-flex items-center"
          style={{ gap: 4, fontSize: 'var(--font-size-small)', color: 'var(--muted-foreground)' }}
        >
          <ArrowLeft size={14} /> Back to level list
        </Link>
      </div>
    </main>
  )
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div
      className="clay-inset"
      style={{ background: 'oklch(1 0 0 / 0.75)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius)', textAlign: 'center' }}
    >
      <div
        className="inline-flex items-center justify-center font-semibold"
        style={{ gap: 4, fontSize: 'var(--font-size-small)', color: 'var(--muted-foreground)' }}
      >
        {icon} {label}
      </div>
      <div className="font-bold" style={{ fontSize: 'var(--font-size-body)', marginTop: 2 }}>
        {value}
      </div>
    </div>
  )
}
