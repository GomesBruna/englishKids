/*
  # Update Learning Items Access Policy

  1. Changes
    - Drop existing public policy for learning_items
    - Add new policy requiring authentication to view learning content

  2. Security
    - Only authenticated users can view learning content
    - Ensures only kids with accounts can access the game
*/

-- Drop the old public policy
DROP POLICY IF EXISTS "Anyone can view learning content" ON learning_items;

-- Add authenticated-only policy
CREATE POLICY "Authenticated users can view learning content"
  ON learning_items
  FOR SELECT
  TO authenticated
  USING (true);