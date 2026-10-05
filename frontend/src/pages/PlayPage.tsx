import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock,
  Lightbulb,
  Shuffle,
  Sparkles,
  Timer as TimerIcon,
  X,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { FadeIn } from '@/components/MotionPrimitives'
import { Stars } from '@/components/Stars'
import { TopicIcon } from '@/components/TopicIcon'
import { getGrade, getTopic, isAnswerCorrect, starsForAccuracy, topicColor, topicSoft } from '@/curriculum'
import type { Question } from '@/curriculum'
import { useProfile } from '@/context/ProfileContext'
import { resultsApi } from '@/lib/api'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import NotFound from './NotFound'

interface AnswerRecord {
  input: string
  correct: boolean
}

const formatClock = (seconds: number): string => {
  const s = Math.max(0, seconds)
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

export default function PlayPage() {
  const { grade: gradeParam, topicId, level: levelParam } = useParams()
  const [search] = useSearchParams()
  const gradeNumber = Number(gradeParam)
  const levelNumber = Number(levelParam)
  const gradeInfo = getGrade(gradeNumber)
  const topic = topicId ? getTopic(gradeNumber, topicId) : undefined
  const meta = topic?.levels.find((l) => l.level === levelNumber)
  const { profile } = useProfile()
  const navigate = useNavigate()

  /** With relax=1 the timer is off, which suits kids who are just starting out */
  const timed = search.get('mode') !== 'relax'

  /* ── Question generation: re-randomized on every entry / new round, avoiding recently answered questions where possible ── */
  const [round, setRound] = useState(0)
  const historyKey = `mathland.recent.${gradeNumber}.${topicId}.${levelNumber}`
  const questions = useMemo<Question[]>(() => {
    if (!topic || !meta) return []
    let recent: string[] = []
    try {
      const raw = localStorage.getItem(historyKey)
      if (raw) recent = JSON.parse(raw) as string[]
    } catch {
      recent = []
    }
    const generated = topic.generate(meta.level, meta.questionCount, recent)
    try {
      const merged = [...generated.map((q) => q.prompt), ...recent].slice(0, 80)
      localStorage.setItem(historyKey, JSON.stringify(merged))
    } catch {
      /* Ignore storage failures in private mode */
    }
    return generated
  // `round` is intentionally a dependency: bumping it re-rolls the question set
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic, meta, round, historyKey])

  const [phase, setPhase] = useState<'ready' | 'playing' | 'saving'>('ready')
  const [index, setIndex] = useState(0)
  const [records, setRecords] = useState<Record<string, AnswerRecord>>({})
  const recordsRef = useRef<Record<string, AnswerRecord>>({})
  const [input, setInput] = useState('')
  const [answered, setAnswered] = useState(false)
  const [lastCorrect, setLastCorrect] = useState(false)
  const [startedAt, setStartedAt] = useState(() => Date.now())
  const [durationMs, setDurationMs] = useState(0)
  const totalSeconds = meta ? meta.questionCount * meta.secondsPerQuestion : 0
  const [remaining, setRemaining] = useState(totalSeconds)
  const finishedRef = useRef(false)

  /* Reset all state when a new round starts */
  useEffect(() => {
    setIndex(0)
    setRecords({})
    recordsRef.current = {}
    setInput('')
    setAnswered(false)
    setRemaining(totalSeconds)
    finishedRef.current = false
    setPhase('ready')
  }, [round, totalSeconds])

  const saveMutation = useMutation({
    mutationFn: () =>
      resultsApi.create({
        userId: profile!.id,
        grade: gradeNumber,
        topicId: topic!.id,
        topicName: topic!.name,
        level: meta!.level,
        correct: Object.values(recordsRef.current).filter((r) => r.correct).length,
        total: questions.length,
        score: scoreOf(recordsRef.current, questions.length),
        stars: starsForAccuracy(accuracyOf(recordsRef.current, questions.length)),
        durationMs: durationMs || Date.now() - startedAt,
        timed,
      }),
  })

  const finish = useCallback(async () => {
    if (finishedRef.current) return
    finishedRef.current = true
    setPhase('saving')
    const elapsed = Date.now() - startedAt
    setDurationMs(elapsed)
    if (!profile) {
      navigate(`/levels/${gradeNumber}/${topic!.id}`)
      return
    }
    try {
      const saved = await saveMutation.mutateAsync()
      navigate(`/result/${saved.id}`)
    } catch {
      // On save failure, go back to the level page and show a notice; progress is not lost (the level can be replayed at any time)
      toast.error('Could not save your result. Check your connection and try again.')
      navigate(`/levels/${gradeNumber}/${topic!.id}`)
    }
  }, [profile, gradeNumber, topic, startedAt, navigate, saveMutation])

  /* Ref bridge for finish: avoids re-creating the timer / auto-advance timer on every render */
  const finishRef = useRef<() => void>(() => {})
  useEffect(() => {
    finishRef.current = () => void finish()
  }, [finish])

  /* ── Level timer ── */
  useEffect(() => {
    if (phase !== 'playing' || !timed) return
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000)
    return () => clearInterval(id)
  }, [phase, timed])

  /* Time runs out → submit automatically */
  useEffect(() => {
    if (phase === 'playing' && timed && remaining === 0) finishRef.current()
  }, [phase, timed, remaining])

  const current = questions[index]

  /* Advance automatically after a correct answer; stop on a wrong answer to show the explanation */
  useEffect(() => {
    if (!answered || !current || phase !== 'playing') return
    if (!lastCorrect) return
    const id = setTimeout(() => {
      if (index + 1 >= questions.length) finishRef.current()
      else {
        setIndex((i) => i + 1)
        setInput('')
        setAnswered(false)
      }
    }, 950)
    return () => clearTimeout(id)
  }, [answered, lastCorrect, index, questions.length, current, phase])

  if (!gradeInfo || !topic || !meta) return <NotFound />

  const color = topicColor(topic.color)
  const soft = topicSoft(topic.color)
  const answeredCount = Object.keys(records).length
  const correctCount = Object.values(records).filter((r) => r.correct).length
  const progress = questions.length ? (index + (answered ? 1 : 0)) / questions.length : 0
  const lowTime = timed && remaining <= Math.max(10, totalSeconds * 0.2)

  const commit = (value: string) => {
    if (answered || !current) return
    const correct = isAnswerCorrect(current, value)
    const next = { ...recordsRef.current, [current.id]: { input: value, correct } }
    recordsRef.current = next
    setRecords(next)
    setLastCorrect(correct)
    setAnswered(true)
  }

  const goNext = () => {
    if (!answered) return
    if (index + 1 >= questions.length) {
      void finish()
      return
    }
    setIndex((i) => i + 1)
    setInput('')
    setAnswered(false)
  }

  const start = () => {
    setStartedAt(Date.now())
    setRemaining(totalSeconds)
    setPhase('playing')
  }

  /* ── Ready screen ── */
  if (phase === 'ready') {
    return (
      <main className="container" style={{ maxWidth: 720, paddingBottom: 'var(--spacing-3xl)' }}>
        <FadeIn>
          <div className="clay" style={{ marginTop: 'var(--spacing-xl)', padding: 'var(--spacing-xl)', textAlign: 'center' }}>
            <TopicIcon icon={topic.icon} color={topic.color} size={72} />
            <div style={{ fontSize: 'var(--font-size-small)', color: 'var(--muted-foreground)', marginTop: 'var(--spacing-sm)' }}>
              {gradeInfo.name} · {topic.name}
            </div>
            <h1 className="font-bold text-title" style={{ color, marginTop: 4 }}>
              Level {meta.level} · {meta.name}
            </h1>
            <p style={{ color: 'var(--muted-foreground)', marginTop: 'var(--spacing-sm)', fontSize: 'var(--font-size-body)' }}>
              {meta.goal}
            </p>

            <div
              className="flex justify-center flex-wrap"
              style={{ gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}
            >
              <InfoPill icon={<Sparkles size={16} />} label="Questions" value={`${meta.questionCount}`} />
              <InfoPill
                icon={timed ? <TimerIcon size={16} /> : <Clock size={16} />}
                label={timed ? 'Time limit' : 'Mode'}
                value={timed ? `${formatClock(totalSeconds)} (${meta.secondsPerQuestion} sec per question)` : 'Untimed practice'}
              />
              <InfoPill icon={<Lightbulb size={16} />} label="On a wrong answer" value="See the explanation right away" />
            </div>

            <div className="flex flex-col items-center" style={{ gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-xl)' }}>
              <button
                type="button"
                onClick={start}
                className="clay-solid cursor-pointer font-bold"
                style={{
                  background: color,
                  color: 'var(--card)',
                  paddingInline: 'var(--spacing-xl)',
                  paddingBlock: 'var(--spacing-md)',
                  borderRadius: 'var(--radius)',
                  fontSize: 'var(--font-size-body)',
                }}
              >
                Start level
              </button>
              <button
                type="button"
                onClick={() => navigate(`/study/${gradeNumber}/${topic.id}`)}
                className="cursor-pointer font-semibold"
                style={{ fontSize: 'var(--font-size-small)', color: 'var(--muted-foreground)' }}
              >
                Review the concepts and smart tricks first
              </button>
              <button
                type="button"
                onClick={() => setRound((r) => r + 1)}
                className="cursor-pointer font-semibold inline-flex items-center"
                style={{ fontSize: 'var(--font-size-small)', color: 'var(--muted-foreground)', gap: 4 }}
              >
                <Shuffle size={13} /> New questions (round {round + 1})
              </button>
              <button
                type="button"
                onClick={() => navigate(`/levels/${gradeNumber}/${topic.id}`)}
                className="cursor-pointer font-semibold inline-flex items-center"
                style={{ fontSize: 'var(--font-size-small)', color: 'var(--muted-foreground)', gap: 4 }}
              >
                <ArrowLeft size={14} /> Back to levels
              </button>
            </div>
          </div>
        </FadeIn>
      </main>
    )
  }

  if (!current) return <NotFound />

  return (
    <main className="container" style={{ maxWidth: 780, paddingBottom: 'var(--spacing-3xl)' }}>
      {/* ── Top status bar ── */}
      <div
        className="clay flex items-center flex-wrap"
        style={{
          marginTop: 'var(--spacing-lg)',
          padding: 'var(--spacing-md)',
          gap: 'var(--spacing-md)',
          background: `linear-gradient(120deg, ${soft}, var(--card))`,
        }}
      >
        <div className="flex items-center" style={{ gap: 'var(--spacing-sm)' }}>
          <TopicIcon icon={topic.icon} color={topic.color} size={38} />
          <div>
            <div className="font-bold" style={{ fontSize: 'var(--font-size-body)', color }}>
              Level {meta.level} · {meta.name}
            </div>
            <div style={{ fontSize: 'var(--font-size-small)', color: 'var(--muted-foreground)' }}>
              Question {index + 1} / {questions.length}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 140 }}>
          <div
            style={{
              height: 12,
              borderRadius: 999,
              background: 'var(--muted)',
              overflow: 'hidden',
              boxShadow: 'inset 0 2px 4px oklch(0 0 0 / 0.08)',
            }}
          >
            <motion.div
              animate={{ width: `${Math.round(progress * 100)}%` }}
              transition={{ type: 'spring', damping: 22, stiffness: 260 }}
              style={{ height: '100%', background: color, borderRadius: 999 }}
            />
          </div>
          <div
            className="flex justify-between"
            style={{ fontSize: 'var(--font-size-small)', color: 'var(--muted-foreground)', marginTop: 4 }}
          >
            <span>Correct {correctCount}</span>
            <span>Answered {answeredCount} / {questions.length}</span>
          </div>
        </div>

        <div
          className="inline-flex items-center font-bold"
          style={{
            gap: 6,
            paddingInline: 'var(--spacing-md)',
            paddingBlock: 'var(--spacing-xs)',
            borderRadius: 999,
            background: lowTime ? 'var(--theme-red)' : 'var(--card)',
            color: lowTime ? 'white' : 'var(--foreground)',
            fontSize: 'var(--font-size-body)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {timed ? (
            <>
              <TimerIcon size={16} />
              {formatClock(remaining)}
            </>
          ) : (
            <>
              <Clock size={16} />
              Untimed
            </>
          )}
        </div>
      </div>

      {/* ── Question card ── */}
      <FadeIn key={current.id}>
        <div className="clay" style={{ marginTop: 'var(--spacing-lg)', padding: 'var(--spacing-xl)' }}>
          <div
            className="inline-flex items-center font-semibold"
            style={{
              gap: 6,
              fontSize: 'var(--font-size-small)',
              color: 'var(--muted-foreground)',
              background: 'var(--muted)',
              paddingInline: 'var(--spacing-sm)',
              paddingBlock: 2,
              borderRadius: 999,
            }}
          >
            {current.kind === 'choice' ? 'Multiple choice' : current.kind === 'fill' ? 'Fill in the blank' : 'True or false'}
          </div>

          <h2
            className="font-bold"
            style={{ fontSize: 'var(--font-size-headline)', marginTop: 'var(--spacing-sm)', lineHeight: 1.35 }}
          >
            {current.prompt}
          </h2>

          {current.kind === 'choice' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 'var(--spacing-sm)',
                marginTop: 'var(--spacing-lg)',
              }}
            >
              {current.options?.map((option) => {
                const isAnswer = option === current.answer
                const picked = answered && records[current.id]?.input === option
                const bg = answered
                  ? isAnswer
                    ? 'var(--theme-green)'
                    : picked
                      ? 'var(--theme-red)'
                      : 'var(--card)'
                  : 'var(--card)'
                return (
                  <button
                    key={option}
                    type="button"
                    disabled={answered}
                    onClick={() => commit(option)}
                    className={answered ? '' : 'clay clay-hover cursor-pointer'}
                    style={{
                      padding: 'var(--spacing-md)',
                      borderRadius: 'var(--radius)',
                      fontSize: 'var(--font-size-body)',
                      fontWeight: 700,
                      background: bg,
                      color: answered && (isAnswer || picked) ? 'white' : 'var(--foreground)',
                      border: `var(--clay-border-width) solid ${answered && (isAnswer || picked) ? 'transparent' : 'var(--border)'}`,
                    }}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          )}

          {current.kind === 'judge' && (
            <div className="flex" style={{ gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
              {[
                { label: 'True ✓', value: 'true', good: true },
                { label: 'False ✗', value: 'false', good: false },
              ].map((opt) => {
                const isAnswer = current.answer === opt.value
                const picked = answered && records[current.id]?.input === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={answered}
                    onClick={() => commit(opt.value)}
                    className={answered ? '' : 'clay clay-hover cursor-pointer'}
                    style={{
                      flex: 1,
                      padding: 'var(--spacing-lg)',
                      borderRadius: 'var(--radius)',
                      fontSize: 'var(--font-size-title)',
                      fontWeight: 700,
                      background: answered
                        ? isAnswer
                          ? 'var(--theme-green)'
                          : picked
                            ? 'var(--theme-red)'
                            : 'var(--card)'
                        : 'var(--card)',
                      color:
                        answered && (isAnswer || picked)
                          ? 'white'
                          : opt.good
                            ? 'var(--theme-green)'
                            : 'var(--theme-red)',
                      border: `var(--clay-border-width) solid ${answered && (isAnswer || picked) ? 'transparent' : 'var(--border)'}`,
                    }}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          )}

          {current.kind === 'fill' && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                commit(input)
              }}
              className="flex items-center flex-wrap"
              style={{ gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-lg)' }}
            >
              <input
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={answered}
                inputMode="decimal"
                placeholder="Type your answer"
                aria-label="Answer input"
                className="clay-inset"
                style={{
                  flex: 1,
                  minWidth: 160,
                  padding: 'var(--spacing-md)',
                  borderRadius: 'var(--radius)',
                  fontSize: 'var(--font-size-title)',
                  fontWeight: 700,
                  fontFamily: 'var(--font-sans)',
                  color: 'var(--foreground)',
                }}
              />
              {current.unit && (
                <span className="font-semibold" style={{ fontSize: 'var(--font-size-body)', color: 'var(--muted-foreground)' }}>
                  {current.unit}
                </span>
              )}
              {!answered && (
                <button
                  type="submit"
                  className="clay-solid cursor-pointer font-bold"
                  style={{
                    background: color,
                    color: 'var(--card)',
                    paddingInline: 'var(--spacing-lg)',
                    paddingBlock: 'var(--spacing-md)',
                    borderRadius: 'var(--radius)',
                    fontSize: 'var(--font-size-body)',
                  }}
                >
                  Submit
                </button>
              )}
            </form>
          )}

          {/* ── Instant feedback ── */}
          {answered && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                marginTop: 'var(--spacing-lg)',
                padding: 'var(--spacing-md)',
                borderRadius: 'var(--radius)',
                background: lastCorrect ? 'var(--theme-green)' : 'var(--theme-red)',
                color: 'white',
              }}
            >
              <div className="flex items-center font-bold" style={{ gap: 8, fontSize: 'var(--font-size-body)' }}>
                {lastCorrect ? <Check size={18} /> : <X size={18} />}
                {lastCorrect
                  ? 'Correct!'
                  : `The correct answer is: ${current.kind === 'judge' ? (current.answer === 'true' ? 'True ✓' : 'False ✗') : current.answer}${current.unit ? ` ${current.unit}` : ''}`}
              </div>
              <div style={{ marginTop: 6, fontSize: 'var(--font-size-small)', lineHeight: 1.6 }}>
                {current.explanation}
              </div>
              {current.smartTip && (
                <div
                  className="inline-flex items-center font-semibold"
                  style={{
                    gap: 6,
                    marginTop: 'var(--spacing-sm)',
                    paddingInline: 'var(--spacing-sm)',
                    paddingBlock: 3,
                    borderRadius: 999,
                    background: 'oklch(1 0 0 / 0.22)',
                    fontSize: 'var(--font-size-small)',
                  }}
                >
                  <Lightbulb size={13} /> Smart trick: {current.smartTip}
                </div>
              )}
            </motion.div>
          )}

          <div className="flex justify-end" style={{ marginTop: 'var(--spacing-lg)' }}>
            {answered && (
              <button
                type="button"
                onClick={goNext}
                className="clay-solid cursor-pointer inline-flex items-center font-bold"
                style={{
                  gap: 4,
                  background: 'var(--foreground)',
                  color: 'var(--card)',
                  paddingInline: 'var(--spacing-lg)',
                  paddingBlock: 'var(--spacing-sm)',
                  borderRadius: 'var(--radius)',
                  fontSize: 'var(--font-size-body)',
                }}
              >
                {index + 1 >= questions.length ? 'See results' : 'Next question'} <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </FadeIn>

      {/* ── Bottom: question progress dots + quit round ── */}
      <div
        className="flex items-center flex-wrap justify-between"
        style={{ gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)' }}
      >
        <div className="flex flex-wrap" style={{ gap: 6 }}>
          {questions.map((q, i) => {
            const rec = records[q.id]
            return (
              <span
                key={q.id}
                title={`Question ${i + 1}`}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 999,
                  background: rec ? (rec.correct ? 'var(--theme-green)' : 'var(--theme-red)') : 'var(--border)',
                  outline: i === index ? '2px solid var(--foreground)' : 'none',
                  outlineOffset: 2,
                }}
              />
            )
          })}
        </div>
        <div className="flex items-center" style={{ gap: 'var(--spacing-md)' }}>
          <span style={{ fontSize: 'var(--font-size-small)', color: 'var(--muted-foreground)' }}>
            <Stars value={starsForAccuracy(accuracyOf(records, Math.max(1, answeredCount)))} size={14} />
          </span>
          <button
            type="button"
            onClick={() => navigate(`/levels/${gradeNumber}/${topic.id}`)}
            className="cursor-pointer font-semibold inline-flex items-center"
            style={{ fontSize: 'var(--font-size-small)', color: 'var(--muted-foreground)', gap: 4 }}
          >
            <ArrowLeft size={14} /> Quit round
          </button>
        </div>
      </div>

      {phase === 'saving' && (
        <div style={{ marginTop: 'var(--spacing-md)', textAlign: 'center', color: 'var(--muted-foreground)' }}>
          Saving your result…
        </div>
      )}
    </main>
  )
}

/* ────────────── Small components & scoring ────────────── */

function InfoPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div
      className="clay-inset"
      style={{
        padding: 'var(--spacing-md)',
        borderRadius: 'var(--radius)',
        minWidth: 150,
        textAlign: 'left',
      }}
    >
      <div
        className="inline-flex items-center font-semibold"
        style={{ gap: 6, fontSize: 'var(--font-size-small)', color: 'var(--muted-foreground)' }}
      >
        {icon} {label}
      </div>
      <div className="font-bold" style={{ fontSize: 'var(--font-size-body)', marginTop: 2 }}>
        {value}
      </div>
    </div>
  )
}

const accuracyOf = (records: Record<string, AnswerRecord>, total: number): number => {
  if (!total) return 0
  const correct = Object.values(records).filter((r) => r.correct).length
  return Math.round((correct / total) * 100)
}

const scoreOf = (records: Record<string, AnswerRecord>, total: number): number => {
  if (!total) return 0
  const correct = Object.values(records).filter((r) => r.correct).length
  return Math.round((correct / total) * 100)
}
