import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function InfoPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 p-8">
      <div className="container mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-foreground">
            DBR Dashboard V2
          </h1>
          <p className="text-xl text-muted-foreground">
            AI-Powered Database Reactivation
          </p>
          <Badge variant="outline" className="text-sm">
            The functionality of HighLevel and MORE, with the simplicity of an iPhone
          </Badge>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                Database
              </CardTitle>
              <CardDescription>PostgreSQL via Supabase</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">✓ Connected</p>
              <p className="text-sm text-muted-foreground mt-2">13 tables ready</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                Next.js
              </CardTitle>
              <CardDescription>React 19 + Server Components</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">✓ Running</p>
              <p className="text-sm text-muted-foreground mt-2">TypeScript enabled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                UI Components
              </CardTitle>
              <CardDescription>shadcn/ui + Tailwind CSS</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">✓ Ready</p>
              <p className="text-sm text-muted-foreground mt-2">8 components installed</p>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Features</CardTitle>
            <CardDescription>What's included in V2.0</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Badge className="bg-primary">Core</Badge>
                  Database & Infrastructure
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>✓ Multi-tenant architecture</li>
                  <li>✓ Row Level Security (RLS)</li>
                  <li>✓ Real-time subscriptions</li>
                  <li>✓ Automated triggers & stats</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Badge className="bg-primary">SMS</Badge>
                  Campaign Management
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>✓ M1/M2/M3 message sequences</li>
                  <li>✓ AI response handling</li>
                  <li>✓ Rate limiting & scheduling</li>
                  <li>✓ Manual mode override</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Badge className="bg-sophie-suggestion">Sophie</Badge>
                  AI Intelligence
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>✓ Conversation analysis</li>
                  <li>✓ Learning library</li>
                  <li>✓ Prompt versioning</li>
                  <li>✓ Quality scoring</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Badge variant="outline">Coming Soon</Badge>
                  V2.1 & Beyond
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>○ WhatsApp integration</li>
                  <li>○ Email campaigns</li>
                  <li>○ Voice calling</li>
                  <li>○ Mobile app (PWA)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="flex justify-center gap-4">
          <Link href="/dashboard">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Go to Dashboard →
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Login
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
