"use client"

import { useAuth } from '@/contexts/auth-context'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Pages that don't need authentication and should not have sidebar
  const publicPages = [
    '/auth/signin',
    '/auth/signup', 
    '/auth/forgot-password',
    '/auth/reset-password',
    '/config-check',
    '/setup-required'
  ]
  
  const isPublicPage = publicPages.some(page => pathname?.startsWith(page))

  useEffect(() => {
    if (!loading && !user && !isPublicPage) {
      router.push('/auth/signin')
    }
  }, [user, loading, router, isPublicPage])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // If it's a public page, render without sidebar
  if (isPublicPage) {
    return <>{children}</>
  }

  // For protected pages, only render if user is authenticated
  if (!user) {
    return null
  }

  return <>{children}</>
}
