'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/lib/auth'

// Legacy workspace route: sends authenticated users to /learn.
export default function WorkspaceLegacyPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Keep old /workspace URL functional by redirecting to current entry flow.
    if (!loading && user) {
      router.push('/learn')
    }
  }, [loading, router, user])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky border-t-transparent" />
    </div>
  )
}
