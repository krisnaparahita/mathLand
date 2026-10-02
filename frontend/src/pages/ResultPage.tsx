import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  BookOpen,
  History,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Timer,
  TrendingUp,
  Trophy,
} from 'lucide-react'
import { FadeIn, HoverLift } from '@/components/MotionPrimitives'
import { Stars } from '@/components/Stars'
import { TopicIcon } from '@/components/TopicIcon'
import { getGrade, getTopic, topicColor, topicSoft } from '@/curriculum'
import { useProfile } from '@/context/ProfileContext'
import { resultsApi } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import NotFound from './NotFound'

const formatDuration = (ms: number): string => {
  const total = Math.max(0, Math.round(ms / 1000))
  return `${Math.floor(total / 60)} 分 ${total % 60} 秒`
}

const ENCOURAGE: Record<number, { title: string; body: string }> = {
  3: { title: '太棒了！满分小能手 🌟', body: '这一关你已经完全掌握，试试更高的关卡挑战自己吧！' },
  2: { title: '做得很好！继续加油 💪', body: '只差一点点就满星了，复习一下巧算方法再来一次。' },
  1: { title: '不错，再来一次会更好 👍', body: '先去看看讲解和巧算方法，弄懂思路后正确率会明显提升。' },
  0: { title: '别灰心，学习就是慢慢来 🌱', body: '建议先到「学习方法」里看懂例题，再用不限时模式练一遍。' },
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

  if (isLoading) {
    return (
      <main className="container" style={{ maxWidth: 720, paddingBlock: 'var(--spacing-3xl)', textAlign: 'center' }}>
        <p style={{ color: 'var(--muted-foreground)' }}>正在加载成绩…</p>
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

  return (
    <main className="container" style={{ maxWidth: 760, paddingBottom: 'var(--spacing-3xl)' }}>
      <FadeIn>
        <section
          className="clay"
          style={{
            marginTop: 'var(--spacing-xl)',
            padding: 'var(--spacing-xl)',
            textAlign: 'center',
            background: `linear-gradient(140deg, ${soft}, var(--card))`,
          }}
        >
          {topic && <TopicIcon icon={topic.icon} color={topic.color} size={64} />}

          <div style={{ fontSize: 'var(--font-size-small)', color: 'var(--muted-foreground)', marginTop: 'var(--spacing-xs)' }}>
            {gradeInfo?.name} · {topic?.name ?? result.topicName} · 第 {result.level} 关
          </div>

          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 18, stiffness: 260, delay: 0.1 }}
            className="font-bold text-display"
            style={{ color, marginTop: 'var(--spacing-xs)', fontVariantNumeric: 'tabular-nums' }}
          >
            {result.score}
            <span style={{ fontSize: 'var(--font-size-title)', color: 'var(--muted-foreground)' }}> 分</span>
          </motion.div>

          <div className="flex justify-center" style={{ marginTop: 'var(--spacing-xs)' }}>
            <Stars value={result.stars} size={30} />
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
            <Metric icon={<Trophy size={16} />} label="答对题数" value={`${result.correct} / ${result.total}`} />
            <Metric icon={<TrendingUp size={16} />} label="正确率" value={`${accuracy}%`} />
            <Metric icon={<Timer size={16} />} label="用时" value={formatDuration(result.durationMs)} />
            <Metric
              icon={<Sparkles size={16} />}
              label="模式"
              value={result.timed ? '限时闯关' : '不限时练习'}
            />
          </div>

          {best && (
            <div style={{ marginTop: 'var(--spacing-sm)', fontSize: 'var(--font-size-small)', color: 'var(--muted-foreground)' }}>
              本关历史最佳：{best.bestScore} 分 · 已挑战 {best.plays} 次
            </div>
          )}
        </section>
      </FadeIn>

      {/* ── 下一步 ── */}
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
            <div className="inline-flex items-center font-bold" style={{ gap: 6, color }}>
              <RotateCcw size={17} /> 换一批题再来一次
            </div>
            <div style={{ fontSize: 'var(--font-size-small)', color: 'var(--muted-foreground)', marginTop: 4 }}>
              题目会重新随机生成，永远不会重复上一次
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
                <Trophy size={17} /> 挑战第 {nextLevel} 关
              </div>
              <div style={{ fontSize: 'var(--font-size-small)', color: 'var(--muted-foreground)', marginTop: 4 }}>
                {nextUnlocked ? '难度升级，题量更多、时间更紧' : '至少获得 1 颗星才能解锁下一关'}
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
              <BookOpen size={17} /> 复习讲解与巧算方法
            </div>
            <div style={{ fontSize: 'var(--font-size-small)', color: 'var(--muted-foreground)', marginTop: 4 }}>
              <Lightbulb size={12} /> 看一遍例题，下次正确率更高
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
              <History size={17} /> 查看成绩历史
            </div>
            <div style={{ fontSize: 'var(--font-size-small)', color: 'var(--muted-foreground)', marginTop: 4 }}>
              回顾每一次闯关的记录与进步曲线
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
          <ArrowLeft size={14} /> 返回关卡列表
        </Link>
      </div>
    </main>
  )
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div
      className="clay-inset"
      style={{ padding: 'var(--spacing-md)', borderRadius: 'var(--radius)', textAlign: 'center' }}
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
