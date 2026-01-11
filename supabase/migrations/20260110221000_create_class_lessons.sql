/*
  # Class Lessons Database Schema

  1. New Tables
    - `class_categories`
      - `id` (uuid, primary key)
      - `slug` (text, unique) - URL-friendly identifier: 'my-friends', 'at-school'
      - `name` (text) - Display name: 'My Friends', 'At School'
      - `icon` (text) - Icon name for the UI: 'users', 'school'
      - `color` (text) - Tailwind gradient classes
      - `order_index` (integer) - Display order
      - `created_at` (timestamptz)

    - `lessons`
      - `id` (uuid, primary key)
      - `category_id` (uuid, foreign key)
      - `lesson_number` (text) - '1.1', '1.2', etc
      - `title` (text) - 'Lição 1.1'
      - `order_index` (integer)
      - `created_at` (timestamptz)

    - `lesson_audios`
      - `id` (uuid, primary key)
      - `lesson_id` (uuid, foreign key)
      - `type` (text) - 'class' or 'practice'
      - `audio_url` (text) - URL to the audio file
      - `title` (text) - Optional title for the audio
      - `order_index` (integer)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Public read access for educational content

  3. Initial Data
    - Populate with My Friends and At School categories
    - Create lessons 1.1 through 1.8 for each category
    - Audio URLs will be placeholders (to be updated with real URLs later)
*/

-- Create class categories table
CREATE TABLE IF NOT EXISTS class_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  icon text NOT NULL,
  color text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES class_categories(id) ON DELETE CASCADE,
  lesson_number text NOT NULL,
  title text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create lesson audios table
CREATE TABLE IF NOT EXISTS lesson_audios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('class', 'practice')),
  audio_url text NOT NULL,
  title text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE class_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_audios ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Anyone can view class categories"
  ON class_categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can view lessons"
  ON lessons
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can view lesson audios"
  ON lesson_audios
  FOR SELECT
  TO public
  USING (true);

-- Create indexes for better query performance
CREATE INDEX idx_lessons_category_id ON lessons(category_id);
CREATE INDEX idx_lesson_audios_lesson_id ON lesson_audios(lesson_id);
CREATE INDEX idx_lesson_audios_type ON lesson_audios(type);

-- Insert class categories (only My Friends for now)
INSERT INTO class_categories (slug, name, icon, color, order_index) VALUES
('my-friends', 'My Friends', 'users', 'bg-gradient-to-br from-red-400 to-pink-500', 1);

-- Insert lessons for My Friends
INSERT INTO lessons (category_id, lesson_number, title, order_index)
SELECT 
  c.id,
  lesson_num,
  'Lição ' || lesson_num,
  row_number
FROM class_categories c,
(VALUES 
  ('1.1', 1), ('1.2', 2), ('1.3', 3), ('1.4', 4),
  ('1.5', 5), ('1.6', 6), ('1.7', 7), ('1.8', 8)
) AS lessons_data(lesson_num, row_number)
WHERE c.slug = 'my-friends';


-- Insert placeholder audios for all lessons (class type)
-- You will update these URLs with real audio files later
INSERT INTO lesson_audios (lesson_id, type, audio_url, title, order_index)
SELECT 
  l.id,
  'class',
  '/audios/' || c.slug || '/class/' || l.lesson_number || '.mp3',
  'Áudio da Aula ' || l.lesson_number,
  1
FROM lessons l
JOIN class_categories c ON l.category_id = c.id;

-- Insert placeholder audios for all lessons (practice type)
INSERT INTO lesson_audios (lesson_id, type, audio_url, title, order_index)
SELECT 
  l.id,
  'practice',
  '/audios/' || c.slug || '/practice/' || l.lesson_number || '.mp3',
  'Áudio da Prática ' || l.lesson_number,
  1
FROM lessons l
JOIN class_categories c ON l.category_id = c.id;
