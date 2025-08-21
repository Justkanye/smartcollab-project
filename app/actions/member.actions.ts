'use server'

import { createClient } from '@/lib/superbase.server'
import { revalidatePath } from 'next/cache'

export type MemberRole = 'admin' | 'member' | 'viewer'

export async function getOrganizationMembers(organizationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: [], error: 'User not authenticated' }
  }

  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      id,
      role,
      status,
      created_at,
      user:profiles(id, full_name, email, avatar_url)
    `)
    .eq('organization_id', organizationId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    return { data: [], error: error.message }
  }

  return { 
    data: data.map(member => ({
      id: member.id,
      role: member.role,
      status: member.status,
      created_at: member.created_at,
      user: member.user
    })), 
    error: null 
  }
}

export async function inviteMember(organizationId: string, email: string, role: MemberRole = 'member') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: 'User not authenticated' }
  }

  // Check if user has permission to invite members
  const { data: memberCheck } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
    .single()

  if (!memberCheck || !['admin', 'owner'].includes(memberCheck.role)) {
    return { data: null, error: 'Insufficient permissions' }
  }

  // Check if user exists
  const { data: userData } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (userData) {
    // User exists, add directly
    const { error } = await supabase
      .from('organization_members')
      .insert([
        {
          organization_id: organizationId,
          user_id: userData.id,
          role,
          status: 'pending',
          invited_by: user.id
        }
      ])

    if (error) {
      return { data: null, error: error.message }
    }
  } else {
    // User doesn't exist, create invitation
    const { error } = await supabase
      .from('organization_invitations')
      .insert([
        {
          organization_id: organizationId,
          email,
          role,
          invited_by: user.id,
          status: 'pending'
        }
      ])

    if (error) {
      return { data: null, error: error.message }
    }
  }

  revalidatePath('/settings/members')
  return { data: { success: true }, error: null }
}

export async function updateMemberRole(organizationId: string, memberId: string, role: MemberRole) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'User not authenticated' }
  }

  // Check if user has permission to update roles
  const { data: currentUser } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
    .single()

  if (!currentUser || !['admin', 'owner'].includes(currentUser.role)) {
    return { error: 'Insufficient permissions' }
  }

  const { error } = await supabase
    .from('organization_members')
    .update({ role })
    .eq('id', memberId)
    .eq('organization_id', organizationId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/settings/members')
  return { error: null }
}

export async function removeMember(organizationId: string, memberId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'User not authenticated' }
  }

  // Check if user has permission to remove members
  const { data: currentUser } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
    .single()

  if (!currentUser || !['admin', 'owner'].includes(currentUser.role)) {
    return { error: 'Insufficient permissions' }
  }

  const { error } = await supabase
    .from('organization_members')
    .update({ status: 'inactive' })
    .eq('id', memberId)
    .eq('organization_id', organizationId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/settings/members')
  return { error: null }
}
