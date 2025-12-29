import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Clock, Calendar, Users, ArrowLeft, Lock, Palette, Layout, Type, Image as ImageIcon, Save, RotateCcw, ChevronDown, ChevronRight, Activity, Server, RefreshCw, CheckCircle2, AlertCircle, Play, Pause, Zap, Github, Copy, ListOrdered, KeyRound } from 'lucide-react';
import { useAnalyticsDashboard } from '../hooks/useSiteAnalytics';
import { useSiteConfig, SiteConfig, DEFAULT_SITE_CONFIG } from '../hooks/useSiteConfig';
import { useKeepalive } from '../hooks/useKeepalive';
import { HeroSection } from './HeroSection';
import { EventSection } from './EventSection';
import { ActionSection } from './ActionSection';
import { AboutSection } from './AboutSection';

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
    <div className={`bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 relative overflow-hidden group transition-colors border-white/5`}>
      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`} style={{ color }}>
         {icon}
      </div>
      <div className="relative z-10">
        <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4 bg-white/5" style={{ color }}>
          {icon}
        </div>
        <h3 className="text-white/50 text-xs font-sans font-bold uppercase tracking-widest mb-1">{title}</h3>
        {loading ? <div className="h-10 w-24 bg-white/10 rounded animate-pulse" /> : <div className="text-4xl font-display text-white">{value}</div>}
      </div>
    </div>
);

interface AdminDashboardProps {
  onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const stats = useAnalyticsDashboard();
  const { config, saveConfig, resetConfig, loading: configLoading } = useSiteConfig();
  const { logs, lastRun, isPinging, triggerKeepalive, refreshLogs, autoPingEnabled, setAutoPingEnabled, timeToNextPing } = useKeepalive();
  
  const [draftConfig, setDraftConfig] = useState<SiteConfig>(config);
  const [activeTab, setActiveTab] = useState<'analytics' | 'builder' | 'keepalive'>('analytics');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  React.useEffect(() => {
    if (config) setDraftConfig({ ...DEFAULT_SITE_CONFIG, ...config });
  }, [config]);

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

  const yamlCode = `name: Supabase Keepalive
