import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, GraduationCap, History, Home, UserRound } from 'lucide-react'
import { AvatarBubble } from './AvatarBubble'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useProfile } from '@/context/ProfileContext'
import { getGrade } from '@/curriculum'

const NAV = [
  { to: '/', label: 'Home', Icon: Home },
  { to: '/history', label: 'History', Icon: History },
  { to: '/profile', label: 'My Profile', Icon: UserRound },
]

export function AppHeader() {
  const { pathname } = useLocation()
  const { profile, profiles, selectProfile } = useProfile()

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur"
      style={{
        background: 'oklch(1 0 0 / 0.85)',
        borderBottom: '3px solid var(--border)',
      }}
    >
      <div
        className="container flex items-center justify-between"
        style={{ paddingBlock: 'var(--spacing-sm)', gap: 'var(--spacing-md)' }}
      >
        <Link to="/" className="flex items-center cursor-pointer" style={{ gap: 'var(--spacing-sm)' }}>
          <span
            className="inline-flex items-center justify-center rounded-xl"
            style={{
              width: 38,
              height: 38,
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
            }}
          >
            <GraduationCap size={22} strokeWidth={2.4} />
          </span>
          <span className="font-bold" style={{ fontSize: 'var(--font-size-title)', letterSpacing: 'var(--letter-spacing-tight)' }}>
            MathLand
          </span>
        </Link>

        <nav className="hidden md:flex items-center" style={{ gap: 'var(--spacing-xs)' }}>
          {NAV.map(({ to, label, Icon }) => {
            const active = to === '/' ? pathname === '/' : pathname.startsWith(to)
            return (
              <Link
                key={to}
                to={to}
                className="flex items-center rounded-xl cursor-pointer"
                style={{
                  gap: 'var(--spacing-xs)',
                  paddingInline: 'var(--spacing-sm)',
                  paddingBlock: 'var(--spacing-xs)',
                  fontSize: 'var(--font-size-label)',
                  fontWeight: active ? 700 : 500,
                  color: active ? 'var(--primary)' : 'var(--muted-foreground)',
                  background: active ? 'var(--muted)' : 'transparent',
                  transition: 'var(--duration-normal) var(--ease-default)',
                }}
              >
                <Icon size={16} strokeWidth={2.2} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center" style={{ gap: 'var(--spacing-sm)' }}>
          {profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="clay clay-hover flex items-center cursor-pointer"
                  style={{
                    gap: 'var(--spacing-xs)',
                    paddingInline: 'var(--spacing-sm)',
                    paddingBlock: 'var(--spacing-xs)',
                    borderRadius: '999px',
                  }}
                >
                  <AvatarBubble avatar={profile.avatar} color={profile.color} size={30} />
                  <span className="hidden sm:inline font-semibold" style={{ fontSize: 'var(--font-size-label)' }}>
                    {profile.name}
                  </span>
                  <ChevronDown size={14} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" style={{ borderRadius: 'var(--radius)', minWidth: 200 }}>
                <DropdownMenuLabel>Switch profile</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {profiles.map((p) => (
                  <DropdownMenuItem
                    key={p.id}
                    className="cursor-pointer"
                    onClick={() => selectProfile(p.id)}
                  >
                    <AvatarBubble avatar={p.avatar} color={p.color} size={24} />
                    <span>{p.name}</span>
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 'var(--font-size-small)' }}>
                      {getGrade(p.grade)?.name ?? `Grade ${p.grade}`}
                    </span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/profile">Manage profiles</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/profile"
              className="clay clay-hover cursor-pointer"
              style={{
                paddingInline: 'var(--spacing-md)',
                paddingBlock: 'var(--spacing-xs)',
                fontSize: 'var(--font-size-label)',
                fontWeight: 600,
              }}
            >
              Create profile
            </Link>
          )}
        </div>
      </div>

      <nav
        className="md:hidden flex items-center justify-around"
        style={{ borderTop: '2px solid var(--border)', paddingBlock: 'var(--spacing-xs)' }}
      >
        {NAV.map(({ to, label, Icon }) => {
          const active = to === '/' ? pathname === '/' : pathname.startsWith(to)
          return (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center cursor-pointer"
              style={{
                gap: 2,
                fontSize: 'var(--font-size-small)',
                color: active ? 'var(--primary)' : 'var(--muted-foreground)',
                fontWeight: active ? 700 : 500,
              }}
            >
              <Icon size={18} strokeWidth={2.2} />
              {label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
