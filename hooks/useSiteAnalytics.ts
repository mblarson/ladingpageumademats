
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

// Substitua pelo seu ID do Google Analytics se tiver (ex: 'G-XXXXXXXXXX')
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; 

export const useSiteAnalytics = () => {
  // 1. Rastrear Visita ao carregar o site
  useEffect(() => {
    const trackVisit = async () => {
      // Evita contar em ambiente de desenvolvimento local se desejar, 
      // mas para teste vamos deixar rodar.
      
      // A. Registrar no Supabase (Para o Dashboard Interno)
      // Usamos sessionStorage para não contar F5 como nova visita na mesma aba
      const hasVisitedSession = sessionStorage.getItem('umademats_visited');
      
      if (!hasVisitedSession) {
        try {
          await supabase.from('site_visits').insert({
            page: window.location.pathname
          });
          sessionStorage.setItem('umademats_visited', 'true');
        } catch (error) {
          console.error('Erro ao registrar visita:', error);
        }
      }

      // B. Injetar Google Analytics (Para o painel do Google)
      if (GA_MEASUREMENT_ID && !window.dataLayer) {
        const script = document.createElement('script');
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
        script.async = true;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag(...args: any[]) { window.dataLayer.push(args); }
        gtag('js', new Date());
        gtag('config', GA_MEASUREMENT_ID);
      }
    };

    trackVisit();
  }, []);
};

// Hook separado para buscar os dados do Dashboard
export const useAnalyticsDashboard = () => {
  const [stats, setStats] = useState({
    last24h: 0,
    last7d: 0,
    last30d: 0,
    total: 0,
    loading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const now = new Date();
        
        // Helper para calcular datas
        const getDateAgo = (days: number) => {
          const d = new Date();
          d.setDate(d.getDate() - days);
          return d.toISOString();
        };

        // Buscando todas as visitas (em um app muito grande, isso seria otimizado com count(*))
        // Para MVP, vamos fazer queries separadas de count
        
        const p24h = supabase.from('site_visits').select('*', { count: 'exact', head: true }).gt('created_at', getDateAgo(1));
        const p7d = supabase.from('site_visits').select('*', { count: 'exact', head: true }).gt('created_at', getDateAgo(7));
        const p30d = supabase.from('site_visits').select('*', { count: 'exact', head: true }).gt('created_at', getDateAgo(30));
        const pTotal = supabase.from('site_visits').select('*', { count: 'exact', head: true });

        const [r24, r7, r30, rTot] = await Promise.all([p24h, p7d, p30d, pTotal]);

        setStats({
          last24h: r24.count || 0,
          last7d: r7.count || 0,
          last30d: r30.count || 0,
          total: rTot.count || 0,
          loading: false
        });

      } catch (error) {
        console.error("Erro ao carregar estatísticas", error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  return stats;
};

// Declaração para TypeScript aceitar window.dataLayer
declare global {
  interface Window {
    dataLayer: any[];
  }
}
