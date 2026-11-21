import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select(`, categories(name)`)
      .order('created_at', { ascending: false });

    if (!error) {
      const formatted = (data || []).map((p) => ({
        ...p,
        category: p.categories?.name || '',
      }));
      setProducts(formatted);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const createProduct = async (product) => {
    const { data, error } = await supabase.rpc('fn_create_product', {
      p_name: product.name,
      p_description: product.description,
      p_price: Number(product.price),
      p_category_id: product.category_id || null,
      p_image_url: product.image_url || null,
      p_is_available: product.is_available !== false,
    });
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

  return { products, loading, refetch: fetchProducts, createProduct, updateProduct, deleteProduct };
}
