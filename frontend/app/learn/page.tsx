'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { AppShell } from '@/components/layout/AppShell'
import { useAuth } from '@/lib/auth'
import { fetchLearningLanguages, type LearningLanguage } from '@/lib/languages'

// Learn page: first step that lists available languages.
export default function LearnLanguagesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [languages, setLanguages] = useState<LearningLanguage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Redirect guests to login before showing learning content.
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, router, user])

  useEffect(() => {
    if (authLoading || !user) {
      return
    }

    // Fetch language cards once auth is confirmed.
    const load = async () => {
      setLoading(true)
      setError('')

      try {
        const rows = await fetchLearningLanguages()
        setLanguages(rows)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load languages.')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [authLoading, user])

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
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-text-muted">Learn</p>
          <h1 className="mt-2 text-2xl font-semibold text-text-primary">Choose a Language</h1>
          <p className="mt-1 text-sm text-text-muted">Select a language to view its learning paths.</p>
        </div>

        {error ? (
          <div className="rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center gap-2 py-12">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            <span className="text-sm text-text-muted">Loading languages...</span>
          </div>
        ) : languages.length === 0 ? (
          <div className="card text-center">
            <p className="text-sm text-text-muted">No languages available yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {languages.map((language) => (
              <Link
                key={language.slug}
                href={`/learn/${language.slug}`}
                className="group card-interactive"
              >
                <p className="text-sm font-semibold text-text-primary group-hover:text-white">{language.name}</p>
                <p className="mt-1 text-xs text-text-muted">View paths</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
