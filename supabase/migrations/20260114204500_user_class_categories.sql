/*
  # User-Category relationship and RLS updates

  1. New Tables
    - `user_class_categories`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `category_id` (uuid, foreign key to class_categories)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `user_class_categories`
    - Update policies for `class_categories`, `lessons`, and `lesson_audios`
    - Admins see everything
    - Users see only what they are assigned to
*/

-- Create junction table
CREATE TABLE IF NOT EXISTS user_class_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES class_categories(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, category_id)
);

-- Enable RLS
ALTER TABLE user_class_categories ENABLE ROW LEVEL SECURITY;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_user_class_categories_user_id ON user_class_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_user_class_categories_category_id ON user_class_categories(category_id);

-- RLS Policies for user_class_categories
CREATE POLICY "Admins can manage user category relationships"
  ON user_class_categories
  FOR ALL
  TO authenticated
  USING (check_is_admin());

CREATE POLICY "Users can view their own category relationships"
  ON user_class_categories
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Update RLS Policies for class_categories
DROP POLICY IF EXISTS "Anyone can view class categories" ON class_categories;

CREATE POLICY "Admins can view all categories"
  ON class_categories
  FOR SELECT
  TO authenticated
  USING (check_is_admin());

CREATE POLICY "Users can view assigned categories"
  ON class_categories
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_class_categories
      WHERE user_id = auth.uid()
      AND category_id = class_categories.id
    )
  );

-- Update RLS Policies for lessons
DROP POLICY IF EXISTS "Anyone can view lessons" ON lessons;

CREATE POLICY "Admins can view all lessons"
  ON lessons
  FOR SELECT
  TO authenticated
  USING (check_is_admin());

CREATE POLICY "Users can view lessons of assigned categories"
  ON lessons
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_class_categories
      WHERE user_id = auth.uid()
      AND category_id = lessons.category_id
    )
  );

-- Update RLS Policies for lesson_audios
DROP POLICY IF EXISTS "Anyone can view lesson audios" ON lesson_audios;

CREATE POLICY "Admins can view all lesson audios"
  ON lesson_audios
  FOR SELECT
  TO authenticated
  USING (check_is_admin());

CREATE POLICY "Users can view audios of assigned categories"
  ON lesson_audios
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lessons
      JOIN user_class_categories ON user_class_categories.category_id = lessons.category_id
      WHERE user_class_categories.user_id = auth.uid()
      AND lessons.id = lesson_audios.lesson_id
    )
  );
