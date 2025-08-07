'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useOrganizations, Organization } from '@/hooks/use-organizations'

interface OrganizationContextType {
  organizations: Organization[]
  currentOrganization: Organization | null
  loading: boolean
  error: string | null
  createOrganization: (orgData: Omit<Organization, 'id' | 'created_at' | 'updated_at' | 'owner_id'>) => Promise<{ data: Organization | null; error: string | null }>
  updateOrganization: (id: string, updates: Partial<Organization>) => Promise<{ error: string | null }>
  deleteOrganization: (id: string) => Promise<{ error: string | null }>
  switchOrganization: (org: Organization | null) => void
  refetch: () => Promise<void>
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const organizationData = useOrganizations()

  return (
    <OrganizationContext.Provider value={organizationData}>
      {children}
    </OrganizationContext.Provider>
  )
}

export function useOrganizationContext() {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    throw new Error('useOrganizationContext must be used within an OrganizationProvider')
  }
  return context
}
