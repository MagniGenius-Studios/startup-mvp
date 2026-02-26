import './globals.css'

import { Space_Grotesk, Sora } from 'next/font/google'
import type { Metadata } from 'next'

const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' })
const body = Sora({ subsets: ['latin'], variable: '--font-body' })

export const metadata: Metadata = {
  title: 'CodeByte | AI-Powered Coding Mentor',
  description: 'Learn to code with AI feedback loops built for mastery.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="font-body bg-ink text-slate-100 antialiased">
        <main>{children}</main>
      </body>
    </html>
  )
}
