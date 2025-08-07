-- Enable RLS on all organization tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Users can view organizations they are members of" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can create organizations" ON organizations
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Organization admins can update organizations" ON organizations
  FOR UPDATE USING (
    id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND role = 'admin' AND status = 'active'
    )
  );

CREATE POLICY "Organization admins can delete organizations" ON organizations
  FOR DELETE USING (
    id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND role = 'admin' AND status = 'active'
    )
  );

-- Organization members policies
CREATE POLICY "Users can view organization members of their organizations" ON organization_members
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Organization admins can manage members" ON organization_members
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND role = 'admin' AND status = 'active'
    )
  );

CREATE POLICY "Users can update their own membership" ON organization_members
  FOR UPDATE USING (user_id = auth.uid());

-- Organization invitations policies
CREATE POLICY "Organization admins can manage invitations" ON organization_invitations
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND role = 'admin' AND status = 'active'
    )
  );

CREATE POLICY "Users can view invitations sent to them" ON organization_invitations
  FOR SELECT USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Update project policies to include organization context
DROP POLICY IF EXISTS "Users can view projects they have access to" ON projects;
CREATE POLICY "Users can view projects they have access to" ON projects
  FOR SELECT USING (
    created_by = auth.uid() OR
    id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    ) OR
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Update task policies to include organization context
DROP POLICY IF EXISTS "Users can view tasks they have access to" ON tasks;
CREATE POLICY "Users can view tasks they have access to" ON tasks
  FOR SELECT USING (
    created_by = auth.uid() OR
    assigned_to = auth.uid() OR
    project_id IN (
      SELECT id FROM projects WHERE 
        created_by = auth.uid() OR
        id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
    ) OR
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );
