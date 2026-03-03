'use client'

import Link from 'next/link'
import { useEffect } from 'react'

import { PageShell } from '@/components/layout/PageShell'
import { useAuth } from '@/lib/auth'

const mockStats = [
  { label: 'Active tracks', value: '3' },
  { label: 'Lessons completed', value: '42' },
  { label: 'Problems solved', value: '118' },
]

export default function DashboardPage() {
  const { user, loading, logout } = useAuth()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login'
    }
  }, [user, loading])

  if (loading) {
    return (
      <PageShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky border-t-transparent" />
        </div>
      </PageShell>
    )
  }

  if (!user) {
    return null
  }

  return (
    <PageShell>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Dashboard</p>
          <h1 className="text-3xl font-display text-white">
            Welcome, {user.name || 'Learner'} 👋
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-slate-100 transition hover:border-white/40"
          >
            Home
          </Link>
          <button
            onClick={() => void logout()}
            className="rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300 transition hover:bg-red-500/20"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
        <p className="text-sm text-slate-300">
          Signed in as <span className="font-medium text-white">{user.email}</span>
          <span className="ml-2 rounded-full bg-sky/20 px-2 py-0.5 text-xs text-sky">{user.role}</span>
        </p>
      </div>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {mockStats.map((stat) => (
          <div key={stat.label} className="card border-white/5 bg-white/5 text-center">
            <div className="text-3xl font-display text-white">{stat.value}</div>
            <p className="text-sm text-slate-300">{stat.label}</p>
          </div>
        ))}
      </section>

      <section className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="card">
          <h2 className="font-display text-xl text-white">Next up</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-200">
            <li className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3">
              <span>Lesson: Recursive problem solving</span>
              <span className="text-xs text-slate-400">Est. 25 min</span>
            </li>
            <li className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3">
              <span>Problem: Balanced parentheses</span>
              <span className="text-xs text-slate-400">Est. 15 min</span>
            </li>
            <li className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3">
              <span>Reflection prompt</span>
              <span className="text-xs text-slate-400">Est. 5 min</span>
            </li>
          </ul>
        </div>
        <div className="card">
          <h2 className="font-display text-xl text-white">Recent feedback</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-200">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="font-semibold text-mint">L3 • Array transformations</p>
              <p className="mt-2 text-slate-300">
                Improve time complexity by avoiding nested loops; consider using a hash map to cache lookups.
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="font-semibold text-sky">L2 • State management</p>
              <p className="mt-2 text-slate-300">
                Great progress! Next, refactor to pure functions so edge cases are easier to test.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
