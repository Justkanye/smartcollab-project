'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface Project {
  id: string
  name: string
  description: string | null
  status: 'planning' | 'active' | 'completed' | 'on-hold'
  priority: 'low' | 'medium' | 'high'
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
  organization_id: string | null
  owner_id: string
  progress?: number
}

// Sample data for when Supabase is not available
const sampleProjects: Project[] = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete overhaul of the company website with modern design',
    status: 'active',
    priority: 'high',
    start_date: '2024-01-15',
    end_date: '2024-03-15',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z',
    organization_id: null,
    owner_id: 'user-1',
    progress: 65
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'Native mobile app for iOS and Android platforms',
    status: 'active',
    priority: 'high',
    start_date: '2024-02-01',
    end_date: '2024-06-01',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-05T00:00:00Z',
    organization_id: null,
    owner_id: 'user-1',
    progress: 30
  },
  {
    id: '3',
    name: 'Database Migration',
    description: 'Migrate legacy database to new cloud infrastructure',
    status: 'planning',
    priority: 'medium',
    start_date: '2024-03-01',
    end_date: '2024-04-15',
    created_at: '2024-02-15T00:00:00Z',
    updated_at: '2024-02-15T00:00:00Z',
    organization_id: null,
    owner_id: 'user-1',
    progress: 10
  }
]

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      
      if (!supabase) {
        // Use sample data when Supabase is not available
        setProjects(sampleProjects)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error fetching projects:', error)
        // Fallback to sample data
        setProjects(sampleProjects)
      } else {
        setProjects(data || [])
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err)
      setError('Failed to load projects')
      // Fallback to sample data
      setProjects(sampleProjects)
    } finally {
      setLoading(false)
    }
  }

  const createProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (!supabase) {
        // Simulate creating a project with sample data
        const newProject: Project = {
          ...projectData,
          id: `project-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        setProjects(prev => [newProject, ...prev])
        return { data: newProject, error: null }
      }

      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single()

      if (error) {
        console.error('Error creating project:', error)
        return { data: null, error }
      }

      setProjects(prev => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      console.error('Failed to create project:', err)
      return { data: null, error: 'Failed to create project' }
    }
  }

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      if (!supabase) {
        // Simulate updating a project with sample data
        setProjects(prev => prev.map(project => 
          project.id === id 
            ? { ...project, ...updates, updated_at: new Date().toISOString() }
            : project
        ))
        return { error: null }
      }

      const { error } = await supabase
        .from('projects')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) {
        console.error('Error updating project:', error)
        return { error }
      }

      setProjects(prev => prev.map(project => 
        project.id === id 
          ? { ...project, ...updates, updated_at: new Date().toISOString() }
          : project
      ))
      return { error: null }
    } catch (err) {
      console.error('Failed to update project:', err)
      return { error: 'Failed to update project' }
    }
  }

  const deleteProject = async (id: string) => {
    try {
      if (!supabase) {
        // Simulate deleting a project with sample data
        setProjects(prev => prev.filter(project => project.id !== id))
        return { error: null }
      }

      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting project:', error)
        return { error }
      }

      setProjects(prev => prev.filter(project => project.id !== id))
      return { error: null }
    } catch (err) {
      console.error('Failed to delete project:', err)
      return { error: 'Failed to delete project' }
    }
  }

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  }
}
