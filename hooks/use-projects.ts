"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'
import type { Database } from '@/lib/supabase'

type Project = Database['public']['Tables']['projects']['Row'] & {
  profiles: {
    full_name: string | null
    email: string
  } | null
  project_members: {
    profiles: {
      full_name: string | null
      email: string
    } | null
  }[]
  tasks: {
    id: string
    completed: boolean
  }[]
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchProjects()
    }
  }, [user])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          profiles:created_by (full_name, email),
          project_members (
            profiles:user_id (full_name, email)
          ),
          tasks (id, completed)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createProject = async (projectData: {
    name: string
    description?: string
    priority?: string
    due_date?: string
  }) => {
    if (!user) return { error: 'User not authenticated' }

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          created_by: user.id,
          status: 'Planning',
          progress: 0,
        })
        .select()
        .single()

      if (error) throw error

      // Add creator as project member
      await supabase
        .from('project_members')
        .insert({
          project_id: data.id,
          user_id: user.id,
          role: 'Owner',
        })

      await fetchProjects()
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' }
    }
  }

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error
      await fetchProjects()
      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'An error occurred' }
    }
  }

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchProjects()
      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'An error occurred' }
    }
  }

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects,
  }
}
