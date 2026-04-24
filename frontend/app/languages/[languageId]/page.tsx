import { redirect } from 'next/navigation'

// Legacy deep-link route redirected to /learn flow.
export default function LanguagePageRedirect() {
  redirect('/learn')
}
