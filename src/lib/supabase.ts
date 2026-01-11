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

export interface ClassCategory {
  id: string;
  slug: string;
  name: string;
  icon: string;
  color: string;
  order_index: number;
  created_at: string;
}

export interface Lesson {
  id: string;
  category_id: string;
  lesson_number: string;
  title: string;
  class_image_url: string | null;
  practice_image_url: string | null;
  order_index: number;
  created_at: string;
}

export interface LessonAudio {
  id: string;
  lesson_id: string;
  type: 'class' | 'practice';
  audio_url: string;
  title: string | null;
  order_index: number;
  created_at: string;
}

export interface LessonWithAudios extends Lesson {
  classAudios: LessonAudio[];
  practiceAudios: LessonAudio[];
}

export interface ClassCategoryVideo {
  id: string;
  category_id: string;
  video_url: string;
  title: string | null;
  order_index: number;
  created_at: string;
}

export interface ClassCategoryWithLessons extends ClassCategory {
  lessons: LessonWithAudios[];
  videos: ClassCategoryVideo[];
}
