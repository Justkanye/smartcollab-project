-- Drop all existing policies to start completely fresh
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on all tables
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- Disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Profiles policies - completely isolated
CREATE POLICY "profiles_all_access" ON public.profiles 
FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Organizations policies - completely isolated, no joins
CREATE POLICY "organizations_all_access" ON public.organizations
FOR ALL USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);

-- Organization members policies - completely isolated
CREATE POLICY "organization_members_own_access" ON public.organization_members
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Projects policies - completely isolated, no joins
CREATE POLICY "projects_all_access" ON public.projects 
FOR ALL USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);

-- Tasks policies - completely isolated, no joins
CREATE POLICY "tasks_created_access" ON public.tasks 
FOR ALL USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);

CREATE POLICY "tasks_assigned_select" ON public.tasks 
FOR SELECT USING (auth.uid() = assigned_to);

CREATE POLICY "tasks_assigned_update" ON public.tasks 
FOR UPDATE USING (auth.uid() = assigned_to) WITH CHECK (auth.uid() = assigned_to);
