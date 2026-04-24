'use client'

import { PropsWithChildren } from 'react'

import { TopNav } from './TopNav'

// App shell: shared authenticated layout with top nav and centered content.
export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-0">
      <TopNav />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-6 py-10 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
