import { Star } from 'lucide-react'

interface StarsProps {
  value: number
  max?: number
  size?: number
}

export function Stars({ value, max = 3, size = 18 }: StarsProps) {
  return (
    <span className="inline-flex items-center" style={{ gap: 'var(--spacing-xs)' }} aria-label={`${value} 星`}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < value
        return (
          <Star
            key={i}
            size={size}
            strokeWidth={2.2}
            fill={filled ? 'var(--theme-gold)' : 'transparent'}
            color={filled ? 'var(--theme-gold)' : 'var(--border)'}
          />
        )
      })}
    </span>
  )
}
