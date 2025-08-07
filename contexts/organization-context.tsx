"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { useOrganizations } from '@/hooks/use-organizations'
import type { Database } from '@/lib/supabase'

type Organization = Database['public']['Tables']['organizations']['Row'] & {
  member_count?: number
  user_role?: string
  user_permissions?: any
}

interface OrganizationContextType {
  organizations: Organization[]
  currentOrganization: Organization | null
  loading: boolean
  error: string | null
  switchOrganization: (org: Organization) => void
  hasPermission: (permission: string) => boolean
  isAdmin: boolean
  isMember: boolean
  isGuest: boolean
  refetch: () => void
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const {
    organizations,
    currentOrganization,
    loading,
    error,
    switchOrganization,
    refetch
  } = useOrganizations()

  // Load saved organization from localStorage
  useEffect(() => {
    const savedOrgId = localStorage.getItem('currentOrganizationId')
    if (savedOrgId && organizations.length > 0) {
      const savedOrg = organizations.find(org => org.id === savedOrgId)
      if (savedOrg && (!currentOrganization || currentOrganization.id !== savedOrgId)) {
        switchOrganization(savedOrg)
      }
    }
  }, [organizations, currentOrganization, switchOrganization])

  const hasPermission = (permission: string): boolean => {
    if (!currentOrganization?.user_role) return false

    const role = currentOrganization.user_role
    const customPermissions = currentOrganization.user_permissions || {}

    // Check custom permissions first
    if (customPermissions[permission] !== undefined) {
      return customPermissions[permission]
    }

    // Default role permissions
    switch (role) {
      case 'admin':
        return true // Admins have all permissions
      case 'member':
        return [
          'create_projects',
          'manage_own_projects',
          'manage_tasks',
          'view_projects',
          'collaborate'
        ].includes(permission)
      case 'guest':
        return [
          'view_assigned_projects',
          'view_assigned_tasks',
          'comment',
          'update_assigned_tasks'
        ].includes(permission)
      default:
        return false
    }
  }

  const isAdmin = currentOrganization?.user_role === 'admin'
  const isMember = currentOrganization?.user_role === 'member'
  const isGuest = currentOrganization?.user_role === 'guest'

  const value = {
    organizations,
    currentOrganization,
    loading,
    error,
    switchOrganization,
    hasPermission,
    isAdmin,
    isMember,
    isGuest,
    refetch,
  }

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  )
}

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider')
  }
  return context
}
