import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/actions'
import { LeadDetailClient } from './lead-detail-client'

interface PageProps {
  params: {
    id: string
  }
}

export default async function LeadDetailPage({ params }: PageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return <LeadDetailClient leadId={params.id} />
}
