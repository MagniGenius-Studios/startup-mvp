'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { AppShell } from '@/components/layout/AppShell'
import { useAuth } from '@/lib/auth'
import {
  fetchCategoriesByLanguage,
  fetchLanguages,
  type CategorySummary,
  type LanguageSummary,
} from '@/lib/catalog'
import { fetchDashboard, type DashboardData, type LanguageProgressItem } from '@/lib/dashboard'
import { PROGRESS_UPDATED_EVENT } from '@/lib/progressEvents'

interface LanguageCatalogMeta {
  categories: CategorySummary[]
  totalProblems: number
}

function getMasteryLabel(percent: number): string {
  if (percent >= 100) return 'Mastered'
  if (percent >= 50) return 'Improving'
  if (percent > 0) return 'Learning'
  return 'Not Started'
}

function getMasteryBadgeClass(percent: number): string {
  if (percent >= 100) return 'badge-mastered'
  if (percent > 0) return 'badge-learning'
  return 'badge-new'
}

function getResumeHref(
  languageId: string,
  catalogMeta: LanguageCatalogMeta | undefined,
  recentProblemId: string | undefined,
): string {
  if (recentProblemId) return `/workspace/${recentProblemId}`
  if (catalogMeta?.categories[0]?.id) return `/categories/${catalogMeta.categories[0].id}`
  return `/languages/${languageId}`
}

export default function LanguagesPage() {
  const { user, loading: authLoading } = useAuth()

  const [languages, setLanguages] = useState<LanguageSummary[]>([])
  const [catalogByLanguageId, setCatalogByLanguageId] = useState<Record<string, LanguageCatalogMeta>>({})
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const languageList = await fetchLanguages()
        setLanguages(languageList)

        const metadataEntries = await Promise.all(
          languageList.map(async (language) => {
            try {
              const categories = await fetchCategoriesByLanguage(language.id)
              const totalProblems = categories.reduce((sum, category) => sum + category.problemCount, 0)
              return [language.id, { categories, totalProblems }] as const
            } catch {
              return [language.id, { categories: [], totalProblems: 0 }] as const
            }
          }),
        )

        setCatalogByLanguageId(Object.fromEntries(metadataEntries))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load learning paths.')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const loadDashboard = useCallback(async () => {
    if (authLoading || !user) {
      setDashboard(null)
      return
    }
    try {
      const data = await fetchDashboard()
      setDashboard(data)
    } catch {
      setDashboard(null)
    }
  }, [authLoading, user])

  useEffect(() => {
    if (authLoading) return
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
  }, [authLoading, loadDashboard])

  const languageProgressById = useMemo(() => {
    if (!dashboard?.languageProgress.length) return {} as Record<string, LanguageProgressItem>
    return dashboard.languageProgress.reduce<Record<string, LanguageProgressItem>>((acc, item) => {
      acc[item.languageId] = item
      return acc
    }, {})
  }, [dashboard?.languageProgress])

  const recentProblemByLanguageId = useMemo(() => {
    const mapped: Record<string, string> = {}
    if (!dashboard?.recentSubmissions.length) return mapped
    for (const submission of dashboard.recentSubmissions) {
      if (submission.languageId && !mapped[submission.languageId]) {
        mapped[submission.languageId] = submission.problemId
      }
    }
    return mapped
  }, [dashboard?.recentSubmissions])

  return (
    <AppShell>
      <div className="animate-fade-in space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Learning Paths</h1>
          <p className="mt-1 text-sm text-text-muted">
            Choose a path and build your skills step by step
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center gap-2 py-12">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            <span className="text-sm text-text-muted">Loading paths...</span>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        ) : languages.length === 0 ? (
          <div className="card text-center">
            <p className="text-sm text-text-muted">No learning paths available yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {languages.map((language) => {
              const catalogMeta = catalogByLanguageId[language.id]
              const totalProblems = catalogMeta?.totalProblems ?? 0
              const modules = catalogMeta?.categories.length ?? 0
              const progress = languageProgressById[language.id]
              const completionPercent = progress?.completionPercent ?? 0
              const completed = progress?.completedProblems ?? 0
              const resumeHref = getResumeHref(language.id, catalogMeta, recentProblemByLanguageId[language.id])

              return (
                <div key={language.id} className="card-interactive group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent-dim/20 text-lg">
                          {language.name === 'Python' ? '🐍' : language.name === 'JavaScript' ? '⚡' : '💻'}
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-text-primary">
                            {language.name} Foundations
                          </h2>
                          <p className="text-xs text-text-muted">
                            {modules} modules · {totalProblems} exercises
                          </p>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-text-secondary">{completed} of {totalProblems} completed</span>
                          <span className={getMasteryBadgeClass(completionPercent)}>
                            {getMasteryLabel(completionPercent)}
                          </span>
                        </div>
                        <div className="progress-track mt-2">
                          <div
                            className="progress-fill"
                            style={{ width: `${Math.max(0, Math.min(100, completionPercent))}%` }}
                          />
                        </div>
                      </div>

                      {/* Modules preview */}
                      {catalogMeta?.categories.length ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {catalogMeta.categories.slice(0, 4).map((cat) => (
                            <Link
                              key={cat.id}
                              href={`/categories/${cat.id}`}
                              className="rounded-lg bg-surface-2 px-3 py-1.5 text-xs text-text-secondary transition hover:bg-surface-3 hover:text-text-primary"
                            >
                              {cat.name}
                            </Link>
                          ))}
                          {catalogMeta.categories.length > 4 && (
                            <span className="rounded-lg bg-surface-2 px-3 py-1.5 text-xs text-text-muted">
                              +{catalogMeta.categories.length - 4} more
                            </span>
                          )}
                        </div>
                      ) : null}
                    </div>

                    {/* CTA */}
                    <div className="shrink-0 pt-1">
                      <Link
                        href={resumeHref}
                        className="button-primary text-xs"
                      >
                        {completed > 0 ? 'Continue' : 'Start'} →
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}
