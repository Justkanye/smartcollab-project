import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { getUser } from "./actions/auth.actions";
import SetStore from "@/components/set-store";
import { CURRENT_ORGANIZATION_COOKIE } from "@/lib/constants";
import {
  getCurrentOrganization,
  getOrganizations,
} from "./actions/organization.actions";
import SetCookie from "@/components/set-cookie";
import { ThemeProvider } from "@/components/theme-provider";
// import { AuthProvider } from "@/contexts/auth-context";
// import { ProtectedRoute } from "@/components/protected-route";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SmartCollab - Intelligent Work Collaboration System",
  description: "An Intelligent Collaborative Work Performance Tracking System",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: user } = await getUser();
  const { data: currentOrganization } = await getCurrentOrganization();
  const { data: organizations } = await getOrganizations();
  console.dir({ user }, { depth: 5 });

  return (
    <html lang='en' suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SidebarProvider defaultOpen={true}>
            <AppSidebar />
            <main className='flex-1 overflow-hidden'>{children}</main>
            {/* <AuthProvider>
              <MainContent>{children}</MainContent>
            </AuthProvider> */}
          </SidebarProvider>
          <Toaster />
          <SetStore
            user={user}
            organizations={organizations}
            currentOrganizationId={currentOrganization?.id}
          />
          <SetCookie
            name={CURRENT_ORGANIZATION_COOKIE}
            value={currentOrganization?.id}
            expiration={60 * 60 * 24 * 7}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}

// Helper component to conditionally apply sidebar and protection
// function MainContent({ children }: { children: React.ReactNode }) {
//   return <ProtectedRoute>{children}</ProtectedRoute>;
// }
