import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useFinance() {
  const [finance, setFinance] = useState({
    today_revenue: 0,
    today_orders: 0,
    monthly_revenue: 0,
    avg_ticket: 0,
    monthly_cancellations: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchFinance = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('finance_summary')
      .select('*')
      .single();

    if (!error && data) setFinance(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  return { finance, loading, refetch: fetchFinance };
}
