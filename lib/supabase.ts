import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Get environment variables with fallbacks and validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate required environment variables
if (!supabaseUrl) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL environment variable. ' +
    'Please add it to your .env.local file or environment configuration.'
  )
}

if (!supabaseAnonKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. ' +
    'Please add it to your .env.local file or environment configuration.'
  )
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch (error) {
  throw new Error(
    `Invalid NEXT_PUBLIC_SUPABASE_URL format: ${supabaseUrl}. ` +
    'Please ensure it follows the format: https://your-project.supabase.co'
  )
}

// Create and export Supabase client
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Export createClient function for compatibility
export const createClient = () => supabase

// Export types for TypeScript
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: string | null
          department: string | null
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string | null
          department?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string | null
          department?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          description: string | null
          logo_url: string | null
          settings: any
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          logo_url?: string | null
          settings?: any
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          logo_url?: string | null
          settings?: any
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: string
          permissions: any
          invited_by: string | null
          invited_at: string
          joined_at: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role?: string
          permissions?: any
          invited_by?: string | null
          invited_at?: string
          joined_at?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: string
          permissions?: any
          invited_by?: string | null
          invited_at?: string
          joined_at?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      organization_invitations: {
        Row: {
          id: string
          organization_id: string
          email: string
          role: string
          permissions: any
          invited_by: string
          token: string
          expires_at: string
          accepted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          email: string
          role?: string
          permissions?: any
          invited_by: string
          token: string
          expires_at: string
          accepted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          email?: string
          role?: string
          permissions?: any
          invited_by?: string
          token?: string
          expires_at?: string
          accepted_at?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string | null
          data: any
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message?: string | null
          data?: any
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string | null
          data?: any
          read?: boolean
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          status: string
          priority: string
          progress: number
          start_date: string | null
          due_date: string | null
          organization_id: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          status?: string
          priority?: string
          progress?: number
          start_date?: string | null
          due_date?: string | null
          organization_id?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          status?: string
          priority?: string
          progress?: number
          start_date?: string | null
          due_date?: string | null
          organization_id?: string | null
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
          status: string
          priority: string
          project_id: string | null
          organization_id: string | null
          assigned_to: string | null
          created_by: string
          due_date: string | null
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: string
          priority?: string
          project_id?: string | null
          organization_id?: string | null
          assigned_to?: string | null
          created_by: string
          due_date?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: string
          priority?: string
          project_id?: string | null
          organization_id?: string | null
          assigned_to?: string | null
          created_by?: string
          due_date?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      project_members: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          role?: string
          created_at?: string
        }
      }
    }
    Functions: {
      create_organization_with_admin: {
        Args: {
          org_name: string
          org_description?: string
          org_logo_url?: string
        }
        Returns: string
      }
      invite_user_to_organization: {
        Args: {
          org_id: string
          invite_email: string
          invite_role?: string
          invite_permissions?: any
        }
        Returns: string
      }
      accept_organization_invitation: {
        Args: {
          invitation_token: string
        }
        Returns: boolean
      }
      update_organization_member_role: {
        Args: {
          org_id: string
          member_user_id: string
          new_role: string
          new_permissions?: any
        }
        Returns: boolean
      }
    }
  }
}

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}

// Helper function to get configuration status
export const getSupabaseConfig = () => {
  return {
    url: supabaseUrl ? 'configured' : 'missing',
    anonKey: supabaseAnonKey ? 'configured' : 'missing',
    isValid: isSupabaseConfigured()
  }
}

// Role definitions and permissions
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
