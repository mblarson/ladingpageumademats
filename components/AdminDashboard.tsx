import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Clock, Calendar, Users, ArrowLeft, Lock, Palette, Layout, Type, Image as ImageIcon, Save, RotateCcw, ChevronDown, ChevronRight } from 'lucide-react';
import { useAnalyticsDashboard, useSiteAnalytics } from '../hooks/useSiteAnalytics';
import { useSiteConfig, SiteConfig, DEFAULT_SITE_CONFIG } from '../hooks/useSiteConfig';
import { HeroSection } from './HeroSection';
import { EventSection } from './EventSection';
import { ActionSection } from './ActionSection';
import { AboutSection } from './AboutSection';

// --- COMPONENTS ---

const ColorPicker: React.FC<{ label: string; value: string; onChange: (val: string) => void }> = ({ label, value, onChange }) => (
    <div className="flex flex-col gap-2">
        <label className="text-white/70 text-xs uppercase font-bold tracking-wider">{label}</label>
        <div className="flex items-center gap-3">
            <input 
                type="color" 
                value={value} 
                onChange={(e) => onChange(e.target.value)}
                className="w-10 h-10 rounded-lg border-2 border-white/20 cursor-pointer bg-transparent"
            />
            <input 
                type="text" 
                value={value} 
                onChange={(e) => onChange(e.target.value)}
                className="flex-1 bg-black border border-white/20 rounded-lg px-3 py-2 text-white text-sm font-mono uppercase focus:border-brand-neon focus:outline-none"
            />
        </div>
    </div>
);

const TextInput: React.FC<{ label: string; value: string; onChange: (val: string) => void; multiline?: boolean }> = ({ label, value, onChange, multiline }) => (
    <div className="flex flex-col gap-2">
        <label className="text-white/70 text-xs uppercase font-bold tracking-wider">{label}</label>
        {multiline ? (
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:border-brand-neon focus:outline-none h-24 resize-none"
            />
        ) : (
            <input 
                type="text" 
                value={value} 
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:border-brand-neon focus:outline-none"
            />
        )}
    </div>
);

const SectionAccordion: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-white/10 last:border-none">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-[#1a1a1a] hover:bg-[#252525] transition-colors"
            >
                <span className="font-bold text-white uppercase text-sm tracking-wide">{title}</span>
                {isOpen ? <ChevronDown size={16} className="text-white/50" /> : <ChevronRight size={16} className="text-white/50" />}
            </button>
            {isOpen && (
                <div className="p-4 bg-[#111] space-y-6 border-t border-white/5">
                    {children}
                </div>
            )}
        </div>
    );
}


const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode; color: string; loading?: boolean }> = ({ title, value, icon, color, loading }) => (
    <div className={`bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-${color} transition-colors`}>
      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-${color}`}>
         {icon}
      </div>
      <div className="relative z-10">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 bg-${color} bg-opacity-20 text-${color}`}>
          <div className="text-current">{icon}</div>
        </div>
        <h3 className="text-white/50 text-xs font-sans font-bold uppercase tracking-widest mb-1">{title}</h3>
        {loading ? <div className="h-10 w-24 bg-white/10 rounded animate-pulse" /> : <div className="text-4xl font-display text-white">{value}</div>}
      </div>
    </div>
);

// --- MAIN DASHBOARD COMPONENT ---

interface AdminDashboardProps {
  onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const stats = useAnalyticsDashboard();
  const { config, saveConfig, resetConfig, loading: configLoading } = useSiteConfig();
  
  // Local state for the "Editor Mode"
  // Initialize with the fetched config when available, or default
  const [draftConfig, setDraftConfig] = useState<SiteConfig>(config);
  
  // Update draft when config loads from DB
  React.useEffect(() => {
      // Basic check to ensure we have keys, simple deep merge if needed but simple spread works for flat object
      if (config) setDraftConfig({ ...DEFAULT_SITE_CONFIG, ...config });
  }, [config]);