on:
  schedule:
    - cron: '0 */4 * * *'
  workflow_dispatch:

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Acordar Banco
        run: |
          curl -X POST "\${{ secrets.SUPABASE_URL }}/rest/v1/automation_logs" \\
          -H "apikey: \${{ secrets.SUPABASE_ANON_KEY }}" \\
          -H "Authorization: Bearer \${{ secrets.SUPABASE_ANON_KEY }}" \\
          -H "Content-Type: application/json" \\
          -d '{"event_type": "keepalive_github", "status": "success", "details": {"source": "github_action"}}'`;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
         <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-3xl p-8 text-center">
            <div className="w-16 h-16 bg-brand-neon rounded-full flex items-center justify-center mx-auto mb-6"><Lock className="text-black" size={32} /></div>
            <h2 className="text-2xl font-display text-white mb-2">Área Restrita</h2>
            <form onSubmit={handleLogin} className="flex flex-col gap-4 mt-6">
               <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-neon transition-colors" />
               <button type="submit" className="w-full bg-brand-neon text-black font-bold uppercase py-3 rounded-xl hover:bg-brand-neon/80 transition-colors"> Acessar </button>
            </form>
            <button onClick={onBack} className="mt-6 text-white/30 text-xs hover:text-white uppercase font-bold tracking-widest">Voltar ao Site</button>
         </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col h-screen overflow-hidden text-white font-sans">
      <div className="border-b border-white/10 flex flex-col md:flex-row items-center justify-between bg-[#0f0f0f] shrink-0 z-50">
         <div className="w-full md:w-auto h-16 flex items-center px-4 md:px-6">
             <div className="flex items-center gap-4">
                 <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"><ArrowLeft size={20} /></button>
                 <div className="h-6 w-px bg-white/10 hidden md:block" />
                 <h1 className="text-lg font-display uppercase text-white tracking-wide"> Admin <span className="text-brand-neon">Panel</span> </h1>
             </div>
         </div>
         <div className="w-full md:w-auto px-4 pb-4 md:pb-0 md:pr-6">
            <div className="flex bg-white/5 rounded-lg p-1 gap-1 w-full md:w-auto">
                <button onClick={() => setActiveTab('analytics')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'analytics' ? 'bg-white text-black shadow-lg' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                    <BarChart3 size={16} /> <span className="hidden sm:inline">Analytics</span>
                </button>
                 <button onClick={() => setActiveTab('keepalive')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'keepalive' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                    <Activity size={16} /> <span>Monitor</span>
                </button>
                <button onClick={() => setActiveTab('builder')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'builder' ? 'bg-brand-neon text-black shadow-lg' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                    <Layout size={16} /> <span>Config</span>
                </button>
            </div>
         </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {activeTab === 'builder' && (
          <aside className="w-full md:w-80 border-r border-white/10 bg-[#0f0f0f] overflow-y-auto custom-scrollbar flex flex-col shrink-0">
            <div className="flex-1">
                <SectionAccordion title="Hero Section" defaultOpen>
                    <ColorPicker label="Cor de Fundo" value={draftConfig.hero_bgColor} onChange={(val) => handleConfigChange('hero_bgColor', val)} />
                    <ColorPicker label="Cor Accent (Neon)" value={draftConfig.hero_accentColor} onChange={(val) => handleConfigChange('hero_accentColor', val)} />
                    <TextInput label="Título Linha 1" value={draftConfig.hero_titleLine1} onChange={(val) => handleConfigChange('hero_titleLine1', val)} />
                    <TextInput label="Título Linha 2" value={draftConfig.hero_titleLine2} onChange={(val) => handleConfigChange('hero_titleLine2', val)} />
                </SectionAccordion>
                <SectionAccordion title="Event Section">
                    <TextInput label="Título do Evento" value={draftConfig.event_title} onChange={(val) => handleConfigChange('event_title', val)} />
                    <TextInput label="Badge/Subtítulo" value={draftConfig.event_badge} onChange={(val) => handleConfigChange('event_badge', val)} />
                    <TextInput label="Localização" value={draftConfig.event_location} onChange={(val) => handleConfigChange('event_location', val)} />
                </SectionAccordion>
            </div>
            <div className="p-4 border-t border-white/10 bg-[#151515] sticky bottom-0 flex flex-col gap-2">
                <button onClick={() => saveConfig(draftConfig)} className="w-full bg-brand-neon text-black font-bold uppercase py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg"><Save size={18} /> Salvar Alterações</button>
                <button onClick={resetConfig} className="w-full bg-white/5 text-white/50 font-bold uppercase py-2 rounded-xl text-[10px] flex items-center justify-center gap-2 hover:bg-white/10 hover:text-white"><RotateCcw size={14} /> Resetar Padrão</button>
            </div>
          </aside>
        )}

        <main className="flex-1 overflow-y-auto bg-black p-4 md:p-8 custom-scrollbar">
          {activeTab === 'analytics' && (
            <div className="max-w-6xl mx-auto space-y-8">
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  <StatCard title="Total de Visitas" value={stats.total} icon={<Users />} color="#ccff00" loading={stats.loading} />
                  <StatCard title="Últimos 30 dias" value={stats.last30d} icon={<Calendar />} color="#ec4899" loading={stats.loading} />
                  <StatCard title="Últimos 7 dias" value={stats.last7d} icon={<Clock />} color="#a855f7" loading={stats.loading} />
                  <StatCard title="Últimas 24 horas" value={stats.last24h} icon={<BarChart3 />} color="#3b82f6" loading={stats.loading} />
               </div>
            </div>
          )}

          {activeTab === 'keepalive' && (
             <div className="max-w-4xl mx-auto space-y-8">
                <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                       <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
                           <Activity size={32} />
                       </div>
                       <div>
                          <h2 className="text-xl font-display uppercase text-white">Keepalive Automático</h2>
                          <p className="text-white/40 text-sm">Previne o Supabase de entrar em modo repouso por inatividade.</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] uppercase font-bold text-white/30">Próximo ping em:</span>
                            <span className="text-2xl font-mono text-blue-400">{formatCountdown(timeToNextPing)}</span>
                        </div>
                        <button 
                          onClick={() => setAutoPingEnabled(!autoPingEnabled)}
                          className={`w-14 h-8 rounded-full relative transition-colors p-1 ${autoPingEnabled ? 'bg-blue-600' : 'bg-white/10'}`}
                        >
                           <motion.div animate={{ x: autoPingEnabled ? 24 : 0 }} className="w-6 h-6 bg-white rounded-full shadow-lg" />
                        </button>
                    </div>
                </div>

                <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl overflow-hidden">
                   <div className="p-6 border-b border-white/5 flex items-center justify-between">
                       <h3 className="font-bold uppercase tracking-wider text-white/50 text-sm">Histórico de Atividade</h3>
                       <button onClick={refreshLogs} className="p-2 hover:bg-white/5 rounded-full transition-colors"><RefreshCw size={16} /></button>
                   </div>
                   <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                      {logs.length === 0 ? (
                        <div className="p-12 text-center text-white/20 uppercase text-xs tracking-widest">Nenhum registro encontrado</div>
                      ) : (
                        <table className="w-full text-left text-sm">
                           <thead className="sticky top-0 bg-[#1a1a1a] text-white/30 text-[10px] uppercase tracking-widest border-b border-white/5">
                              <tr>
                                <th className="px-6 py-3 font-bold">Data/Hora</th>
                                <th className="px-6 py-3 font-bold">Evento</th>
                                <th className="px-6 py-3 font-bold">Status</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-white/5">
                              {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                                   <td className="px-6 py-4 text-white/60 font-mono text-xs">{formatTime(log.created_at)}</td>
                                   <td className="px-6 py-4">
                                      <span className="text-white font-bold">{log.event_type}</span>
                                      <span className="block text-[10px] text-white/30 uppercase mt-1">{log.details?.source || 'unknown'}</span>
                                   </td>
                                   <td className="px-6 py-4">
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${log.status === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                         {log.status}
                                      </span>
                                   </td>
                                </tr>
                              ))}
                           </tbody>
                        </table>
                      )}
                   </div>
                </div>

                <div className="bg-blue-900/10 border border-blue-500/20 rounded-3xl p-8 space-y-6">
                   <div className="flex items-center gap-3 text-blue-400">
                      <Github size={24} />
                      <h3 className="text-xl font-display uppercase">Automação Via GitHub</h3>
                   </div>
                   <p className="text-white/60 text-sm leading-relaxed">
                      Para garantir que o banco nunca hiberne mesmo sem usuários no admin, configure uma **GitHub Action** com o código abaixo. Ela fará um ping automático no seu banco a cada 4 horas.
                   </p>
                   
                   <div className="space-y-3">
                      <p className="text-white/40 text-xs">Para que o GitHub possa acessar seu banco com segurança:</p>
                      <div className="bg-blue-900/10 border border-blue-500/20 rounded-xl p-5 space-y-3">
                          <p className="text-blue-200 text-xs">Vá em <span className="font-bold italic">Settings &gt; Secrets and variables &gt; Actions</span> e clique em <span className="text-white font-bold">"New repository secret"</span>:</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                                 <span className="text-[10px] text-white/30 uppercase block mb-1">Nome</span>
                                 <code className="text-brand-neon font-bold">SUPABASE_URL</code>
                              </div>
                              <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                                 <span className="text-[10px] text-white/30 uppercase block mb-1">Nome</span>
                                 <code className="text-brand-neon font-bold">SUPABASE_ANON_KEY</code>
                              </div>
                          </div>
                      </div>
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'builder' && (
             <div className="w-full h-full rounded-2xl border-4 border-white/5 overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 left-0 right-0 bg-white/10 backdrop-blur-md p-2 flex items-center justify-between z-40 border-b border-white/10">
                    <span className="text-[10px] font-bold text-white/50 uppercase px-3">Live Preview</span>
                    <div className="flex gap-2 pr-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                    </div>
                </div>
                <div className="w-full h-full origin-top scale-[0.6] md:scale-[0.8] lg:scale-100 bg-white">
                    <div className="h-full overflow-y-auto overflow-x-hidden no-scrollbar">
                        <HeroSection previewConfig={draftConfig} />
                        <EventSection previewConfig={draftConfig} />
                        <ActionSection previewConfig={draftConfig} />
                        <AboutSection previewConfig={draftConfig} />
                    </div>
                </div>
             </div>
          )}
        </main>
      </div>
    </div>
  );
};