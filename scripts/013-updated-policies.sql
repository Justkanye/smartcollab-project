-- Drop existing policies if they exist
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies 
              WHERE schemaname = 'public' 
              AND tablename IN ('teams', 'team_members')) 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- Enable RLS if not already enabled
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Teams policies
-- Allow organization members to view teams in their organization
CREATE POLICY "teams_org_member_select" ON public.teams
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id = teams.organization_id
    AND om.user_id = auth.uid()
    AND om.status = 'active'
  )
);

-- Allow organization admins/owners to create teams
CREATE POLICY "teams_admin_create" ON public.teams
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id = teams.organization_id
    AND om.user_id = auth.uid()
    AND om.role IN ('owner', 'admin')
    AND om.status = 'active'
  )
);

-- Allow team admins/owners to update their teams
CREATE POLICY "teams_admin_update" ON public.teams
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = teams.id
    AND tm.user_id = auth.uid()
    AND tm.role IN ('owner', 'admin')
  )
  OR
  EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id = teams.organization_id
    AND om.user_id = auth.uid()
    AND om.role IN ('owner', 'admin')
    AND om.status = 'active'
  )
);

-- Team members policies
-- Allow organization members to view team members in their organization
CREATE POLICY "team_members_select" ON public.team_members
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.teams t
    JOIN public.organization_members om ON t.organization_id = om.organization_id
    WHERE t.id = team_members.team_id
    AND om.user_id = auth.uid()
    AND om.status = 'active'
  )
);

-- Allow team admins/owners to manage team members
CREATE POLICY "team_members_admin_manage" ON public.team_members
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = team_members.team_id
    AND tm.user_id = auth.uid()
    AND tm.role IN ('owner', 'admin')
  )
  OR
  EXISTS (
    SELECT 1 FROM public.teams t
    JOIN public.organization_members om ON t.organization_id = om.organization_id
    WHERE t.id = team_members.team_id
    AND om.user_id = auth.uid()
    AND om.role IN ('owner', 'admin')
    AND om.status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = team_members.team_id
    AND tm.user_id = auth.uid()
    AND tm.role IN ('owner', 'admin')
  )
  OR
  EXISTS (
    SELECT 1 FROM public.teams t
    JOIN public.organization_members om ON t.organization_id = om.organization_id
    WHERE t.id = team_members.team_id
    AND om.user_id = auth.uid()
    AND om.role IN ('owner', 'admin')
    AND om.status = 'active'
  )
);

-- Allow users to leave a team (delete their own membership)
CREATE POLICY "team_members_leave_team" ON public.team_members
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
  AND NOT EXISTS (
    SELECT 1 FROM public.teams
    WHERE id = team_members.team_id
    AND created_by = auth.uid()
  )
);
