
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Clock, Calendar, Users, ArrowLeft, Lock, Layout, Save, RotateCcw, ChevronDown, ChevronRight, Activity, RefreshCw, Presentation, List, PieChart, User } from 'lucide-react';
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

const ColorPicker: React.FC<{ label: string; value: string; onChange: (val: string) => void }> = ({ label, value, onChange }) => (
    <div className="flex flex-col gap-2">
        <label className="text-white/70 text-xs uppercase font-bold tracking-wider">{label}</label>
        <div className="flex items-center gap-3">
            <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-10 h-10 rounded-lg border-2 border-white/20 cursor-pointer bg-transparent" />
            <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 bg-black border border-white/20 rounded-lg px-3 py-2 text-white text-sm font-mono uppercase focus:border-brand-neon focus:outline-none" />
        </div>
    </div>
);

const TextInput: React.FC<{ label: string; value: string; onChange: (val: string) => void; multiline?: boolean }> = ({ label, value, onChange, multiline }) => (
    <div className="flex flex-col gap-2">
        <label className="text-white/70 text-xs uppercase font-bold tracking-wider">{label}</label>
        {multiline ? (
            <textarea value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:border-brand-neon focus:outline-none h-24 resize-none" />
        ) : (
            <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:border-brand-neon focus:outline-none" />
        )}
    </div>
);

