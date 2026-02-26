'use client'

import { useState } from 'react'

import { PageShell } from '@/components/layout/PageShell'
import { api } from '@/lib/api'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      await api.post('/auth/login', { email, password })
      setMessage('Logged in (placeholder).')
    } catch (error) {
      setMessage('Login failed. Backend not implemented yet.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell width="sm">
      <h1 className="text-3xl font-display text-white">Welcome back</h1>
      <p className="mt-2 text-sm text-slate-300">Sign in to continue to CodeByte.</p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        <div className="space-y-2">
          <label className="text-sm text-slate-200" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none ring-0 placeholder:text-slate-500 focus:border-sky"
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate-200" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none ring-0 placeholder:text-slate-500 focus:border-sky"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-sky px-4 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        {message && <p className="text-center text-sm text-slate-200">{message}</p>}
      </form>
    </PageShell>
  )
}
