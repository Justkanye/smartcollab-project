-- Function to create organization with admin role
CREATE OR REPLACE FUNCTION create_organization_with_admin(
  org_name TEXT,
  org_description TEXT DEFAULT NULL,
  org_logo_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_org_id UUID;
  user_id UUID;
BEGIN
  -- Get current user ID
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Create organization
  INSERT INTO organizations (name, description, logo_url, created_by)
  VALUES (org_name, org_description, org_logo_url, user_id)
  RETURNING id INTO new_org_id;

  -- Add creator as admin
  INSERT INTO organization_members (organization_id, user_id, role, status, joined_at)
  VALUES (new_org_id, user_id, 'admin', 'active', NOW());

  RETURN new_org_id;
END;
$$;

-- Function to invite user to organization
CREATE OR REPLACE FUNCTION invite_user_to_organization(
  org_id UUID,
  invite_email TEXT,
  invite_role TEXT DEFAULT 'member',
  invite_permissions JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitation_id UUID;
  inviter_id UUID;
  invite_token TEXT;
  existing_member UUID;
BEGIN
  -- Get current user ID
  inviter_id := auth.uid();
  
  IF inviter_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Check if inviter is admin of the organization
  IF NOT EXISTS (
    SELECT 1 FROM organization_members 
    WHERE organization_id = org_id 
    AND user_id = inviter_id 
    AND role = 'admin' 
    AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Only organization admins can invite users';
  END IF;

  -- Check if user is already a member
  SELECT id INTO existing_member
  FROM organization_members om
  JOIN auth.users u ON om.user_id = u.id
  WHERE om.organization_id = org_id AND u.email = invite_email;

  IF existing_member IS NOT NULL THEN
    RAISE EXCEPTION 'User is already a member of this organization';
  END IF;

  -- Generate invitation token
  invite_token := encode(gen_random_bytes(32), 'hex');

  -- Create invitation
  INSERT INTO organization_invitations (
    organization_id, 
    email, 
    role, 
    permissions, 
    invited_by, 
    token, 
    expires_at
  )
  VALUES (
    org_id, 
    invite_email, 
    invite_role, 
    invite_permissions, 
    inviter_id, 
    invite_token, 
    NOW() + INTERVAL '7 days'
  )
  ON CONFLICT (organization_id, email) 
  DO UPDATE SET
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions,
    invited_by = EXCLUDED.invited_by,
    token = EXCLUDED.token,
    expires_at = EXCLUDED.expires_at,
    created_at = NOW()
  RETURNING id INTO invitation_id;

  -- Create notification for existing users
  INSERT INTO notifications (user_id, type, title, message, data)
  SELECT 
    u.id,
    'organization_invitation',
    'Organization Invitation',
    'You have been invited to join ' || o.name,
    jsonb_build_object(
      'organization_id', org_id,
      'organization_name', o.name,
      'role', invite_role,
      'invitation_id', invitation_id,
      'token', invite_token
    )
  FROM auth.users u
  CROSS JOIN organizations o
  WHERE u.email = invite_email AND o.id = org_id;

  RETURN invitation_id;
END;
$$;

-- Function to accept organization invitation
CREATE OR REPLACE FUNCTION accept_organization_invitation(invitation_token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitation_record RECORD;
  user_id UUID;
  user_email TEXT;
BEGIN
  -- Get current user
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Get user email
  SELECT email INTO user_email FROM auth.users WHERE id = user_id;

  -- Get invitation details
  SELECT * INTO invitation_record
  FROM organization_invitations
  WHERE token = invitation_token
  AND expires_at > NOW()
  AND accepted_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invitation';
  END IF;

  -- Check if invitation email matches user email
  IF invitation_record.email != user_email THEN
    RAISE EXCEPTION 'Invitation email does not match user email';
  END IF;

  -- Add user to organization
  INSERT INTO organization_members (
    organization_id,
    user_id,
    role,
    permissions,
    invited_by,
    invited_at,
    joined_at,
    status
  )
  VALUES (
    invitation_record.organization_id,
    user_id,
    invitation_record.role,
    invitation_record.permissions,
    invitation_record.invited_by,
    invitation_record.created_at,
    NOW(),
    'active'
  );

  -- Mark invitation as accepted
  UPDATE organization_invitations
  SET accepted_at = NOW()
  WHERE id = invitation_record.id;

  -- Create welcome notification
  INSERT INTO notifications (user_id, type, title, message, data)
  SELECT 
    user_id,
    'organization_joined',
    'Welcome to Organization',
    'You have successfully joined ' || o.name,
    jsonb_build_object(
      'organization_id', invitation_record.organization_id,
      'organization_name', o.name,
      'role', invitation_record.role
    )
  FROM organizations o
  WHERE o.id = invitation_record.organization_id;

  RETURN TRUE;
END;
$$;

-- Function to update member role
CREATE OR REPLACE FUNCTION update_organization_member_role(
  org_id UUID,
  member_user_id UUID,
  new_role TEXT,
  new_permissions JSONB DEFAULT '{}'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Check if current user is admin
  IF NOT EXISTS (
    SELECT 1 FROM organization_members 
    WHERE organization_id = org_id 
    AND user_id = current_user_id 
    AND role = 'admin' 
    AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Only organization admins can update member roles';
  END IF;

  -- Update member role
  UPDATE organization_members
  SET 
    role = new_role,
    permissions = new_permissions,
    updated_at = NOW()
  WHERE organization_id = org_id AND user_id = member_user_id;

  -- Create notification
  INSERT INTO notifications (user_id, type, title, message, data)
  SELECT 
    member_user_id,
    'role_updated',
    'Role Updated',
    'Your role in ' || o.name || ' has been updated to ' || new_role,
    jsonb_build_object(
      'organization_id', org_id,
      'organization_name', o.name,
      'new_role', new_role
    )
  FROM organizations o
  WHERE o.id = org_id;

  RETURN TRUE;
END;
$$;
