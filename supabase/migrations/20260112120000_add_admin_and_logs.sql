-- Add new columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS last_active_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS points integer DEFAULT 0;

-- Create user_activity_logs table
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL, -- e.g., 'lesson_start', 'game_complete', 'video_watch'
  activity_name text NOT NULL, -- e.g., 'Colors Quiz', 'Animals Lesson'
  points_earned integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Function to check if the current user is an admin without recursion
-- SECURITY DEFINER allows this to run as the table owner and skip RLS checks on profiles
CREATE OR REPLACE FUNCTION check_is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles RLS
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by own user or admin" ON profiles;

-- A single policy for selection is often safer to avoid recursion
CREATE POLICY "Profiles are viewable by own user or admin"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id 
    OR 
    check_is_admin()
  );

-- Logs Table with explicit FK to profiles for easier joins
ALTER TABLE user_activity_logs 
DROP CONSTRAINT IF EXISTS user_activity_logs_user_id_fkey,
ADD CONSTRAINT user_activity_logs_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Logs RLS
DROP POLICY IF EXISTS "Users can insert own logs" ON user_activity_logs;
DROP POLICY IF EXISTS "Users can read own logs" ON user_activity_logs;
DROP POLICY IF EXISTS "Admins can read all logs" ON user_activity_logs;
DROP POLICY IF EXISTS "Admins can manage logs" ON user_activity_logs;

-- Users need to be able to INSERT and SELECT their own logs
-- SELECT is often needed by the client to confirm the insert was successful
CREATE POLICY "Users can insert own logs"
  ON user_activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own logs"
  ON user_activity_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all logs"
  ON user_activity_logs
  FOR SELECT
  TO authenticated
  USING (
    check_is_admin()
  );

CREATE POLICY "Admins can manage logs"
  ON user_activity_logs
  FOR DELETE
  TO authenticated
  USING (
    check_is_admin()
  );

-- Function to update points and last_active_at on new log entry
-- SECURITY DEFINER is critical here: it runs the update as the "owner" (postgres) 
-- bypassing the fact that the user might not have UPDATE permissions on profiles.
CREATE OR REPLACE FUNCTION update_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET 
    points = COALESCE(points, 0) + NEW.points_earned,
    last_active_at = NEW.created_at
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update stats
DROP TRIGGER IF EXISTS after_activity_log_insert ON user_activity_logs;
CREATE TRIGGER after_activity_log_insert
  AFTER INSERT ON user_activity_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_stats();
