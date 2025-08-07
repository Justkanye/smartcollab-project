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

type OrganizationInvitation = Database['public']['Tables']['organization_invitations']['Row'] & {
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

  useEffect(() => {
    if (user) {
      fetchOrganizations()
    }
  }, [user])

  const fetchOrganizations = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('organizations')
        .select(`
          *,
          organization_members!inner (
            role,
            permissions,
            status
          )
        `)
        .eq('organization_members.user_id', user?.id)
        .eq('organization_members.status', 'active')

      if (error) throw error

      const orgsWithDetails = await Promise.all(
        (data || []).map(async (org) => {
          // Get member count
          const { count } = await supabase
            .from('organization_members')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', org.id)
            .eq('status', 'active')

          const member = org.organization_members[0]
          return {
            ...org,
            member_count: count || 0,
            user_role: member?.role,
            user_permissions: member?.permissions
          }
        })
      )

      setOrganizations(orgsWithDetails)
      
      // Set current organization if none selected
      if (!currentOrganization && orgsWithDetails.length > 0) {
        setCurrentOrganization(orgsWithDetails[0])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
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
      const { data, error } = await supabase.rpc('create_organization_with_admin', {
        org_name: orgData.name,
        org_description: orgData.description,
        org_logo_url: orgData.logo_url
      })

      if (error) throw error
      await fetchOrganizations()
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' }
    }
  }

  const updateOrganization = async (id: string, updates: Partial<Organization>) => {
    try {
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

  const switchOrganization = (org: Organization) => {
    setCurrentOrganization(org)
    // Store in localStorage for persistence
    localStorage.setItem('currentOrganizationId', org.id)
  }

  return {
    organizations,
    currentOrganization,
    loading,
    error,
    createOrganization,
    updateOrganization,
    switchOrganization,
    refetch: fetchOrganizations,
  }
}

export function useOrganizationMembers(organizationId?: string) {
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (organizationId) {
      fetchMembers()
    }
  }, [organizationId])

  const fetchMembers = async () => {
    if (!organizationId) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('organization_id', organizationId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMembers(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const inviteMember = async (email: string, role: string = 'member') => {
    if (!organizationId) return { error: 'No organization selected' }

    try {
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
    }
  }, [user])

  const fetchInvitations = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('organization_invitations')
        .select(`
          *,
          organizations (name),
          invited_by_profile:invited_by (
            full_name,
            email
          )
        `)
        .eq('email', user.email)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error
      setInvitations(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const acceptInvitation = async (token: string) => {
    try {
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