const SectionAccordion: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-white/10 last:border-none">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-4 bg-[#1a1a1a] hover:bg-[#252525] transition-colors">
                <span className="font-bold text-white uppercase text-sm tracking-wide">{title}</span>
                {isOpen ? <ChevronDown size={16} className="text-white/50" /> : <ChevronRight size={16} className="text-white/50" />}
            </button>
            {isOpen && <div className="p-4 bg-[#111] space-y-6 border-t border-white/5">{children}</div>}
        </div>
    );
}

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode; color: string; loading?: boolean }> = ({ title, value, icon, color, loading }) => (
    <div className={`bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 relative overflow-hidden group transition-colors border-white/5`}>
      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`} style={{ color }}>{icon}</div>
      <div className="relative z-10">
        <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4 bg-white/5" style={{ color }}>{icon}</div>
        <h3 className="text-white/50 text-xs font-sans font-bold uppercase tracking-widest mb-1">{title}</h3>
        {loading ? <div className="h-10 w-24 bg-white/10 rounded animate-pulse" /> : <div className="text-4xl font-display text-white">{value}</div>}
      </div>
    </div>
);

// --- COMPONENTE DE AUDITORIA DE PRESENÇA ---
const PresenceControl: React.FC = () => {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
    const [selectedResp, setSelectedResp] = useState<any | null>(null);

    useEffect(() => {
        const fetchRecords = async () => {
            const { data } = await supabase.from('presence_records').select('*').order('created_at', { ascending: false });
            if (data) setRecords(data);
            setLoading(false);
        };
        fetchRecords();
    }, []);

    // Added useMemo to React imports
    const groupedData = useMemo(() => {
        return records.reduce((acc: any, record) => {
            const m = record.month;
            if (!acc[m]) acc[m] = { total: 0, sectors: {}, responsibles: [] };
            acc[m].total += record.total_general;
            acc[m].responsibles.push(record);
            SECTORS_LIST.forEach(s => {
                acc[m].sectors[s] = (acc[m].sectors[s] || 0) + (record.sectors?.[s] || 0);
            });
            return acc;
        }, {});
    }, [records]);

    if (loading) return <div className="p-10 text-center uppercase tracking-widest opacity-20">Carregando Auditoria...</div>;

    const months = Object.keys(groupedData);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
                <PieChart className="text-brand-neon" />
                <h2 className="text-2xl font-display uppercase tracking-wider">Controle de Presença</h2>
            </div>

            {selectedResp ? (
                <div className="bg-[#1a1a1a] border-2 border-brand-pink p-8 rounded-3xl">
                    <button onClick={() => setSelectedResp(null)} className="flex items-center gap-2 text-brand-pink font-bold uppercase text-xs mb-6"><ArrowLeft size={14} /> Voltar ao Mês</button>
                    <h3 className="text-3xl font-display uppercase mb-2">{selectedResp.responsible}</h3>
                    <p className="text-white/40 text-xs uppercase font-bold tracking-widest mb-8">{selectedResp.month} • {new Date(selectedResp.created_at).toLocaleString()}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {SECTORS_LIST.map(s => selectedResp.sectors?.[s] > 0 && (
                            <div key={s} className="bg-black/40 p-4 rounded-xl border border-white/10">
                                <span className="block text-[10px] text-white/40 font-bold uppercase mb-1">Setor {s}</span>
                                <span className="text-2xl font-mono text-brand-pink">{selectedResp.sectors[s]}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                        <span className="font-display text-xl uppercase">Total do Culto</span>
                        <span className="text-4xl font-display text-brand-pink">{selectedResp.total_general}</span>
                    </div>
                </div>
            ) : selectedMonth ? (
                <div className="space-y-6">
                    <div className="bg-[#1a1a1a] border-2 border-brand-neon p-8 rounded-3xl">
                        <button onClick={() => setSelectedMonth(null)} className="flex items-center gap-2 text-brand-neon font-bold uppercase text-xs mb-6"><ArrowLeft size={14} /> Voltar aos Meses</button>
                        <h3 className="text-5xl font-display uppercase text-brand-neon mb-8">{selectedMonth}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">Total Geral do Mês</h4>
                                <span className="text-7xl font-display">{groupedData[selectedMonth].total}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {SECTORS_LIST.map(s => groupedData[selectedMonth].sectors[s] > 0 && (
                                    <div key={s} className="bg-black/20 p-2 rounded-lg border border-white/5">
                                        <span className="block text-[8px] text-white/30 font-bold uppercase">{s}</span>
                                        <span className="text-sm font-mono text-brand-neon">{groupedData[selectedMonth].sectors[s]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 px-2 mb-2">Cultos por Responsável</h4>
                        {groupedData[selectedMonth].responsibles.map((r: any) => (
                            <button key={r.id} onClick={() => setSelectedResp(r)} className="w-full flex items-center justify-between p-5 bg-[#1a1a1a] hover:bg-[#222] border border-white/5 rounded-2xl transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/30 group-hover:text-brand-pink"><User size={20} /></div>
                                    <span className="font-bold uppercase tracking-wide">{r.responsible}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-mono text-xl">{r.total_general}</span>
                                    <ChevronRight size={16} className="text-white/20" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-2">
                    {months.map(m => (
                        <button key={m} onClick={() => setSelectedMonth(m)} className="w-full flex items-center justify-between p-6 bg-[#1a1a1a] hover:bg-brand-neon hover:text-black border border-white/10 rounded-2xl transition-all group">
                            <span className="text-2xl font-display uppercase tracking-widest">{m}</span>
                            <div className="flex items-center gap-4">
                                <span className="font-mono text-lg opacity-50">{groupedData[m].responsibles.length} Cultos</span>
                                <ChevronRight size={20} className="opacity-20 group-hover:opacity-100" />
                            </div>
                        </button>
                    ))}
                    {months.length === 0 && <div className="p-20 text-center opacity-20 uppercase tracking-widest">Nenhum registro encontrado.</div>}
                </div>
            )}
        </div>
    );
};

interface AdminDashboardProps {
  onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const stats = useAnalyticsDashboard();
  const { config, saveConfig, resetConfig } = useSiteConfig();
  const { logs, refreshLogs, autoPingEnabled, setAutoPingEnabled, timeToNextPing } = useKeepalive();
  
  const [draftConfig, setDraftConfig] = useState<SiteConfig>(config);
  const [activeTab, setActiveTab] = useState<'analytics' | 'builder' | 'keepalive' | 'presence'>('analytics');
  const [adminView, setAdminView] = useState<'menu' | 'dashboard' | 'presence'>('menu');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  React.useEffect(() => {
    if (config) setDraftConfig({ ...DEFAULT_SITE_CONFIG, ...config });
  }, [config]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'umademats2026' || password === 'admin' || password === 'macuxi') {
      setIsAuthenticated(true);
    } else { alert('Senha incorreta'); }
  };

  const handleConfigChange = (key: keyof SiteConfig, value: any) => { setDraftConfig(prev => ({ ...prev, [key]: value })); };

  const formatTime = (isoString: string | null) => {
    if (!isoString) return 'Nunca executado';
    return new Date(isoString).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
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
         <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-3xl p-8 text-center">
            <div className="w-16 h-16 bg-brand-neon rounded-full flex items-center justify-center mx-auto mb-6"><Lock className="text-black" size={32} /></div>
            <h2 className="text-2xl font-display text-white mb-2">Área Restrita</h2>
            <form onSubmit={handleLogin} className="flex flex-col gap-4 mt-6">
               <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-neon" />
               <button type="submit" className="w-full bg-brand-neon text-black font-bold uppercase py-3 rounded-xl hover:bg-brand-neon/80 transition-colors"> Acessar </button>
            </form>
            <button onClick={onBack} className="mt-6 text-white/30 text-xs hover:text-white uppercase font-bold tracking-widest">Voltar ao Site</button>
         </motion.div>
      </div>
    );
  }

  if (adminView === 'menu') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 gap-8">
        <h2 className="text-3xl font-display uppercase text-white tracking-widest">Painel Administrativo</h2>
        <div className="flex flex-col gap-3 w-full max-w-sm">
          <button 
            onClick={() => setAdminView('dashboard')}
            className="w-full bg-[#1a1a1a] border-2 border-white/10 hover:border-brand-neon p-6 rounded-lg text-lg font-bold uppercase text-white transition-all text-center"
          >
            Área Admin
          </button>
          <button 
            onClick={() => setAdminView('presence')}
            className="w-full bg-brand-neon text-black p-6 rounded-lg text-lg font-bold uppercase transition-all text-center"
          >
            Contador de Presença
          </button>
        </div>
        <button onClick={onBack} className="text-white/30 hover:text-white uppercase font-bold text-sm tracking-widest flex items-center gap-2">
          <ArrowLeft size={16} /> Voltar ao Site
        </button>
      </div>
    );
  }

  if (adminView === 'presence') { return <PresenceCounter onBack={() => setAdminView('menu')} />; }

  return (
    <div className="min-h-screen bg-black flex flex-col h-screen overflow-hidden text-white font-sans">
      <div className="border-b border-white/10 flex flex-col md:flex-row items-center justify-between bg-[#0f0f0f] shrink-0 z-50">
         <div className="w-full md:w-auto h-16 flex items-center px-4 md:px-6">
             <div className="flex items-center gap-4">
                 <button onClick={() => setAdminView('menu')} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"><ArrowLeft size={20} /></button>
                 <div className="h-6 w-px bg-white/10 hidden md:block" />
                 <h1 className="text-lg font-display uppercase text-white tracking-wide"> Admin <span className="text-brand-neon">Panel</span> </h1>
             </div>
         </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* MENU LATERAL ESTILO LISTA */}
        <aside className="w-full md:w-64 border-r border-white/10 bg-[#0f0f0f] overflow-y-auto flex flex-col shrink-0 p-4 gap-2">
            <button onClick={() => setActiveTab('analytics')} className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl font-bold uppercase text-xs tracking-widest transition-all ${activeTab === 'analytics' ? 'bg-white text-black' : 'text-white/40 hover:bg-white/5'}`}>
                <BarChart3 size={18} /> Analytics
            </button>
            <button onClick={() => setActiveTab('presence')} className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl font-bold uppercase text-xs tracking-widest transition-all ${activeTab === 'presence' ? 'bg-brand-pink text-white' : 'text-white/40 hover:bg-white/5'}`}>
                <List size={18} /> Presença
            </button>
            <button onClick={() => setActiveTab('keepalive')} className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl font-bold uppercase text-xs tracking-widest transition-all ${activeTab === 'keepalive' ? 'bg-blue-600 text-white' : 'text-white/40 hover:bg-white/5'}`}>
                <Activity size={18} /> Monitor
            </button>
            <button onClick={() => setActiveTab('builder')} className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl font-bold uppercase text-xs tracking-widest transition-all ${activeTab === 'builder' ? 'bg-brand-neon text-black' : 'text-white/40 hover:bg-white/5'}`}>
                <Layout size={18} /> Config
            </button>

            {activeTab === 'builder' && (
                <div className="mt-8 pt-6 border-t border-white/5">
                    <SectionAccordion title="Cores e Textos" defaultOpen>
                        <TextInput label="Título 1" value={draftConfig.hero_titleLine1} onChange={(val) => handleConfigChange('hero_titleLine1', val)} />
                        <ColorPicker label="Cor Neon" value={draftConfig.hero_accentColor} onChange={(val) => handleConfigChange('hero_accentColor', val)} />
                    </SectionAccordion>
                    <div className="mt-4 flex flex-col gap-2">
                        <button onClick={() => saveConfig(draftConfig)} className="w-full bg-brand-neon text-black font-bold uppercase py-3 rounded-xl flex items-center justify-center gap-2"><Save size={18} /> Salvar</button>
                        <button onClick={resetConfig} className="w-full bg-white/5 text-white/40 font-bold uppercase py-2 rounded-xl text-[10px]">Resetar</button>
                    </div>
                </div>
            )}
        </aside>

        <main className="flex-1 overflow-y-auto bg-black p-4 md:p-8 custom-scrollbar">
          {activeTab === 'presence' && <PresenceControl />}

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
                       <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400"><Activity size={32} /></div>
                       <div><h2 className="text-xl font-display uppercase text-white tracking-widest">Monitor Automático</h2></div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end"><span className="text-[10px] uppercase font-bold text-white/30">Próximo ping em:</span><span className="text-2xl font-mono text-blue-400">{formatCountdown(timeToNextPing)}</span></div>
                        <button onClick={() => setAutoPingEnabled(!autoPingEnabled)} className={`w-14 h-8 rounded-full relative transition-colors p-1 ${autoPingEnabled ? 'bg-blue-600' : 'bg-white/10'}`}><motion.div animate={{ x: autoPingEnabled ? 24 : 0 }} className="w-6 h-6 bg-white rounded-full shadow-lg" /></button>
                    </div>
                </div>
                <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl overflow-hidden">
                   <div className="p-6 border-b border-white/5 flex items-center justify-between"><h3 className="font-bold uppercase tracking-wider text-white/50 text-sm">Histórico</h3><button onClick={refreshLogs} className="p-2 hover:bg-white/5 rounded-full transition-colors"><RefreshCw size={16} /></button></div>
                   <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left text-sm">
                           <thead className="sticky top-0 bg-[#1a1a1a] text-white/30 text-[10px] uppercase tracking-widest border-b border-white/5"><tr><th className="px-6 py-3 font-bold">Data/Hora</th><th className="px-6 py-3 font-bold">Evento</th><th className="px-6 py-3 font-bold">Status</th></tr></thead>
                           <tbody className="divide-y divide-white/5">{logs.map((log) => (<tr key={log.id} className="hover:bg-white/[0.02] transition-colors"><td className="px-6 py-4 text-white/60 font-mono text-xs">{formatTime(log.created_at)}</td><td className="px-6 py-4 font-bold text-xs uppercase text-white/80">{log.event_type}</td><td className="px-6 py-4 font-bold text-[10px] uppercase text-green-500">{log.status}</td></tr>))}</tbody>
                        </table>
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'builder' && (
             <div className="w-full h-full rounded-2xl border-4 border-white/5 overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 left-0 right-0 bg-white/10 backdrop-blur-md p-2 flex items-center justify-between z-40 border-b border-white/10"><span className="text-[10px] font-bold text-white/50 uppercase px-3">Live Preview</span></div>
                <div className="w-full h-full origin-top scale-[0.6] md:scale-[0.8] lg:scale-100 bg-white"><div className="h-full overflow-y-auto overflow-x-hidden no-scrollbar"><HeroSection previewConfig={draftConfig} /><EventSection previewConfig={draftConfig} /><ActionSection previewConfig={draftConfig} /><AboutSection previewConfig={draftConfig} /></div></div>
             </div>
          )}
        </main>
      </div>
    </div>
  );
};
