-- Function to create an organization with an owner and default team
CREATE OR REPLACE FUNCTION create_organization_with_owner(
  org_name TEXT,
  owner_email TEXT,
  owner_name TEXT,
  org_description TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_org_id UUID;
  owner_id UUID;
  default_team_id UUID;
  result JSONB;
BEGIN
  -- Get the user ID from auth.users and ensure a profile exists
  SELECT id INTO owner_id 
  FROM auth.users 
  WHERE email = owner_email
  LIMIT 1;
  
  IF owner_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', owner_email;
  END IF;
  
  -- Ensure a profile exists for this user
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (owner_id, owner_email, owner_name, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

  -- Start transaction
  BEGIN
    -- Create the organization
    INSERT INTO organizations (
      name, 
      description, 
      created_by,
      updated_at
    ) VALUES (
      org_name, 
      org_description, 
      owner_id,
      NOW()
    )
    RETURNING id INTO new_org_id;

    -- Add the owner as an organization member with owner role
    INSERT INTO organization_members (
      organization_id,
      user_id,
      role,
      status,
      joined_at,
      created_at,
      updated_at
    ) VALUES (
      new_org_id,
      owner_id,
      'owner',
      'active',
      NOW(),
      NOW(),
      NOW()
    );

    -- Create default team for the organization
    INSERT INTO teams (
      organization_id,
      name,
      description,
      created_by,
      updated_at
    ) VALUES (
      new_org_id,
      'General',
      'Default team for ' || org_name,
      owner_id,
      NOW()
    )
    RETURNING id INTO default_team_id;

    -- Add the owner to the default team
    INSERT INTO team_members (
      team_id,
      user_id,
      role,
      created_at,
      updated_at
    ) VALUES (
      default_team_id,
      owner_id,
      'admin',
      NOW(),
      NOW()
    );

    -- Create default project for the organization
    INSERT INTO projects (
      organization_id,
      name,
      description,
      status,
      created_by,
      updated_at
    ) VALUES (
      new_org_id,
      'Getting Started',
      'Default project to help you get started',
      'In Progress',
      owner_id,
      NOW()
    );

    -- Return the result
    result := jsonb_build_object(
      'id', new_org_id,
      'name', org_name,
      'description', org_description,
      'created_by', owner_id,
      'created_at', NOW(),
      'updated_at', NOW(),
      'owner_id', owner_id,
      'default_team_id', default_team_id
    );

    RETURN result;
  EXCEPTION
    WHEN OTHERS THEN
      -- Rollback the transaction on error
      RAISE EXCEPTION 'Error creating organization: %', SQLERRM;
  END;
END;
$$;
