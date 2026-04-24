'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { AppShell } from '@/components/layout/AppShell'
import { useAuth } from '@/lib/auth'
import { LANGUAGE_META, normalizeLanguage } from '@/lib/languages'
import { fetchProblemProgress, type ProblemProgressItem, type ProblemProgressStatus } from '@/lib/progress'
import { fetchProblemsByTrack, type ProblemSummary } from '@/lib/problems'

interface LearnTrackProblemsPageProps {
  params: {
    language: string
    track: string
  }
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

// Learn track page: problem list with completion dots for selected track.
function getDot(status: ProblemProgressStatus | undefined): React.ReactNode {
  if (status === 'COMPLETED') return <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-success" />
  if (status === 'IN_PROGRESS') return <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-warning" />
  return <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-surface-3" />
}

function getDifficultyClass(level: string): string {
  const normalized = level.toLowerCase()
  if (normalized === 'easy') return 'text-success'
  if (normalized === 'medium') return 'text-warning'
  return 'text-danger'
}

export default function LearnTrackProblemsPage({ params }: LearnTrackProblemsPageProps) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [problems, setProblems] = useState<ProblemSummary[]>([])
  const [progressById, setProgressById] = useState<Record<string, ProblemProgressStatus>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const languageSlug = params.language
  const trackId = params.track.trim()

  const languageLabel = useMemo(() => {
    const normalized = normalizeLanguage(languageSlug)
    return normalized ? LANGUAGE_META[normalized].label : languageSlug
  }, [languageSlug])

  useEffect(() => {
    // Redirect unauthenticated users before data fetches.
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, router, user])

  useEffect(() => {
    if (authLoading || !user) {
      return
    }

    // Fetch problems + progress together so dots align with list rows.
    const load = async () => {
      setLoading(true)
      setError('')
      setProblems([])
      setProgressById({})

      if (!UUID_PATTERN.test(trackId)) {
        // Fast-fail malformed route params before calling backend.
        setError('Invalid track selected.')
        setLoading(false)
        return
      }

      try {
        const [problemRows, progressRows] = await Promise.all([
          fetchProblemsByTrack(trackId),
          fetchProblemProgress().catch(() => []),
        ])

        setProblems(problemRows)
        setProgressById(
          progressRows.reduce<Record<string, ProblemProgressStatus>>((acc, item: ProblemProgressItem) => {
            acc[item.problemId] = item.status
            return acc
          }, {}),
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load problems.')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [authLoading, trackId, user])

  if (authLoading || (!user && loading)) {
    return (
      <AppShell>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      </AppShell>
    )
  }

  if (!user) return null

  return (
    <AppShell>
      <div className="animate-fade-in space-y-6">
        <div className="space-y-2">
          <Link href={`/learn/${languageSlug}`} className="text-xs text-text-muted hover:text-accent-light">
            ← Back to {languageLabel} paths
          </Link>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-text-muted">Learn</p>
            <h1 className="mt-2 text-2xl font-semibold text-text-primary">Problem List</h1>
            <p className="mt-1 text-sm text-text-muted">Select a problem to open it in the workspace.</p>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center gap-2 py-12">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            <span className="text-sm text-text-muted">Loading problems...</span>
          </div>
        ) : problems.length === 0 ? (
          <div className="card text-center">
            <p className="text-sm text-text-muted">No problems available yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {problems.map((problem) => (
              <Link
                key={problem.id}
                href={`/workspace/${problem.id}`}
                className="group flex items-center justify-between rounded-xl bg-surface-1 px-5 py-4 transition hover:bg-surface-2"
              >
                <div className="flex min-w-0 items-center gap-3.5">
                  {getDot(progressById[problem.id])}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text-primary group-hover:text-white">
                      {problem.title}
                    </p>
                    <span className={`text-[11px] font-medium ${getDifficultyClass(problem.difficulty)}`}>
                      {problem.difficulty}
                    </span>
                  </div>
                </div>

                <svg
                  className="h-4 w-4 text-text-muted opacity-0 transition group-hover:opacity-100"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
