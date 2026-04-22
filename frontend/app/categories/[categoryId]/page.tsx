'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { AppShell } from '@/components/layout/AppShell'
import { useAuth } from '@/lib/auth'
import { fetchProblemsByCategory, type CategoryProblemList, type CategoryProblemSummary } from '@/lib/problems'
import { fetchProblemProgress, type ProblemProgressStatus } from '@/lib/progress'

interface ProblemsPageProps {
  params: {
    categoryId: string
  }
}

function getDot(status: ProblemProgressStatus | undefined): React.ReactNode {
  if (status === 'COMPLETED') return <div className="h-2 w-2 shrink-0 rounded-full bg-success" />
  if (status === 'IN_PROGRESS') return <div className="h-2 w-2 shrink-0 rounded-full bg-warning" />
  return <div className="h-2 w-2 shrink-0 rounded-full bg-surface-3" />
}

function getMasteryLabel(status: ProblemProgressStatus | undefined): string {
  if (status === 'COMPLETED') return 'Mastered'
  if (status === 'IN_PROGRESS') return 'Learning'
  return ''
}

function getDifficultyClass(d?: string | null): string {
  const level = d?.toLowerCase() ?? ''
  if (level === 'easy') return 'text-success'
  if (level === 'medium') return 'text-warning'
  return 'text-danger'
}

export default function CategoryProblemsPage({ params }: ProblemsPageProps) {
  const { user, loading: authLoading } = useAuth()

  const [data, setData] = useState<CategoryProblemList | null>(null)
  const [progressByProblemId, setProgressByProblemId] = useState<Record<string, ProblemProgressStatus>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const result = await fetchProblemsByCategory(params.categoryId)
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load problems.')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [params.categoryId])

  const loadProgress = useCallback(async () => {
    if (authLoading || !user) {
      setProgressByProblemId({})
      return
    }
    try {
      const progress = await fetchProblemProgress(params.categoryId)
      const mapped = progress.reduce<Record<string, ProblemProgressStatus>>((acc, item) => {
        acc[item.problemId] = item.status
        return acc
      }, {})
      setProgressByProblemId(mapped)
    } catch {
      setProgressByProblemId({})
    }
  }, [authLoading, params.categoryId, user])

  useEffect(() => {
    void loadProgress()
  }, [loadProgress])

  useEffect(() => {
    const handleRefresh = () => void loadProgress()
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') handleRefresh()
    }
    window.addEventListener('focus', handleRefresh)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.removeEventListener('focus', handleRefresh)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [loadProgress])

  const totalProblems = data?.problems.length ?? 0
  const completedProblems = data?.problems.filter((p) => progressByProblemId[p.id] === 'COMPLETED').length ?? 0
  const completionPercent = totalProblems > 0 ? Math.round((completedProblems / totalProblems) * 100) : 0

  const nextProblem = useMemo(() => {
    if (!data?.problems.length) return null
    const inProg = data.problems.find((p) => progressByProblemId[p.id] === 'IN_PROGRESS')
    if (inProg) return inProg
    const notStarted = data.problems.find((p) => !progressByProblemId[p.id])
    return notStarted ?? data.problems[0]
  }, [data?.problems, progressByProblemId])

  return (
    <AppShell>
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link
              href={data ? `/languages/${data.category.languageId}` : '/languages'}
              className="text-xs text-text-muted hover:text-accent-light"
            >
              ← Back to paths
            </Link>
            <h1 className="mt-2 text-2xl font-semibold text-text-primary">
              {data?.category.name ?? 'Problems'}
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              {completedProblems} of {totalProblems} exercises completed
            </p>
          </div>
          {nextProblem && (
            <Link href={`/workspace/${nextProblem.id}`} className="button-primary text-xs">
              {completedProblems > 0 ? 'Continue' : 'Start'} →
            </Link>
          )}
        </div>

        {/* Progress bar */}
        {totalProblems > 0 && (
          <div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${Math.max(0, Math.min(100, completionPercent))}%` }}
              />
            </div>
            <p className="mt-1.5 text-right text-[11px] text-text-muted">{completionPercent}%</p>
          </div>
        )}

        {/* Problem list */}
        {loading ? (
          <div className="flex items-center gap-2 py-12">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            <span className="text-sm text-text-muted">Loading exercises...</span>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        ) : !data || data.problems.length === 0 ? (
          <div className="card text-center">
            <p className="text-sm text-text-muted">No exercises in this module yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.problems.map((problem) => {
              const status = progressByProblemId[problem.id]
              const mastery = getMasteryLabel(status)

              return (
                <Link
                  key={problem.id}
                  href={`/workspace/${problem.id}`}
                  className="group flex items-center justify-between rounded-xl bg-surface-1 px-5 py-4 transition hover:bg-surface-2"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {getDot(status)}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text-primary group-hover:text-white">
                        {problem.title}
                      </p>
                      {problem.difficulty && (
                        <span className={`text-[11px] font-medium ${getDifficultyClass(problem.difficulty)}`}>
                          {problem.difficulty}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {mastery && (
                      <span className={status === 'COMPLETED' ? 'badge-mastered' : 'badge-learning'}>
                        {mastery}
                      </span>
                    )}
                    <svg
                      className="h-4 w-4 text-text-muted opacity-0 transition group-hover:opacity-100"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}
