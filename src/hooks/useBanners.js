import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('active', true)
        .order('sort_order');

      if (!error) setBanners(data || []);
    } catch (err) {
      console.error('useBanners fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  return { banners, loading, refetch: fetchBanners };
}
