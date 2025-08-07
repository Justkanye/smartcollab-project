'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface Project {
  id: string
  name: string
  description: string | null
  status: 'active' | 'completed' | 'on_hold'
  organization_id: string
  created_by: string
  created_at: string
  updated_at: string
}

// Sample data for when database is not available
const sampleProjects: Project[] = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete overhaul of the company website with modern design',
    status: 'active',
    organization_id: 'org-1',
    created_by: 'user-1',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T14:30:00Z'
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'Native mobile app for iOS and Android platforms',
    status: 'active',
    organization_id: 'org-1',
    created_by: 'user-1',
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-01-18T16:45:00Z'
  },
  {
    id: '3',
    name: 'Database Migration',
    description: 'Migrate legacy database to new cloud infrastructure',
    status: 'completed',
    organization_id: 'org-1',
    created_by: 'user-1',
    created_at: '2024-01-05T08:00:00Z',
    updated_at: '2024-01-15T12:00:00Z'
  }
]

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: supabaseError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (supabaseError) {
        console.warn('Database not available, using sample data:', supabaseError.message)
        setProjects(sampleProjects)
      } else {
        setProjects(data || [])
      }
    } catch (err) {
      console.warn('Error fetching projects, using sample data:', err)
      setProjects(sampleProjects)
      setError('Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }

  const createProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single()

      if (supabaseError) {
        console.warn('Database not available for creating project:', supabaseError.message)
        // Create a mock project for demo purposes
        const newProject: Project = {
          ...projectData,
          id: `project-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setProjects(prev => [newProject, ...prev])
        return newProject
      }

      setProjects(prev => [data, ...prev])
      return data
    } catch (err) {
      console.error('Error creating project:', err)
      throw err
    }
  }

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (supabaseError) {
        console.warn('Database not available for updating project:', supabaseError.message)
        // Update in local state for demo purposes
        setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p))
        return
      }

      setProjects(prev => prev.map(p => p.id === id ? data : p))
      return data
    } catch (err) {
      console.error('Error updating project:', err)
      throw err
    }
  }

  const deleteProject = async (id: string) => {
    try {
      const { error: supabaseError } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (supabaseError) {
        console.warn('Database not available for deleting project:', supabaseError.message)
      }

      // Remove from local state regardless
      setProjects(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      console.error('Error deleting project:', err)
      throw err
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject
  }
}
