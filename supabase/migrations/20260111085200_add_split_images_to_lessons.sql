/*
  # Add class and practice image columns to lessons

  1. Changes
    - Add `class_image_url` and `practice_image_url` to `lessons` table.
    - Remove the old `image_url` column from `lessons` table.
    - Populate the new columns with placeholder values based on slug and lesson number.
*/

-- Rename image_url to practice_image_url
ALTER TABLE public.lessons 
RENAME COLUMN image_url TO practice_image_url;

-- Add class_image_url column
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS class_image_url text;

-- Populate class_image_url with placeholder values
UPDATE public.lessons l
SET class_image_url = '/images/' || c.slug || '/class/' || l.lesson_number || '.jpg'
FROM public.class_categories c
WHERE l.category_id = c.id;
