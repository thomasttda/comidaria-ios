import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('products')
        .select(`, categories(name)`)
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;
      const formatted = (data || []).map((p) => ({
        ...p,
        category: p.categories?.name || '',
      }));
      setProducts(formatted);
    } catch (err) {
      console.error('useProducts fetch error:', err);
      setError(err.message || 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const createProduct = async (product) => {
    const { data, error } = await supabase
      .from('products')
      .insert({ ...product, is_available: product.is_available !== false })
      .select().single();
    if (!error && data) await fetchProducts();
    return { data, error };
  };

  const updateProduct = async (id, updates) => {
    const { error } = await supabase.from('products').update(updates).eq('id', id);
    if (!error) await fetchProducts();
    return { error };
  };

  const deleteProduct = async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) await fetchProducts();
    return { error };
  };

  return { products, loading, error, refetch: fetchProducts, createProduct, updateProduct, deleteProduct };
}
