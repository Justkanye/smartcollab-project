-- Test script to verify SmartCollab database setup
-- Run this after completing the main setup scripts

-- Test 1: Check if all tables exist
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('profiles', 'projects', 'tasks', 'project_members');
    
    IF table_count = 4 THEN
        RAISE NOTICE 'SUCCESS: All required tables exist';
    ELSE
        RAISE NOTICE 'ERROR: Missing tables. Expected 4, found %', table_count;
    END IF;
END $$;

-- Test 2: Check if RLS is enabled
DO $$
DECLARE
    rls_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO rls_count
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
    AND c.relname IN ('profiles', 'projects', 'tasks', 'project_members')
    AND c.relrowsecurity = true;
    
    IF rls_count = 4 THEN
        RAISE NOTICE 'SUCCESS: RLS enabled on all tables';
    ELSE
        RAISE NOTICE 'ERROR: RLS not enabled on all tables. Expected 4, found %', rls_count;
    END IF;
END $$;

-- Test 3: Check if policies exist
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'projects', 'tasks', 'project_members');
    
    IF policy_count > 0 THEN
        RAISE NOTICE 'SUCCESS: % policies found', policy_count;
    ELSE
        RAISE NOTICE 'ERROR: No policies found';
    END IF;
END $$;

-- Test 4: Check if functions exist
DO $$
DECLARE
    function_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO function_count
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
    AND p.proname IN ('handle_new_user', 'update_project_progress', 'get_user_projects');
    
    IF function_count >= 3 THEN
        RAISE NOTICE 'SUCCESS: All required functions exist';
    ELSE
        RAISE NOTICE 'ERROR: Missing functions. Expected 3, found %', function_count;
    END IF;
END $$;

-- Test 5: Check if triggers exist
DO $$
DECLARE
    trigger_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'
    AND trigger_name IN ('on_auth_user_created', 'update_project_progress_trigger');
    
    IF trigger_count >= 2 THEN
        RAISE NOTICE 'SUCCESS: All required triggers exist';
    ELSE
        RAISE NOTICE 'ERROR: Missing triggers. Expected 2, found %', trigger_count;
    END IF;
END $$;

-- Display summary
SELECT 
    'Setup Verification Complete' as status,
    'Check the notices above for any errors' as note;
