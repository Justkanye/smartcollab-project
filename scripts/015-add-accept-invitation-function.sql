-- Create a function to accept invitations
CREATE OR REPLACE FUNCTION public.accept_invitation(
  p_invitation_id UUID,
  p_invitation_type TEXT,
  p_user_id UUID,
  p_email TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invitation RECORD;
  v_membership_id UUID;
  v_team_id UUID;
  v_organization_id UUID;
  v_role TEXT;
  v_result JSONB;
BEGIN
  -- Get the invitation based on type
  IF p_invitation_type = 'organization' THEN
    SELECT * INTO v_invitation 
    FROM public.organization_invitations 
    WHERE id = p_invitation_id 
    AND email = p_email
    AND expires_at > NOW()
    FOR UPDATE;
    
    IF NOT FOUND THEN
      RETURN jsonb_build_object('error', 'Invalid or expired organization invitation');
    END IF;
    
    v_organization_id := v_invitation.organization_id;
    v_role := v_invitation.role;
    
  ELSIF p_invitation_type = 'team' THEN
    SELECT * INTO v_invitation 
    FROM public.team_invitations ti
    JOIN public.teams t ON t.id = ti.team_id
    WHERE ti.id = p_invitation_id 
    AND ti.email = p_email
    AND ti.expires_at > NOW()
    FOR UPDATE;
    
    IF NOT FOUND THEN
      RETURN jsonb_build_object('error', 'Invalid or expired team invitation');
    END IF;
    
    v_team_id := v_invitation.team_id;
    v_organization_id := v_invitation.organization_id;
    v_role := v_invitation.role;
    
    -- Check if user is already a member of the organization
    PERFORM 1 
    FROM public.organization_members 
    WHERE organization_id = v_organization_id 
    AND user_id = p_user_id
    AND status = 'active';
    
    IF NOT FOUND THEN
      RETURN jsonb_build_object('error', 'You must be a member of the organization first');
    END IF;
    
  ELSE
    RETURN jsonb_build_object('error', 'Invalid invitation type');
  END IF;
  
  -- Start a transaction
  BEGIN
    -- Add or update organization membership for organization invites
    IF p_invitation_type = 'organization' THEN
      INSERT INTO public.organization_members (
        organization_id,
        user_id,
        email,
        role,
        status,
        invited_by,
        invited_at,
        updated_at
      )
      VALUES (
        v_organization_id,
        p_user_id,
        p_email,
        v_role,
        'active',
        v_invitation.invited_by,
        v_invitation.created_at,
        NOW()
      )
      ON CONFLICT (organization_id, user_id) 
      DO UPDATE SET
        status = 'active',
        role = v_role,
        updated_at = NOW()
      RETURNING id INTO v_membership_id;
      
      -- Add to default teams
      INSERT INTO public.team_members (
        team_id,
        user_id,
        role,
        created_at,
        updated_at
      )
      SELECT 
        id,
        p_user_id,
        'member',
        NOW(),
        NOW()
      FROM public.teams
      WHERE organization_id = v_organization_id 
      AND is_default = TRUE
      ON CONFLICT (team_id, user_id) DO NOTHING;
      
    -- Add to team for team invites
    ELSIF p_invitation_type = 'team' THEN
      INSERT INTO public.team_members (
        team_id,
        user_id,
        role,
        created_at,
        updated_at
      )
      VALUES (
        v_team_id,
        p_user_id,
        v_role,
        NOW(),
        NOW()
      )
      ON CONFLICT (team_id, user_id) 
      DO UPDATE SET
        role = v_role,
        updated_at = NOW();
    END IF;
    
    -- Delete the invitation
    IF p_invitation_type = 'organization' THEN
      DELETE FROM public.organization_invitations 
      WHERE id = p_invitation_id;
    ELSE
      DELETE FROM public.team_invitations 
      WHERE id = p_invitation_id;
    END IF;
    
    -- Return success
    v_result := jsonb_build_object(
      'success', true,
      'organization_id', v_organization_id,
      'team_id', v_team_id
    );
    
    RETURN v_result;
    
  EXCEPTION WHEN OTHERS THEN
    -- Rollback the transaction on error
    RAISE EXCEPTION 'Error accepting invitation: %', SQLERRM;
  END;
END;
$$;
