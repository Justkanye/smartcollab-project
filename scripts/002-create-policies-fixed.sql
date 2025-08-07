-- Drop existing policies if they exist (for re-running the script)
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view projects they're members of" ON public.projects;
DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Project owners and admins can update projects" ON public.projects;
DROP POLICY IF EXISTS "Project owners can delete projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view projects they own or are members of" ON public.projects;
DROP POLICY IF EXISTS "Users can manage projects they own" ON public.projects;

DROP POLICY IF EXISTS "Users can view tasks in their projects" ON public.tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Task creators and assignees can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Task creators and project owners can delete tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can view tasks they created or are assigned to" ON public.tasks;
DROP POLICY IF EXISTS "Users can manage tasks they created" ON public.tasks;
DROP POLICY IF EXISTS "Users can update tasks assigned to them" ON public.tasks;

DROP POLICY IF EXISTS "Users can view project members for their projects" ON public.project_members;
DROP POLICY IF EXISTS "Project owners and admins can manage members" ON public.project_members;
DROP POLICY IF EXISTS "Users can insert project members" ON public.project_members;
DROP POLICY IF EXISTS "Project owners can manage members" ON public.project_members;
DROP POLICY IF EXISTS "Users can view organization members for their organizations" ON public.organization_members;
DROP POLICY IF EXISTS "Users can manage organization members for organizations they own" ON public.organization_members;

DROP POLICY IF EXISTS "Users can view organizations they own or are members of" ON public.organizations;
DROP POLICY IF EXISTS "Users can update organizations they own" ON public.organizations;
DROP POLICY IF EXISTS "Users can insert organizations they own" ON public.organizations;

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Profiles policies (simple, no recursion)
CREATE POLICY "Users can view all profiles" ON public.profiles 
FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles 
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

-- Organizations policies (simple ownership check)
CREATE POLICY "Users can view organizations they own" ON public.organizations
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can update organizations they own" ON public.organizations
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert organizations they own" ON public.organizations
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Organization members policies (no circular dependencies)
CREATE POLICY "Users can view organization members where they are the organization owner" ON public.organization_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.organizations 
            WHERE public.organizations.id = public.organization_members.organization_id 
            AND public.organizations.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own organization memberships" ON public.organization_members
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Organization owners can manage members" ON public.organization_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.organizations 
            WHERE public.organizations.id = public.organization_members.organization_id 
            AND public.organizations.owner_id = auth.uid()
        )
    );

-- Projects policies (using created_by column)
CREATE POLICY "Users can view own projects" ON public.projects 
FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can create projects" ON public.projects 
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Project creators can update projects" ON public.projects 
FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Project creators can delete projects" ON public.projects 
FOR DELETE USING (auth.uid() = created_by);

-- Tasks policies (using created_by and assigned_to columns)
CREATE POLICY "Users can view tasks they created" ON public.tasks 
FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can view tasks assigned to them" ON public.tasks 
FOR SELECT USING (assigned_to = auth.uid());

CREATE POLICY "Users can create tasks" ON public.tasks 
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Task creators can update tasks" ON public.tasks 
FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Task assignees can update tasks" ON public.tasks 
FOR UPDATE USING (assigned_to = auth.uid());

CREATE POLICY "Task creators can delete tasks" ON public.tasks 
FOR DELETE USING (created_by = auth.uid());
