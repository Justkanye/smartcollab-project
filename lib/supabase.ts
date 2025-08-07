import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Supabase configuration
export const getSupabaseConfig = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables')
    return null
  }

  return { supabaseUrl, supabaseAnonKey }
}

// Create Supabase client
export const createClient = () => {
  try {
    const config = getSupabaseConfig()
    if (!config) return null
    
    const { supabaseUrl, supabaseAnonKey } = config
    return createSupabaseClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.error('Failed to create Supabase client:', error)
    return null
  }
}

// Default client instance
export const supabase = createClient()

// Organization roles
export const ORGANIZATION_ROLES = {
  admin: {
    name: 'Admin',
    description: 'Full access to organization settings, members, and all projects',
    permissions: [
      'manage_organization',
      'manage_members',
      'manage_projects',
      'manage_tasks',
      'view_analytics',
      'manage_settings'
    ]
  },
  member: {
    name: 'Member',
    description: 'Can create and manage projects, collaborate on tasks',
    permissions: [
      'create_projects',
      'manage_own_projects',
      'manage_tasks',
      'view_projects',
      'collaborate'
    ]
  },
  guest: {
    name: 'Guest',
    description: 'Limited access to view and comment on assigned projects',
    permissions: [
      'view_assigned_projects',
      'view_assigned_tasks',
      'comment',
      'update_assigned_tasks'
    ]
  }
} as const

export type OrganizationRole = keyof typeof ORGANIZATION_ROLES

// Database types - Fixed to match actual database schema
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
          created_by: string // Fixed: use created_by instead of owner_id
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
          created_by: string // Fixed: use created_by instead of owner_id
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string // Fixed: use created_by instead of owner_id
        }
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: OrganizationRole
          created_at: string
          updated_at: string
          joined_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role: OrganizationRole
          created_at?: string
          updated_at?: string
          joined_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: OrganizationRole
          created_at?: string
          updated_at?: string
          joined_at?: string | null
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          status: string
          priority: string
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
          organization_id: string | null
          created_by: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          status?: string
          priority?: string
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
          organization_id?: string | null
          created_by: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          status?: string
          priority?: string
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
          organization_id?: string | null
          created_by?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: string
          priority: string
          due_date: string | null
          created_at: string
          updated_at: string
          project_id: string | null
          assigned_to: string | null
          created_by: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: string
          priority?: string
          due_date?: string | null
          created_at?: string
          updated_at?: string
          project_id?: string | null
          assigned_to?: string | null
          created_by: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: string
          priority?: string
          due_date?: string | null
          created_at?: string
          updated_at?: string
          project_id?: string | null
          assigned_to?: string | null
          created_by?: string
        }
      }
    }
  }
}
