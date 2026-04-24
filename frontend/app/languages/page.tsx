import { redirect } from 'next/navigation'

// Legacy route kept for compatibility; points to unified /learn entry.
export default function LanguagesPageRedirect() {
  redirect('/learn')
}
