'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/clients/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function OnboardingPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState(1)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)

    try {
      const result = await createClient(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        // Success! Redirect to dashboard
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <div className="flex items-center justify-center mb-4">
              <div className="w-20 h-20 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-3xl font-bold text-white">DBR</span>
              </div>
            </div>
            <CardTitle className="text-3xl">Create Your First Client</CardTitle>
            <CardDescription className="text-base">
              Set up a client account to start managing leads and campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  type="text"
                  placeholder="Acme Solar Ltd"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <select
                  id="industry"
                  name="industry"
                  required
                  disabled={isLoading}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select industry...</option>
                  <option value="solar">Solar Energy</option>
                  <option value="construction">Construction</option>
                  <option value="real-estate">Real Estate</option>
                  <option value="hvac">HVAC</option>
                  <option value="automotive">Automotive</option>
                  <option value="home-improvement">Home Improvement</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="technology">Technology</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyEmail">Company Email</Label>
                <Input
                  id="companyEmail"
                  name="companyEmail"
                  type="email"
                  placeholder="contact@acme.com"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyPhone">Company Phone</Label>
                <Input
                  id="companyPhone"
                  name="companyPhone"
                  type="tel"
                  placeholder="+44 20 1234 5678"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating client...
                  </>
                ) : (
                  'Create Client & Continue'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
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
            You're all set up! Let's complete your onboarding.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Onboarding Steps */}
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 border rounded-lg bg-primary/5 border-primary">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Client Created</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Your client account has been set up successfully
                </p>
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
