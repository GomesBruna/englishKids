import { useState, useEffect } from 'react';
import { supabase, LearningItem } from '../lib/supabase';

export const useLearningItems = (category: string) => {
  const [items, setItems] = useState<LearningItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('learning_items')
          .select('*')
          .eq('category', category)
          .order('order_index');

        if (error) throw error;
        setItems(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [category]);

  return { items, loading, error };
};
