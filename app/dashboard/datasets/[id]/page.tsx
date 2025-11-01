import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/actions'
import { DatasetDetailClient } from './dataset-detail-client'

interface PageProps {
  params: {
    id: string
  }
}

export default async function DatasetDetailPage({ params }: PageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return <DatasetDetailClient datasetId={params.id} />
}
