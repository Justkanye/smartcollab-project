'use client'

import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

const notifications = [
  {
    id: '1',
    title: 'New task assigned',
    message: 'You have been assigned to "Design homepage mockup"',
    time: '2 minutes ago',
    read: false,
  },
  {
    id: '2',
    title: 'Project updated',
    message: 'Website Redesign project status changed to active',
    time: '1 hour ago',
    read: false,
  },
  {
    id: '3',
    title: 'Task completed',
    message: 'Database schema review has been completed',
    time: '3 hours ago',
    read: true,
  },
]

export function Notifications() {
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Notifications</h4>
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount} new</Badge>
            )}
          </div>
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`space-y-1 rounded-lg p-3 ${
                    notification.read 
                      ? 'bg-muted/50' 
                      : 'bg-accent'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium">
                      {notification.title}
                    </p>
                    {!notification.read && (
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {notification.time}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  )
}
