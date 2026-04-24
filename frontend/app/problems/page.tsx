import { redirect } from 'next/navigation'

// Legacy problems route redirected to learn-first navigation.
export default function ProblemsPageRedirect() {
  redirect('/learn')
}
