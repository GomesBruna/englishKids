/*
  # Add image_url to lessons

  Adds an image_url column to the lessons table to display
  an image for each lesson.
*/

-- Add image_url column to lessons
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS image_url text;

-- Update existing records with placeholder image URLs
UPDATE lessons l
SET image_url = '/images/' || c.slug || '/' || l.lesson_number || '.jpg'
FROM class_categories c
WHERE l.category_id = c.id AND l.image_url IS NULL;
