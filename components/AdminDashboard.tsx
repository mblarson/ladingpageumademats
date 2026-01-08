
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Clock, Calendar, Users, ArrowLeft, Lock, Layout, Save, RotateCcw, ChevronDown, ChevronRight, Activity, RefreshCw, Presentation, List, PieChart, User, Menu, X, BookOpen, Trophy, Flame, AlertCircle, Database, ChevronUp, MapPin, ClipboardList } from 'lucide-react';
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

// Componente para exibir dados em colunas de 7 itens
const ColumnLayout: React.FC<{ items: { label: string; value: string | number; onClick?: () => void }[]; accentColor: string }> = ({ items, accentColor }) => {
    const chunkedItems = useMemo(() => {
        const chunks = [];
        for (let i = 0; i < items.length; i += 7) {
            chunks.push(items.slice(i, i + 7));
        }
        return chunks;
    }, [items]);

    return (
        <div className="flex flex-wrap gap-x-12 gap-y-6">
            {chunkedItems.map((chunk, chunkIdx) => (
                <div key={chunkIdx} className="flex flex-col gap-2 min-w-[200px]">
                    {chunk.map((item, itemIdx) => (
                        <div 
                            key={itemIdx} 
                            onClick={item.onClick}
                            className={`flex items-center justify-between gap-4 py-1.5 border-b border-white/5 group ${item.onClick ? 'cursor-pointer hover:bg-white/5' : ''}`}
                        >
                            <span className="text-[11px] font-bold uppercase tracking-wider text-white/50 group-hover:text-white transition-colors">{item.label}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white/30">=</span>
                                <span className={`text-lg font-mono font-bold ${accentColor}`}>{item.value}</span>
                                {item.onClick && <ChevronRight size={12} className="text-white/20 group-hover:translate-x-1 transition-transform" />}
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

const BibleAnalytics: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<{id: string, name: string}[]>([]);
    const [todayCheckinUsers, setTodayCheckinUsers] = useState<string[]>([]);
    const [topUser, setTopUser] = useState<{name: string, count: number} | null>(null);
    const [streakUsers, setStreakUsers] = useState<string[]>([]);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    
    const [showReadersList, setShowReadersList] = useState(false);
    const [showTodayList, setShowTodayList] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setErrorMsg(null);
            
            try {
                const { data, error } = await supabase
                    .from('user_progress')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                
                if (!data || data.length === 0) {
                    setLoading(false);
                    return;
                }

                const uniqueUsersMap = new Map();
                data.forEach(row => {
                    if (row.user_id) {
                        const currentName = uniqueUsersMap.get(row.user_id);
                        const rowName = row.user_name;
                        if (rowName && rowName.trim() !== '') {
                            uniqueUsersMap.set(row.user_id, rowName);
                        } else if (!currentName) {
                            uniqueUsersMap.set(row.user_id, `Leitor ID: ${row.user_id.substring(0, 4)}`);
                        }
                    }
                });
                setUsers(Array.from(uniqueUsersMap.entries()).map(([id, name]) => ({ id, name })));

                const progressCount: Record<string, number> = {};
                const lastActivity: Record<string, string> = {};

                data.forEach(row => {
                    if (row.user_id) {
                        progressCount[row.user_id] = (progressCount[row.user_id] || 0) + 1;
                        const rowDate = row.created_at || '';
                        if (rowDate > (lastActivity[row.user_id] || '')) lastActivity[row.user_id] = rowDate;
                    }
                });
                
                let maxCount = 0;
                let topUserId = null;
                Object.entries(progressCount).forEach(([uid, count]) => {
                    if (count > maxCount) {
                        maxCount = count;
                        topUserId = uid;
                    } else if (count === maxCount) {
                        if (topUserId && lastActivity[uid] > (lastActivity[topUserId] || '')) topUserId = uid;
                    }
                });

                if (topUserId) {
                    setTopUser({ name: uniqueUsersMap.get(topUserId) || 'Desconhecido', count: maxCount });
                }

                const normalizeDate = (d: Date) => {
                    const offset = d.getTimezoneOffset() * 60000;
                    return new Date(d.getTime() - offset).toISOString().split('T')[0];
                };

                const now = new Date();
                const todayStr = normalizeDate(now);
                
                const d1 = new Date(); d1.setDate(now.getDate() - 1);
                const d2 = new Date(); d2.setDate(now.getDate() - 2);
                const d3 = new Date(); d3.setDate(now.getDate() - 3);
                
                const targetStreakDates = [
                    normalizeDate(d1),
                    normalizeDate(d2),
                    normalizeDate(d3)
                ];

                const userDates: Record<string, Set<string>> = {};
                const todayCheckinsSet = new Set<string>();
                
                data.forEach(row => {
                    if (!row.created_at || !row.user_id) return;
                    
                    const localDate = new Date(row.created_at);
                    const dateStr = normalizeDate(localDate);
                    
                    if (!userDates[row.user_id]) userDates[row.user_id] = new Set();
                    userDates[row.user_id].add(dateStr);

                    if (dateStr === todayStr) {
                        const name = uniqueUsersMap.get(row.user_id);
                        if (name) todayCheckinsSet.add(name);
                    }
                });

                setTodayCheckinUsers(Array.from(todayCheckinsSet));

                const streaks: string[] = [];
                Object.entries(userDates).forEach(([uid, datesSet]) => {
                    const hasStreak = targetStreakDates.every(date => datesSet.has(date));
                    if (hasStreak) {
                        streaks.push(uniqueUsersMap.get(uid) || 'Desconhecido');
                    }
                });
                setStreakUsers(streaks);

            } catch (err: any) {
                console.error("Erro BibleAnalytics:", err);
                setErrorMsg(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="p-10 text-center uppercase tracking-widest opacity-20 animate-pulse">Carregando Dados...</div>;

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <BookOpen className="text-brand-purple" />
                    <h2 className="text-2xl font-display uppercase tracking-wider">Analytics da Leitura</h2>
                </div>
             </div>

            {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-xl flex flex-col gap-2 text-red-200 mb-6">
                    <div className="flex items-center gap-2 font-bold"><AlertCircle size={20} /> Erro de Permissão no Banco de Dados</div>
                    <p className="text-sm opacity-80">O painel administrativo não tem permissão para ler os dados dos usuários sem login.</p>
                </div>
            )}

            <div className="flex flex-col md:grid md:grid-cols-2 gap-6">
                 <div className="order-1 md:order-3 md:col-span-2 bg-[#1a1a1a] border border-white/10 rounded-3xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-500"><Flame size={20} /></div>
                        <div>
                            <h3 className="font-bold uppercase text-sm tracking-wide text-white">Em Chamas (Últimos 3 dias)</h3>
                            <p className="text-[10px] uppercase text-white/30 font-bold">Leitura consecutiva nos 3 dias anteriores a hoje</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {streakUsers.length > 0 ? streakUsers.map((name, idx) => (
                            <div key={idx} className="bg-black/40 border border-white/5 p-3 rounded-xl flex items-center gap-3">
                                 <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                 <span className="text-xs font-bold uppercase text-white/80">{name}</span>
                            </div>
                        )) : (
                            <div className="col-span-3 text-center py-8 opacity-30 uppercase text-xs font-bold tracking-widest">Ninguém completou a sequência ainda.</div>
                        )}
                    </div>
                 </div>

                 <div 
                    onClick={() => setShowTodayList(!showTodayList)}
                    className="order-2 md:order-4 md:col-span-2 bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 flex flex-col gap-4 cursor-pointer hover:border-white/20 transition-colors"
                >
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-brand-neon/10 rounded-full flex items-center justify-center text-brand-neon"><Calendar size={20} /></div>
                            <h3 className="font-bold uppercase text-sm tracking-wide text-white/70">Leitores Hoje</h3>
                         </div>
                         <div className="flex items-center gap-4">
                            <span className="text-3xl font-display text-white">{todayCheckinUsers.length}</span>
                            {showTodayList ? <ChevronUp className="text-white/30" size={20} /> : <ChevronDown className="text-white/30" size={20} />}
                         </div>
                    </div>
                    
                    <AnimatePresence>
                        {showTodayList && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="mt-2 pr-2 max-h-[200px] overflow-y-auto custom-scrollbar border-t border-white/5 pt-4">
                                    <table className="w-full text-left">
                                        <tbody className="divide-y divide-white/5">
                                            {todayCheckinUsers.length > 0 ? todayCheckinUsers.map((name, idx) => (
                                                <tr key={idx}><td className="py-2 text-xs font-bold uppercase text-white/50">{name}</td></tr>
                                            )) : (<tr><td className="py-4 text-center text-xs text-white/20 uppercase">Nenhum check-in hoje</td></tr>)}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                 <div className="order-3 md:order-2 bg-[#1a1a1a] border-2 border-brand-neon rounded-3xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Trophy size={80} /></div>
                    <div className="relative z-10">
                        <h3 className="text-brand-neon font-bold uppercase text-xs tracking-widest mb-4">Maior Progresso</h3>
                        {topUser ? (<div className="flex flex-col gap-1"><span className="text-3xl font-display text-white uppercase">{topUser.name}</span><span className="text-sm font-mono text-white/50">{topUser.count} capítulos concluídos</span></div>) : (<span className="text-white/30 text-sm uppercase">--</span>)}
                    </div>
                </div>

                <div 
                    onClick={() => setShowReadersList(!showReadersList)}
                    className="order-4 md:order-1 bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 flex flex-col gap-4 cursor-pointer hover:border-white/20 transition-colors"
                >
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white"><Users size={20} /></div>
                            <h3 className="font-bold uppercase text-sm tracking-wide text-white/70">Leitores Totais</h3>
                         </div>
                         <div className="flex items-center gap-4">
                            <span className="text-3xl font-display text-white">{users.length}</span>
                            {showReadersList ? <ChevronUp className="text-white/30" size={20} /> : <ChevronDown className="text-white/30" size={20} />}
                         </div>
                    </div>
                    
                    <AnimatePresence>
                        {showReadersList && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="mt-2 pr-2 max-h-[200px] overflow-y-auto custom-scrollbar border-t border-white/5 pt-4">
                                    <table className="w-full text-left">
                                        <tbody className="divide-y divide-white/5">
                                            {users.length > 0 ? users.map(u => (<tr key={u.id}><td className="py-2 text-xs font-bold uppercase text-white/50">{u.name}</td></tr>)) : null}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

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
            if (!record.month) return acc;
            const m = record.month.trim().toUpperCase(); 
            if (!acc[m]) acc[m] = { total: 0, sectors: {}, responsibles: [] };
            acc[m].total += (Number(record.total_general) || 0);
            acc[m].responsibles.push(record);
            
            // Soma os setores para o total do mês
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
                    <button onClick={() => setSelectedResp(null)} className="flex items-center gap-2 text-brand-pink font-bold uppercase text-xs mb-6 hover:opacity-70 transition-opacity">
                        <ArrowLeft size={14} /> Voltar ao Mês
                    </button>
                    <h3 className="text-3xl font-display uppercase mb-2">{selectedResp.responsible}</h3>
                    <p className="text-white/40 text-xs uppercase font-bold tracking-widest mb-8">
                        {selectedResp.month} • {new Date(selectedResp.created_at).toLocaleString()}
                    </p>
                    
                    <div className="bg-black/40 p-8 rounded-2xl border border-white/5">
                        <ColumnLayout 
                            accentColor="text-brand-pink"
                            items={SECTORS_LIST
                                .filter(s => Number(selectedResp.sectors?.[s]) > 0)
                                .map(s => ({
                                    label: `Setor ${s}`,
                                    value: selectedResp.sectors[s]
                                }))
                            }
                        />
                    </div>
                </div>
            ) : selectedMonth ? (
                <div className="space-y-10">
                    <div className="bg-[#1a1a1a] border-2 border-brand-neon p-8 rounded-3xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 text-brand-neon"><PieChart size={120} /></div>
                        <button onClick={() => setSelectedMonth(null)} className="flex items-center gap-2 text-brand-neon font-bold uppercase text-xs mb-6 hover:opacity-70 transition-opacity relative z-10">
                            <ArrowLeft size={14} /> Voltar aos Meses
                        </button>
                        <h3 className="text-5xl font-display uppercase text-brand-neon mb-4 relative z-10">{selectedMonth}</h3>
                        <div className="relative z-10"><h4 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Total Acumulado</h4><span className="text-7xl font-display text-white">{groupedData[selectedMonth].total}</span></div>
                    </div>

                    {/* QUANTIDADE POR SETORES (ACUMULADO DO MÊS) */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-2">
                            <MapPin size={18} className="text-brand-neon" />
                            <h4 className="text-lg font-display uppercase tracking-wide text-white">Totais por Setor</h4>
                        </div>
                        <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-white/10">
                            <ColumnLayout 
                                accentColor="text-brand-neon"
                                items={SECTORS_LIST
                                    .filter(s => (groupedData[selectedMonth].sectors[s] || 0) > 0)
                                    .map(s => ({
                                        label: `Setor ${s}`,
                                        value: groupedData[selectedMonth].sectors[s]
                                    }))
                                }
                            />
                        </div>
                    </div>

                    {/* QUANTIDADE POR RESPONSÁVEL (HISTÓRICO) */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-2">
                            <ClipboardList size={18} className="text-brand-pink" />
                            <h4 className="text-lg font-display uppercase tracking-wide text-white">Relatórios por Responsável</h4>
                        </div>
                        <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-white/10">
                            <ColumnLayout 
                                accentColor="text-brand-pink"
                                items={groupedData[selectedMonth].responsibles.map((resp: any) => ({
                                    label: resp.responsible,
                                    value: resp.total_general,
                                    onClick: () => setSelectedResp(resp)
                                }))}
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {months.length > 0 ? months.map(m => (
                        <button key={m} onClick={() => setSelectedMonth(m)} className="w-full flex items-center justify-between p-6 bg-[#1a1a1a] hover:bg-brand-neon hover:text-black border border-white/10 rounded-2xl transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-black/20"><Calendar size={20} className="text-white group-hover:text-black" /></div>
                                <div className="text-left">
                                    <span className="block text-2xl font-display uppercase tracking-widest">{m}</span>
                                    <span className="text-[10px] font-bold uppercase opacity-40 group-hover:opacity-60">{groupedData[m].total} Presenças Registradas</span>
                                </div>
                            </div>
                            <ChevronRight size={20} className="opacity-20 group-hover:opacity-100" />
                        </button>
                    )) : (
                        <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-3xl opacity-20 uppercase font-bold tracking-widest text-xs">Nenhum registro de presença encontrado.</div>
                    )}
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
    if (password === 'umademats2026' || password === 'admin' || password === 'macuxi') setIsAuthenticated(true);
    else alert('Senha incorreta');
  };

  const handleConfigChange = (key: keyof SiteConfig, value: any) => setDraftConfig(prev => ({ ...prev, [key]: value }));

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
         <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-3xl p-8 text-center">
            <div className="w-16 h-16 bg-brand-neon rounded-full flex items-center justify-center mx-auto mb-6"><Lock className="text-black" size={32} /></div>
            <h2 className="text-2xl font-display text-white mb-2">Área Restrita</h2>
            <form onSubmit={handleLogin} className="flex flex-col gap-4 mt-6">
               <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-neon" />
               <button type="submit" className="w-full bg-brand-neon text-black font-bold uppercase py-3 rounded-xl hover:bg-brand-neon/80 transition-colors">Acessar</button>
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
          <button onClick={() => setAdminView('dashboard')} className="w-full bg-[#1a1a1a] border-2 border-white/10 hover:border-brand-neon p-6 rounded-lg text-lg font-bold uppercase text-white transition-all text-center">Área Admin</button>
          <button onClick={() => setAdminView('presence')} className="w-full bg-[#1a1a1a] border-2 border-white/10 hover:border-brand-neon p-6 rounded-lg text-lg font-bold uppercase text-white transition-all text-center">Contador de Presença</button>
        </div>
        <button onClick={onBack} className="text-white/30 hover:text-white uppercase font-bold text-sm tracking-widest flex items-center gap-2"><ArrowLeft size={16} /> Voltar ao Site</button>
      </div>
    );
  }

  if (adminView === 'presence') return <PresenceCounter onBack={() => setAdminView('menu')} />;

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
                 <h1 className="text-lg font-display uppercase text-white tracking-wide">
                    Painel <span className="text-brand-neon">UMADEMATS</span>
                 </h1>
             </div>
         </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        <aside className="w-full md:w-80 border-r border-white/10 bg-[#0f0f0f] overflow-visible flex flex-col shrink-0 p-6 gap-2 relative z-40">
            <h3 className="text-[10px] uppercase font-bold text-white/30 tracking-[0.2em] mb-4 ml-2">Navegação</h3>
            <div className="relative z-50">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`w-full rounded-full px-6 py-4 flex items-center justify-between border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] relative overflow-hidden group transition-all active:scale-95 ${currentTab.color}`}>
                   <div className="flex items-center gap-3">
                       <currentTab.icon size={20} className={currentTab.textColor} />
                       <span className={`font-display italic text-2xl uppercase tracking-wide ${currentTab.textColor}`}>{currentTab.label}</span>
                   </div>
                   <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">{isMenuOpen ? <X className={currentTab.textColor} size={18} /> : <Menu className={currentTab.textColor} size={18} />}</div>
                </button>
                <AnimatePresence>
                   {isMenuOpen && (
                     <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-[calc(100%+10px)] left-0 right-0 bg-[#1a1a1a] border-2 border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col p-2 gap-1">
                        {TABS.map((tab) => (
                          <button key={tab.id} onClick={() => { setActiveTab(tab.id as any); setIsMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tab.color}`}><tab.icon size={14} className={tab.textColor} /></div>
                             <span className="font-bold uppercase text-sm tracking-widest text-white">{tab.label}</span>
                          </button>
                        ))}
                     </motion.div>
                   )}
                </AnimatePresence>
            </div>
            {activeTab === 'builder' && (<div className="mt-8 pt-6 border-t border-white/5"><button onClick={() => saveConfig(draftConfig)} className="w-full bg-brand-neon text-black font-bold uppercase py-3 rounded-xl flex items-center justify-center gap-2"><Save size={18} /> Salvar</button></div>)}
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
                    <div className="flex items-center gap-4"><div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400"><Activity size={32} /></div><div><h2 className="text-xl font-display uppercase text-white tracking-widest">Monitor Automático</h2></div></div>
                    <button onClick={() => setAutoPingEnabled(!autoPingEnabled)} className={`w-14 h-8 rounded-full relative transition-colors p-1 ${autoPingEnabled ? 'bg-blue-600' : 'bg-white/10'}`}><motion.div animate={{ x: autoPingEnabled ? 24 : 0 }} className="w-6 h-6 bg-white rounded-full shadow-lg" /></button>
                </div>
             </div>
          )}
          {activeTab === 'builder' && (
             <div className="w-full h-full rounded-2xl border-4 border-white/5 overflow-hidden shadow-2xl relative">
                <div className="w-full h-full origin-top scale-[0.6] md:scale-[0.8] lg:scale-100 bg-white"><div className="h-full overflow-y-auto overflow-x-hidden no-scrollbar"><HeroSection previewConfig={draftConfig} /><EventSection previewConfig={draftConfig} /><ActionSection previewConfig={draftConfig} /><AboutSection previewConfig={draftConfig} /></div></div>
             </div>
          )}
        </main>
      </div>
    </div>
  );
};
