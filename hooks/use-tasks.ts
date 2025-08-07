"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'
import type { Database } from '@/lib/supabase'

type Task = Database['public']['Tables']['tasks']['Row'] & {
  projects: {
    name: string
  } | null
  assigned_to_profile: {
    full_name: string | null
    email: string
  } | null
  created_by_profile: {
    full_name: string | null
    email: string
  } | null
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchTasks()
    }
  }, [user])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          projects:project_id (name),
          assigned_to_profile:assigned_to (full_name, email),
          created_by_profile:created_by (full_name, email)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (taskData: {
    title: string
    description?: string
    priority?: string
    project_id?: string
    assigned_to?: string
    due_date?: string
  }) => {
    if (!user) return { error: 'User not authenticated' }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          created_by: user.id,
          status: 'To Do',
          completed: false,
        })
        .select()
        .single()

      if (error) throw error
      await fetchTasks()
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' }
    }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error
      await fetchTasks()
      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'An error occurred' }
    }
  }

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchTasks()
      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'An error occurred' }
    }
  }

  const toggleTaskComplete = async (id: string, completed: boolean) => {
    return updateTask(id, { 
      completed,
      status: completed ? 'Done' : 'To Do'
    })
  }

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    refetch: fetchTasks,
  }
}
