import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient as createServerClient } from '@/lib/supabase/server'

export default async function AdminDashboardPage() {
  const user = await getCurrentUser()

  console.log('[ADMIN DEBUG] User object:', JSON.stringify(user, null, 2))
  console.log('[ADMIN DEBUG] Profile:', user?.profile)
  console.log('[ADMIN DEBUG] is_super_admin value:', user?.profile?.is_super_admin)

  if (!user) {
    redirect('/login')
  }

  // Check if user is super admin
  if (!user.profile?.is_super_admin) {
    console.log('[ADMIN DEBUG] Redirecting to dashboard - not super admin')
    redirect('/dashboard')
  }

  console.log('[ADMIN DEBUG] Super admin check passed!')

  const supabase = await createServerClient()

  // Fetch admin stats
  const [
    { count: totalCompanies },
    { count: totalUsers },
    { data: recentCompanies },
  ] = await Promise.all([
    (supabase.from('clients') as any).select('*', { count: 'exact', head: true }),
    (supabase.from('users') as any).select('*', { count: 'exact', head: true }),
    (supabase.from('clients') as any)
      .select(`
        id,
        company_name,
        industry,
        status,
        plan,
        created_at,
        user_clients!inner(
          users(
            email,
            full_name
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5">
      {/* Admin Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-destructive flex items-center justify-center">
              <span className="text-lg font-bold text-white">⚡</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Super Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">Platform Management</p>
            </div>
          </div>

          <a href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Dashboard
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Platform Overview</h2>
          <p className="text-muted-foreground">
            Monitor all companies and users on the DBR platform
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCompanies || 0}</div>
              <p className="text-xs text-muted-foreground">Registered businesses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">Platform users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <path d="M2 10h20" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCompanies || 0}</div>
              <p className="text-xs text-muted-foreground">Mostly trial plans</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Status</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-green-500"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">Online</div>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Companies */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Company Signups</CardTitle>
            <CardDescription>
              Latest businesses that have registered on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCompanies && recentCompanies.length > 0 ? (
                recentCompanies.map((company: any) => {
                  const owner = company.user_clients?.[0]?.users
                  return (
                    <div
                      key={company.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">{company.company_name}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-sm text-muted-foreground capitalize">
                            {company.industry}
                          </p>
                          <span className="text-sm text-muted-foreground">
                            {owner?.email || 'No owner'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                          {company.status}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 capitalize">
                          {company.plan} plan
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No companies yet</p>
                  <p className="text-sm mt-2">Companies will appear here as users sign up</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
