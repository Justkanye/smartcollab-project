"use client"

import { useState } from 'react'
import { Bell, Check, X, Users, UserPlus, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useNotifications } from '@/hooks/use-notifications'
import { useOrganizationInvitations } from '@/hooks/use-organizations'
import { useToast } from '@/hooks/use-toast'
import { formatDistanceToNow } from 'date-fns'

export function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications()
  const { invitations, acceptInvitation, declineInvitation } = useOrganizationInvitations()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)

  const handleAcceptInvitation = async (token: string, invitationId: string) => {
    const { error } = await acceptInvitation(token)
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "You have joined the organization!",
      })
      setOpen(false)
    }
  }

  const handleDeclineInvitation = async (invitationId: string) => {
    const { error } = await declineInvitation(invitationId)
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Invitation declined",
        description: "The invitation has been declined.",
      })
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'organization_invitation':
        return <UserPlus className="h-4 w-4" />
      case 'organization_joined':
        return <Users className="h-4 w-4" />
      case 'role_updated':
        return <Settings className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const totalUnread = unreadCount + invitations.length

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {totalUnread > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
            >
              {totalUnread > 99 ? '99+' : totalUnread}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          Notifications
          {totalUnread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-auto p-0 text-xs"
            >
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-[400px]">
          {/* Organization Invitations */}
          {invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="flex items-start gap-3 p-3 border-b last:border-b-0"
            >
              <div className="flex-shrink-0 mt-1">
                <UserPlus className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <p className="text-sm font-medium">Organization Invitation</p>
                  <p className="text-xs text-muted-foreground">
                    You've been invited to join <strong>{invitation.organizations?.name}</strong> as a {invitation.role}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleAcceptInvitation(invitation.token, invitation.id)}
                    className="h-7 text-xs"
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeclineInvitation(invitation.id)}
                    className="h-7 text-xs"
                  >
                    Decline
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* Regular Notifications */}
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-3 p-3 border-b last:border-b-0 ${
                !notification.read ? 'bg-muted/50' : ''
              }`}
            >
              <div className="flex-shrink-0 mt-1">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium">{notification.title}</p>
                    {notification.message && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {!notification.read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markAsRead(notification.id)}
                        className="h-6 w-6 p-0"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteNotification(notification.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {notifications.length === 0 && invitations.length === 0 && (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
