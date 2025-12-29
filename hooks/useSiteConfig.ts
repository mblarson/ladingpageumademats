import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface SiteConfig {
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
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  // HERO
  hero_bgColor: '#4F46E5',
  hero_accentColor: '#ccff00',
  hero_secondaryColor: '#ec4899',
  hero_marqueeText: 'UMADEMATS  •  ',
  hero_titleLine1: 'UI',
  hero_titleLine2: 'MADEMATS',
  hero_button1: 'Congresso',
  hero_button2: 'GAMES',
  hero_button3: 'Quem Somos',
  hero_mascotUrl: 'https://raw.githubusercontent.com/mblarson/imagens/main/mascotearanha.png',
  hero_showMascot: true,

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
  action_shirtLink: 'https://projeto-camiseta.vercel.app/?mode=view',

  // ABOUT
  about_title: 'QUEM SOMOS',
  about_text: 'Igreja com visão para o século XXI, dedicada a apresentar Deus ao mundo, cumprir o evangelho de Cristo, incentivar a faith e fortalecer uma comunidade vitoriosa sustentada pela promessa de que as portas do inferno não prevalecerão. Estamos em Campo Grande - MS no endereço Av. Dr. João Rosa Píres, 482 - Amambai.',
  about_bannerUrl: 'https://raw.githubusercontent.com/mblarson/imagens/main/ieadms.png',
};

export const useSiteConfig = () => {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [loading, setLoading] = useState(true);

  // Carregar configurações ao iniciar
  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      // .maybeSingle() não retorna erro 406 se a linha não existir (retorna null)
      const { data, error } = await supabase
        .from('site_config')
        .select('value')
        .eq('key', 'landing_page')
        .maybeSingle();

      if (data) {
        // Merge com defaults para garantir que novos campos não quebrem
        setConfig({ ...DEFAULT_SITE_CONFIG, ...data.value });
      }
    } catch (e) {
      console.warn("Using default config (Table not found or empty)");
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (newConfig: SiteConfig) => {
    try {
      // Otimistic Update
      setConfig(newConfig);
      
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