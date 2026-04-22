'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { PageShell } from '@/components/layout/PageShell'
import { useAuth } from '@/lib/auth'
import {
  fetchCategoriesByLanguage,
  fetchLanguages,
  type CategorySummary,
  type LanguageSummary,
} from '@/lib/catalog'
import {
  fetchDashboard,
  type DashboardData,
  type LanguageProgressItem,
  type ProgressStatusLabel,
} from '@/lib/dashboard'
import { PROGRESS_UPDATED_EVENT } from '@/lib/progressEvents'

interface CategoriesPageProps {
  params: {
    languageId: string
  }
}

const CATEGORY_SUBTITLES = [
  'Start with practical foundations and build confidence quickly.',
  'Apply concepts through guided problem-solving drills.',
  'Sharpen your fluency with mixed real-world coding tasks.',
  'Consolidate everything with tougher progression checkpoints.',
]

function estimateHours(totalProblems: number): number {
  return Math.max(1, Math.ceil(totalProblems * 0.45))
}

function getLearnerLabel(totalProblems: number): string {
  return `${Math.max(18, totalProblems * 4.2).toFixed(1)}k Learners`
}

function getLanguageSubtitle(languageName: string): string {
  return `Learn ${languageName} through structured modules, practical challenges, and focused coding practice.`
}

function getProgressLabel(status: ProgressStatusLabel | undefined): string {
  if (status === 'COMPLETED') return 'Completed'
  if (status === 'IN_PROGRESS') return 'In Progress'
  return 'Not Started'
}

function getProgressClass(status: ProgressStatusLabel | undefined): string {
  if (status === 'COMPLETED') return 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
  if (status === 'IN_PROGRESS') return 'border-amber-500/30 bg-amber-500/15 text-amber-300'
  return 'border-slate-500/30 bg-slate-600/20 text-slate-300'
}

function getResumeHref(
  languageId: string,
  categories: CategorySummary[],
  recentSubmissions: DashboardData['recentSubmissions'] | undefined,
): string {
  const recentProblemId = recentSubmissions?.find((submission) => submission.languageId === languageId)?.problemId
  if (recentProblemId) {
    return `/workspace/${recentProblemId}`
  }

  if (categories[0]?.id) {
    return `/categories/${categories[0].id}`
  }

  return '/languages'
}

