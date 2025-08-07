-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view projects they're members of" ON public.projects;
DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Project owners and admins can update projects" ON public.projects;
DROP POLICY IF EXISTS "Project owners can delete projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view projects they own or are members of" ON public.projects;
DROP POLICY IF EXISTS "Users can manage projects they own" ON public.projects;
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
DROP POLICY IF EXISTS "Project creators can update projects" ON public.projects;
DROP POLICY IF EXISTS "Project creators can delete projects" ON public.projects;

DROP POLICY IF EXISTS "Users can view tasks in their projects" ON public.tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Task creators and assignees can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Task creators and project owners can delete tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can view tasks they created or are assigned to" ON public.tasks;
DROP POLICY IF EXISTS "Users can manage tasks they created" ON public.tasks;
DROP POLICY IF EXISTS "Users can update tasks assigned to them" ON public.tasks;
DROP POLICY IF EXISTS "Users can view tasks they created" ON public.tasks;
DROP POLICY IF EXISTS "Users can view tasks assigned to them" ON public.tasks;
DROP POLICY IF EXISTS "Task creators can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Task assignees can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Task creators can delete tasks" ON public.tasks;

DROP POLICY IF EXISTS "Users can view project members for their projects" ON public.project_members;
DROP POLICY IF EXISTS "Project owners and admins can manage members" ON public.project_members;
DROP POLICY IF EXISTS "Users can insert project members" ON public.project_members;
DROP POLICY IF EXISTS "Project owners can manage members" ON public.project_members;

DROP POLICY IF EXISTS "Users can view organization members for their organizations" ON public.organization_members;
DROP POLICY IF EXISTS "Users can manage organization members for organizations they own" ON public.organization_members;
DROP POLICY IF EXISTS "Users can view organization members where they are the organization owner" ON public.organization_members;
DROP POLICY IF EXISTS "Users can view their own organization memberships" ON public.organization_members;
DROP POLICY IF EXISTS "Organization owners can manage members" ON public.organization_members;

DROP POLICY IF EXISTS "Users can view organizations they own or are members of" ON public.organizations;
DROP POLICY IF EXISTS "Users can update organizations they own" ON public.organizations;
DROP POLICY IF EXISTS "Users can insert organizations they own" ON public.organizations;
DROP POLICY IF EXISTS "Users can view organizations they own" ON public.organizations;

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Simple profiles policies (no recursion possible)
CREATE POLICY "profiles_select_own" ON public.profiles 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles 
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

-- Simple organizations policies (no recursion)
CREATE POLICY "organizations_select_own" ON public.organizations
FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "organizations_update_own" ON public.organizations
FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "organizations_insert_own" ON public.organizations
FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "organizations_delete_own" ON public.organizations
FOR DELETE USING (auth.uid() = owner_id);

-- Simple organization members policies (no recursion)
CREATE POLICY "organization_members_select_own" ON public.organization_members
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "organization_members_insert_own" ON public.organization_members
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "organization_members_update_own" ON public.organization_members
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "organization_members_delete_own" ON public.organization_members
FOR DELETE USING (auth.uid() = user_id);

-- Simple projects policies (no joins, no recursion)
CREATE POLICY "projects_select_own" ON public.projects 
FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "projects_insert_own" ON public.projects 
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "projects_update_own" ON public.projects 
FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "projects_delete_own" ON public.projects 
FOR DELETE USING (auth.uid() = created_by);

-- Simple tasks policies (no joins, no recursion)
CREATE POLICY "tasks_select_created" ON public.tasks 
FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "tasks_select_assigned" ON public.tasks 
FOR SELECT USING (auth.uid() = assigned_to);

CREATE POLICY "tasks_insert_own" ON public.tasks 
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "tasks_update_created" ON public.tasks 
FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "tasks_update_assigned" ON public.tasks 
FOR UPDATE USING (auth.uid() = assigned_to);

CREATE POLICY "tasks_delete_created" ON public.tasks 
FOR DELETE USING (auth.uid() = created_by);
