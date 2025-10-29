import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface LearningItem {
  id: string;
  category: string;
  english_word: string;
  portuguese_word: string;
  image_url: string;
  pronunciation: string;
  audio_text: string;
  order_index: number;
  created_at: string;
}
