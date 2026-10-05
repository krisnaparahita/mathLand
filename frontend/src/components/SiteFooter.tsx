import { Link } from 'react-router-dom'
import { SITE } from '@/lib/site'

export function SiteFooter() {
  return (
    <footer
      style={{
        borderTop: '3px solid var(--border)',
        color: 'var(--muted-foreground)',
        fontSize: 'var(--font-size-small)',
      }}
    >
      <div
        className="container flex flex-wrap items-center justify-between"
        style={{ paddingBlock: 'var(--spacing-md)', gap: 'var(--spacing-sm)' }}
      >
        <span>
          {SITE.name} · {SITE.domain} · Free and open source
        </span>
        <nav className="flex items-center" style={{ gap: 'var(--spacing-md)' }}>
          <Link to="/about" className="font-semibold cursor-pointer" style={{ color: 'var(--primary)' }}>
            About
          </Link>
          <a
            href={SITE.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold cursor-pointer"
            style={{ color: 'var(--primary)' }}
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  )
}
