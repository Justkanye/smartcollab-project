'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface Task {
  id: string
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  project_id: string
  assigned_to: string | null
  created_by: string
  due_date: string | null
  created_at: string
  updated_at: string
}

// Sample data for when database is not available
const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Design homepage mockup',
    description: 'Create wireframes and mockups for the new homepage design',
    status: 'completed',
    priority: 'high',
    project_id: '1',
    assigned_to: 'user-2',
    created_by: 'user-1',
    due_date: '2024-01-25T17:00:00Z',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-22T09:15:00Z'
  },
  {
    id: '2',
    title: 'Set up development environment',
    description: 'Configure local development environment for the mobile app',
    status: 'in_progress',
    priority: 'medium',
    project_id: '2',
    assigned_to: 'user-3',
    created_by: 'user-1',
    due_date: '2024-01-30T12:00:00Z',
    created_at: '2024-01-18T14:00:00Z',
    updated_at: '2024-01-20T11:30:00Z'
  },
  {
    id: '3',
    title: 'Write API documentation',
    description: 'Document all API endpoints for the mobile app backend',
    status: 'todo',
    priority: 'medium',
    project_id: '2',
    assigned_to: null,
    created_by: 'user-1',
    due_date: '2024-02-05T15:00:00Z',
    created_at: '2024-01-20T16:45:00Z',
    updated_at: '2024-01-20T16:45:00Z'
  },
  {
    id: '4',
    title: 'Database schema review',
    description: 'Review and optimize database schema before migration',
    status: 'completed',
    priority: 'high',
    project_id: '3',
    assigned_to: 'user-4',
    created_by: 'user-1',
    due_date: '2024-01-12T10:00:00Z',
    created_at: '2024-01-05T08:30:00Z',
    updated_at: '2024-01-12T09:45:00Z'
  },
  {
    id: '5',
    title: 'User testing sessions',
    description: 'Conduct user testing for the new website design',
    status: 'todo',
    priority: 'low',
    project_id: '1',
    assigned_to: 'user-2',
    created_by: 'user-1',
    due_date: '2024-02-10T14:00:00Z',
    created_at: '2024-01-22T13:20:00Z',
    updated_at: '2024-01-22T13:20:00Z'
  }
]

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: supabaseError } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })

      if (supabaseError) {
        console.warn('Database not available, using sample data:', supabaseError.message)
        setTasks(sampleTasks)
      } else {
        setTasks(data || [])
      }
    } catch (err) {
      console.warn('Error fetching tasks, using sample data:', err)
      setTasks(sampleTasks)
      setError('Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single()

      if (supabaseError) {
        console.warn('Database not available for creating task:', supabaseError.message)
        // Create a mock task for demo purposes
        const newTask: Task = {
          ...taskData,
          id: `task-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setTasks(prev => [newTask, ...prev])
        return newTask
      }

      setTasks(prev => [data, ...prev])
      return data
    } catch (err) {
      console.error('Error creating task:', err)
      throw err
    }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (supabaseError) {
        console.warn('Database not available for updating task:', supabaseError.message)
        // Update in local state for demo purposes
        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t))
        return
      }

      setTasks(prev => prev.map(t => t.id === id ? data : t))
      return data
    } catch (err) {
      console.error('Error updating task:', err)
      throw err
    }
  }

  const deleteTask = async (id: string) => {
    try {
      const { error: supabaseError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (supabaseError) {
        console.warn('Database not available for deleting task:', supabaseError.message)
      }

      // Remove from local state regardless
      setTasks(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      console.error('Error deleting task:', err)
      throw err
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask
  }
}
