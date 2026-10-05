import { Bird, Bug, Cat, Dog, Fish, PawPrint, Rabbit, Snail, Squirrel, Turtle } from 'lucide-react'
import { topicColor } from '@/curriculum'

export const AVATAR_OPTIONS = [
  { key: 'cat', label: 'Cat', Icon: Cat },
  { key: 'dog', label: 'Dog', Icon: Dog },
  { key: 'rabbit', label: 'Rabbit', Icon: Rabbit },
  { key: 'bird', label: 'Bird', Icon: Bird },
  { key: 'fish', label: 'Fish', Icon: Fish },
  { key: 'turtle', label: 'Turtle', Icon: Turtle },
  { key: 'squirrel', label: 'Squirrel', Icon: Squirrel },
  { key: 'bug', label: 'Ladybug', Icon: Bug },
  { key: 'snail', label: 'Snail', Icon: Snail },
  { key: 'paw', label: 'Paw print', Icon: PawPrint },
] as const

export const COLOR_OPTIONS = [
  { key: 'indigo', label: 'Indigo' },
  { key: 'orange', label: 'Orange' },
  { key: 'green', label: 'Green' },
  { key: 'pink', label: 'Pink' },
  { key: 'blue', label: 'Blue' },
  { key: 'purple', label: 'Purple' },
  { key: 'yellow', label: 'Gold' },
  { key: 'teal', label: 'Teal' },
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
