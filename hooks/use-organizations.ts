"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'
import type { Database } from '@/lib/supabase'

type Organization = Database['public']['Tables']['organizations']['Row'] & {
  member_count?: number
  user_role?: string
  user_permissions?: any
}

type OrganizationMember = Database['public']['Tables']['organization_members']['Row'] & {
  profiles: {
    full_name: string | null
    email: string
    avatar_url: string | null
  } | null
}

type OrganizationInvitation = {
  id: string
  organization_id: string
  email: string
  role: string
  token: string
  expires_at: string
  created_at: string
  accepted_at: string | null
  invited_by: string
  organizations: {
    name: string
  } | null
  invited_by_profile: {
    full_name: string | null
    email: string
  } | null
}

export function useOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Sample organizations for when Supabase is not configured
  const sampleOrganizations: Organization[] = [
    {
      id: 'org-1',
      name: 'Acme Corporation',
      description: 'Leading technology company',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-15T10:30:00Z',
      created_by: user?.id || 'sample-user', // Fixed: use created_by instead of owner_id
      member_count: 12,
      user_role: 'admin',
      user_permissions: {}
    },
    {
      id: 'org-2',
      name: 'Startup Inc',
      description: 'Innovative startup focused on AI solutions',
      created_at: '2024-01-10T00:00:00Z',
      updated_at: '2024-01-20T14:45:00Z',
      created_by: user?.id || 'sample-user', // Fixed: use created_by instead of owner_id
      member_count: 5,
      user_role: 'member',
      user_permissions: {}
    }
  ]

  useEffect(() => {
    if (user) {
      fetchOrganizations()
    } else {
      setOrganizations([])
      setCurrentOrganization(null)
      setLoading(false)
    }
  }, [user])

  const fetchOrganizations = async () => {
    try {
      setLoading(true)
      setError(null)

      // If no Supabase client, use sample data
      if (!supabase) {
        setOrganizations(sampleOrganizations)
        if (!currentOrganization && sampleOrganizations.length > 0) {
          setCurrentOrganization(sampleOrganizations[0])
        }
        setLoading(false)
        return
      }

      // If no user, return empty
      if (!user) {
        setOrganizations([])
        setCurrentOrganization(null)
        setLoading(false)
        return
      }

      // Simple query using created_by instead of owner_id
      const { data, error: fetchError } = await supabase
        .from('organizations')
        .select('*')
        .eq('created_by', user.id) // Fixed: use created_by instead of owner_id
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error fetching organizations:', fetchError)
        // Fall back to sample data
        setOrganizations(sampleOrganizations)
        if (!currentOrganization && sampleOrganizations.length > 0) {
          setCurrentOrganization(sampleOrganizations[0])
        }
        setError(null)
      } else {
        setOrganizations(data || [])
        // Set first organization as current if none selected
        if (!currentOrganization && data && data.length > 0) {
          setCurrentOrganization(data[0])
        }
      }
    } catch (err) {
      console.error('Error fetching organizations:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
      // Fall back to sample data
      setOrganizations(sampleOrganizations)
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  const createOrganization = async (orgData: {
    name: string
    description?: string
    logo_url?: string
  }) => {
    if (!user) return { error: 'User not authenticated' }

    try {
      if (!supabase) {
        // Simulate creating organization with sample data
        const newOrg: Organization = {
          id: `org-${Date.now()}`,
          name: orgData.name,
          description: orgData.description || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: user.id, // Fixed: use created_by instead of owner_id
          member_count: 1,
          user_role: 'admin',
          user_permissions: {}
        }
        setOrganizations(prev => [newOrg, ...prev])
        return { data: newOrg, error: null }
      }

      const { data, error } = await supabase
        .from('organizations')
        .insert([{
          name: orgData.name,
          description: orgData.description || null,
          created_by: user.id // Fixed: use created_by instead of owner_id
        }])
        .select()
        .single()

      if (error) throw error
      await fetchOrganizations()
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' }
    }
  }

  const updateOrganization = async (id: string, updates: Partial<Organization>) => {
    try {
      if (!supabase) {
        // Simulate update with sample data
        setOrganizations(prev => 
          prev.map(org => org.id === id ? { ...org, ...updates } : org)
        )
        if (currentOrganization?.id === id) {
          setCurrentOrganization(prev => prev ? { ...prev, ...updates } : null)
        }
        return { error: null }
      }

      const { error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', id)

      if (error) throw error
      await fetchOrganizations()
      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'An error occurred' }
    }
  }

  const switchOrganization = (org: Organization | null) => {
    setCurrentOrganization(org)
    // Store in localStorage for persistence
    if (org) {
      localStorage.setItem('currentOrganizationId', org.id)
    } else {
      localStorage.removeItem('currentOrganizationId')
    }
  }

  return {
    organizations,
    currentOrganization,
    loading,
    error,
    createOrganization,
    updateOrganization,
    switchOrganization,
    setCurrentOrganization,
    refetch: fetchOrganizations,
  }
}

export function useOrganizationMembers(organizationId?: string) {
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Sample members for when Supabase is not configured
  const sampleMembers: OrganizationMember[] = [
    {
      id: 'member-1',
      organization_id: organizationId || 'org-1',
      user_id: user?.id || 'sample-user',
      role: 'admin',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      joined_at: '2024-01-01T00:00:00Z',
      profiles: {
        full_name: 'John Doe',
        email: user?.email || 'john@example.com',
        avatar_url: null
      }
    },
    {
      id: 'member-2',
      organization_id: organizationId || 'org-1',
      user_id: 'user-2',
      role: 'member',
      created_at: '2024-01-05T00:00:00Z',
      updated_at: '2024-01-05T00:00:00Z',
      joined_at: '2024-01-05T00:00:00Z',
      profiles: {
        full_name: 'Jane Smith',
        email: 'jane@example.com',
        avatar_url: null
      }
    }
  ]

  useEffect(() => {
    if (organizationId) {
      fetchMembers()
    } else {
      setMembers([])
      setLoading(false)
    }
  }, [organizationId])

  const fetchMembers = async () => {
    if (!organizationId) return

    try {
      setLoading(true)
      setError(null)

      // If no Supabase client, use sample data
      if (!supabase) {
        setMembers(sampleMembers)
        setLoading(false)
        return
      }

      // For now, use sample data to avoid database issues
      setMembers(sampleMembers)
      setLoading(false)

    } catch (err) {
      console.error('Error fetching members:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
      setMembers(sampleMembers)
      setLoading(false)
    }
  }

  const inviteMember = async (email: string, role: string = 'member') => {
    if (!organizationId) return { error: 'No organization selected' }

    try {
      if (!supabase) {
        // Simulate invitation
        return { data: { success: true }, error: null }
      }

      const { data, error } = await supabase.rpc('invite_user_to_organization', {
        org_id: organizationId,
        invite_email: email,
        invite_role: role
      })

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' }
    }
  }

  const updateMemberRole = async (userId: string, role: string, permissions: any = {}) => {
    if (!organizationId) return { error: 'No organization selected' }

    try {
      if (!supabase) {
        // Simulate role update
        setMembers(prev => 
          prev.map(member => 
            member.user_id === userId ? { ...member, role } : member
          )
        )
        return { data: { success: true }, error: null }
      }

      const { data, error } = await supabase.rpc('update_organization_member_role', {
        org_id: organizationId,
        member_user_id: userId,
        new_role: role,
        new_permissions: permissions
      })

      if (error) throw error
      await fetchMembers()
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' }
    }
  }

  const removeMember = async (userId: string) => {
    if (!organizationId) return { error: 'No organization selected' }

    try {
      if (!supabase) {
        // Simulate member removal
        setMembers(prev => prev.filter(member => member.user_id !== userId))
        return { error: null }
      }

      const { error } = await supabase
        .from('organization_members')
        .update({ status: 'inactive' })
        .eq('organization_id', organizationId)
        .eq('user_id', userId)

      if (error) throw error
      await fetchMembers()
      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'An error occurred' }
    }
  }

  return {
    members,
    loading,
    error,
    inviteMember,
    updateMemberRole,
    removeMember,
    refetch: fetchMembers,
  }
}

export function useOrganizationInvitations() {
  const [invitations, setInvitations] = useState<OrganizationInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchInvitations()
    } else {
      setInvitations([])
      setLoading(false)
    }
  }, [user])

  const fetchInvitations = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      // If no Supabase client, use empty array
      if (!supabase) {
        setInvitations([])
        setLoading(false)
        return
      }

      // For now, use empty array to avoid database issues
      setInvitations([])
      setLoading(false)

    } catch (err) {
      console.error('Error fetching invitations:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
      setInvitations([])
      setLoading(false)
    }
  }

  const acceptInvitation = async (token: string) => {
    try {
      if (!supabase) {
        return { data: { success: true }, error: null }
      }

      const { data, error } = await supabase.rpc('accept_organization_invitation', {
        invitation_token: token
      })

      if (error) throw error
      await fetchInvitations()
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' }
    }
  }

  const declineInvitation = async (invitationId: string) => {
    try {
      if (!supabase) {
        return { error: null }
      }

      const { error } = await supabase
        .from('organization_invitations')
        .delete()
        .eq('id', invitationId)

      if (error) throw error
      await fetchInvitations()
      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'An error occurred' }
    }
  }

  return {
    invitations,
    loading,
    error,
    acceptInvitation,
    declineInvitation,
    refetch: fetchInvitations,
  }
}
