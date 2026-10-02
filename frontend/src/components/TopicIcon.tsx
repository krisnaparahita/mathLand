import {
  BookOpen,
  Box,
  Calculator,
  Calendar,
  Circle,
  Clock,
  Coins,
  Compass,
  Divide,
  Grid3x3,
  Hash,
  Minus,
  Percent,
  PieChart,
  Plus,
  Ruler,
  Scale,
  Shapes,
  Sigma,
  Square,
  Thermometer,
  TrendingUp,
  Variable,
  X,
  ArrowLeftRight,
  ArrowUpDown,
  type LucideIcon,
} from 'lucide-react'
import { topicColor, topicSoft } from '@/curriculum'

const ICON_MAP: Record<string, LucideIcon> = {
  Hash,
  Plus,
  Minus,
  ArrowLeftRight,
  Shapes,
  BookOpen,
  ArrowUpDown,
  X,
  Clock,
  Ruler,
  Coins,
  Divide,
  Sigma,
  PieChart,
  Square,
  Calendar,
  Compass,
  Percent,
  Grid3x3,
  Box,
  TrendingUp,
  Circle,
  Thermometer,
  Variable,
  Calculator,
  Scale,
}

interface TopicIconProps {
  icon: string
  color: string
  size?: number
}

export function TopicIcon({ icon, color, size = 56 }: TopicIconProps) {
  const Icon = ICON_MAP[icon] ?? Hash
  return (
    <span
      className="inline-flex items-center justify-center rounded-2xl"
      style={{
        width: size,
        height: size,
        background: topicSoft(color),
        color: topicColor(color),
        border: '2px solid oklch(0.257 0.09 281.288 / 0.1)',
      }}
    >
      <Icon size={Math.round(size * 0.52)} strokeWidth={2.2} />
    </span>
  )
}
