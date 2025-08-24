"use client";

import * as React from "react";
import {
  BarChart3,
  Calendar,
  CheckSquare,
  FolderOpen,
  Home,
  Settings,
  Users,
  LogOut,
  User,
  Building2,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { OrganizationSwitcher } from "@/components/organization-switcher";
import Link from "next/link";
import { signOut } from "@/app/actions/auth.actions";
import { useStore } from "@/hooks/use-store";
import { useToast } from "@/hooks/use-toast";
import { useShallow } from "zustand/shallow";

// Navigation items
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
    },
    {
      title: "Projects",
      url: "/projects",
      icon: FolderOpen,
    },
    {
      title: "Tasks",
      url: "/tasks",
      icon: CheckSquare,
    },
    {
      title: "Team",
      url: "/team",
      icon: Users,
    },
    {
      title: "Reports",
      url: "/reports",
      icon: BarChart3,
    },
    {
      title: "Timeline",
      url: "/timeline",
      icon: Calendar,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const [user, currentOrganization] = useStore(
    useShallow(state => [
      state.user,
      state.organizations.find(org => org.id === state.currentOrganizationId),
    ])
  );
  const { toast } = useToast();

  const pathname = usePathname();

  // Pages that don't need authentication and should not have sidebar
  const publicPages = [
    "/auth/signin",
    "/auth/signup",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/config-check",
    "/setup-required",
  ];

  const isPublicPage = publicPages.some(page => pathname?.startsWith(page));

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = "/auth/signin";
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out",
      });
    }
  };

  const handleProfile = () => {
    router.push("/profile");
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  const handleOrganizationSettings = () => {
    if (currentOrganization) {
      router.push("/organizations/settings");
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No organization selected",
      });
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  const getUserName = () => {
    return user?.user_metadata?.full_name || user?.email || "User";
  };

  const getUserEmail = () => {
    return user?.email || "";
  };

  if (isPublicPage) {
    return null;
  }

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <OrganizationSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url} className='flex items-center gap-2'>
                      <item.icon className='h-4 w-4' />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size='lg'
                  className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer'
                >
                  <Avatar className='h-8 w-8 rounded-lg'>
                    <AvatarImage
                      src={
                        user?.user_metadata?.avatar_url ||
                        "/placeholder-user.jpg"
                      }
                      alt={getUserName()}
                    />
                    <AvatarFallback className='rounded-lg'>
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className='grid flex-1 text-left text-sm leading-tight'>
                    <span className='truncate font-semibold'>
                      {getUserName()}
                    </span>
                    <span className='truncate text-xs text-muted-foreground'>
                      {getUserEmail()}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
                side='bottom'
                align='end'
                sideOffset={4}
              >
                <DropdownMenuLabel className='p-0 font-normal cursor-pointer'>
                  <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                    <Avatar className='h-8 w-8 rounded-lg'>
                      <AvatarImage
                        src={
                          user?.user_metadata?.avatar_url ||
                          "/placeholder-user.jpg"
                        }
                        alt={getUserName()}
                      />
                      <AvatarFallback className='rounded-lg'>
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className='grid flex-1 text-left text-sm leading-tight'>
                      <span className='truncate font-semibold'>
                        {getUserName()}
                      </span>
                      <span className='truncate text-xs text-muted-foreground'>
                        {getUserEmail()}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleProfile} className='gap-2'>
                  <User className='h-4 w-4' />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSettings} className='gap-2'>
                  <Settings className='h-4 w-4' />
                  Account Settings
                </DropdownMenuItem>
                {currentOrganization && (
                  <DropdownMenuItem
                    onClick={handleOrganizationSettings}
                    className='gap-2'
                  >
                    <Building2 className='h-4 w-4' />
                    Organization Settings
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className='gap-2 text-red-600 cursor-pointer'
                >
                  <LogOut className='h-4 w-4' />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
