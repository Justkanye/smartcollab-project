"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, ArrowLeft, Search, Compass, Zap } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl text-center space-y-8">
        {/* Animated 404 */}
        <div className="relative">
          <div className="text-[12rem] md:text-[16rem] font-bold text-transparent bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-bounce">
              <Compass className="h-16 w-16 md:h-24 md:w-24 text-blue-500 opacity-60" />
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="flex items-center justify-center">
              <div className="flex aspect-square size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 text-white shadow-lg">
                <Zap className="size-8" />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Page Not Found
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground max-w-md mx-auto">
                Oops! The page you're looking for seems to have wandered off into the digital wilderness.
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                <Home className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-blue-900">Go Home</h3>
                <p className="text-sm text-blue-700">Return to dashboard</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
                <Search className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold text-purple-900">Search</h3>
                <p className="text-sm text-purple-700">Find what you need</p>
              </div>
              <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-100">
                <ArrowLeft className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                <h3 className="font-semibold text-indigo-900">Go Back</h3>
                <p className="text-sm text-indigo-700">Previous page</p>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button 
              asChild 
              className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="flex-1 h-12 border-2 hover:bg-gray-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardFooter>
        </Card>

        {/* Additional Help */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Still having trouble? 
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/projects" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
              View Projects
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/tasks" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
              View Tasks
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/team" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
              View Team
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
