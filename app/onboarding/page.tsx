import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function OnboardingPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center mb-4">
            <div className="w-20 h-20 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-3xl font-bold text-white">DBR</span>
            </div>
          </div>
          <CardTitle className="text-3xl">Welcome to DBR Dashboard!</CardTitle>
          <CardDescription className="text-base">
            You're all set up, {user.profile?.full_name?.split(' ')[0] || 'there'}!
            Let's complete your onboarding.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Onboarding Steps */}
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 border rounded-lg bg-background">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-white">1</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Create or Select Client</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Set up your first client account to manage their leads and campaigns
                </p>
                <Button size="sm" disabled>
                  Set up client
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 border rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-muted-foreground">2</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1 text-muted-foreground">Configure Campaign Settings</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Set up your SMS templates, Sophie AI prompts, and campaign rules
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 border rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-muted-foreground">3</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1 text-muted-foreground">Upload Your First Dataset</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Import leads from CSV or connect your CRM
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 border rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-muted-foreground">4</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1 text-muted-foreground">Launch Your Campaign</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Start sending messages and reactivating your database
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <Button variant="ghost" asChild>
                <a href="/dashboard">Skip for now</a>
              </Button>
              <div className="flex gap-2">
                <Button disabled>
                  Continue →
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
            <p className="text-sm font-medium text-primary">
              🎉 Account created successfully!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Client management and campaign setup coming soon
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
