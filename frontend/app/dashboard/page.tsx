'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { AppShell } from '@/components/layout/AppShell'
import { useAuth } from '@/lib/auth'
import {
  fetchDashboard,
  type DashboardData,
  type ProgressStatusLabel,
} from '@/lib/dashboard'
import { PROGRESS_UPDATED_EVENT } from '@/lib/progressEvents'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getTimeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'yesterday'
  return `${days}d ago`
}

function getMasteryLabel(status: ProgressStatusLabel): string {
  if (status === 'COMPLETED') return 'Mastered'
  if (status === 'IN_PROGRESS') return 'Learning'
  return 'Not Started'
}

function getMasteryBadgeClass(status: ProgressStatusLabel): string {
  if (status === 'COMPLETED') return 'badge-mastered'
  if (status === 'IN_PROGRESS') return 'badge-learning'
  return 'badge-new'
}

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth()
  const router = useRouter()

  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, router, user])

  const continueHref = useMemo(() => {
    const recentProblemId = dashboard?.recentSubmissions[0]?.problemId
    return recentProblemId ? `/workspace/${recentProblemId}` : '/languages'
  }, [dashboard?.recentSubmissions])

  const loadDashboard = useCallback(async () => {
    if (authLoading || !user) return
    setLoading(true)
    setError('')
    try {
      const data = await fetchDashboard()
      setDashboard(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard.')
    } finally {
      setLoading(false)
    }
  }, [authLoading, user])

  useEffect(() => {
    if (authLoading || !user) return
    void loadDashboard()

    const intervalId = window.setInterval(() => void loadDashboard(), 30000)
    const handleRefresh = () => void loadDashboard()
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') handleRefresh()
    }

    window.addEventListener('focus', handleRefresh)
    window.addEventListener(PROGRESS_UPDATED_EVENT, handleRefresh)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('focus', handleRefresh)
      window.removeEventListener(PROGRESS_UPDATED_EVENT, handleRefresh)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [authLoading, loadDashboard, user])

  if (authLoading || (user && loading && !dashboard)) {
    return (
      <AppShell>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      </AppShell>
    )
  }

  if (!user) return null

  const recentSubmission = dashboard?.recentSubmissions[0]

  return (
    <AppShell>
      <div className="animate-fade-in space-y-8">
        {/* ─── Greeting ──────────────────────────── */}
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            {getGreeting()}, {user.name?.split(' ')[0] || 'Learner'} 👋
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Continue your learning journey
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        {/* ─── Continue Learning Card ────────────── */}
        {recentSubmission && (
          <Link href={continueHref} className="group block">
            <div className="card-interactive relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-accent-light">Continue Learning</p>
                  <p className="mt-1 truncate text-lg font-semibold text-text-primary">
                    {recentSubmission.title}
                  </p>
                  <p className="mt-0.5 text-sm text-text-muted">
                    Last attempted {getTimeAgo(String(recentSubmission.createdAt))}
                  </p>
                </div>
                <div className="shrink-0 rounded-xl bg-accent/10 px-4 py-2.5 text-sm font-semibold text-accent-light transition group-hover:bg-accent group-hover:text-white">
                  Continue →
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* ─── Progress Stats ────────────────────── */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card text-center">
            <div className="text-3xl font-semibold text-text-primary">
              {dashboard?.completedProblems ?? 0}
            </div>
            <p className="mt-1 text-xs text-text-muted">Mastered</p>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-semibold text-text-primary">
              {dashboard?.inProgressProblems ?? 0}
            </div>
            <p className="mt-1 text-xs text-text-muted">Learning</p>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-semibold text-text-primary">
              <span className="mr-1">🔥</span>{dashboard?.streak ?? 0}
            </div>
            <p className="mt-1 text-xs text-text-muted">Day Streak</p>
          </div>
        </div>

        {/* ─── Learning Paths ────────────────────── */}
        {dashboard?.languageProgress?.length ? (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Learning Paths</h2>
              <Link href="/languages" className="text-xs text-text-muted hover:text-accent-light">
                View all →
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {dashboard.languageProgress.map((lang) => {
                const percent = Math.max(0, Math.min(100, lang.completionPercent))
                return (
                  <Link
                    key={lang.languageId}
                    href={`/languages/${lang.languageId}`}
                    className="card-interactive"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-text-primary">{lang.languageName}</p>
                        <p className="mt-0.5 text-xs text-text-muted">
                          {lang.completedProblems}/{lang.totalProblems} problems
                        </p>
                      </div>
                      <span className={getMasteryBadgeClass(lang.statusLabel)}>
                        {getMasteryLabel(lang.statusLabel)}
                      </span>
                    </div>
                    <div className="mt-3">
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${percent}%` }} />
                      </div>
                      <p className="mt-1.5 text-right text-[11px] text-text-muted">{percent}%</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        ) : null}

        {/* ─── Focus Areas (Weak Concepts) ───────── */}
        {dashboard?.weakConcepts?.length ? (
          <section>
            <h2 className="mb-4 text-lg font-semibold text-text-primary">Focus Areas</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {dashboard.weakConcepts.map((wc) => {
                const score = Math.max(0, Math.min(100, wc.score))
                return (
                  <div key={wc.concept.id} className="card">
                    <p className="text-sm font-medium text-text-primary">{wc.concept.name}</p>
                    <div className="mt-2">
                      <div className="progress-track">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            score >= 70 ? 'bg-success' : score >= 30 ? 'bg-warning' : 'bg-accent'
                          }`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <p className="mt-1.5 text-right text-[11px] text-text-muted">
                        {score >= 70 ? 'Strong' : score >= 30 ? 'Improving' : 'Beginner'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ) : null}

        {/* ─── Recommended For You ────────────────── */}
        {dashboard?.recommendedProblems?.length ? (
          <section>
            <h2 className="mb-4 text-lg font-semibold text-text-primary">Recommended For You</h2>
            <div className="space-y-2">
              {dashboard.recommendedProblems.map((rec) => (
                <Link
                  key={rec.problemId}
                  href={`/workspace/${rec.problemId}`}
                  className="group flex items-center justify-between rounded-xl bg-surface-1 px-4 py-3 transition hover:bg-surface-2"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-sm">🎯</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text-primary group-hover:text-white">
                        {rec.title}
                      </p>
                      {rec.concepts.length > 0 && (
                        <div className="mt-0.5 flex flex-wrap gap-1">
                          {rec.concepts.map((c) => (
                            <span key={c} className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] text-accent-light">
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {rec.difficulty && (
                    <span className={`shrink-0 text-[11px] font-medium ${
                      rec.difficulty.toLowerCase() === 'easy' ? 'text-success' :
                      rec.difficulty.toLowerCase() === 'medium' ? 'text-warning' : 'text-danger'
                    }`}>
                      {rec.difficulty}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {/* ─── Recent Activity ───────────────────── */}
        {dashboard?.recentSubmissions?.length ? (
          <section>
            <h2 className="mb-4 text-lg font-semibold text-text-primary">Recent Activity</h2>
            <div className="space-y-2">
              {dashboard.recentSubmissions.slice(0, 5).map((sub) => (
                <Link
                  key={`${sub.problemId}-${sub.createdAt}`}
                  href={`/workspace/${sub.problemId}`}
                  className="flex items-center justify-between rounded-xl bg-surface-1 px-4 py-3 transition hover:bg-surface-2"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-2 w-2 rounded-full ${sub.isCorrect ? 'bg-success' : 'bg-danger'}`} />
                    <span className="truncate text-sm text-text-primary">{sub.title}</span>
                  </div>
                  <span className="shrink-0 text-xs text-text-muted">
                    {getTimeAgo(String(sub.createdAt))}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : (
          <section className="card text-center">
            <p className="text-sm text-text-muted">
              No activity yet. Start a{' '}
              <Link href="/languages" className="text-accent-light hover:underline">
                learning path
              </Link>{' '}
              to begin your journey.
            </p>
          </section>
        )}
      </div>
    </AppShell>
  )
}
