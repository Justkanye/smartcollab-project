'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface Task {
  id: string
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
  created_at: string
  updated_at: string
  project_id: string | null
  assignee_id: string | null
  creator_id: string
  project?: {
    id: string
    name: string
  }
  assignee?: {
    id: string
    full_name: string | null
    email: string
  }
}

// Sample data for when Supabase is not available
const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Design homepage mockup',
    description: 'Create wireframes and high-fidelity mockups for the new homepage',
    status: 'in_progress',
    priority: 'high',
    due_date: '2024-02-15',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z',
    project_id: '1',
    assignee_id: 'user-1',
    creator_id: 'user-1',
    project: {
      id: '1',
      name: 'Website Redesign'
    }
  },
  {
    id: '2',
    title: 'Set up development environment',
    description: 'Configure local development environment with all necessary tools',
    status: 'completed',
    priority: 'medium',
    due_date: '2024-02-10',
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-25T00:00:00Z',
    project_id: '2',
    assignee_id: 'user-1',
    creator_id: 'user-1',
    project: {
      id: '2',
      name: 'Mobile App Development'
    }
  },
  {
    id: '3',
    title: 'Database schema design',
    description: 'Design the database schema for the new application',
    status: 'todo',
    priority: 'high',
    due_date: '2024-02-20',
    created_at: '2024-01-20T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z',
    project_id: '3',
    assignee_id: 'user-1',
    creator_id: 'user-1',
    project: {
      id: '3',
      name: 'Database Migration'
    }
  },
  {
    id: '4',
    title: 'User authentication flow',
    description: 'Implement secure user authentication and authorization',
    status: 'in_progress',
    priority: 'high',
    due_date: '2024-02-25',
    created_at: '2024-01-25T00:00:00Z',
    updated_at: '2024-01-30T00:00:00Z',
    project_id: '2',
    assignee_id: 'user-1',
    creator_id: 'user-1',
    project: {
      id: '2',
      name: 'Mobile App Development'
    }
  },
  {
    id: '5',
    title: 'API documentation',
    description: 'Write comprehensive API documentation for developers',
    status: 'todo',
    priority: 'medium',
    due_date: '2024-03-01',
    created_at: '2024-01-28T00:00:00Z',
    updated_at: '2024-01-28T00:00:00Z',
    project_id: '1',
    assignee_id: 'user-1',
    creator_id: 'user-1',
    project: {
      id: '1',
      name: 'Website Redesign'
    }
  }
]

export function useTasks(projectId?: string) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTasks()
  }, [projectId])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!supabase) {
        // Use sample data when Supabase is not available
        const filteredTasks = projectId 
          ? sampleTasks.filter(task => task.project_id === projectId)
          : sampleTasks
        setTasks(filteredTasks)
        setLoading(false)
        return
      }

      let query = supabase
        .from('tasks')
        .select(`
          *,
          project:projects(id, name),
          assignee:profiles!tasks_assignee_id_fkey(id, full_name, email)
        `)
        .order('updated_at', { ascending: false })

      if (projectId) {
        query = query.eq('project_id', projectId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching tasks:', error)
        // Fallback to sample data
        const filteredTasks = projectId 
          ? sampleTasks.filter(task => task.project_id === projectId)
          : sampleTasks
        setTasks(filteredTasks)
      } else {
        setTasks(data || [])
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err)
      setError('Failed to load tasks')
      // Fallback to sample data
      const filteredTasks = projectId 
        ? sampleTasks.filter(task => task.project_id === projectId)
        : sampleTasks
      setTasks(filteredTasks)
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (!supabase) {
        // Simulate creating a task with sample data
        const newTask: Task = {
          ...taskData,
          id: `task-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        setTasks(prev => [newTask, ...prev])
        return { data: newTask, error: null }
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select(`
          *,
          project:projects(id, name),
          assignee:profiles!tasks_assignee_id_fkey(id, full_name, email)
        `)
        .single()

      if (error) {
        console.error('Error creating task:', error)
        return { data: null, error }
      }

      setTasks(prev => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      console.error('Failed to create task:', err)
      return { data: null, error: 'Failed to create task' }
    }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      if (!supabase) {
        // Simulate updating a task with sample data
        setTasks(prev => prev.map(task => 
          task.id === id 
            ? { ...task, ...updates, updated_at: new Date().toISOString() }
            : task
        ))
        return { error: null }
      }

      const { error } = await supabase
        .from('tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) {
        console.error('Error updating task:', error)
        return { error }
      }

      setTasks(prev => prev.map(task => 
        task.id === id 
          ? { ...task, ...updates, updated_at: new Date().toISOString() }
          : task
      ))
      return { error: null }
    } catch (err) {
      console.error('Failed to update task:', err)
      return { error: 'Failed to update task' }
    }
  }

  const deleteTask = async (id: string) => {
    try {
      if (!supabase) {
        // Simulate deleting a task with sample data
        setTasks(prev => prev.filter(task => task.id !== id))
        return { error: null }
      }

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting task:', error)
        return { error }
      }

      setTasks(prev => prev.filter(task => task.id !== id))
      return { error: null }
    } catch (err) {
      console.error('Failed to delete task:', err)
      return { error: 'Failed to delete task' }
    }
  }

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(task => task.status === status)
  }

  const getTasksByPriority = (priority: Task['priority']) => {
    return tasks.filter(task => task.priority === priority)
  }

  const getOverdueTasks = () => {
    const now = new Date()
    return tasks.filter(task => 
      task.due_date && 
      new Date(task.due_date) < now && 
      task.status !== 'completed'
    )
  }

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    getTasksByStatus,
    getTasksByPriority,
    getOverdueTasks,
  }
}
