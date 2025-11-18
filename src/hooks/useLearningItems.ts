import { useState, useEffect } from 'react';
import { supabase, LearningItem } from '../lib/supabase';

const categoryCache = new Map<string, LearningItem[]>();
const imageCache = new Map<string, Promise<void>>();

const preloadImage = (url: string) => {
  if (!url) {
    return Promise.resolve();
  }

  if (imageCache.has(url)) {
    return imageCache.get(url)!;
  }

  const imagePromise = new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve(); // resolve even if an image fails so UI can continue
    img.src = url;
  });

  imageCache.set(url, imagePromise);
  return imagePromise;
};

export const useLearningItems = (category: string) => {
  const [items, setItems] = useState<LearningItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);

        const cachedItems = categoryCache.get(category);
        if (cachedItems) {
          setItems(cachedItems);
          setLoading(false);
          // still kick off preloading to ensure assets exist if cache was primed before images
          cachedItems.length && Promise.all(cachedItems.map((item) => preloadImage(item.image_url))).catch(() => {});
          return;
        }

        const { data, error } = await supabase
          .from('learning_items')
          .select('*')
          .eq('category', category)
          .order('order_index');

        if (error) throw error;

        const fetchedItems = data || [];
        if (!isMounted) return;

        categoryCache.set(category, fetchedItems);
        setItems(fetchedItems);
        // preload images in the background so UI shows immediately while assets cache
        Promise.all(fetchedItems.map((item) => preloadImage(item.image_url))).catch(() => {});
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchItems();

    return () => {
      isMounted = false;
    };
  }, [category]);

  return { items, loading, error };
};
