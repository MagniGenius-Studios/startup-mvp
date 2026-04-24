import { redirect } from 'next/navigation'

// Legacy category route redirected until category-specific pages are restored.
export default function CategoryPageRedirect() {
  redirect('/learn')
}
