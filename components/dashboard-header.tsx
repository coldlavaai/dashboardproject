'use client'

import { Button } from '@/components/ui/button'
import { ClientSwitcher } from '@/components/client-switcher'
import { signOut } from '@/lib/auth/actions'
import { useClient } from '@/lib/clients/context'

type DashboardHeaderProps = {
  userName: string | null
  userEmail: string
  userRole: string
}

export function DashboardHeader({ userName, userEmail, userRole }: DashboardHeaderProps) {
  const { currentClient } = useClient()

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-lg font-bold text-white">DBR</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">DBR Dashboard</h1>
              <p className="text-xs text-muted-foreground">Database Reactivation</p>
            </div>
          </div>

          {currentClient && (
            <>
              <div className="h-8 w-px bg-border" />
              <ClientSwitcher />
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium">{userName || userEmail}</p>
            <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
          </div>
          <form action={signOut}>
            <Button variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
