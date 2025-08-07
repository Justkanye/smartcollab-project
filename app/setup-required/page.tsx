"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { XCircle, ExternalLink, Copy } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function SetupRequired() {
  const [copied, setCopied] = useState(false)

  const envTemplate = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(envTemplate)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6 pt-20">
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <XCircle className="h-16 w-16 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-600">Setup Required</CardTitle>
            <CardDescription>
              SmartCollab needs to be configured with your Supabase credentials to work properly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertTitle>Missing Configuration</AlertTitle>
              <AlertDescription>
                The required environment variables are not set. Please follow the setup instructions below.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Quick Setup Guide</h3>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <p className="font-medium">Create a Supabase project</p>
                    <p className="text-sm text-muted-foreground">
                      Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center">supabase.com <ExternalLink className="h-3 w-3 ml-1" /></a> and create a new project
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <p className="font-medium">Get your credentials</p>
                    <p className="text-sm text-muted-foreground">
                      In your Supabase dashboard, go to Settings → API to find your URL and keys
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div className="flex-1">
                    <p className="font-medium">Create .env.local file</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      Create a <code>.env.local</code> file in your project root with:
                    </p>
                    <div className="relative">
                      <pre className="bg-muted p-3 rounded-lg text-sm overflow-x-auto">
                        <code>{envTemplate}</code>
                      </pre>
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute top-2 right-2"
                        onClick={copyToClipboard}
                      >
                        {copied ? 'Copied!' : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <p className="font-medium">Restart your development server</p>
                    <p className="text-sm text-muted-foreground">
                      Run <code>npm run dev</code> or <code>yarn dev</code> to restart with the new environment variables
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button asChild>
                <Link href="/config-check">
                  Check Configuration
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <a href="https://supabase.com/docs/guides/getting-started" target="_blank" rel="noopener noreferrer">
                  Supabase Docs <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
