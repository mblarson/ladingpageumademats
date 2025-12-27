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
      try {
        const hasVisitedSession = typeof window !== 'undefined' ? sessionStorage.getItem('umademats_visited') : null;
        
        if (!hasVisitedSession) {
          const { error } = await supabase.from('site_visits').insert({
            page: window.location.pathname
          });
          
          if (error) {
            console.error("🚨 [Supabase Analytics Insert Error]:", error.message, error.details, error.hint);
          } else {
            sessionStorage.setItem('umademats_visited', 'true');
          }
        }
      } catch (error) {
        console.error('🚨 [Analytics Critical Error]:', error);
      }

      // B. Injetar Google Analytics (Para o painel do Google)
      try {
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
      } catch (e) {
          console.error("🚨 [GA Load Error]", e);
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
      console.log("📊 [Analytics Dashboard] Fetching stats...");
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

        // Await all promises. Even if they "fail" (return error obj), Promise.all won't throw unless network exception logic implies it.
        // Supabase returns { count: null, error: ... } on logic error.
        const results = await Promise.all([p24h, p7d, p30d, pTotal]);
        
        // Safety check to ensure we have an array of results
        if (!results || results.length < 4) {
            throw new Error("Falha ao recuperar dados do Supabase: Resultado incompleto.");
        }

        const [r24, r7, r30, rTot] = results;

        // Log detailed errors if Supabase returned them
        if (r24.error) console.error("❌ [Stats 24h Error]:", r24.error);
        if (r7.error) console.error("❌ [Stats 7d Error]:", r7.error);
        if (r30.error) console.error("❌ [Stats 30d Error]:", r30.error);
        if (rTot.error) console.error("❌ [Stats Total Error]:", rTot.error);

        setStats({
          last24h: r24?.count ?? 0,
          last7d: r7?.count ?? 0,
          last30d: r30?.count ?? 0,
          total: rTot?.count ?? 0,
          loading: false
        });
        
        console.log("✅ [Analytics Dashboard] Stats loaded:", {
            last24h: r24?.count,
            last7d: r7?.count,
            last30d: r30?.count,
            total: rTot?.count
        });

      } catch (error) {
        console.error("🚨 [Dashboard Fetch Error]:", error);
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