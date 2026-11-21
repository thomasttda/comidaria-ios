import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order');

      if (supabaseError) throw supabaseError;
      setCategories(data || []);
    } catch (err) {
      console.error('useCategories fetch error:', err);
      setError(err.message || 'Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
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

  return { categories, loading, error, refetch: fetchCategories, createCategory, updateCategory, deleteCategory };
}
