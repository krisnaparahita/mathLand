import { STICKERS, nextSticker } from '@/lib/stickers'
import { topicSoft, topicColor } from '@/curriculum'

interface StickerBoardProps {
  totalStars: number
  /** Sticker ids to animate as just unlocked */
  newIds?: string[]
}

export function StickerBoard({ totalStars, newIds = [] }: StickerBoardProps) {
  const collected = STICKERS.filter((s) => totalStars >= s.stars)
  const next = nextSticker(totalStars)

  return (
    <div
      style={{
        background: 'var(--muted)',
        border: '3px dashed var(--border)',
        borderRadius: 'var(--radius)',
        padding: 'var(--spacing-md)',
      }}
    >
      <div className="flex items-baseline justify-between flex-wrap" style={{ gap: 'var(--spacing-xs)' }}>
        <h3 className="font-bold" style={{ fontSize: 'var(--font-size-body)' }}>
          My sticker board
        </h3>
        <span style={{ color: 'var(--muted-foreground)', fontSize: 'var(--font-size-small)', fontWeight: 700 }}>
          {collected.length} of {STICKERS.length} collected
        </span>
      </div>

      <ul
        className="grid grid-cols-4 sm:grid-cols-6"
        style={{ gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-sm)', listStyle: 'none', padding: 0 }}
      >
        {STICKERS.map((s, i) => {
          const got = totalStars >= s.stars
          const isNew = newIds.includes(s.id)
          return (
            <li
              key={s.id}
              title={got ? s.name : `Unlocks at ${s.stars} stars`}
              aria-label={got ? s.name : `Locked sticker, unlocks at ${s.stars} stars`}
              className={isNew ? 'animate-pop-in' : undefined}
              style={{
                aspectRatio: '1',
                display: 'grid',
                placeItems: 'center',
                fontSize: 'clamp(1.4rem, 4vw, 2rem)',
                borderRadius: 18,
                background: got ? topicSoft(s.color) : 'transparent',
                border: got
                  ? `3px solid color-mix(in oklch, ${topicColor(s.color)} 55%, white)`
                  : '3px dashed var(--border)',
                boxShadow: got ? `0 4px 0 color-mix(in oklch, ${topicColor(s.color)} 55%, white)` : 'none',
                transform: got ? `rotate(${i % 2 === 0 ? -3 : 3}deg)` : undefined,
                color: 'var(--border)',
              }}
            >
              {got ? s.emoji : '?'}
            </li>
          )
        })}
      </ul>

      <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--font-size-small)', marginTop: 'var(--spacing-sm)' }}>
        {next
          ? `Earn ${next.stars - totalStars} more ${next.stars - totalStars === 1 ? 'star' : 'stars'} to unlock the next sticker.`
          : 'You collected every sticker. Amazing!'}
      </p>
    </div>
  )
}
