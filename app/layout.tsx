import type React from "react"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SmartCollab - Project Management",
  description: "Comprehensive project management and team collaboration platform",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <MainContent>{children}</MainContent>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  )
}

// Helper component to conditionally apply sidebar and protection
function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <main className="flex-1 overflow-hidden">{children}</main>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
