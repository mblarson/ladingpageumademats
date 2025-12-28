import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Clock, Calendar, Users, ArrowLeft, Lock, Palette, Layout, Type, Image as ImageIcon, Save, RotateCcw, ChevronDown, ChevronRight, Activity, Server, RefreshCw, CheckCircle2, AlertCircle, Play, Pause, Zap } from 'lucide-react';
import { useAnalyticsDashboard, useSiteAnalytics } from '../hooks/useSiteAnalytics';
import { useSiteConfig, SiteConfig, DEFAULT_SITE_CONFIG } from '../hooks/useSiteConfig';
import { useKeepalive, AutomationLog } from '../hooks/useKeepalive';
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
  const { logs, lastRun, isPinging, triggerKeepalive, refreshLogs, autoPingEnabled, setAutoPingEnabled, timeToNextPing } = useKeepalive();
  
  // Local state for the "Editor Mode"
  const [draftConfig, setDraftConfig] = useState<SiteConfig>(config);
  
  // Update draft when config loads from DB
  React.useEffect(() => {
      if (config) setDraftConfig({ ...DEFAULT_SITE_CONFIG, ...config });
  }, [config]);

  const [activeTab, setActiveTab] = useState<'analytics' | 'builder' | 'keepalive'>('analytics');
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

  const formatTime = (isoString: string | null) => {
      if (!isoString) return 'Nunca executado';
      return new Date(isoString).toLocaleString('pt-BR', { 
          day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' 
      });
  };
  
  const formatCountdown = (ms: number) => {
      const totalSeconds = Math.floor(ms / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
      
      {/* HEADER RESPONSIVO */}
      <div className="border-b border-white/10 flex flex-col md:flex-row items-center justify-between bg-[#0f0f0f] shrink-0 z-50">
         
         {/* Top Row: Back & Title */}
         <div className="w-full md:w-auto h-16 flex items-center px-4 md:px-6">
             <div className="flex items-center gap-4">
                 <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                 </button>
                 <div className="h-6 w-px bg-white/10 hidden md:block" />
                 <h1 className="text-lg font-display uppercase text-white tracking-wide">
                   Admin <span className="text-brand-neon">Panel</span>
                 </h1>
             </div>
         </div>

         {/* Bottom Row (Mobile) / Right Side (Desktop): Tabs */}
         <div className="w-full md:w-auto px-4 pb-4 md:pb-0 md:pr-6">
            <div className="flex bg-white/5 rounded-lg p-1 gap-1 w-full md:w-auto">
                {/* Analytics Tab */}
                <button 
                    onClick={() => setActiveTab('analytics')}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'analytics' ? 'bg-white text-black shadow-lg' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                >
                    <BarChart3 size={16} />
                    <span className="hidden sm:inline">Analytics</span>
                </button>

                 {/* Monitor Tab */}
                 <button 
                    onClick={() => setActiveTab('keepalive')}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'keepalive' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                >
                    <Activity size={16} />
                    <span>Monitor</span>
                </button>

                {/* Builder Tab */}
                <button 
                    onClick={() => setActiveTab('builder')}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'builder' ? 'bg-brand-neon text-black shadow-lg' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                >
                    <Layout size={16} />
                    <span className="hidden sm:inline">Visual Builder</span>
                    <span className="sm:hidden">Editor</span>
                </button>
            </div>
         </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-hidden relative">
          
          {/* --- TAB: ANALYTICS --- */}
          {activeTab === 'analytics' && (
             <div className="h-full overflow-y-auto p-4 md:p-8">
                 <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8">
                        <StatCard title="24 Horas" value={stats.last24h} icon={<Clock size={20}/>} color="brand-neon" loading={stats.loading} />
                        <StatCard title="7 Dias" value={stats.last7d} icon={<Calendar size={20}/>} color="brand-pink" loading={stats.loading} />
                        <StatCard title="30 Dias" value={stats.last30d} icon={<Calendar size={20}/>} color="brand-purple" loading={stats.loading} />
                        <StatCard title="Total" value={stats.total} icon={<Users size={20}/>} color="white" loading={stats.loading} />
                    </div>
                    <div className="p-12 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-white/30 text-center">
                        <BarChart3 size={48} className="mb-4 opacity-50" />
                        <p className="uppercase tracking-widest text-sm">Gráficos Detalhados em Breve</p>
                    </div>
                 </div>
             </div>
          )}

           {/* --- TAB: KEEPALIVE (MONITOR) --- */}
           {activeTab === 'keepalive' && (
             <div className="h-full overflow-y-auto p-4 md:p-8 bg-gray-900/50">
                 <div className="max-w-4xl mx-auto">
                    
                    {/* Header Card */}
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 md:p-8 mb-8 flex flex-col gap-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <Server className="text-blue-500" size={24} />
                                    <h2 className="text-xl md:text-2xl font-display text-white uppercase">Status do Banco</h2>
                                </div>
                                <p className="text-white/50 text-sm max-w-md">
                                    Monitoramento de pings locais (via navegador enquanto o painel está aberto).
                                </p>
                            </div>
                            
                             <div className="flex flex-wrap gap-2">
                                 <div className={`px-3 py-2 rounded-lg border flex items-center gap-2 ${autoPingEnabled ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                     {autoPingEnabled ? <Zap size={14} className="fill-current" /> : <Pause size={14} className="fill-current" />}
                                     <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">{autoPingEnabled ? 'Painel On' : 'Painel Off'}</span>
                                 </div>

                                 <div className="bg-black/50 px-3 py-2 rounded-lg border border-white/5 flex items-center gap-2">
                                     <span className="text-[10px] md:text-xs font-bold text-white/40 uppercase tracking-widest">Próx:</span>
                                     <span className="text-brand-neon font-mono text-xs md:text-sm">{formatCountdown(timeToNextPing)}</span>
                                 </div>
                             </div>
                        </div>

                        <div className="flex items-center gap-2 w-full">
                             {/* Toggle Button */}
                             <button
                                 onClick={() => setAutoPingEnabled(!autoPingEnabled)}
                                 className={`p-3 rounded-xl border border-white/10 transition-all ${autoPingEnabled ? 'bg-white/5 text-white/50 hover:text-white' : 'bg-green-600 text-white hover:bg-green-500'}`}
                                 title={autoPingEnabled ? "Pausar Automação Local" : "Iniciar Automação Local"}
                             >
                                 {autoPingEnabled ? <Pause size={18} /> : <Play size={18} />}
                             </button>

                             <button 
                                onClick={() => triggerKeepalive(false)}
                                disabled={isPinging}
                                className={`
                                    flex-1 flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-bold uppercase tracking-wide transition-all shadow-lg text-sm
                                    ${isPinging ? 'bg-white/10 text-white/50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white hover:scale-105'}
                                `}
                             >
                                <RefreshCw size={18} className={isPinging ? 'animate-spin' : ''} />
                                {isPinging ? '...' : 'Ping Manual'}
                             </button>
                        </div>
                    </div>

                    {/* Logs Table */}
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl overflow-hidden">
                        <div className="p-4 md:p-6 border-b border-white/10 flex items-center justify-between">
                            <h3 className="text-sm md:text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2">
                                <Activity size={18} className="text-brand-neon" />
                                Histórico
                            </h3>
                            <button onClick={refreshLogs} className="text-white/30 hover:text-white p-2 transition-colors">
                                <RefreshCw size={14} />
                            </button>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[600px]">
                                <thead className="bg-black/40 text-xs font-bold uppercase text-white/40 tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Fonte / Evento</th>
                                        <th className="px-6 py-4">Data / Hora</th>
                                        <th className="px-6 py-4">Detalhes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {logs.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-white/20 text-sm uppercase tracking-widest">
                                                Nenhum log encontrado. Aguardando ping...
                                            </td>
                                        </tr>
                                    ) : (
                                        logs.map((log) => (
                                            <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    {log.status === 'success' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold uppercase border border-green-500/20">
                                                            <CheckCircle2 size={12} /> Sucesso
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold uppercase border border-red-500/20">
                                                            <AlertCircle size={12} /> Erro
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-white font-medium text-sm">
                                                    {log.event_type === 'keepalive_auto' ? (
                                                        <span className="inline-flex items-center gap-2 text-brand-neon">
                                                            <Zap size={14} /> Auto Painel 🤖
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-2 text-blue-400">
                                                            <Activity size={14} /> Manual Ping 👤
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-white/60 font-mono text-xs">
                                                    {formatTime(log.created_at)}
                                                </td>
                                                <td className="px-6 py-4 text-white/40 text-xs font-mono max-w-xs truncate">
                                                    {JSON.stringify(log.details)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                 </div>
             </div>
           )}

          {/* --- TAB: VISUAL BUILDER (FULL PAGE) --- */}
          {activeTab === 'builder' && (
              <div className="flex flex-col md:flex-row h-full">
                  
                  {/* LEFT SIDEBAR: CONTROLS (Mobile: Bottom Sheet style / Desktop: Sidebar) */}
                  <div className="w-full md:w-[380px] bg-[#1a1a1a] border-r border-white/10 h-[40vh] md:h-full flex flex-col shrink-0 order-2 md:order-1">
                      <div className="p-4 md:p-5 border-b border-white/10 flex items-center justify-between">
                          <div>
                            <h2 className="text-white font-display uppercase text-lg md:text-xl">Editor Visual</h2>
                            <p className="text-white/40 text-xs mt-1">Personalize o site.</p>
                          </div>
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
                      <div className="p-4 md:p-5 border-t border-white/10 bg-[#0f0f0f] flex gap-3">
                          <button 
                            onClick={() => saveConfig(draftConfig)}
                            className="flex-1 bg-brand-neon hover:bg-brand-neon/80 text-black py-3 rounded-xl font-bold uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg transition-all text-sm"
                          >
                              <Save size={18} /> Salvar
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
                  <div className="flex-1 bg-gray-900 relative overflow-hidden flex flex-col order-1 md:order-2 h-[60vh] md:h-full border-b md:border-b-0 border-white/10">
                      <div className="absolute top-4 left-4 z-[100] bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 pointer-events-none">
                          <span className="text-[10px] text-white uppercase font-bold tracking-wider flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/>
                              Preview
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