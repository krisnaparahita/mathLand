/** Decorative shapes that drift slowly behind a hero. Hidden from screen readers. */
export function FloatingShapes() {
  return (
    <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
      <span
        className="float-shape"
        style={{ top: -8, right: '6%', width: 54, height: 54, borderRadius: '50%', background: 'var(--c-sun)' }}
      />
      <span
        className="float-shape"
        style={{ bottom: 8, left: '46%', width: 40, height: 40, borderRadius: 12, background: 'var(--c-sky)', animationDelay: '-2s' }}
      />
      <span
        className="float-shape"
        style={{
          top: '4%',
          left: '49%',
          width: 48,
          height: 44,
          background: 'var(--c-grape)',
          clipPath: 'polygon(50% 0, 100% 100%, 0 100%)',
          animationDelay: '-4s',
        }}
      />
      <span
        className="float-shape font-display"
        style={{ top: '52%', left: '50%', fontSize: '3rem', fontWeight: 700, color: 'var(--c-pink)', animationDelay: '-1s' }}
      >
        +
      </span>
    </div>
  )
}
