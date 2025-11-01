import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/actions'

export default async function ConversationsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Conversations</h1>
        <p className="text-muted-foreground">
          View and manage SMS conversations with your leads
        </p>
      </div>

      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">Conversations view coming soon...</p>
      </div>
    </div>
  )
}
