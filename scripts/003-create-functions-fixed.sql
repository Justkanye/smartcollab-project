-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_project_progress() CASCADE;

-- Function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, update it instead
    UPDATE public.profiles 
    SET 
      email = NEW.email,
      full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', full_name),
      avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', avatar_url),
      updated_at = NOW()
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update project progress based on tasks
CREATE OR REPLACE FUNCTION public.update_project_progress()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_tasks INTEGER;
  completed_tasks INTEGER;
  new_progress INTEGER;
  target_project_id UUID;
BEGIN
  -- Determine which project to update
  IF TG_OP = 'DELETE' THEN
    target_project_id := OLD.project_id;
  ELSE
    target_project_id := NEW.project_id;
  END IF;
  
  -- Only proceed if there's a project_id
  IF target_project_id IS NOT NULL THEN
    -- Count total and completed tasks for the project
    SELECT 
      COUNT(*), 
      COUNT(*) FILTER (WHERE completed = true)
    INTO total_tasks, completed_tasks
    FROM public.tasks
    WHERE project_id = target_project_id;
    
    -- Calculate new progress percentage
    new_progress := CASE 
      WHEN total_tasks = 0 THEN 0
      ELSE ROUND((completed_tasks::FLOAT / total_tasks) * 100)
    END;
    
    -- Update the project progress
    UPDATE public.projects 
    SET 
      progress = new_progress, 
      updated_at = NOW()
    WHERE id = target_project_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_project_progress_trigger ON public.tasks;

-- Create trigger to update project progress when tasks change
CREATE TRIGGER update_project_progress_trigger
  AFTER INSERT OR UPDATE OF completed OR DELETE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_project_progress();

-- Function to get user's projects with stats
CREATE OR REPLACE FUNCTION public.get_user_projects(user_id UUID)
RETURNS TABLE (
  project_id UUID,
  project_name TEXT,
  project_description TEXT,
  project_status TEXT,
  project_priority TEXT,
  project_progress INTEGER,
  project_due_date DATE,
  total_tasks BIGINT,
  completed_tasks BIGINT,
  team_members BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.status,
    p.priority,
    p.progress,
    p.due_date,
    COALESCE(task_stats.total_tasks, 0),
    COALESCE(task_stats.completed_tasks, 0),
    COALESCE(member_stats.team_members, 0)
  FROM public.projects p
  LEFT JOIN (
    SELECT 
      project_id,
      COUNT(*) as total_tasks,
      COUNT(*) FILTER (WHERE completed = true) as completed_tasks
    FROM public.tasks
    GROUP BY project_id
  ) task_stats ON p.id = task_stats.project_id
  LEFT JOIN (
    SELECT 
      project_id,
      COUNT(*) as team_members
    FROM public.project_members
    GROUP BY project_id
  ) member_stats ON p.id = member_stats.project_id
  WHERE 
    p.created_by = user_id OR 
    EXISTS (
      SELECT 1 FROM public.project_members pm 
      WHERE pm.project_id = p.id AND pm.user_id = user_id
    )
  ORDER BY p.created_at DESC;
END;
$$;
