'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { PageShell } from '@/components/layout/PageShell'
import { useAuth } from '@/lib/auth'

// Login page: collects credentials and starts authenticated session.
export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth()
  // Form state for controlled inputs and UX feedback.
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Skip login screen when session is already active.
  useEffect(() => {
    if (!authLoading && user) {
      window.location.href = '/dashboard'
    }
  }, [user, authLoading])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      // API call handled by auth context so user state stays centralized.
      await login(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <PageShell width="sm">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky border-t-transparent" />
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell width="sm">
      <div className="flex min-h-[70vh] flex-col justify-center">
        <div className="text-center">
          <Link href="/" className="text-2xl font-display tracking-tight text-white hover:text-sky transition">
            CodeByte
          </Link>
        </div>

        <h1 className="mt-8 text-3xl font-display text-white text-center">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-300 text-center">Sign in to continue to CodeByte.</p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm text-slate-200" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none ring-0 placeholder:text-slate-500 focus:border-sky transition"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-200" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none ring-0 placeholder:text-slate-500 focus:border-sky transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-sky px-4 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink border-t-transparent" />
                Signing in…
              </span>
            ) : (
              'Sign in'
            )}
          </button>

          <p className="text-center text-sm text-slate-300">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-sky hover:text-sky/80 transition font-medium">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </PageShell>
  )
}
