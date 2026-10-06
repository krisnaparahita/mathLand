import { useState } from 'react'
import { rng } from '@/curriculum'

interface Sample {
  a: number
  b: number
  options: number[]
}

const makeSample = (): Sample => {
  const a = rng.int(4, 9)
  const b = rng.int(Math.max(4, 11 - a), 9) // the sum is always above 10, so "make a ten" applies
  const answer = a + b
  const wrong = rng.sample([answer - 2, answer - 1, answer + 1, answer + 2, answer + 3], 3)
  return { a, b, options: rng.shuffle([answer, ...wrong]) }
}

/** A tiny playable question for the home page, so visitors can try the game right away. */
export function QuickQuestion() {
  const [sample, setSample] = useState(makeSample)
  const answer = sample.a + sample.b
  const [picked, setPicked] = useState<number | null>(null)
  const [wrongPicks, setWrongPicks] = useState<number[]>([])
  const solved = picked === answer

  const choose = (value: number) => {
    if (solved) return
    if (value === answer) setPicked(value)
    else setWrongPicks((w) => (w.includes(value) ? w : [...w, value]))
  }

  const again = () => {
    setSample(makeSample())
    setPicked(null)
    setWrongPicks([])
  }

  const ten = 10 - sample.a

  return (
    <div className="clay" style={{ padding: 'var(--spacing-lg)', position: 'relative', zIndex: 1 }}>
      <div
        className="flex items-center justify-between"
        style={{ color: 'var(--muted-foreground)', fontWeight: 800, fontSize: 'var(--font-size-small)' }}
      >
        <span className="inline-flex items-center" style={{ gap: 8 }}>
          <span
            className="animate-pulse-dot"
            style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--c-mint)', display: 'inline-block' }}
          />
          Try one now
        </span>
        <span>Grade 1 · Addition</span>
      </div>

      <div
        className="font-display text-center"
        style={{ fontSize: 'clamp(2.2rem, 7vw, 3.2rem)', fontWeight: 600, padding: '12px 0 18px' }}
      >
        {sample.a} + {sample.b} = <span style={{ color: 'var(--primary)' }}>{solved ? answer : '?'}</span>
      </div>

      <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-sm)' }}>
        {sample.options.map((o) => {
          const isRight = solved && o === answer
          const isWrong = wrongPicks.includes(o)
          return (
            <button
              key={o}
              type="button"
              onClick={() => choose(o)}
              disabled={solved || isWrong}
              className={`clay clay-hover font-display cursor-pointer ${isRight ? 'animate-pop-in' : ''} ${isWrong ? 'animate-wiggle' : ''}`}
              style={{
                fontSize: '1.6rem',
                fontWeight: 600,
                padding: 'var(--spacing-sm)',
                background: isRight
                  ? 'color-mix(in oklch, var(--c-mint) 45%, white)'
                  : isWrong
                    ? 'color-mix(in oklch, var(--c-coral) 25%, white)'
                    : 'var(--card)',
                borderColor: isRight ? 'var(--c-mint)' : isWrong ? 'var(--c-coral)' : undefined,
              }}
            >
              {o}
            </button>
          )
        })}
      </div>

      <div
        aria-live="polite"
        style={{ minHeight: '3.4em', marginTop: 'var(--spacing-md)', textAlign: 'center', fontWeight: 800 }}
      >
        {solved ? (
          <>
            <span style={{ color: 'oklch(0.42 0.12 165)' }}>Correct! ★ Nice work.</span>
            <small style={{ display: 'block', fontWeight: 600, color: 'var(--muted-foreground)' }}>
              Make a ten first: {sample.a} + {ten} = 10, then add the rest.
            </small>
          </>
        ) : wrongPicks.length > 0 ? (
          <>
            <span style={{ color: 'var(--primary)' }}>Not quite, try another one!</span>
            <small style={{ display: 'block', fontWeight: 600, color: 'var(--muted-foreground)' }}>
              Smart trick: make a ten first. {sample.a} + {ten} = 10.
            </small>
          </>
        ) : (
          <span style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>Pick an answer.</span>
        )}
      </div>

      {solved && (
        <div className="text-center">
          <button
            type="button"
            onClick={again}
            className="cursor-pointer"
            style={{ background: 'none', border: 0, fontWeight: 800, color: 'var(--muted-foreground)', textDecoration: 'underline' }}
          >
            Another one
          </button>
        </div>
      )}
    </div>
  )
}
