import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useProductOptions(productId) {
  const [optionCategories, setOptionCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOptions = async () => {
    if (!productId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: categories, error: catError } = await supabase
      .from('product_option_categories')
      .select(`
        *,
        product_option_values(*)
      `)
      .eq('product_id', productId)
      .order('sort_order');

    if (!catError) {
      setOptionCategories(categories || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOptions();
  }, [productId]);

  const createOptionCategory = async (name, isRequired = false, allowMultiple = false) => {
    const { data, error } = await supabase
      .from('product_option_categories')
      .insert({
        product_id: productId,
        name,
        is_required: isRequired,
        allow_multiple: allowMultiple,
      })
      .select()
      .single();
    if (!error) await fetchOptions();
    return { data, error };
  };

  const updateOptionCategory = async (id, updates) => {
    const { error } = await supabase
      .from('product_option_categories')
      .update(updates)
      .eq('id', id);
    if (!error) await fetchOptions();
    return { error };
  };

  const deleteOptionCategory = async (id) => {
    const { error } = await supabase
      .from('product_option_categories')
      .delete()
      .eq('id', id);
    if (!error) await fetchOptions();
    return { error };
  };

  const createOptionValue = async (categoryId, name, priceExtra = 0, isDefault = false) => {
    const { data, error } = await supabase
      .from('product_option_values')
      .insert({
        option_category_id: categoryId,
        name,
        price_extra: priceExtra,
        is_default: isDefault,
      })
      .select()
      .single();
    if (!error) await fetchOptions();
    return { data, error };
  };

  const updateOptionValue = async (id, updates) => {
    const { error } = await supabase
      .from('product_option_values')
      .update(updates)
      .eq('id', id);
    if (!error) await fetchOptions();
    return { error };
  };

  const deleteOptionValue = async (id) => {
    const { error } = await supabase
      .from('product_option_values')
      .delete()
      .eq('id', id);
    if (!error) await fetchOptions();
    return { error };
  };

  return {
    optionCategories,
    loading,
    refetch: fetchOptions,
    createOptionCategory,
    updateOptionCategory,
    deleteOptionCategory,
    createOptionValue,
    updateOptionValue,
    deleteOptionValue,
  };
}
