/*
  # Add image_url to lesson_audios

  Adds an image_url column to the lesson_audios table to display
  images alongside audio playback.
*/

-- Add image_url column to lesson_audios
ALTER TABLE lesson_audios ADD COLUMN IF NOT EXISTS image_url text;

-- Update existing records with placeholder image URLs
UPDATE lesson_audios la
SET image_url = '/images/' || c.slug || '/' || la.type || '/' || l.lesson_number || '.jpg'
FROM lessons l
JOIN class_categories c ON l.category_id = c.id
WHERE la.lesson_id = l.id AND la.image_url IS NULL;
