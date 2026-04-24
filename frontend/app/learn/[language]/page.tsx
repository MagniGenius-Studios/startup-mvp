'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { AppShell } from '@/components/layout/AppShell'
import { useAuth } from '@/lib/auth'
import { fetchTracksByLanguage, LANGUAGE_META, normalizeLanguage, type LearningTrack } from '@/lib/languages'

interface LearnTracksPageProps {
  params: {
    language: string
  }
}

export default function LearnTracksPage({ params }: LearnTracksPageProps) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [tracks, setTracks] = useState<LearningTrack[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const languageSlug = params.language
  const languageLabel = useMemo(() => {
    const normalized = normalizeLanguage(languageSlug)
    return normalized ? LANGUAGE_META[normalized].label : languageSlug
  }, [languageSlug])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, router, user])

  useEffect(() => {
    if (authLoading || !user) {
      return
    }

    const load = async () => {
      setLoading(true)
      setError('')

      try {
        const rows = await fetchTracksByLanguage(languageSlug)
        setTracks(rows)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tracks.')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [authLoading, languageSlug, user])

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
          <Link href="/learn" className="text-xs text-text-muted hover:text-accent-light">
            ← Back to languages
          </Link>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-text-muted">Learn</p>
            <h1 className="mt-2 text-2xl font-semibold text-text-primary">{languageLabel} Paths</h1>
            <p className="mt-1 text-sm text-text-muted">Choose a path to see its problems.</p>
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
            <span className="text-sm text-text-muted">Loading paths...</span>
          </div>
        ) : tracks.length === 0 ? (
          <div className="card text-center">
            <p className="text-sm text-text-muted">No paths available for this language yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tracks.map((track) => (
              <Link
                key={track.id}
                href={`/learn/${languageSlug}/${track.id}`}
                className="group card-interactive block"
              >
                <p className="text-sm font-semibold text-text-primary group-hover:text-white">{track.title}</p>
                <p className="mt-1 text-xs text-text-muted">{track.description || 'No description provided.'}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
