'use client'

import '../styles/globals.css'

import { AuthProvider } from '@/lib/auth'

// Root layout: global styles + auth context for all pages.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>CodeByte | AI-Powered Coding Mentor</title>
        <meta name="description" content="Learn to code with AI feedback loops built for mastery." />
      </head>
      <body className="font-body bg-ink text-slate-100 antialiased">
        <AuthProvider>
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
