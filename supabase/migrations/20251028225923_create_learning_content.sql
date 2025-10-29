/*
  # English Learning Game Database Schema

  1. New Tables
    - `learning_items`
      - `id` (uuid, primary key) - Unique identifier for each learning item
      - `category` (text) - Category: colors, numbers, animals, pronouns
      - `english_word` (text) - The English word to learn
      - `portuguese_word` (text) - Portuguese translation
      - `image_url` (text) - URL to image representation
      - `pronunciation` (text) - Phonetic pronunciation guide
      - `audio_text` (text) - Text for speech synthesis
      - `order_index` (integer) - Display order within category
      - `created_at` (timestamptz) - Record creation timestamp

  2. Security
    - Enable RLS on `learning_items` table
    - Add policy for public read access (educational content)
    
  3. Initial Data
    - Populate with colors, numbers, animals, and pronouns
    - Include Portuguese translations for Brazilian kids
*/

-- Create learning items table
CREATE TABLE IF NOT EXISTS learning_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  english_word text NOT NULL,
  portuguese_word text NOT NULL,
  image_url text NOT NULL,
  pronunciation text NOT NULL,
  audio_text text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE learning_items ENABLE ROW LEVEL SECURITY;

-- Public read access for learning content
CREATE POLICY "Anyone can view learning content"
  ON learning_items
  FOR SELECT
  TO public
  USING (true);

-- Insert Colors
INSERT INTO learning_items (category, english_word, portuguese_word, image_url, pronunciation, audio_text, order_index) VALUES
('colors', 'Red', 'Vermelho', 'https://images.pexels.com/photos/3635300/pexels-photo-3635300.jpeg?auto=compress&cs=tinysrgb&w=400', 'red', 'red', 1),
('colors', 'Blue', 'Azul', 'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=400', 'bloo', 'blue', 2),
('colors', 'Yellow', 'Amarelo', 'https://images.pexels.com/photos/1070945/pexels-photo-1070945.jpeg?auto=compress&cs=tinysrgb&w=400', 'yeh-loh', 'yellow', 3),
('colors', 'Green', 'Verde', 'https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg?auto=compress&cs=tinysrgb&w=400', 'green', 'green', 4),
('colors', 'Orange', 'Laranja', 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=400', 'or-inj', 'orange', 5),
('colors', 'Purple', 'Roxo', 'https://images.pexels.com/photos/1453799/pexels-photo-1453799.jpeg?auto=compress&cs=tinysrgb&w=400', 'pur-puhl', 'purple', 6),

-- Insert Numbers
('numbers', 'One', 'Um', 'https://images.pexels.com/photos/3799821/pexels-photo-3799821.jpeg?auto=compress&cs=tinysrgb&w=400', 'wuhn', 'one', 1),
('numbers', 'Two', 'Dois', 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg?auto=compress&cs=tinysrgb&w=400', 'too', 'two', 2),
('numbers', 'Three', 'Três', 'https://images.pexels.com/photos/4033330/pexels-photo-4033330.jpeg?auto=compress&cs=tinysrgb&w=400', 'three', 'three', 3),
('numbers', 'Four', 'Quatro', 'https://images.pexels.com/photos/3945657/pexels-photo-3945657.jpeg?auto=compress&cs=tinysrgb&w=400', 'for', 'four', 4),
('numbers', 'Five', 'Cinco', 'https://images.pexels.com/photos/3945667/pexels-photo-3945667.jpeg?auto=compress&cs=tinysrgb&w=400', 'fayv', 'five', 5),
('numbers', 'Six', 'Seis', 'https://images.pexels.com/photos/3945646/pexels-photo-3945646.jpeg?auto=compress&cs=tinysrgb&w=400', 'siks', 'six', 6),

-- Insert Animals
('animals', 'Dog', 'Cachorro', 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=400', 'dawg', 'dog', 1),
('animals', 'Cat', 'Gato', 'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=400', 'kat', 'cat', 2),
('animals', 'Bird', 'Pássaro', 'https://images.pexels.com/photos/349758/hummingbird-bird-birds-349758.jpeg?auto=compress&cs=tinysrgb&w=400', 'burd', 'bird', 3),
('animals', 'Fish', 'Peixe', 'https://images.pexels.com/photos/128756/pexels-photo-128756.jpeg?auto=compress&cs=tinysrgb&w=400', 'fish', 'fish', 4),
('animals', 'Rabbit', 'Coelho', 'https://images.pexels.com/photos/326012/pexels-photo-326012.jpeg?auto=compress&cs=tinysrgb&w=400', 'rab-it', 'rabbit', 5),
('animals', 'Elephant', 'Elefante', 'https://images.pexels.com/photos/66898/elephant-cub-tsavo-kenya-66898.jpeg?auto=compress&cs=tinysrgb&w=400', 'el-uh-fuhnt', 'elephant', 6),

-- Insert Pronouns
('pronouns', 'I', 'Eu', 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=400', 'eye', 'I', 1),
('pronouns', 'You', 'Você', 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400', 'yoo', 'you', 2),
('pronouns', 'He', 'Ele', 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400', 'hee', 'he', 3),
('pronouns', 'She', 'Ela', 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400', 'shee', 'she', 4),
('pronouns', 'We', 'Nós', 'https://images.pexels.com/photos/1645634/pexels-photo-1645634.jpeg?auto=compress&cs=tinysrgb&w=400', 'wee', 'we', 5),
('pronouns', 'They', 'Eles/Elas', 'https://images.pexels.com/photos/1157557/pexels-photo-1157557.jpeg?auto=compress&cs=tinysrgb&w=400', 'thay', 'they', 6);