  const [activeTab, setActiveTab] = useState<'analytics' | 'builder'>('analytics');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'umademats2026' || password === 'admin') {
      setIsAuthenticated(true);
    } else {
      alert('Senha incorreta');
    }
  };

  const handleConfigChange = (key: keyof SiteConfig, value: any) => {
      setDraftConfig(prev => ({ ...prev, [key]: value }));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
         <motion.div 
           initial={{ scale: 0.9, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-3xl p-8 text-center"
         >
            <div className="w-16 h-16 bg-brand-neon rounded-full flex items-center justify-center mx-auto mb-6">
               <Lock className="text-black" size={32} />
            </div>
            <h2 className="text-2xl font-display text-white mb-2">Área Restrita</h2>
            <form onSubmit={handleLogin} className="flex flex-col gap-4 mt-6">
               <input 
                 type="text" 
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 placeholder="Senha"
                 className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-neon transition-colors"
               />
               <button type="submit" className="w-full bg-brand-neon text-black font-bold uppercase py-3 rounded-xl hover:bg-brand-neon/80 transition-colors">
                 Acessar
               </button>
            </form>
            <button onClick={onBack} className="mt-6 text-white/30 text-xs hover:text-white uppercase font-bold tracking-widest">Voltar ao Site</button>
         </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col h-screen overflow-hidden">
      
      {/* HEADER */}
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0f0f0f] shrink-0">
         <div className="flex items-center gap-6">
             <button onClick={onBack} className="text-white/50 hover:text-white transition-colors">
                <ArrowLeft size={20} />
             </button>
             <div className="h-6 w-px bg-white/10" />
             <h1 className="text-lg font-display uppercase text-white tracking-wide">
               Admin <span className="text-brand-neon">Builder</span>
             </h1>
         </div>

         {/* Tabs Switcher */}
         <div className="flex bg-white/5 rounded-lg p-1">
            <button 
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'analytics' ? 'bg-white text-black' : 'text-white/50 hover:text-white'}`}
            >
                Analytics
            </button>
            <button 
                onClick={() => setActiveTab('builder')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'builder' ? 'bg-brand-neon text-black' : 'text-white/50 hover:text-white'}`}
            >
                Visual Builder
            </button>
         </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-hidden relative">
          
          {/* --- TAB: ANALYTICS --- */}
          {activeTab === 'analytics' && (
             <div className="h-full overflow-y-auto p-8">
                 <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard title="24 Horas" value={stats.last24h} icon={<Clock size={20}/>} color="brand-neon" loading={stats.loading} />
                        <StatCard title="7 Dias" value={stats.last7d} icon={<Calendar size={20}/>} color="brand-pink" loading={stats.loading} />
                        <StatCard title="30 Dias" value={stats.last30d} icon={<Calendar size={20}/>} color="brand-purple" loading={stats.loading} />
                        <StatCard title="Total" value={stats.total} icon={<Users size={20}/>} color="white" loading={stats.loading} />
                    </div>
                    <div className="p-12 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-white/30">
                        <BarChart3 size={48} className="mb-4 opacity-50" />
                        <p className="uppercase tracking-widest text-sm">Gráficos Detalhados em Breve</p>
                    </div>
                 </div>
             </div>
          )}

          {/* --- TAB: VISUAL BUILDER (FULL PAGE) --- */}
          {activeTab === 'builder' && (
              <div className="flex h-full">
                  
                  {/* LEFT SIDEBAR: CONTROLS */}
                  <div className="w-[380px] bg-[#1a1a1a] border-r border-white/10 h-full flex flex-col shrink-0">
                      <div className="p-5 border-b border-white/10">
                          <h2 className="text-white font-display uppercase text-xl">Editor Visual</h2>
                          <p className="text-white/40 text-xs mt-1">Personalize todas as seções do site.</p>
                      </div>

                      <div className="flex-1 overflow-y-auto custom-scrollbar">
                          
                          {/* HERO SECTION CONTROLS */}
                          <SectionAccordion title="1. Hero (Topo)" defaultOpen={true}>
                              <div className="space-y-4">
                                  <div className="pb-2 border-b border-white/5"><span className="text-brand-neon text-xs font-bold uppercase">Cores</span></div>
                                  <ColorPicker label="Fundo" value={draftConfig.hero_bgColor} onChange={(v) => handleConfigChange('hero_bgColor', v)} />
                                  <ColorPicker label="Destaque (Neon)" value={draftConfig.hero_accentColor} onChange={(v) => handleConfigChange('hero_accentColor', v)} />
                                  <ColorPicker label="Secundário (Pink)" value={draftConfig.hero_secondaryColor} onChange={(v) => handleConfigChange('hero_secondaryColor', v)} />
                                  
                                  <div className="pb-2 border-b border-white/5 mt-4"><span className="text-white text-xs font-bold uppercase">Textos</span></div>
                                  <TextInput label="Marquee (Faixa)" value={draftConfig.hero_marqueeText} onChange={(v) => handleConfigChange('hero_marqueeText', v)} />
                                  <TextInput label="Título 1" value={draftConfig.hero_titleLine1} onChange={(v) => handleConfigChange('hero_titleLine1', v)} />
                                  <TextInput label="Título 2 (Colorido)" value={draftConfig.hero_titleLine2} onChange={(v) => handleConfigChange('hero_titleLine2', v)} />
                                  
                                  <div className="pb-2 border-b border-white/5 mt-4"><span className="text-white text-xs font-bold uppercase">Botões</span></div>
                                  <TextInput label="Botão 1" value={draftConfig.hero_button1} onChange={(v) => handleConfigChange('hero_button1', v)} />
                                  <TextInput label="Botão 2" value={draftConfig.hero_button2} onChange={(v) => handleConfigChange('hero_button2', v)} />
                                  <TextInput label="Botão 3" value={draftConfig.hero_button3} onChange={(v) => handleConfigChange('hero_button3', v)} />

                                  <div className="pb-2 border-b border-white/5 mt-4"><span className="text-brand-purple text-xs font-bold uppercase">Mascote</span></div>
                                  <TextInput label="URL Imagem" value={draftConfig.hero_mascotUrl} onChange={(v) => handleConfigChange('hero_mascotUrl', v)} />
                                  <div className="flex items-center gap-3">
                                      <input 
                                        type="checkbox" 
                                        checked={draftConfig.hero_showMascot} 
                                        onChange={(e) => handleConfigChange('hero_showMascot', e.target.checked)}
                                        className="w-5 h-5 rounded border-white/20 bg-black checked:bg-brand-neon"
                                      />
                                      <span className="text-white text-sm">Mostrar Mascote</span>
                                  </div>
                              </div>
                          </SectionAccordion>

                          {/* EVENT SECTION CONTROLS */}
                          <SectionAccordion title="2. Evento (Info)">
                              <div className="space-y-4">
                                  <TextInput label="Título Principal" value={draftConfig.event_title} onChange={(v) => handleConfigChange('event_title', v)} />
                                  <TextInput label="Badge (Subtítulo)" value={draftConfig.event_badge} onChange={(v) => handleConfigChange('event_badge', v)} />
                                  <TextInput label="Data" value={draftConfig.event_date} onChange={(v) => handleConfigChange('event_date', v)} />
                                  <TextInput label="Localização" value={draftConfig.event_location} onChange={(v) => handleConfigChange('event_location', v)} />
                                  <div className="h-px bg-white/5 my-2" />
                                  <TextInput label="Faixa Marquee" value={draftConfig.event_marqueeText} onChange={(v) => handleConfigChange('event_marqueeText', v)} />
                                  <TextInput label="Título Convidados" value={draftConfig.event_guestTitle} onChange={(v) => handleConfigChange('event_guestTitle', v)} />
                              </div>
                          </SectionAccordion>

                          {/* ACTION SECTION CONTROLS */}
                          <SectionAccordion title="3. Ação (Cards)">
                              <div className="space-y-4">
                                  <TextInput label="Título Linha 1" value={draftConfig.action_title1} onChange={(v) => handleConfigChange('action_title1', v)} />
                                  <TextInput label="Título Linha 2 (Destaque)" value={draftConfig.action_title2} onChange={(v) => handleConfigChange('action_title2', v)} />
                                  <div className="h-px bg-white/5 my-2" />
                                  <TextInput label="Link Games" value={draftConfig.action_gameLink} onChange={(v) => handleConfigChange('action_gameLink', v)} />
                                  <TextInput label="Link Camisetas" value={draftConfig.action_shirtLink} onChange={(v) => handleConfigChange('action_shirtLink', v)} />
                              </div>
                          </SectionAccordion>

                          {/* ABOUT SECTION CONTROLS */}
                          <SectionAccordion title="4. Sobre (Liderança)">
                              <div className="space-y-4">
                                  <TextInput label="Título Seção" value={draftConfig.about_title} onChange={(v) => handleConfigChange('about_title', v)} />
                                  <TextInput label="Descrição Igreja" value={draftConfig.about_text} onChange={(v) => handleConfigChange('about_text', v)} multiline />
                                  <TextInput label="URL Banner Principal" value={draftConfig.about_bannerUrl} onChange={(v) => handleConfigChange('about_bannerUrl', v)} />
                              </div>
                          </SectionAccordion>

                      </div>

                      {/* Footer Actions */}
                      <div className="p-5 border-t border-white/10 bg-[#0f0f0f] flex gap-3">
                          <button 
                            onClick={() => saveConfig(draftConfig)}
                            className="flex-1 bg-brand-neon hover:bg-brand-neon/80 text-black py-3 rounded-xl font-bold uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg transition-all"
                          >
                              <Save size={18} /> Salvar Site
                          </button>
                           <button 
                            onClick={resetConfig}
                            title="Resetar Padrão"
                            className="bg-white/10 hover:bg-red-500 hover:text-white text-white/50 p-3 rounded-xl transition-all"
                          >
                              <RotateCcw size={18} />
                          </button>
                      </div>
                  </div>

                  {/* RIGHT SIDE: LIVE PREVIEW (FULL PAGE) */}
                  <div className="flex-1 bg-gray-900 relative overflow-hidden flex flex-col">
                      <div className="absolute top-4 left-4 z-[100] bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 pointer-events-none">
                          <span className="text-[10px] text-white uppercase font-bold tracking-wider flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/>
                              Preview Ao Vivo
                          </span>
                      </div>
                      
                      {/* Iframe-like Container for Full Page Scroll */}
                      <div className="w-full h-full overflow-y-auto bg-black custom-scrollbar">
                          <div className="w-full origin-top transform transition-all duration-300">
                             <HeroSection previewConfig={draftConfig} />
                             <EventSection previewConfig={draftConfig} />
                             <ActionSection previewConfig={draftConfig} />
                             <AboutSection previewConfig={draftConfig} />
                          </div>
                      </div>
                  </div>
              </div>
          )}

      </div>
    </div>
  );
};