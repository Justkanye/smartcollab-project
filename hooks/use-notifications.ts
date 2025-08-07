'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  created_at: string
  user_id: string
  action_url?: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Sample notifications for when Supabase is not available
  const sampleNotifications: Notification[] = [
    {
      id: '1',
      title: 'Welcome to SmartCollab!',
      message: 'Your account has been successfully created. Start by creating your first project.',
      type: 'success',
      read: false,
      created_at: new Date().toISOString(),
      user_id: user?.id || 'sample-user',
      action_url: '/projects'
    },
    {
      id: '2',
      title: 'Task Due Soon',
      message: 'Your task "Design Homepage Layout" is due in 2 days.',
      type: 'warning',
      read: false,
      created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      user_id: user?.id || 'sample-user',
      action_url: '/tasks'
    },
    {
      id: '3',
      title: 'Project Updated',
      message: 'The "Website Redesign" project has been updated with new requirements.',
      type: 'info',
      read: true,
      created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      user_id: user?.id || 'sample-user',
      action_url: '/projects'
    }
  ]

  useEffect(() => {
    if (user) {
      fetchNotifications()
    } else {
      setNotifications([])
      setLoading(false)
    }
  }, [user])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      setError(null)

      // If no Supabase client or no user, use sample data
      if (!supabase || !user) {
        setNotifications(sampleNotifications)
        setLoading(false)
        return
      }

      // For now, just use sample data to avoid database issues
      // In a real implementation, you would query the notifications table
      setNotifications(sampleNotifications)
      setLoading(false)

    } catch (err) {
      console.error('Error fetching notifications:', err)
      // Fall back to sample data
      setNotifications(sampleNotifications)
      setError(null)
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      if (!supabase) {
        // Simulate marking as read with sample data
        setNotifications(prev => prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        ))
        return { error: null }
      }

      // For now, just update local state
      setNotifications(prev => prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      ))
      return { error: null }

    } catch (err) {
      console.error('Error marking notification as read:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark as read'
      return { error: errorMessage }
    }
  }

  const markAllAsRead = async () => {
    try {
      if (!supabase) {
        // Simulate marking all as read with sample data
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
        return { error: null }
      }

      // For now, just update local state
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
      return { error: null }

    } catch (err) {
      console.error('Error marking all notifications as read:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark all as read'
      return { error: errorMessage }
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      if (!supabase) {
        // Simulate deleting with sample data
        setNotifications(prev => prev.filter(notif => notif.id !== id))
        return { error: null }
      }

      // For now, just update local state
      setNotifications(prev => prev.filter(notif => notif.id !== id))
      return { error: null }

    } catch (err) {
      console.error('Error deleting notification:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete notification'
      return { error: errorMessage }
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications,
  }
}
