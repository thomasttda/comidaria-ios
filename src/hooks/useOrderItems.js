import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useOrderItems(orderId) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    setLoading(true);
    const query = supabase.from('order_items').select('*, products(name, image_url)');

    const { data, error } = orderId
      ? await query.eq('order_id', orderId)
      : await query.order('created_at', { ascending: false });

    if (!error) setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, [orderId]);

  return { items, loading, refetch: fetchItems };
}
