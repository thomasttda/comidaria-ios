import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order');

    if (!error) setCategories(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const createCategory = async (category) => {
    const { error } = await supabase.from('categories').insert(category);
    if (!error) await fetchCategories();
    return { error };
  };

  const updateCategory = async (id, updates) => {
    const { error } = await supabase.from('categories').update(updates).eq('id', id);
    if (!error) await fetchCategories();
    return { error };
  };

  const deleteCategory = async (id) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) await fetchCategories();
    return { error };
  };

  return { categories, loading, refetch: fetchCategories, createCategory, updateCategory, deleteCategory };
}
