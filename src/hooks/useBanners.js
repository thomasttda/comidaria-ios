import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBanners = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('banners')
        .select('*')
        .eq('active', true)
        .order('sort_order');

      if (supabaseError) throw supabaseError;
      setBanners(data || []);
    } catch (err) {
      console.error('useBanners fetch error:', err);
      setError(err.message || 'Erro ao carregar banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  return { banners, loading, error, refetch: fetchBanners };
}
