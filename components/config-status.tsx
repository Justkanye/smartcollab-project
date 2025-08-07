"use client"

import { useEffect, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { validateEnvironment, getEnvStatus } from '@/lib/config-validation'
import { getSupabaseConfig } from '@/lib/supabase'

export function ConfigStatus() {
  const [envStatus, setEnvStatus] = useState<{
    isValid: boolean
    errors: string[]
    warnings: string[]
  } | null>(null)
  const [supabaseStatus, setSupabaseStatus] = useState<{
    url: string
    anonKey: string
    isValid: boolean
  } | null>(null)

  const checkConfiguration = () => {
    try {
      const env = validateEnvironment()
      const supabase = getSupabaseConfig()
      
      setEnvStatus(env)
      setSupabaseStatus(supabase)
    } catch (error) {
      console.error('Configuration check failed:', error)
      setEnvStatus({
        isValid: false,
        errors: ['Failed to validate configuration'],
        warnings: []
      })
    }
  }

  useEffect(() => {
    checkConfiguration()
  }, [])

  if (!envStatus || !supabaseStatus) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          Checking configuration...
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {envStatus.isValid ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            Environment Configuration
          </CardTitle>
          <CardDescription>
            Status of required environment variables
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Supabase URL:</span>
              <span className={`ml-2 ${supabaseStatus.url === 'configured' ? 'text-green-600' : 'text-red-600'}`}>
                {supabaseStatus.url}
              </span>
            </div>
            <div>
              <span className="font-medium">Anon Key:</span>
              <span className={`ml-2 ${supabaseStatus.anonKey === 'configured' ? 'text-green-600' : 'text-red-600'}`}>
                {supabaseStatus.anonKey}
              </span>
            </div>
          </div>
          
          {envStatus.errors.length > 0 && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Configuration Errors</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {envStatus.errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          {envStatus.warnings.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Configuration Warnings</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {envStatus.warnings.map((warning, i) => (
                    <li key={i}>{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          <Button onClick={checkConfiguration} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Recheck Configuration
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
