
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Clock, Calendar, Users, ArrowLeft, Lock, Layout, Save, RotateCcw, ChevronDown, ChevronRight, Activity, RefreshCw, Presentation, List, PieChart, User, Menu, X, BookOpen, Trophy, Flame, AlertCircle, Database, ChevronUp, MapPin, ClipboardList, GraduationCap, Plus, Trash2, Globe, Eye, Image as ImageIcon, Upload, Terminal, CheckCircle2, Building2 } from 'lucide-react';
import { useAnalyticsDashboard } from '../hooks/useSiteAnalytics';
import { useSiteConfig, SiteConfig, DEFAULT_SITE_CONFIG } from '../hooks/useSiteConfig';
import { useKeepalive } from '../hooks/useKeepalive';
import { HeroSection } from './HeroSection';
import { EventSection } from './EventSection';
import { ActionSection } from './ActionSection';
import { AboutSection } from './AboutSection';
import { PresenceCounter } from './PresenceCounter';
import { supabase } from '../lib/supabaseClient';

const SECTORS_LIST = ["A", "B", "C1", "C2", "D", "E", "F", "G", "H", "I", "J", "M", "N", "VISITANTE"];

// --- BIBLE ADMIN COMPONENT ---
const BibleAdmin: React.FC = () => {
    const [progressData, setProgressData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showReadersModal, setShowReadersModal] = useState(false);

    useEffect(() => {
        const fetchProgress = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('user_progress')
                    .select('user_name, reading_item_id, created_at')
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                if (data) setProgressData(data);
            } catch (e) {
                console.error("Erro ao carregar progresso bíblico:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchProgress();
    }, []);

    const userStats = useMemo(() => {
        const stats: Record<string, { count: number, lastActivity: string }> = {};
        progressData.forEach(item => {
            const name = item.user_name || 'Usuário Anônimo';
            if (!stats[name]) stats[name] = { count: 0, lastActivity: item.created_at };
            stats[name].count++;
        });
        return Object.entries(stats).sort((a, b) => b[1].count - a[1].count);
    }, [progressData]);

    const emChamasData = useMemo(() => {
        const fmt = (d: Date) => d.toLocaleDateString('en-CA'); 
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const d1 = new Date(today); d1.setDate(today.getDate() - 1);
        const d2 = new Date(today); d2.setDate(today.getDate() - 2);
        const d3 = new Date(today); d3.setDate(today.getDate() - 3);
        const targets = [fmt(d1), fmt(d2), fmt(d3)];
        const userDaysMap = new Map<string, Set<string>>();
        progressData.forEach(item => {
            const itemDateStr = fmt(new Date(item.created_at));
            if (targets.includes(itemDateStr)) {
                if (!userDaysMap.has(item.user_name)) userDaysMap.set(item.user_name, new Set());
                userDaysMap.get(item.user_name)?.add(itemDateStr);
            }
        });
        return Array.from(userDaysMap.entries())
            .filter(([_, daysSet]) => daysSet.size === 3)
            .map(([userName]) => userName);
    }, [progressData]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 opacity-20">
            <RefreshCw className="animate-spin mb-4" />
            <span className="uppercase font-bold tracking-widest text-xs">Carregando Dados Bíblicos...</span>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
                <BookOpen className="text-brand-purple" />
                <h2 className="text-2xl font-display uppercase tracking-wider">Engajamento na Leitura</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-white/30 tracking-widest block mb-1">Total de Leituras</span>
                    <span className="text-4xl font-display text-white">{progressData.length}</span>
                </div>
                <button onClick={() => setShowReadersModal(true)} className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5 text-left hover:border-brand-neon transition-colors group">
                    <span className="text-[10px] uppercase font-bold text-white/30 tracking-widest block mb-1 group-hover:text-brand-neon">Leitores</span>
                    <div className="flex items-center justify-between">
                        <span className="text-4xl font-display text-white">{userStats.length}</span>
                        <ChevronRight size={20} className="text-white/10 group-hover:text-brand-neon transition-colors" />
                    </div>
                </button>
                <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Flame size={80} className="text-orange-500" />
                    </div>
                    <span className="text-[10px] uppercase font-bold text-white/30 tracking-widest block mb-1">Em Chamas</span>
                    <div className="flex items-center gap-3">
                        <span className="text-4xl font-display text-white">{emChamasData.length}</span>
                        <Flame size={24} className="text-orange-500 animate-pulse" />
                    </div>
                </div>
            </div>
            <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl overflow-hidden shadow-lg">
                <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-widest">Top 3 Leitores</h3>
                    <Trophy size={18} className="text-brand-neon" />
                </div>
                <div className="divide-y divide-white/5">
                    {userStats.length > 0 ? userStats.slice(0, 3).map(([name, data], idx) => (
                        <div key={idx} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${idx === 0 ? 'bg-brand-neon text-black' : 'bg-white/10 text-white'}`}>
                                    {idx + 1}
                                </div>
                                <div>
                                    <p className="text-white font-bold uppercase text-xs tracking-wide">{name}</p>
                                    <p className="text-[9px] text-white/30 uppercase">Última leitura: {new Date(data.lastActivity).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-brand-purple font-display text-2xl">{data.count}</span>
                                <span className="text-[10px] text-white/20 uppercase font-bold">Capítulos</span>
                            </div>
                        </div>
                    )) : <div className="p-10 text-center text-white/20 text-xs uppercase font-bold tracking-widest">Nenhum registro encontrado.</div>}
                </div>
            </div>

            {/* Readers Modal for BibleAdmin */}
            <AnimatePresence>
                {showReadersModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowReadersModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="relative bg-[#1a1a1a] border border-white/10 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
                            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                <h2 className="text-2xl font-display uppercase">Todos os Leitores</h2>
                                <button onClick={() => setShowReadersModal(false)} className="p-2 text-white/30 hover:text-white"><X size={24} /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar divide-y divide-white/5">
                                {userStats.map(([name, data], idx) => (
                                    <div key={idx} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/30 font-bold">{idx + 1}</div>
                                            <div>
                                                <p className="text-white font-bold uppercase text-sm">{name}</p>
                                                <p className="text-[10px] text-white/30 uppercase">Atividade: {new Date(data.lastActivity).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-brand-neon font-display text-2xl">{data.count}</span>
                                            <BookOpen size={16} className="text-brand-neon" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- MAIN ADMIN DASHBOARD COMPONENT ---
export const AdminDashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'config' | 'bible' | 'presence' | 'automation'>('analytics');
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Hooks
  const stats = useAnalyticsDashboard();
  const { config, saveConfig, resetConfig, loading: configLoading } = useSiteConfig();
  const keepalive = useKeepalive();

  // Local state for configuration preview
  const [localConfig, setLocalConfig] = useState<SiteConfig>(config);

  useEffect(() => {
    if (!configLoading) setLocalConfig(config);
  }, [config, configLoading]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'macuxi') setIsAuthorized(true);
    else alert('Senha incorreta!');
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#1a1a1a] p-8 md:p-12 rounded-[2.5rem] border-4 border-brand-neon w-full max-w-md shadow-2xl relative">
          <div className="w-16 h-16 bg-brand-neon rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <Lock size={32} className="text-black" />
          </div>
          <h2 className="text-2xl font-display text-white text-center uppercase mb-8">Acesso Restrito</h2>
          <form onSubmit={handleAuth} className="flex flex-col gap-4">
            <input 
              type="password" 
              autoFocus
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Senha Master"
              className="w-full bg-black border-2 border-white/10 rounded-xl px-5 py-4 text-white font-bold text-center focus:border-brand-neon outline-none"
            />
            <button type="submit" className="w-full bg-brand-neon text-black font-bold uppercase py-4 rounded-xl shadow-lg mt-4 active:scale-95 transition-transform">Entrar</button>
            <button type="button" onClick={onBack} className="text-white/20 text-[10px] uppercase font-bold tracking-widest mt-4">Sair do Painel</button>
          </form>
        </motion.div>
      </div>
    );
  }

  const NavItem = ({ id, label, icon: Icon }: { id: any, label: string, icon: any }) => (
    <button
      onClick={() => { setActiveTab(id); setIsMenuOpen(false); }}
      className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${activeTab === id ? 'bg-brand-neon text-black' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
    >
      <Icon size={20} />
      <span className="font-display uppercase text-sm tracking-wider">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-[#1a1a1a] border-b border-white/10 p-4 flex items-center justify-between sticky top-0 z-[100]">
        <h1 className="font-display text-xl italic uppercase">Admin</h1>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 bg-white/5 rounded-lg">
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-full md:w-64 bg-[#1a1a1a] border-r border-white/10 flex flex-col z-[90] transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-8 hidden md:block">
          <h1 className="font-display italic text-3xl uppercase">Admin</h1>
          <p className="text-[10px] text-brand-neon font-bold uppercase tracking-widest">UMADEMATS v2.0</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem id="analytics" label="Estatísticas" icon={BarChart3} />
          <NavItem id="config" label="Customização" icon={Layout} />
          <NavItem id="bible" label="Bíblia" icon={BookOpen} />
          <NavItem id="presence" label="Presença" icon={Users} />
          <NavItem id="automation" label="Automação" icon={Activity} />
        </nav>

        <div className="p-4 border-t border-white/5">
          <button onClick={onBack} className="w-full flex items-center gap-3 p-4 text-white/30 hover:text-white transition-colors group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Sair do Painel</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen overflow-y-auto">
        <div className="p-6 md:p-12 max-w-6xl mx-auto">
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-4xl font-display uppercase tracking-tight">Estatísticas</h2>
                <div className="flex items-center gap-2 bg-brand-neon/10 px-4 py-2 rounded-full text-brand-neon text-[10px] font-bold uppercase border border-brand-neon/20">
                  <div className="w-2 h-2 bg-brand-neon rounded-full animate-pulse" />
                  Atualizado em tempo real
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Últimas 24h', val: stats.last24h, icon: Clock, color: 'text-brand-neon' },
                  { label: 'Últimos 7 dias', val: stats.last7d, icon: Calendar, color: 'text-brand-pink' },
                  { label: 'Últimos 30 dias', val: stats.last30d, icon: PieChart, color: 'text-brand-purple' },
                  { label: 'Total Geral', val: stats.total, icon: Database, color: 'text-white' },
                ].map((stat, i) => (
                  <div key={i} className="bg-[#1a1a1a] p-6 rounded-3xl border border-white/5 shadow-xl group hover:border-white/10 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-2xl bg-white/5 ${stat.color} group-hover:scale-110 transition-transform`}><stat.icon size={20} /></div>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-white/30 tracking-widest">{stat.label}</span>
                    <h3 className="text-4xl font-display mt-1 tracking-tight">{stats.loading ? '...' : stat.val}</h3>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-4xl font-display uppercase tracking-tight">Customização</h2>
                <div className="flex gap-3">
                  <button onClick={resetConfig} title="Resetar Padrão" className="p-3 bg-white/5 rounded-xl hover:bg-red-500/10 hover:text-red-400 text-white/50 transition-colors"><RotateCcw size={20} /></button>
                  <button onClick={() => saveConfig(localConfig)} className="flex items-center gap-2 bg-brand-neon text-black px-6 py-3 rounded-xl font-bold uppercase text-xs shadow-lg hover:scale-105 active:scale-95 transition-all">
                    <Save size={16} /> Salvar Site
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Configuration Editor */}
                <div className="space-y-6 bg-[#1a1a1a] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl h-fit max-h-[1000px] overflow-y-auto custom-scrollbar">
                   <div className="grid grid-cols-1 gap-8">
                      {/* Hero Section Config */}
                      <section className="space-y-4">
                        <h4 className="text-[10px] uppercase font-bold text-brand-neon tracking-[0.3em] border-b border-brand-neon/20 pb-2">Hero Section</h4>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                             <label className="text-[10px] uppercase font-bold text-white/40 ml-2">Fundo</label>
                             <input type="color" value={localConfig.hero_bgColor} onChange={e => setLocalConfig({...localConfig, hero_bgColor: e.target.value})} className="w-full h-12 bg-black border-2 border-white/10 rounded-xl cursor-pointer" />
                           </div>
                           <div className="space-y-2">
                             <label className="text-[10px] uppercase font-bold text-white/40 ml-2">Acento</label>
                             <input type="color" value={localConfig.hero_accentColor} onChange={e => setLocalConfig({...localConfig, hero_accentColor: e.target.value})} className="w-full h-12 bg-black border-2 border-white/10 rounded-xl cursor-pointer" />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] uppercase font-bold text-white/40 ml-2">Texto Marquee</label>
                           <input type="text" value={localConfig.hero_marqueeText} onChange={e => setLocalConfig({...localConfig, hero_marqueeText: e.target.value})} className="w-full bg-black border-2 border-white/10 rounded-xl p-4 text-white outline-none focus:border-brand-neon" />
                        </div>
                      </section>

                      {/* Event Section Config */}
                      <section className="space-y-4">
                        <h4 className="text-[10px] uppercase font-bold text-brand-pink tracking-[0.3em] border-b border-brand-pink/20 pb-2">Evento</h4>
                        <div className="space-y-2">
                           <label className="text-[10px] uppercase font-bold text-white/40 ml-2">Título do Congresso</label>
                           <input type="text" value={localConfig.event_title} onChange={e => setLocalConfig({...localConfig, event_title: e.target.value})} className="w-full bg-black border-2 border-white/10 rounded-xl p-4 text-white outline-none focus:border-brand-pink" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] uppercase font-bold text-white/40 ml-2">Badge Destaque</label>
                           <input type="text" value={localConfig.event_badge} onChange={e => setLocalConfig({...localConfig, event_badge: e.target.value})} className="w-full bg-black border-2 border-white/10 rounded-xl p-4 text-white outline-none focus:border-brand-pink" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] uppercase font-bold text-white/40 ml-2">Localização</label>
                           <input type="text" value={localConfig.event_location} onChange={e => setLocalConfig({...localConfig, event_location: e.target.value})} className="w-full bg-black border-2 border-white/10 rounded-xl p-4 text-white outline-none focus:border-brand-pink" />
                        </div>
                      </section>

                      {/* About Section Config */}
                      <section className="space-y-4">
                        <h4 className="text-[10px] uppercase font-bold text-brand-purple tracking-[0.3em] border-b border-brand-purple/20 pb-2">Sobre Nós</h4>
                        <div className="space-y-2">
                           <label className="text-[10px] uppercase font-bold text-white/40 ml-2">Texto Institucional</label>
                           <textarea rows={4} value={localConfig.about_text} onChange={e => setLocalConfig({...localConfig, about_text: e.target.value})} className="w-full bg-black border-2 border-white/10 rounded-xl p-4 text-white outline-none focus:border-brand-purple custom-scrollbar" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] uppercase font-bold text-white/40 ml-2">URL Banner</label>
                           <input type="text" value={localConfig.about_bannerUrl} onChange={e => setLocalConfig({...localConfig, about_bannerUrl: e.target.value})} className="w-full bg-black border-2 border-white/10 rounded-xl p-4 text-white outline-none focus:border-brand-purple" />
                        </div>
                      </section>
                   </div>
                </div>

                {/* Live Preview Wrapper */}
                <div className="hidden lg:block space-y-4">
                   <h4 className="text-[10px] uppercase font-bold text-white/20 text-center tracking-widest">Visualização em tempo real (Desktop Simulation)</h4>
                   <div className="border-8 border-[#111] rounded-[3rem] overflow-hidden h-[900px] scale-[0.95] origin-top shadow-2xl relative bg-black">
                      <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
                         <HeroSection previewConfig={localConfig} onNavigate={() => {}} />
                         <EventSection previewConfig={localConfig} />
                         <ActionSection previewConfig={localConfig} onNavigate={() => {}} />
                         <AboutSection previewConfig={localConfig} />
                      </div>
                      {/* Interactive Mask Overlay */}
                      <div className="absolute inset-0 pointer-events-none border-[12px] border-black/50 rounded-[2.5rem]" />
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bible' && <BibleAdmin />}

          {activeTab === 'presence' && (
             <div className="space-y-8">
                <div className="flex items-center justify-between mb-8">
                   <h2 className="text-4xl font-display uppercase tracking-tight">Controle de Presença</h2>
                </div>
                <div className="bg-[#1a1a1a] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl relative min-h-[600px]">
                   <PresenceCounter onBack={() => setActiveTab('analytics')} />
                </div>
             </div>
          )}

          {activeTab === 'automation' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-4xl font-display uppercase tracking-tight">Keepalive</h2>
                <button 
                  onClick={() => keepalive.triggerKeepalive()} 
                  disabled={keepalive.isPinging}
                  className="flex items-center gap-2 bg-brand-neon text-black px-6 py-3 rounded-xl font-bold uppercase text-xs shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Zap size={16} className={keepalive.isPinging ? 'animate-spin' : ''} /> Ping Manual
                </button>
              </div>

              <div className="bg-[#1a1a1a] p-8 rounded-[2.5rem] border border-white/5 shadow-xl space-y-10">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                       <h3 className="text-xl font-bold uppercase mb-1">Status do Banco de Dados</h3>
                       <p className="text-white/40 text-xs font-medium">Previne que o Supabase entre em hibernação simulando atividade.</p>
                    </div>
                    <div className="flex items-center gap-5 bg-black/40 p-5 rounded-3xl border border-white/5">
                        <div className="text-right">
                           <span className="text-[9px] uppercase font-bold text-white/30 block mb-1">Próximo Ping Automático</span>
                           <span className="text-3xl font-mono text-brand-neon tracking-tighter">
                             {Math.floor(keepalive.timeToNextPing / 60000)}:{(keepalive.timeToNextPing % 60000 / 1000).toFixed(0).padStart(2, '0')}
                           </span>
                        </div>
                        <div className="w-14 h-14 rounded-full border-4 border-white/5 flex items-center justify-center relative bg-black/20">
                           <motion.div 
                              className="absolute inset-0 border-4 border-brand-neon rounded-full" 
                              animate={{ opacity: [0.2, 1, 0.2] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                           />
                           <Activity className="text-brand-neon" size={24} />
                        </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center gap-2 text-white/30">
                       <Terminal size={14} />
                       <h4 className="text-[10px] uppercase font-bold tracking-widest">Logs de Automação</h4>
                    </div>
                    <div className="bg-black/40 rounded-3xl border border-white/5 overflow-hidden">
                       <div className="p-4 border-b border-white/5 bg-white/5 grid grid-cols-3 text-[9px] font-bold uppercase tracking-widest text-white/40">
                          <span>Evento</span>
                          <span>Data / Hora</span>
                          <span className="text-right">Status</span>
                       </div>
                       <div className="max-h-[350px] overflow-y-auto custom-scrollbar divide-y divide-white/5">
                          {keepalive.logs.map(log => (
                             <div key={log.id} className="p-4 grid grid-cols-3 text-xs items-center hover:bg-white/5 transition-colors">
                                <span className="font-mono text-brand-neon font-bold uppercase text-[10px]">{log.event_type}</span>
                                <span className="text-white/40 font-medium">{new Date(log.created_at).toLocaleString('pt-BR')}</span>
                                <div className="flex justify-end">
                                   <div className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase flex items-center gap-1.5 ${log.status === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                      <div className={`w-1.5 h-1.5 rounded-full ${log.status === 'success' ? 'bg-green-400' : 'bg-red-400'}`} />
                                      {log.status}
                                   </div>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
