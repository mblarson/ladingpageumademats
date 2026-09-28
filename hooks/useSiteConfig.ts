
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface SiteConfig {
  // UI INTERACTION
  ui_allowDrag: boolean;

  // HERO SECTION
  hero_bgColor: string;
  hero_accentColor: string;
  hero_secondaryColor: string;
  hero_marqueeText: string;
  hero_titleLine1: string;
  hero_titleLine2: string;
  hero_button1: string;
  hero_button2: string;
  hero_button3: string;
  hero_mascotUrl: string;
  hero_showMascot: boolean;
  hero_desktopFontSizeFactor: number; // NOVO: Controle de escala de fonte para Desktop

  // EVENT SECTION
  event_marqueeText: string;
  event_title: string; // "Congresso"
  event_badge: string; // "Jubileu de Ouro"
  event_date: string;  // "03 e 04 de Abril"
  event_location: string; // "Bosque Expo..."
  event_guestTitle: string; // "CONFIRMADOS"

  // ACTION SECTION
  action_title1: string; // "Selecione o que"
  action_title2: string; // "deseja fazer:"
  action_gameLink: string;
  action_shirtLink: string;

  // ABOUT SECTION
  about_title: string; // "QUEM SOMOS"
  about_text: string;
  about_bannerUrl: string;

  // BIBLE CAMPAIGN
  bible_campaign_active: boolean;

  // SECTION 2 (PROXIMOS ENCONTROS)
  section2_first_image_url?: string;

  // SYSTEM THEME
  system_theme: 'default' | 'copa';
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  // UI
  ui_allowDrag: true,

  // SECTION 2
  section2_first_image_url: '',

  // SYSTEM THEME
  system_theme: 'default',

  // HERO
  hero_bgColor: '#4F46E5',
  hero_accentColor: '#ccff00',
  hero_secondaryColor: '#ec4899',
  hero_marqueeText: 'UMADEMATS • ',
  hero_titleLine1: 'UMADE',
  hero_titleLine2: 'MATS',
  hero_button1: 'Congresso',
  hero_button2: 'GAMES',
  hero_button3: 'Quem Somos',
  hero_mascotUrl: 'https://raw.githubusercontent.com/mblarson/imagens/main/mascotearanha.png',
  hero_showMascot: true,
  hero_desktopFontSizeFactor: 1.0, // Valor base original

  // EVENT
  event_marqueeText: 'UMADEMATS 2026 • JUBILEU DE OURO •',
  event_title: 'Congresso',
  event_badge: 'Jubileu de Ouro',
  event_date: '03 e 04 de Abril',
  event_location: 'Bosque Expo - Shopping Bosque dos Ipês',
  event_guestTitle: 'CONFIRMADOS',

  // ACTION
  action_title1: 'Selecione o que',
  action_title2: 'deseja fazer:',
  action_gameLink: 'https://umadegames.com.br',
  action_shirtLink: '/pedidoscamisetas',

  // ABOUT
  about_title: 'QUEM SOMOS',
  about_text: 'Igreja com visão para o século XXI, dedicada a apresentar Deus ao mundo, cumprir o evangelho de Cristo, incentivar a faith e fortalecer uma comunidade vitoriosa sustentada pela promessa de que as portas do inferno não prevalecerão. Estamos em Campo Grande - MS no endereço Av. Dr. João Rosa Píres, 482 - Amambai.',
  about_bannerUrl: 'https://raw.githubusercontent.com/mblarson/imagens/main/ieadms.png',

  // BIBLE CAMPAIGN
  bible_campaign_active: false,
};

// Cache em memória e promessa compartilhada para evitar requisições redundantes de componentes montados em paralelo
let cachedConfig: SiteConfig | null = null;
let inFlightConfigPromise: Promise<SiteConfig | null> | null = null;

export const fetchSharedSiteConfig = async (): Promise<SiteConfig | null> => {
  if (cachedConfig) return cachedConfig;
  if (inFlightConfigPromise) return inFlightConfigPromise;

  inFlightConfigPromise = (async () => {
    try {
      const { data } = await supabase
        .from('site_config')
        .select('value')
        .eq('key', 'landing_page')
        .maybeSingle();

      if (data && data.value) {
        const mergedConfig: SiteConfig = { ...DEFAULT_SITE_CONFIG, ...data.value };
        cachedConfig = mergedConfig;
        if (typeof window !== 'undefined') {
          if (mergedConfig.system_theme) {
            localStorage.setItem('umademats_system_theme', mergedConfig.system_theme);
          }
          try {
            localStorage.setItem('umademats_site_config', JSON.stringify(mergedConfig));
          } catch (e) {}
        }
        return mergedConfig;
      }
    } catch (e) {
      console.warn("Using default config (Table not found or empty)");
    } finally {
      inFlightConfigPromise = null;
    }
    return null;
  })();

  return inFlightConfigPromise;
};

export const useSiteConfig = () => {
  const [config, setConfig] = useState<SiteConfig>(() => {
    if (cachedConfig) return cachedConfig;
    let initialTheme: 'default' | 'copa' = 'default';
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('umademats_site_config');
        if (saved) {
          const parsed = JSON.parse(saved);
          const merged: SiteConfig = { ...DEFAULT_SITE_CONFIG, ...parsed };
          cachedConfig = merged;
          return merged;
        }
      } catch (e) {}

      const savedTheme = localStorage.getItem('umademats_system_theme');
      if (savedTheme === 'default' || savedTheme === 'copa') {
        initialTheme = savedTheme as 'default' | 'copa';
      }
    }
    return {
      ...DEFAULT_SITE_CONFIG,
      system_theme: initialTheme
    };
  });
  const [loading, setLoading] = useState(() => !cachedConfig);

  // Carregar configurações ao iniciar com desduplicação de requisição
  useEffect(() => {
    let isMounted = true;
    if (cachedConfig) {
      setLoading(false);
      return;
    }

    fetchSharedSiteConfig().then((res) => {
      if (isMounted) {
        if (res) setConfig(res);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const saveConfig = async (newConfig: SiteConfig) => {
    try {
      // Optimistic Update imediato
      cachedConfig = newConfig;
      setConfig(newConfig);
      
      // Salvar imediatamente no localStorage para evitar qualquer atraso visual
      if (typeof window !== 'undefined') {
        localStorage.setItem('umademats_system_theme', newConfig.system_theme);
        try {
          localStorage.setItem('umademats_site_config', JSON.stringify(newConfig));
        } catch (e) {}
      }
      
      const { error } = await supabase
        .from('site_config')
        .upsert({ key: 'landing_page', value: newConfig }, { onConflict: 'key' });

      if (error) throw error;
      alert('Configurações salvas com sucesso! 💾');
    } catch (e: any) {
      console.error("Error saving config:", e);
      alert('Erro ao salvar: ' + e.message);
    }
  };

  const resetConfig = () => {
    if(confirm("Tem certeza? Isso voltará para o padrão original.")) {
        saveConfig(DEFAULT_SITE_CONFIG);
    }
  };

  return { config, loading, saveConfig, resetConfig };
};
