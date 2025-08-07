"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ConfigStatus } from '@/components/config-status'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function ConfigCheck() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">SmartCollab Configuration</h1>
          <p className="text-muted-foreground">
            Verify your Supabase configuration and environment setup
          </p>
        </div>

        <ConfigStatus />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Setup Instructions
            </CardTitle>
            <CardDescription>
              Follow these steps to configure SmartCollab properly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Environment Variables Required</AlertTitle>
              <AlertDescription>
                Create a <code>.env.local</code> file in your project root with the following variables:
              </AlertDescription>
            </Alert>

            <div className="bg-muted p-4 rounded-lg font-mono text-sm">
              <div className="space-y-1">
                <div>NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co</div>
                <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key</div>
                <div className="text-muted-foreground"># Optional:</div>
                <div className="text-muted-foreground">SUPABASE_SERVICE_ROLE_KEY=your-service-key</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">How to get your Supabase credentials:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Go to your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center">Supabase Dashboard <ExternalLink className="h-3 w-3 ml-1" /></a></li>
                <li>Select your project</li>
                <li>Navigate to Settings → API</li>
                <li>Copy the "Project URL" for NEXT_PUBLIC_SUPABASE_URL</li>
                <li>Copy the "anon public" key for NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                <li>Optionally copy the "service_role" key for server operations</li>
              </ol>
            </div>

            <div className="flex gap-2">
              <Button asChild>
                <Link href="/auth/signin">
                  Try Sign In
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">
                  Go to Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
