-- Function to check if a user is already a member of a team
CREATE OR REPLACE FUNCTION check_team_membership(
  p_team_id UUID,
  p_email TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_is_member BOOLEAN;
BEGIN
  -- Get the user ID from the email
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = p_email
  LIMIT 1;
  
  -- If user doesn't exist, they're not a member
  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user is already a member of the team
  SELECT EXISTS (
    SELECT 1 
    FROM team_members 
    WHERE team_id = p_team_id 
    AND user_id = v_user_id
  ) INTO v_is_member;
  
  RETURN v_is_member;
END;
$$;
