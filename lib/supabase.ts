import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

// Create client function for compatibility
export function createClient() {
  return supabase
}

// Get Supabase configuration status
export function getSupabaseConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing',
    isValid: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  }
}

// Organization roles and permissions
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

// Database types
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
          owner_id: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
          owner_id: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
          owner_id?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          status: 'active' | 'completed' | 'on_hold'
          organization_id: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          status?: 'active' | 'completed' | 'on_hold'
          organization_id: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          status?: 'active' | 'completed' | 'on_hold'
          organization_id?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
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
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'completed'
          priority?: 'low' | 'medium' | 'high'
          project_id: string
          assigned_to?: string | null
          created_by: string
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'completed'
          priority?: 'low' | 'medium' | 'high'
          project_id?: string
          assigned_to?: string | null
          created_by?: string
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
