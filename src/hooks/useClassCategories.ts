import { useState, useEffect } from 'react';
import { supabase, ClassCategory, Lesson, LessonAudio, ClassCategoryWithLessons, LessonWithAudios, ClassCategoryVideo } from '../lib/supabase';

// Cache to avoid refetching
const categoriesCache: ClassCategoryWithLessons[] | null = null;

export const useClassCategories = () => {
    const [categories, setCategories] = useState<ClassCategoryWithLessons[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Check cache first
                if (categoriesCache) {
                    setCategories(categoriesCache);
                    setLoading(false);
                    return;
                }

                // Fetch all categories
                const { data: categoriesData, error: categoriesError } = await supabase
                    .from('class_categories')
                    .select('*')
                    .order('order_index');

                if (categoriesError) throw categoriesError;

                // Fetch all lessons
                const { data: lessonsData, error: lessonsError } = await supabase
                    .from('lessons')
                    .select('*')
                    .order('order_index');

                if (lessonsError) throw lessonsError;

                // Fetch all audios
                const { data: audiosData, error: audiosError } = await supabase
                    .from('lesson_audios')
                    .select('*')
                    .order('order_index');

                if (audiosError) throw audiosError;

                // Fetch all category videos
                const { data: videosData, error: videosError } = await supabase
                    .from('class_category_videos')
                    .select('*')
                    .order('order_index');

                if (videosError) {
                    console.warn('Error fetching class_category_videos:', videosError);
                    // Don't throw if table doesn't exist yet, just use empty array
                }

                if (!isMounted) return;

                // Group audios by lesson
                const audiosByLesson = (audiosData as LessonAudio[]).reduce((acc, audio) => {
                    if (!acc[audio.lesson_id]) {
                        acc[audio.lesson_id] = { class: [], practice: [] };
                    }
                    if (audio.type === 'class') {
                        acc[audio.lesson_id].class.push(audio);
                    } else {
                        acc[audio.lesson_id].practice.push(audio);
                    }
                    return acc;
                }, {} as Record<string, { class: LessonAudio[]; practice: LessonAudio[] }>);

                // Group lessons by category with audios
                const lessonsByCategory = (lessonsData as Lesson[]).reduce((acc, lesson) => {
                    if (!acc[lesson.category_id]) {
                        acc[lesson.category_id] = [];
                    }
                    const lessonsAudios = audiosByLesson[lesson.id] || { class: [], practice: [] };
                    acc[lesson.category_id].push({
                        ...lesson,
                        classAudios: lessonsAudios.class,
                        practiceAudios: lessonsAudios.practice,
                    });
                    return acc;
                }, {} as Record<string, LessonWithAudios[]>);

                // Combine categories with their lessons and videos
                const result: ClassCategoryWithLessons[] = (categoriesData as ClassCategory[]).map(category => ({
                    ...category,
                    lessons: lessonsByCategory[category.id] || [],
                    videos: (videosData as ClassCategoryVideo[] || []).filter(v => v.category_id === category.id),
                }));

                setCategories(result);
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : 'Erro ao carregar aulas');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []);

    return { categories, loading, error };
};
