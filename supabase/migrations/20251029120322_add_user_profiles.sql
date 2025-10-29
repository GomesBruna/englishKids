/*
  # Add User Profiles for Kids

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text) - User email
      - `full_name` (text) - Child's full name
      - `created_at` (timestamptz) - Profile creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `profiles` table
    - Add policy for users to read their own profile
    - Admin-only creation (profiles created manually)

  3. Notes
    - Profiles will be created manually by admin for specific children
    - No public registration allowed
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Function to handle profile updates timestamp
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update timestamp
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at'
  ) THEN
    CREATE TRIGGER set_updated_at
      BEFORE UPDATE ON profiles
      FOR EACH ROW
      EXECUTE FUNCTION handle_updated_at();
  END IF;
END $$;