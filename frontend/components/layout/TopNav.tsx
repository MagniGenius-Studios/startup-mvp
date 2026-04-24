'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { useAuth } from '@/lib/auth'

// Top navigation: primary app links + user actions for signed-in sessions.
const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: '◉' },
  { href: '/learn', label: 'Learn', icon: '📚' },
  { href: '/workspace', label: 'Practice', icon: '⌨' },
] as const

function getUserInitials(name?: string | null, email?: string | null): string {
  if (name) {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  return email?.[0]?.toUpperCase() ?? '?'
}

export function TopNav() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const initials = getUserInitials(user?.name, user?.email)

  return (
    <nav className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-white/[0.06] bg-surface-0/90 px-6 backdrop-blur-md">
      {/* Left: Logo + nav links */}
      <div className="flex items-center gap-8">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-dim">
            <span className="text-sm font-bold text-white">C</span>
          </div>
          <span className="text-[15px] font-semibold text-text-primary">CodeByte</span>
        </Link>

        <div className="flex items-center gap-1">
          {navLinks.map((link) => {
            // Highlight current section for quick orientation.
            const isActive = pathname?.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3.5 py-2 text-[13px] font-medium transition-all ${
                  isActive
                    ? 'bg-accent/10 text-accent-light'
                    : 'text-text-secondary hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="mr-1.5 text-xs">{link.icon}</span>
                {link.label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Right: User */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <button
              onClick={() => void logout()}
              className="rounded-lg px-3 py-1.5 text-xs text-text-muted transition hover:bg-white/5 hover:text-text-secondary"
            >
              Sign out
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-dim">
              <span className="text-[11px] font-bold text-white">{initials}</span>
            </div>
          </>
        ) : (
          <Link href="/login" className="button-primary text-xs">
            Sign in
          </Link>
        )}
      </div>
    </nav>
  )
}
