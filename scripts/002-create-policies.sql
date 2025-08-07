-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view projects they're members of" ON projects FOR SELECT 
USING (
  auth.uid() = created_by OR 
  EXISTS (
    SELECT 1 FROM project_members 
    WHERE project_members.project_id = projects.id 
    AND project_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create projects" ON projects FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Project owners and admins can update projects" ON projects FOR UPDATE 
USING (
  auth.uid() = created_by OR 
  EXISTS (
    SELECT 1 FROM project_members 
    WHERE project_members.project_id = projects.id 
    AND project_members.user_id = auth.uid() 
    AND project_members.role IN ('Owner', 'Admin')
  )
);

CREATE POLICY "Project owners can delete projects" ON projects FOR DELETE 
USING (auth.uid() = created_by);

-- Tasks policies
CREATE POLICY "Users can view tasks in their projects" ON tasks FOR SELECT 
USING (
  auth.uid() = created_by OR 
  auth.uid() = assigned_to OR
  project_id IS NULL OR
  EXISTS (
    SELECT 1 FROM project_members 
    WHERE project_members.project_id = tasks.project_id 
    AND project_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create tasks" ON tasks FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Task creators and assignees can update tasks" ON tasks FOR UPDATE 
USING (
  auth.uid() = created_by OR 
  auth.uid() = assigned_to OR
  EXISTS (
    SELECT 1 FROM project_members 
    WHERE project_members.project_id = tasks.project_id 
    AND project_members.user_id = auth.uid() 
    AND project_members.role IN ('Owner', 'Admin')
  )
);

CREATE POLICY "Task creators and project owners can delete tasks" ON tasks FOR DELETE 
USING (
  auth.uid() = created_by OR
  EXISTS (
    SELECT 1 FROM project_members 
    WHERE project_members.project_id = tasks.project_id 
    AND project_members.user_id = auth.uid() 
    AND project_members.role IN ('Owner', 'Admin')
  )
);

-- Project members policies
CREATE POLICY "Users can view project members for their projects" ON project_members FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM project_members pm 
    WHERE pm.project_id = project_members.project_id 
    AND pm.user_id = auth.uid()
  )
);

CREATE POLICY "Project owners and admins can manage members" ON project_members FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM project_members pm 
    WHERE pm.project_id = project_members.project_id 
    AND pm.user_id = auth.uid() 
    AND pm.role IN ('Owner', 'Admin')
  )
);
