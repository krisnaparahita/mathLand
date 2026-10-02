import { Bird, Bug, Cat, Dog, Fish, PawPrint, Rabbit, Snail, Squirrel, Turtle } from 'lucide-react'
import { topicColor } from '@/curriculum'

export const AVATAR_OPTIONS = [
  { key: 'cat', label: '小猫', Icon: Cat },
  { key: 'dog', label: '小狗', Icon: Dog },
  { key: 'rabbit', label: '兔子', Icon: Rabbit },
  { key: 'bird', label: '小鸟', Icon: Bird },
  { key: 'fish', label: '小鱼', Icon: Fish },
  { key: 'turtle', label: '乌龟', Icon: Turtle },
  { key: 'squirrel', label: '松鼠', Icon: Squirrel },
  { key: 'bug', label: '瓢虫', Icon: Bug },
  { key: 'snail', label: '蜗牛', Icon: Snail },
  { key: 'paw', label: '爪印', Icon: PawPrint },
] as const

export const COLOR_OPTIONS = [
  { key: 'indigo', label: '靛蓝' },
  { key: 'orange', label: '橙色' },
  { key: 'green', label: '绿色' },
  { key: 'pink', label: '粉色' },
  { key: 'blue', label: '蓝色' },
  { key: 'purple', label: '紫色' },
  { key: 'yellow', label: '金黄' },
  { key: 'teal', label: '青绿' },
] as const

interface AvatarBubbleProps {
  avatar: string
  color: string
  size?: number
}

export function AvatarBubble({ avatar, color, size = 44 }: AvatarBubbleProps) {
  const option = AVATAR_OPTIONS.find((a) => a.key === avatar) ?? AVATAR_OPTIONS[0]
  const Icon = option.Icon
  const bg = topicColor(color)

  return (
    <span
      className="inline-flex items-center justify-center shrink-0 rounded-full"
      style={{
        width: size,
        height: size,
        background: bg,
        color: 'var(--card)',
        border: '2px solid oklch(0.257 0.09 281.288 / 0.18)',
      }}
    >
      <Icon size={Math.round(size * 0.55)} strokeWidth={2.2} />
    </span>
  )
}
