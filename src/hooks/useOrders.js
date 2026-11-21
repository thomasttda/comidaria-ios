import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`, order_items(*, products(name))`)
        .order('created_at', { ascending: false });

      if (!error) setOrders(data || []);
    } catch (err) {
      console.error('useOrders fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (id, status) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (!error) await fetchOrders();
    return { error };
  };

  const createOrder = async (order, items) => {
    const { data, error } = await supabase.from('orders').insert(order).select().single();
    if (error) return { error };

    const orderItems = items.map((item) => ({
      order_id: data.id,
      product_id: item.id,
      product_name: item.name,
      quantity: item.quantity,
      unit_price: item.price,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (!itemsError) await fetchOrders();
    return { error: itemsError, data };
  };

  return { orders, loading, refetch: fetchOrders, updateOrderStatus, createOrder };
}
