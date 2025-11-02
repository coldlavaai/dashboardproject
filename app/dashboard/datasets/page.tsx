import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/actions'
import { DatasetsClient } from './datasets-client'

export default async function DatasetsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return <DatasetsClient />
}
