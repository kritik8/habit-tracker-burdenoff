import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth/session'

export default async function Home() {
  const session = await getSessionUser()

  if (session) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }
}
