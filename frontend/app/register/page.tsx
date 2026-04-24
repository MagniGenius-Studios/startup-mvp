'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { PageShell } from '@/components/layout/PageShell'
import { useAuth } from '@/lib/auth'

// Register page: creates a new user account and bootstraps session.
export default function RegisterPage() {
    const { register, user, loading: authLoading } = useAuth()
    // Controlled form state for validation + error messages.
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Keep logged-in users out of auth pages.
    useEffect(() => {
        if (!authLoading && user) {
            window.location.href = '/dashboard'
        }
    }, [user, authLoading])

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('Passwords do not match.')
            return
        }

        setLoading(true)
        try {
            // Register API is wrapped by auth context for consistent user state.
            await register(name, email, password)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed. Please try again.')
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

                <h1 className="mt-8 text-3xl font-display text-white text-center">Create your account</h1>
                <p className="mt-2 text-sm text-slate-300 text-center">
                    Start your coding journey with CodeByte.
                </p>

                <form onSubmit={handleSubmit} className="mt-10 space-y-5">
                    {error && (
                        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm text-slate-200" htmlFor="register-name">
                            Full Name
                        </label>
                        <input
                            id="register-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            minLength={2}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none ring-0 placeholder:text-slate-500 focus:border-sky transition"
                            placeholder="Jane Doe"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-slate-200" htmlFor="register-email">
                            Email
                        </label>
                        <input
                            id="register-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none ring-0 placeholder:text-slate-500 focus:border-sky transition"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-slate-200" htmlFor="register-password">
                            Password
                        </label>
                        <input
                            id="register-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none ring-0 placeholder:text-slate-500 focus:border-sky transition"
                            placeholder="Min. 8 characters"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-slate-200" htmlFor="register-confirm-password">
                            Confirm Password
                        </label>
                        <input
                            id="register-confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={8}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none ring-0 placeholder:text-slate-500 focus:border-sky transition"
                            placeholder="Re-enter password"
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
                                Creating account…
                            </span>
                        ) : (
                            'Create account'
                        )}
                    </button>

                    <p className="text-center text-sm text-slate-300">
                        Already have an account?{' '}
                        <Link href="/login" className="text-sky hover:text-sky/80 transition font-medium">
                            Sign in
                        </Link>
                    </p>
                </form>
            </div>
        </PageShell>
    )
}
