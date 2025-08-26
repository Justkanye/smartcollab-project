-- Policies for teams table

-- Allow authenticated users to view teams they are members of
CREATE POLICY "Allow team members to view their teams"
ON public.teams
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_members.team_id = teams.id
    AND team_members.user_id = auth.uid()
  )
  OR 
  EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_members.organization_id = teams.organization_id
    AND organization_members.user_id = auth.uid()
    AND organization_members.role = 'owner'
  )
);

-- Allow organization admins and owners to create teams
CREATE POLICY "Allow organization admins to create teams"
ON public.teams
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_members.organization_id = teams.organization_id
    AND organization_members.user_id = auth.uid()
    AND organization_members.role IN ('owner', 'admin')
  )
);

-- Allow team owners and organization admins to update teams
CREATE POLICY "Allow team owners and org admins to update teams"
ON public.teams
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_members.team_id = teams.id
    AND team_members.user_id = auth.uid()
    AND team_members.role = 'owner'
  )
  OR
  EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_members.organization_id = teams.organization_id
    AND organization_members.user_id = auth.uid()
    AND organization_members.role IN ('owner', 'admin')
  )
);

-- Policies for team_members table

-- Create a security definer function to check team membership
CREATE OR REPLACE FUNCTION public.is_team_member(team_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE team_id = team_id_param 
    AND user_id = user_id_param
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Allow team members to view their team's members
CREATE POLICY "Allow team members to view team members"
ON public.team_members
FOR SELECT
TO authenticated
USING (
  public.is_team_member(team_id, auth.uid())
);

-- Create a security definer function to check team ownership
CREATE OR REPLACE FUNCTION public.is_team_owner(team_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE team_id = team_id_param 
    AND user_id = user_id_param
    AND role = 'owner'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Create a security definer function to check organization admin status
CREATE OR REPLACE FUNCTION public.is_org_admin(team_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.teams t
    JOIN public.organization_members om ON t.organization_id = om.organization_id
    WHERE t.id = team_id_param
    AND om.user_id = user_id_param
    AND om.role IN ('owner', 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Allow team owners and organization admins to add/remove team members
CREATE POLICY "Allow team owners to manage team members"
ON public.team_members
FOR ALL
TO authenticated
USING (
  public.is_team_owner(team_id, auth.uid()) OR
  public.is_org_admin(team_id, auth.uid())
)
WITH CHECK (
  public.is_team_owner(team_id, auth.uid()) OR
  public.is_org_admin(team_id, auth.uid())
);

-- Function already defined above
