import '../styles/globals.css'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CodeByte | AI-Powered Coding Mentor',
  description: 'Learn to code with AI feedback loops built for mastery.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body bg-ink text-slate-100 antialiased">
        <main>{children}</main>
      </body>
    </html>
  )
}
