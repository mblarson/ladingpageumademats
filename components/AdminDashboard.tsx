
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Clock, Calendar, Users, ArrowLeft, Lock, Layout, Save, RotateCcw, ChevronDown, ChevronRight, Activity, RefreshCw, Presentation, List, PieChart, User, Menu, X, BookOpen, Trophy, Flame } from 'lucide-react';
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

// --- COMPONENTE DE ANALYTICS DA LEITURA BÍBLICA (NOVO) ---
const BibleAnalytics: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<{id: string, name: string}[]>([]);
    const [topUser, setTopUser] = useState<{name: string, count: number} | null>(null);
    const [streakUsers, setStreakUsers] = useState<string[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Busca EXCLUSIVAMENTE da tabela user_progress
                const { data, error } = await supabase
                    .from('user_progress')
                    .select('user_id, user_name, created_at');
                
                if (error) throw error;
                if (!data) return;

                // 1. Processar Usuários Únicos
                const uniqueUsersMap = new Map();
                data.forEach(row => {
                    if (row.user_id && row.user_name) {
                        uniqueUsersMap.set(row.user_id, row.user_name);
                    }
                });
                const userList = Array.from(uniqueUsersMap.entries()).map(([id, name]) => ({ id, name }));
                setUsers(userList);

                // 2. Processar Usuário Mais Avançado (Maior qtd de registros)
                const progressCount: Record<string, number> = {};
                const lastActivity: Record<string, string> = {}; // Para desempate

                data.forEach(row => {
                    progressCount[row.user_id] = (progressCount[row.user_id] || 0) + 1;
                    
                    // Guarda a data mais recente
                    if (!lastActivity[row.user_id] || new Date(row.created_at) > new Date(lastActivity[row.user_id])) {
                        lastActivity[row.user_id] = row.created_at;
                    }
                });
                
                let maxCount = 0;
                let topUserId = null;
                
                Object.entries(progressCount).forEach(([uid, count]) => {
                    if (count > maxCount) {
                        maxCount = count;
                        topUserId = uid;
                    } else if (count === maxCount) {
                        // Desempate pela atividade mais recente
                        if (topUserId && lastActivity[uid] > lastActivity[topUserId]) {
                            topUserId = uid;
                        }
                    }
                });

                if (topUserId) {
                    setTopUser({
                        name: uniqueUsersMap.get(topUserId) || 'Desconhecido',
                        count: maxCount
                    });
                }

                // 3. Processar Streak de 3 Dias (Hoje, Ontem, Anteontem)
                // Usamos ISO string (UTC) para consistência com o banco
                const today = new Date();
                const d1 = new Date(); d1.setDate(d1.getDate() - 1);
                const d2 = new Date(); d2.setDate(d2.getDate() - 2);

                const targetDates = [
                    today.toISOString().split('T')[0],
                    d1.toISOString().split('T')[0],
                    d2.toISOString().split('T')[0]
                ];

                const userDates: Record<string, Set<string>> = {};
                
                data.forEach(row => {
                    if (!row.created_at) return;
                    const dateStr = row.created_at.split('T')[0]; // Pega YYYY-MM-DD
                    if (!userDates[row.user_id]) userDates[row.user_id] = new Set();
                    userDates[row.user_id].add(dateStr);
                });

                const streaks: string[] = [];
                Object.entries(userDates).forEach(([uid, datesSet]) => {
                    // Verifica se o usuário tem atividade em TODOS os 3 dias alvo
                    const hasStreak = targetDates.every(date => datesSet.has(date));
                    if (hasStreak) {
                        streaks.push(uniqueUsersMap.get(uid) || 'Desconhecido');
                    }
                });
                setStreakUsers(streaks);

            } catch (err) {
                console.error("Erro ao carregar dados bíblicos:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="p-10 text-center uppercase tracking-widest opacity-20">Carregando Dados Bíblicos...</div>;

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
             <div className="flex items-center gap-3 mb-4">
                <BookOpen className="text-brand-purple" />
                <h2 className="text-2xl font-display uppercase tracking-wider">Analytics da Leitura</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* CARD: Usuários Cadastrados */}
                <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white"><Users size={20} /></div>
                            <h3 className="font-bold uppercase text-sm tracking-wide text-white/70">Usuários Ativos</h3>
                         </div>
                         <span className="text-3xl font-display text-white">{users.length}</span>
                    </div>
                    
                    <div className="mt-2 pr-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left">
                            <tbody className="divide-y divide-white/5">
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td className="py-2 text-xs font-bold uppercase text-white/50">{u.name}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                 {/* CARD: Mais Avançado */}
                 <div className="bg-[#1a1a1a] border-2 border-brand-neon rounded-3xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Trophy size={80} />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-brand-neon font-bold uppercase text-xs tracking-widest mb-4">Maior Progresso</h3>
                        {topUser ? (
                            <div className="flex flex-col gap-1">
                                <span className="text-3xl font-display text-white uppercase">{topUser.name}</span>
                                <span className="text-sm font-mono text-white/50">{topUser.count} capítulos concluídos</span>
                            </div>
                        ) : (
                            <span className="text-white/30 text-sm uppercase">Nenhum dado</span>
                        )}
                    </div>
                </div>

            </div>

             {/* LISTA: Ofensiva 3 Dias */}
             <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-500"><Flame size={20} /></div>
                    <div>
                        <h3 className="font-bold uppercase text-sm tracking-wide text-white">Em Chamas (Últimos 3 dias)</h3>
                        <p className="text-[10px] uppercase text-white/30 font-bold">Leitura consecutiva: Hoje, Ontem e Anteontem</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {streakUsers.length > 0 ? streakUsers.map((name, idx) => (
                        <div key={idx} className="bg-black/40 border border-white/5 p-3 rounded-xl flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                             <span className="text-xs font-bold uppercase text-white/80">{name}</span>
                        </div>
                    )) : (
                        <div className="col-span-3 text-center py-8 opacity-30 uppercase text-xs font-bold tracking-widest">
                            Ninguém completou a sequência ainda.
                        </div>
                    )}
                </div>
             </div>
        </div>
    );
};

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

    const groupedData = useMemo(() => {
        return records.reduce((acc: any, record) => {
            // REGRA: O Mês é uma ENTIDADE ÚNICA. Sanitizamos a string para garantir agrupamento.
            if (!record.month) return acc;
            const m = record.month.trim().toUpperCase(); 

            if (!acc[m]) acc[m] = { total: 0, sectors: {}, responsibles: [] };
            
            // REGRA: Soma aritmética dos totais
            acc[m].total += (Number(record.total_general) || 0);
            
            // REGRA: Manter vínculo com responsável (Log individual)
            acc[m].responsibles.push(record);
            
            // REGRA: Soma agregada por setores
            SECTORS_LIST.forEach(s => {
                const currentVal = acc[m].sectors[s] || 0;
                const recordVal = Number(record.sectors?.[s]) || 0;
                acc[m].sectors[s] = currentVal + recordVal;
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
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {SECTORS_LIST.map(s => groupedData[selectedMonth].sectors[s] > 0 && (
                                    <div key={s} className="bg-black/20 px-2 py-1 rounded border border-white/5 flex items-center justify-between">
                                        <span className="text-[10px] text-white/40 font-bold uppercase">{s}</span>
                                        <span className="text-xs font-mono font-bold text-brand-neon">{groupedData[selectedMonth].sectors[s]}</span>
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
  const [activeTab, setActiveTab] = useState<'analytics' | 'builder' | 'keepalive' | 'presence' | 'bible'>('analytics');
  const [adminView, setAdminView] = useState<'menu' | 'dashboard' | 'presence'>('menu');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            className="w-full bg-[#1a1a1a] border-2 border-white/10 hover:border-brand-neon p-6 rounded-lg text-lg font-bold uppercase text-white transition-all text-center"
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

  const TABS = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'bg-white', textColor: 'text-black' },
    { id: 'bible', label: 'Leitura Bíblica', icon: BookOpen, color: 'bg-brand-purple', textColor: 'text-white' },
    { id: 'presence', label: 'Presença', icon: List, color: 'bg-brand-pink', textColor: 'text-white' },
    { id: 'keepalive', label: 'Monitor', icon: Activity, color: 'bg-blue-500', textColor: 'text-white' },
    { id: 'builder', label: 'Config', icon: Layout, color: 'bg-brand-neon', textColor: 'text-black' }
  ];

  const currentTab = TABS.find(t => t.id === activeTab) || TABS[0];

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
        {/* MENU LATERAL ESTILO DROPDOWN (Pill Shape) */}
        <aside className="w-full md:w-80 border-r border-white/10 bg-[#0f0f0f] overflow-visible flex flex-col shrink-0 p-6 gap-2 relative z-40">
            <h3 className="text-[10px] uppercase font-bold text-white/30 tracking-[0.2em] mb-4 ml-2">Navegação</h3>
            
            <div className="relative z-50">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`w-full rounded-full px-6 py-4 flex items-center justify-between border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] relative overflow-hidden group transition-all active:scale-95 ${currentTab.color}`}
                >
                   <div className="flex items-center gap-3">
                       <currentTab.icon size={20} className={currentTab.textColor} />
                       <span className={`font-display italic text-2xl uppercase tracking-wide ${currentTab.textColor}`}>{currentTab.label}</span>
                   </div>
                   <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
                      {isMenuOpen ? <X className={currentTab.textColor} size={18} /> : <Menu className={currentTab.textColor} size={18} />}
                   </div>
                </button>

                <AnimatePresence>
                   {isMenuOpen && (
                     <motion.div
                       initial={{ opacity: 0, y: -10, scale: 0.95 }}
                       animate={{ opacity: 1, y: 0, scale: 1 }}
                       exit={{ opacity: 0, y: -10, scale: 0.95 }}
                       className="absolute top-[calc(100%+10px)] left-0 right-0 bg-[#1a1a1a] border-2 border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col p-2 gap-1"
                     >
                        {TABS.map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id as any); setIsMenuOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id ? 'bg-white/10' : 'hover:bg-white/5'}`}
                          >
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tab.color}`}>
                                <tab.icon size={14} className={tab.textColor} />
                             </div>
                             <span className="font-bold uppercase text-sm tracking-widest text-white">{tab.label}</span>
                             {activeTab === tab.id && <div className="ml-auto w-2 h-2 bg-brand-neon rounded-full" />}
                          </button>
                        ))}
                     </motion.div>
                   )}
                </AnimatePresence>
            </div>

            {/* Config Inputs if Builder Active */}
            {activeTab === 'builder' && (
                <div className="mt-8 pt-6 border-t border-white/5 animate-in slide-in-from-left-4 fade-in duration-300">
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

          {activeTab === 'bible' && <BibleAnalytics />}

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