export default function CategoriesPage({ params }: CategoriesPageProps) {
  const { user, loading: authLoading } = useAuth()

  const [language, setLanguage] = useState<LanguageSummary | null>(null)
  const [categories, setCategories] = useState<CategorySummary[]>([])
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const [languageList, categoryList] = await Promise.all([
          fetchLanguages(),
          fetchCategoriesByLanguage(params.languageId),
        ])
        setLanguage(languageList.find((item) => item.id === params.languageId) ?? null)
        setCategories(categoryList)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load categories.')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [params.languageId])

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
    if (authLoading) {
      return
    }

    void loadDashboard()

    const intervalId = window.setInterval(() => {
      void loadDashboard()
    }, 30000)

    const handleRefresh = () => {
      void loadDashboard()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleRefresh()
      }
    }

    window.addEventListener('focus', handleRefresh)
    window.addEventListener('pageshow', handleRefresh)
    window.addEventListener(PROGRESS_UPDATED_EVENT, handleRefresh)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('focus', handleRefresh)
      window.removeEventListener('pageshow', handleRefresh)
      window.removeEventListener(PROGRESS_UPDATED_EVENT, handleRefresh)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [authLoading, loadDashboard])

  const languageProgress = useMemo<LanguageProgressItem | null>(() => {
    return dashboard?.languageProgress.find((item) => item.languageId === params.languageId) ?? null
  }, [dashboard?.languageProgress, params.languageId])

  const totalProblems = useMemo(
    () => categories.reduce((sum, category) => sum + category.problemCount, 0),
    [categories],
  )
  const totalModules = categories.length
  const completedProblems = languageProgress?.completedProblems ?? 0
  const inProgressProblems = languageProgress?.inProgressProblems ?? 0
  const notStartedProblems = Math.max(0, totalProblems - completedProblems - inProgressProblems)
  const completionPercent = languageProgress?.completionPercent ?? 0
  const resumeHref = getResumeHref(params.languageId, categories, dashboard?.recentSubmissions)

  return (
    <PageShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Language Journey</p>
          <h1 className="mt-2 text-3xl font-display text-white">
            {language ? `Learn ${language.name} Programming` : 'Language Path'}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Follow the modules in order and jump right back into your latest workspace attempt.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200 transition hover:border-white/40"
          >
            Dashboard
          </Link>
          <Link
            href="/languages"
            className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200 transition hover:border-white/40"
          >
            All Languages
          </Link>
        </div>
      </div>

      <div className="mb-5 rounded-xl border border-white/10 bg-gradient-to-r from-[#1f2937]/90 via-[#243248]/90 to-[#1f2937]/90 px-5 py-3 text-sm text-slate-200">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs uppercase tracking-[0.16em] text-slate-300">
            Roadmap
          </span>
          <span>
            This path is part of{' '}
            <span className="font-semibold text-white">{language?.name ?? 'the selected language'} Track</span>
          </span>
          <Link
            href="/dashboard"
            className="ml-auto text-xs font-semibold uppercase tracking-[0.12em] text-sky transition hover:text-sky/80"
          >
            View Progress Hub
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-sm text-slate-300">
          Loading categories...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-8 text-sm text-red-300">
          {error}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <article className="overflow-hidden rounded-2xl border border-sky/20 bg-gradient-to-br from-[#21539d] via-[#1e3a8a] to-[#101a33] shadow-[0_12px_36px_rgba(16,24,40,0.35)]">
              <div className="relative bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:34px_34px] px-6 py-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-yellow-300/95 text-2xl font-bold text-[#805500]">
                      {(language?.name ?? 'L').slice(0, 1)}
                    </div>
                    <h2 className="text-4xl font-display text-white">
                      Learn {language?.name ?? 'Language'} Programming
                    </h2>
                    <p className="mt-2 max-w-4xl text-sm leading-7 text-sky-100/90">
                      {getLanguageSubtitle(language?.name ?? 'this language')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-[#355fb5]">
                      Certification Available
                    </span>
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-[#b46900]">
                      4.6 (82.5k+)
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-5 text-sm font-semibold text-sky-50/90">
                  <span>{totalModules} Modules</span>
                  <span>{estimateHours(totalProblems)} Hours</span>
                  <span>{totalProblems} Problems</span>
                  <span>{getLearnerLabel(totalProblems)}</span>
                  <span>Beginner Level</span>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="min-w-[260px] flex-1">
                    <p className="text-sm font-semibold text-sky-100">
                      Your Progress: <span className="text-emerald-300">{completionPercent}% Completed</span>
                      <span className="ml-2 text-sky-200/80">
                        ({completedProblems} solved • {inProgressProblems} in progress)
                      </span>
                    </p>
                    <div className="mt-2 h-2 rounded-full bg-[#0f2241]/80">
                      <div
                        className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                        style={{ width: `${Math.max(0, Math.min(100, completionPercent))}%` }}
                      />
                    </div>
                  </div>
                  <Link
                    href={resumeHref}
                    className="rounded-lg bg-sky px-6 py-2 text-sm font-semibold text-white transition hover:bg-sky/90"
                  >
                    {completionPercent === 100 ? 'Revise' : 'Resume'}
                  </Link>
                </div>
              </div>
            </article>

            <aside className="rounded-2xl border border-white/10 bg-[#131c2d] p-5">
              <h3 className="text-lg font-display text-white">Path Snapshot</h3>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Completed</span>
                  <span className="font-semibold text-emerald-300">{completedProblems}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">In Progress</span>
                  <span className="font-semibold text-amber-300">{inProgressProblems}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Not Started</span>
                  <span className="font-semibold text-slate-200">{notStartedProblems}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Current Stage</span>
                  <span className={`rounded border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] ${getProgressClass(languageProgress?.statusLabel)}`}>
                    {getProgressLabel(languageProgress?.statusLabel)}
                  </span>
                </div>
              </div>
              <Link
                href={resumeHref}
                className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-sky px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky/90"
              >
                Open Workspace
              </Link>
            </aside>
          </div>

          {categories.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-sm text-slate-300">
              No categories available for this language.
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map((category, index) => (
                <article
                  key={category.id}
                  className="rounded-2xl border border-white/10 bg-[#111827] p-6 shadow-[0_8px_28px_rgba(15,23,42,0.25)]"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-700/40 text-xl font-bold text-white">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-2xl font-display text-white">{category.name}</h3>
                          <p className="mt-1 text-sm text-slate-400">
                            {CATEGORY_SUBTITLES[index % CATEGORY_SUBTITLES.length]}
                          </p>
                        </div>
                        <span className="rounded-full bg-sky/15 px-3 py-1 text-sm font-semibold text-sky-200">
                          {category.problemCount} Problems
                        </span>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center gap-2">
                        <Link
                          href={`/categories/${category.id}`}
                          className="rounded-lg bg-sky px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky/90"
                        >
                          Open Module
                        </Link>
                        <Link
                          href={`/categories/${category.id}`}
                          className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-white/40"
                        >
                          View Roadmap
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </PageShell>
  )
}
