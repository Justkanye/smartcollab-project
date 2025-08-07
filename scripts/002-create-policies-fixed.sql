-- Drop existing policies if they exist (for re-running the script)
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view projects they're members of" ON public.projects;
DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Project owners and admins can update projects" ON public.projects;
DROP POLICY IF EXISTS "Project owners can delete projects" ON public.projects;

DROP POLICY IF EXISTS "Users can view tasks in their projects" ON public.tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Task creators and assignees can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Task creators and project owners can delete tasks" ON public.tasks;

DROP POLICY IF EXISTS "Users can view project members for their projects" ON public.project_members;
DROP POLICY IF EXISTS "Project owners and admins can manage members" ON public.project_members;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles 
FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles 
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view projects they're members of" ON public.projects 
FOR SELECT USING (
  auth.uid() = created_by OR 
  EXISTS (
    SELECT 1 FROM public.project_members 
    WHERE project_members.project_id = projects.id 
    AND project_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create projects" ON public.projects 
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Project owners and admins can update projects" ON public.projects 
FOR UPDATE USING (
  auth.uid() = created_by OR 
  EXISTS (
    SELECT 1 FROM public.project_members 
    WHERE project_members.project_id = projects.id 
    AND project_members.user_id = auth.uid() 
    AND project_members.role IN ('Owner', 'Admin')
  )
);

CREATE POLICY "Project owners can delete projects" ON public.projects 
FOR DELETE USING (auth.uid() = created_by);

-- Tasks policies
CREATE POLICY "Users can view tasks in their projects" ON public.tasks 
FOR SELECT USING (
  auth.uid() = created_by OR 
  auth.uid() = assigned_to OR
  project_id IS NULL OR
  EXISTS (
    SELECT 1 FROM public.project_members 
    WHERE project_members.project_id = tasks.project_id 
    AND project_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create tasks" ON public.tasks 
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Task creators and assignees can update tasks" ON public.tasks 
FOR UPDATE USING (
  auth.uid() = created_by OR 
  auth.uid() = assigned_to OR
  EXISTS (
    SELECT 1 FROM public.project_members 
    WHERE project_members.project_id = tasks.project_id 
    AND project_members.user_id = auth.uid() 
    AND project_members.role IN ('Owner', 'Admin')
  )
);

CREATE POLICY "Task creators and project owners can delete tasks" ON public.tasks 
FOR DELETE USING (
  auth.uid() = created_by OR
  EXISTS (
    SELECT 1 FROM public.project_members 
    WHERE project_members.project_id = tasks.project_id 
    AND project_members.user_id = auth.uid() 
    AND project_members.role IN ('Owner', 'Admin')
  )
);

-- Project members policies
CREATE POLICY "Users can view project members for their projects" ON public.project_members 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.project_members pm 
    WHERE pm.project_id = project_members.project_id 
    AND pm.user_id = auth.uid()
  )
);

CREATE POLICY "Project owners and admins can manage members" ON public.project_members 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.project_members pm 
    WHERE pm.project_id = project_members.project_id 
    AND pm.user_id = auth.uid() 
    AND pm.role IN ('Owner', 'Admin')
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.project_members pm 
    WHERE pm.project_id = project_members.project_id 
    AND pm.user_id = auth.uid() 
    AND pm.role IN ('Owner', 'Admin')
  )
);
