-- Function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update project progress based on tasks
CREATE OR REPLACE FUNCTION update_project_progress()
RETURNS TRIGGER AS $$
DECLARE
  total_tasks INTEGER;
  completed_tasks INTEGER;
  new_progress INTEGER;
BEGIN
  -- Get the project_id from the task
  IF TG_OP = 'DELETE' THEN
    -- For DELETE operations, use OLD record
    IF OLD.project_id IS NOT NULL THEN
      SELECT COUNT(*), COUNT(*) FILTER (WHERE completed = true)
      INTO total_tasks, completed_tasks
      FROM tasks
      WHERE project_id = OLD.project_id;
      
      new_progress := CASE 
        WHEN total_tasks = 0 THEN 0
        ELSE ROUND((completed_tasks::FLOAT / total_tasks) * 100)
      END;
      
      UPDATE projects 
      SET progress = new_progress, updated_at = NOW()
      WHERE id = OLD.project_id;
    END IF;
  ELSE
    -- For INSERT and UPDATE operations, use NEW record
    IF NEW.project_id IS NOT NULL THEN
      SELECT COUNT(*), COUNT(*) FILTER (WHERE completed = true)
      INTO total_tasks, completed_tasks
      FROM tasks
      WHERE project_id = NEW.project_id;
      
      new_progress := CASE 
        WHEN total_tasks = 0 THEN 0
        ELSE ROUND((completed_tasks::FLOAT / total_tasks) * 100)
      END;
      
      UPDATE projects 
      SET progress = new_progress, updated_at = NOW()
      WHERE id = NEW.project_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update project progress when tasks change
CREATE OR REPLACE TRIGGER update_project_progress_trigger
  AFTER INSERT OR UPDATE OR DELETE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_project_progress();
