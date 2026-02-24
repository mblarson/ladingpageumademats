
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

// ID do Google Analytics (ex: 'G-XXXXXXXXXX')
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; 

export const useSiteAnalytics = () => {
  useEffect(() => {
    const trackVisit = async () => {
      try {
        const hasVisitedSession = typeof window !== 'undefined' ? sessionStorage.getItem('umademats_visited') : null;
        
        if (!hasVisitedSession) {
          // Timeout e try-catch para evitar "Failed to fetch" de travar o app
          const { error } = await supabase.from('site_visits').insert({
            page: window.location.pathname
          }).timeout(5000);
          
          if (!error) {
            sessionStorage.setItem('umademats_visited', 'true');
          }
        }
      } catch (error) {
        // Falha silenciosa para evitar erros de console em ambientes restritos
      }

      // Injetar Google Analytics
      try {
        if (GA_MEASUREMENT_ID && !window.dataLayer && typeof window !== 'undefined') {
            const script = document.createElement('script');
            script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
            script.async = true;
            document.head.appendChild(script);

            window.dataLayer = window.dataLayer || [];
            function gtag(...args: any[]) { window.dataLayer.push(args); }
            gtag('js', new Date());
            gtag('config', GA_MEASUREMENT_ID);
        }
      } catch (e) {}
    };

    trackVisit();
  }, []);
};

export const useAnalyticsDashboard = () => {
  const [stats, setStats] = useState({
    last24h: 0, last7d: 0, last30d: 0, total: 0, loading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const getDateAgo = (days: number) => {
          const d = new Date();
          d.setDate(d.getDate() - days);
          return d.toISOString();
        };

        const [r24, r7, r30, rTot] = await Promise.all([
          supabase.from('site_visits').select('*', { count: 'exact', head: true }).gt('created_at', getDateAgo(1)),
          supabase.from('site_visits').select('*', { count: 'exact', head: true }).gt('created_at', getDateAgo(7)),
          supabase.from('site_visits').select('*', { count: 'exact', head: true }).gt('created_at', getDateAgo(30)),
          supabase.from('site_visits').select('*', { count: 'exact', head: true })
        ]);

        setStats({
          last24h: r24?.count ?? 0,
          last7d: r7?.count ?? 0,
          last30d: r30?.count ?? 0,
          total: rTot?.count ?? 0,
          loading: false
        });
      } catch (error) {
        setStats(prev => ({ ...prev, loading: false }));
      }
    };
    fetchStats();
  }, []);

  return stats;
};

declare global {
  interface Window { dataLayer: any[]; }
}
