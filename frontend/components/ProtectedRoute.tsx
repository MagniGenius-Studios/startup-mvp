'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/lib/auth'

interface ProtectedRouteProps {
  children: ReactNode
}

// Guard component: renders children only for authenticated users.
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect to login when auth check completes without a user.
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, router, user])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
