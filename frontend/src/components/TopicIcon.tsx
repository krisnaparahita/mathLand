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
import { topicColor, topicEdge, topicInk } from '@/curriculum'

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
        background: topicColor(color),
        color: topicInk(color),
        transform: 'rotate(-4deg)',
        boxShadow: `0 ${Math.max(3, Math.round(size / 14))}px 0 ${topicEdge(color)}`,
      }}
    >
      <Icon size={Math.round(size * 0.52)} strokeWidth={2.2} />
    </span>
  )
}
