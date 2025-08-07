'use client'

import * as React from 'react'
import { BarChart3, Calendar, FolderOpen, Home, Settings, Users, CheckSquare } from 'lucide-react'

import { OrganizationSwitcher } from '@/components/organization-switcher'
import { Notifications } from '@/components/notifications'
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
} from '@/components/ui/sidebar'

const data = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/',
      icon: Home,
    },
    {
      title: 'Projects',
      url: '/projects',
      icon: FolderOpen,
    },
    {
      title: 'Tasks',
      url: '/tasks',
      icon: CheckSquare,
    },
    {
      title: 'Team',
      url: '/team',
      icon: Users,
    },
    {
      title: 'Timeline',
      url: '/timeline',
      icon: Calendar,
    },
    {
      title: 'Reports',
      url: '/reports',
      icon: BarChart3,
    },
  ],
  navSecondary: [
    {
      title: 'Settings',
      url: '/settings',
      icon: Settings,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-sm font-bold">SC</span>
          </div>
          <span className="font-semibold">SmartCollab</span>
        </div>
        <OrganizationSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navSecondary.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Notifications />
      </SidebarFooter>
    </Sidebar>
  )
}
