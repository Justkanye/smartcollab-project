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
DROP POLICY IF EXISTS "Users can insert project members" ON public.project_members;
DROP POLICY IF EXISTS "Project owners can manage members" ON public.project_members;
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Project owners can update projects" ON public.projects;
DROP POLICY IF EXISTS "Project owners can delete projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view tasks in accessible projects" ON public.tasks;
DROP POLICY IF EXISTS "Task creators and project owners can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Task creators and project owners can delete tasks" ON public.tasks;

-- Profiles policies (simple, no recursion)
CREATE POLICY "Users can view all profiles" ON public.profiles 
FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles 
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects policies (no reference to project_members to avoid recursion)
CREATE POLICY "Users can view own projects" ON public.projects 
FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can create projects" ON public.projects 
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Project owners can update projects" ON public.projects 
FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Project owners can delete projects" ON public.projects 
FOR DELETE USING (auth.uid() = created_by);

-- Project members policies (simple, no complex references)
CREATE POLICY "Users can view project members" ON public.project_members 
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Project owners can manage members" ON public.project_members 
FOR ALL USING (auth.uid() = (SELECT created_by FROM public.projects WHERE id = project_id));

-- Tasks policies (simplified to avoid recursion)
CREATE POLICY "Users can view own tasks" ON public.tasks 
FOR SELECT USING (
  created_by = auth.uid() OR 
  assigned_to = auth.uid()
);

CREATE POLICY "Users can create tasks" ON public.tasks 
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Task creators can update tasks" ON public.tasks 
FOR UPDATE USING (created_by = auth.uid() OR assigned_to = auth.uid());

CREATE POLICY "Task creators can delete tasks" ON public.tasks 
FOR DELETE USING (created_by = auth.uid());
