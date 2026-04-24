import { ReactNode } from 'react'

import ProtectedRoute from '@/components/ProtectedRoute'

// Workspace layout: wraps all workspace routes in auth protection.
export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}
