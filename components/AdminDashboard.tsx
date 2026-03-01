
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Clock, Calendar, Users, ArrowLeft, Lock, Layout, Save, RotateCcw, ChevronDown, ChevronRight, Activity, RefreshCw, Presentation, List, PieChart, User, Menu, X, BookOpen, Trophy, Flame, AlertCircle, Database, ChevronUp, MapPin, ClipboardList, GraduationCap, Plus, Trash2, Globe, Eye, Image as ImageIcon, Upload, Terminal, CheckCircle2, Building2, Type, LayoutGrid, Phone, Search, Filter } from 'lucide-react';
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
    const { config, saveConfig } = useSiteConfig();
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

    const handleToggleCampaign = () => {
        saveConfig({
            ...config,
            bible_campaign_active: !config.bible_campaign_active
        });
    };

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
        <div className="space-y-6 fluid-container">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <BookOpen className="text-brand-purple" />
                    <h2 className="text-2xl font-display uppercase tracking-wider">Engajamento na Leitura</h2>
                </div>

                {/* Toggle Campanha de Premiação */}
                <div className="flex items-center gap-4 bg-[#1a1a1a] border border-white/10 px-6 py-3 rounded-2xl shadow-lg">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase text-white/30 tracking-widest leading-none mb-1">Campanha</span>
                        <span className="text-xs font-bold uppercase text-white tracking-wider">Conceder Premiação</span>
                    </div>
                    <button 
                        onClick={handleToggleCampaign}
                        className={`w-14 h-7 rounded-full relative p-1 transition-all duration-300 ${config.bible_campaign_active ? 'bg-brand-neon shadow-[0_0_15px_rgba(204,255,0,0.3)]' : 'bg-white/10'}`}
                    >
                        <motion.div 
                            animate={{ x: config.bible_campaign_active ? 28 : 0 }}
                            className={`w-5 h-5 rounded-full shadow-md transition-colors ${config.bible_campaign_active ? 'bg-black' : 'bg-white/40'}`}
                        />
                    </button>
                    <span className={`text-[10px] font-black uppercase tracking-tighter w-8 ${config.bible_campaign_active ? 'text-brand-neon' : 'text-white/20'}`}>
                        {config.bible_campaign_active ? 'ON' : 'OFF'}
                    </span>
                </div>
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
            <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl overflow-hidden shadow-lg">
                <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2"><Flame size={18} className="text-orange-500" /> Em Chamas (3 dias seguidos, sem hoje)</h3>
                </div>
                <div className="p-6">
                    {emChamasData.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {emChamasData.map((name, idx) => (
                                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: idx * 0.05 }} key={idx} className="bg-orange-500/10 text-orange-500 border border-orange-500/20 px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                                    {name}
                                </motion.div>
                            ))}
                        </div>
                    ) : <div className="py-8 text-center"><p className="text-white/20 text-[10px] uppercase font-bold tracking-widest">Aguardando leitores atingirem a sequência de 3 dias.</p></div>}
                </div>
            </div>
            <AnimatePresence>
                {showReadersModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowReadersModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-[#1a1a1a] border-2 border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
                            <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                                <h3 className="font-display uppercase text-xl text-white">Ranking de Leitores</h3>
                                <button onClick={() => setShowReadersModal(false)} className="text-white/30 hover:text-white transition-colors"><X size={24} /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2">
                                {userStats.map(([name, data], idx) => (
                                    <div key={idx} className="bg-white/5 p-3 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-brand-purple/20 flex items-center justify-center text-brand-purple"><User size={14} /></div><span className="text-sm font-bold uppercase tracking-wide text-white">{name}</span></div>
                                        <span className="text-[10px] font-bold text-white/30 uppercase">{data.count} capítulos</span>
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

// --- KEEPALIVE ADMIN COMPONENT ---
const KeepaliveAdmin: React.FC = () => {
    const { logs, isPinging, triggerKeepalive, timeToNextPing, autoPingEnabled, setAutoPingEnabled } = useKeepalive();
    return (
        <div className="space-y-6 fluid-container">
            <div className="flex items-center gap-3 mb-8"><Activity className="text-blue-500" /><h2 className="text-2xl font-display uppercase tracking-wider">Monitor do Banco (Keepalive)</h2></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#1a1a1a] border border-white/10 p-8 rounded-3xl relative overflow-hidden shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex flex-col"><span className="text-[10px] font-bold uppercase text-white/30 tracking-widest mb-1">Próximo Pulso em</span><span className="text-5xl font-mono text-white">{Math.floor(timeToNextPing / 60000)}:{(Math.floor((timeToNextPing % 60000) / 1000)).toString().padStart(2, '0')}</span></div>
                        <button onClick={() => triggerKeepalive()} disabled={isPinging} className={`p-6 rounded-2xl flex items-center justify-center transition-all ${isPinging ? 'bg-white/10 animate-pulse' : 'bg-blue-500 hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20'}`}><RefreshCw className={`${isPinging ? 'animate-spin' : ''}`} size={32} /></button>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
                        <button onClick={() => setAutoPingEnabled(!autoPingEnabled)} className={`w-10 h-5 rounded-full relative p-1 transition-colors ${autoPingEnabled ? 'bg-blue-500' : 'bg-white/20'}`}><motion.div animate={{ x: autoPingEnabled ? 20 : 0 }} className="w-3 h-3 bg-white rounded-full" /></button>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Auto-Ping Ativado</span>
                    </div>
                </div>
                <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl overflow-hidden flex flex-col h-[400px] shadow-lg">
                    <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between shrink-0"><span className="text-[10px] font-bold uppercase tracking-widest">Logs de Atividade</span><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 animate-ping" /><span className="text-[8px] font-bold uppercase text-green-500">Live</span></div></div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                        {logs.map((log) => (
                            <div key={log.id} className="p-3 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between group">
                                <div className="flex items-center gap-3"><div className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`} /><div className="flex flex-col"><span className="text-[10px] text-white font-mono uppercase">{log.event_type}</span><span className="text-[8px] text-white/20">{new Date(log.created_at).toLocaleString()}</span></div></div>
                                <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded ${log.status === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{log.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- LIDERA ADMIN COMPONENTS ---
const LideraAdmin: React.FC = () => {
    const [activeSubTab, setActiveSubTab] = useState<'data' | 'orientations'>('data');
    const [orientations, setOrientations] = useState<any[]>([]);
    const [editingOrientation, setEditingOrientation] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [rlsError, setRlsError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Dados de Líderes
    const [leaders, setLeaders] = useState<any[]>([]);
    const [loadingLeaders, setLoadingLeaders] = useState(true);
    const [showLeadersModal, setShowLeadersModal] = useState(false);
    const [showSectorModal, setShowSectorModal] = useState(false);

    useEffect(() => {
        fetchOrientations();
        fetchLeaders();
    }, []);

    const fetchOrientations = async () => {
        setLoading(true);
        try {
            const { data } = await supabase.from('lidera_orientations').select('*').order('created_at', { ascending: false });
            if (data) setOrientations(data);
        } catch (e) { console.error("Erro ao carregar orientações:", e); }
        finally { setLoading(false); }
    };

    const fetchLeaders = async () => {
        setLoadingLeaders(true);
        try {
            // BUSCA GLOBAL: Seleciona todos os registros sem filtros de usuário
            const { data, error } = await supabase
                .from('lidera_logins')
                .select('*')
                .order('user_name', { ascending: true });
                
            if (error) throw error;
            if (data) setLeaders(data);
        } catch (e) { 
            console.error("Erro ao carregar líderes:", e); 
        } finally { 
            setLoadingLeaders(false); 
        }
    };

    // Estatísticas calculadas a partir dos dados existentes
    const stats = useMemo(() => {
        const total = leaders.length;
        const capital = leaders.filter(l => l.tipo_localidade === 'capital').length;
        const interior = leaders.filter(l => l.tipo_localidade === 'interior').length;
        return { total, capital, interior };
    }, [leaders]);

    const topSectorData = useMemo(() => {
        const counts: Record<string, number> = {};
        leaders.forEach(l => {
            if (l.tipo_localidade === 'capital' && l.setor) {
                counts[l.setor] = (counts[l.setor] || 0) + 1;
            }
        });
        const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
        return top ? { sector: top[0], count: top[1] } : null;
    }, [leaders]);

    const handleNew = () => {
        setRlsError(null);
        setEditingOrientation({ title: '', subtitle: '', comment: '', is_published: false, materials: [], cover_url: '' });
    };

    const handleEdit = async (ori: any) => {
        setRlsError(null);
        const { data: materials } = await supabase.from('lidera_materials').select('*').eq('orientation_id', ori.id);
        setEditingOrientation({ ...ori, materials: materials || [] });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { alert("Selecione uma imagem válida."); return; }
        setIsUploading(true); setRlsError(null);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `cover-${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('lider_covers').upload(fileName, file);
            if (uploadError) {
                if (uploadError.message.toLowerCase().includes('rls') || uploadError.message.toLowerCase().includes('policy')) setRlsError("RLS_ERROR");
                throw uploadError;
            }
            const { data: { publicUrl } } = supabase.storage.from('lider_covers').getPublicUrl(fileName);
            setEditingOrientation(prev => ({ ...prev, cover_url: publicUrl }));
        } catch (error: any) { console.error("Erro no upload:", error); if (!rlsError) alert(error.message); }
        finally { setIsUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
    };

    const handleSave = async () => {
        if (!editingOrientation.title) return alert("Informe o título.");
        setIsSaving(true);
        try {
            const { materials, ...oriData } = editingOrientation;
            const { data: savedOri, error: oriError } = await supabase.from('lidera_orientations').upsert({ ...oriData }, { onConflict: 'id' }).select().single();
            if (oriError) throw oriError;
            await supabase.from('lidera_materials').delete().eq('orientation_id', savedOri.id);
            if (materials.length > 0) {
                const materialsToInsert = materials.map((m: any) => ({ orientation_id: savedOri.id, name: m.name, link: m.link }));
                await supabase.from('lidera_materials').insert(materialsToInsert);
            }
            alert("Publicação salva!"); setEditingOrientation(null); fetchOrientations();
        } catch (e: any) { alert("Erro ao salvar: " + e.message); }
        finally { setIsSaving(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Excluir permanentemente?")) return;
        try { await supabase.from('lidera_orientations').delete().eq('id', id); fetchOrientations(); setEditingOrientation(null); }
        catch (e) { alert("Erro ao excluir."); }
    };

    return (
        <div className="space-y-6 fluid-container">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <GraduationCap className="text-brand-neon" />
                    <h2 className="text-2xl font-display uppercase tracking-wider">Lidera UMADEMATS</h2>
                </div>
                {activeSubTab === 'data' && (
                    <button 
                        onClick={fetchLeaders} 
                        disabled={loadingLeaders}
                        className="bg-white/5 hover:bg-white/10 p-3 rounded-xl text-brand-neon transition-all flex items-center gap-2 border border-white/5 active:scale-95"
                        title="Sincronizar Banco"
                    >
                        <RefreshCw size={18} className={loadingLeaders ? 'animate-spin' : ''} />
                        <span className="text-[10px] font-bold uppercase tracking-widest hidden md:inline">Sincronizar</span>
                    </button>
                )}
            </div>

            <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit mb-8">
                <button onClick={() => { setActiveSubTab('data'); setEditingOrientation(null); }} className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeSubTab === 'data' ? 'bg-brand-neon text-black' : 'text-white/50 hover:text-white'}`}>Dados</button>
                <button onClick={() => setActiveSubTab('orientations')} className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeSubTab === 'orientations' ? 'bg-brand-neon text-black' : 'text-white/50 hover:text-white'}`}>Orientações</button>
            </div>

            {activeSubTab === 'data' ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.button whileHover={{ scale: 1.02 }} onClick={() => setShowLeadersModal(true)} className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/5 text-left group hover:border-brand-neon transition-all">
                            <span className="text-[10px] uppercase font-bold text-white/30 tracking-widest block mb-1 group-hover:text-brand-neon">Líderes Cadastrados</span>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-5xl font-display text-white">{loadingLeaders ? '...' : stats.total}</span>
                                <Users size={32} className="text-white/10 group-hover:text-brand-neon transition-colors" />
                            </div>
                            <div className="flex gap-4 text-[10px] uppercase font-bold text-white/40">
                                <div className="flex items-center gap-1"><Building2 size={12} className="text-brand-neon" /> <span>Capital: <b className="text-white">{loadingLeaders ? '...' : stats.capital}</b></span></div>
                                <div className="flex items-center gap-1"><MapPin size={12} className="text-brand-pink" /> <span>Interior: <b className="text-white">{loadingLeaders ? '...' : stats.interior}</b></span></div>
                            </div>
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.02 }} onClick={() => setShowSectorModal(true)} className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/5 text-left group hover:border-brand-pink transition-all">
                            <span className="text-[10px] uppercase font-bold text-white/30 tracking-widest block mb-1 group-hover:text-brand-pink">Setor com mais Líderes</span>
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-3xl font-display text-white">Setor {loadingLeaders ? '-' : (topSectorData?.sector || '-')}</span>
                                    <span className="text-xs uppercase font-bold text-white/30">{loadingLeaders ? '...' : (topSectorData?.count || 0)} Líderes</span>
                                </div>
                                <PieChart size={32} className="text-white/10 group-hover:text-brand-pink transition-colors" />
                            </div>
                        </motion.button>
                    </div>

                    <AnimatePresence>
                        {showLeadersModal && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLeadersModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-[#1a1a1a] border-2 border-white/10 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
                                    <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                                        <h3 className="font-display uppercase text-xl text-white">Líderes Cadastrados</h3>
                                        <button onClick={() => setShowLeadersModal(false)} className="text-white/30 hover:text-white transition-colors"><X size={24} /></button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2">
                                        {leaders.length === 0 && !loadingLeaders ? (
                                            <div className="p-10 text-center text-white/20 uppercase font-bold text-xs">Nenhum líder encontrado.</div>
                                        ) : leaders.map((l, idx) => (
                                            <div key={idx} className="bg-white/5 p-4 rounded-xl flex flex-col gap-1">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-sm font-bold uppercase tracking-wide text-white">{l.user_name || 'Anônimo'}</span>
                                                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase ${l.tipo_localidade === 'capital' ? 'bg-brand-neon/20 text-brand-neon' : 'bg-brand-pink/20 text-brand-pink'}`}>
                                                        {l.tipo_localidade}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-40 text-[9px] uppercase font-bold">
                                                    {l.tipo_localidade === 'capital' ? (
                                                        <>
                                                            <span>Setor {l.setor || '-'}</span>
                                                            <span>•</span>
                                                            <span>{l.congregacao || '-'}</span>
                                                        </>
                                                    ) : (
                                                        <span>{l.cidade || '-'}</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>
                        )}
                        {showSectorModal && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSectorModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-[#1a1a1a] border-2 border-white/10 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
                                    <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                                        <h3 className="font-display uppercase text-xl text-white">Líderes do Setor {topSectorData?.sector}</h3>
                                        <button onClick={() => setShowSectorModal(false)} className="text-white/30 hover:text-white transition-colors"><X size={24} /></button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2">
                                        {leaders.filter(l => l.setor === topSectorData?.sector).map((l, idx) => (
                                            <div key={idx} className="bg-white/5 p-4 rounded-xl flex flex-col gap-1">
                                                <span className="text-sm font-bold uppercase tracking-wide text-white">{l.user_name}</span>
                                                <span className="opacity-40 text-[9px] uppercase font-bold">{l.congregacao || '-'}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="space-y-6">
                    {editingOrientation ? (
                        <div className="max-w-4xl mx-auto bg-[#1a1a1a] border-2 border-brand-neon p-6 md:p-8 rounded-[2rem] space-y-6 shadow-2xl relative overflow-hidden">
                            <div className="flex items-center justify-between">
                                <button onClick={() => setEditingOrientation(null)} className="text-white/50 hover:text-white uppercase font-bold text-xs flex items-center gap-2"><ArrowLeft size={14} /> Voltar</button>
                                <div className="flex items-center gap-4">
                                    {editingOrientation.id && <button onClick={() => handleDelete(editingOrientation.id)} className="text-red-500 hover:text-red-400 p-2"><Trash2 size={20} /></button>}
                                    <button onClick={handleSave} disabled={isSaving || isUploading} className="bg-brand-neon text-black px-8 py-3 rounded-xl font-bold uppercase text-sm flex items-center gap-2 disabled:opacity-50">{(isSaving || isUploading) ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />} Publicar</button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="flex flex-col gap-3">
                                    <label className="text-white/50 text-[10px] uppercase font-bold tracking-widest ml-2">Capa (16:9)</label>
                                    <div onClick={() => !isUploading && fileInputRef.current?.click()} className={`relative aspect-video bg-black rounded-2xl border-2 border-dashed border-white/10 overflow-hidden flex items-center justify-center cursor-pointer hover:border-brand-neon ${isUploading ? 'opacity-50' : ''}`}>
                                        {editingOrientation.cover_url ? <img src={editingOrientation.cover_url} className="w-full h-full object-cover" /> : <ImageIcon className="text-white/10" size={48} />}
                                        {isUploading && <RefreshCw className="animate-spin text-brand-neon absolute" size={32} />}
                                    </div>
                                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                                </div>
                                <div className="flex flex-col gap-6">
                                    <input type="text" value={editingOrientation.title} onChange={(e) => setEditingOrientation({...editingOrientation, title: e.target.value})} placeholder="Título" className="bg-black border border-white/10 rounded-xl p-4 text-white focus:border-brand-neon outline-none" />
                                    <input type="text" value={editingOrientation.subtitle} onChange={(e) => setEditingOrientation({...editingOrientation, subtitle: e.target.value})} placeholder="Subtítulo" className="bg-black border border-white/10 rounded-xl p-4 text-white focus:border-brand-neon outline-none" />
                                </div>
                                <textarea value={editingOrientation.comment} onChange={(e) => setEditingOrientation({...editingOrientation, comment: e.target.value})} placeholder="Conteúdo" className="md:col-span-2 bg-black border border-white/10 rounded-xl p-4 text-white focus:border-brand-neon outline-none h-40 resize-none" />
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-white font-display uppercase tracking-widest text-sm">Links de Apoio</h4>
                                {editingOrientation.materials.map((mat: any, idx: number) => (
                                    <div key={idx} className="flex gap-3 bg-black/40 p-4 rounded-xl border border-white/5">
                                        <input type="text" value={mat.name} onChange={(e) => { const newMats = [...editingOrientation.materials]; newMats[idx].name = e.target.value; setEditingOrientation({...editingOrientation, materials: newMats}); }} placeholder="Nome" className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-xs text-white" />
                                        <input type="text" value={mat.link} onChange={(e) => { const newMats = [...editingOrientation.materials]; newMats[idx].link = e.target.value; setEditingOrientation({...editingOrientation, materials: newMats}); }} placeholder="URL" className="flex-[2] bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-xs text-white" />
                                        <button onClick={() => setEditingOrientation({...editingOrientation, materials: editingOrientation.materials.filter((_:any, i:number) => i !== idx)})} className="p-3 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 size={18} /></button>
                                    </div>
                                ))}
                                <button onClick={() => setEditingOrientation({...editingOrientation, materials: [...editingOrientation.materials, {name: '', link: ''}]})} className="w-full py-3 border-2 border-dashed border-white/10 rounded-xl text-white/30 uppercase text-[9px] font-bold tracking-widest flex items-center justify-center gap-2"><Plus size={14} /> Novo Material</button>
                            </div>
                            <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl">
                                <button onClick={() => setEditingOrientation({...editingOrientation, is_published: !editingOrientation.is_published})} className={`w-12 h-6 rounded-full relative p-1 transition-colors ${editingOrientation.is_published ? 'bg-brand-neon' : 'bg-white/20'}`}><motion.div animate={{ x: editingOrientation.is_published ? 24 : 0 }} className="w-4 h-4 bg-white rounded-full shadow-lg" /></button>
                                <span className="text-xs font-bold uppercase tracking-widest">{editingOrientation.is_published ? 'Visível no Portal' : 'Rascunho'}</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-end mb-4"><button onClick={handleNew} className="bg-brand-neon text-black px-6 py-2 rounded-xl font-bold uppercase text-xs flex items-center gap-2 hover:scale-105 transition-all"><Plus size={16} /> Nova Orientação</button></div>
                            <div className="grid grid-cols-1 gap-3">
                                {orientations.map((ori) => (
                                    <button key={ori.id} onClick={() => handleEdit(ori)} className="w-full bg-[#151515] border border-white/5 hover:border-brand-neon p-6 rounded-2xl transition-all group flex items-center justify-between text-left">
                                        <div className="flex flex-col">
                                            <h3 className="text-xl font-display uppercase tracking-wide text-white group-hover:text-brand-neon leading-none mb-1">{ori.title}</h3>
                                            <div className="flex items-center gap-2"><span className="text-[10px] uppercase font-bold text-white/30">{ori.subtitle || '-'}</span>{!ori.is_published && <span className="bg-red-500/10 text-red-500 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase">Rascunho</span>}</div>
                                        </div>
                                        <ChevronRight size={20} className="text-white/10 group-hover:text-brand-neon" />
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

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

const ColumnLayout: React.FC<{ items: { label: string; value: string | number; onClick?: () => void }[]; accentColor: string }> = ({ items, accentColor }) => {
    const chunkedItems = useMemo(() => {
        const chunks = [];
        for (let i = 0; i < items.length; i += 7) chunks.push(items.slice(i, i + 7));
        return chunks;
    }, [items]);
    return (
        <div className="flex flex-wrap gap-x-12 gap-y-6">
            {chunkedItems.map((chunk, chunkIdx) => (
                <div key={chunkIdx} className="flex flex-col gap-2 min-w-[200px]">
                    {chunk.map((item, itemIdx) => (
                        <div key={itemIdx} onClick={item.onClick} className={`flex items-center justify-between gap-4 py-1.5 border-b border-white/5 group ${item.onClick ? 'cursor-pointer hover:bg-white/5' : ''}`}>
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

const PresenceControl: React.FC = () => {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
    const [selectedResp, setSelectedResp] = useState<any | null>(null);
    useEffect(() => {
        const fetchRecords = async () => {
            const { data } = await supabase.from('presence_records').select('*').order('created_at', { ascending: false });
            if (data) setRecords(data); setLoading(false);
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
        <div className="space-y-6 fluid-container">
            <div className="flex items-center gap-3 mb-4"><PieChart className="text-brand-neon" /><h2 className="text-2xl font-display uppercase tracking-wider">Controle de Presença</h2></div>
            {selectedResp ? (
                <div className="bg-[#1a1a1a] border-2 border-brand-pink p-8 rounded-3xl shadow-xl">
                    <button onClick={() => setSelectedResp(null)} className="flex items-center gap-2 text-brand-pink font-bold uppercase text-xs mb-6 hover:opacity-70 transition-opacity"><ArrowLeft size={14} /> Voltar ao Mês</button>
                    <h3 className="text-3xl font-display uppercase mb-2">{selectedResp.responsible}</h3>
                    <p className="text-white/40 text-xs uppercase font-bold tracking-widest mb-8">{selectedResp.month} • {new Date(selectedResp.created_at).toLocaleString()}</p>
                    <div className="bg-black/40 p-8 rounded-2xl border border-white/5"><ColumnLayout accentColor="text-brand-pink" items={SECTORS_LIST.filter(s => Number(selectedResp.sectors?.[s]) > 0).map(s => ({ label: `Setor ${s}`, value: selectedResp.sectors[s] }))} /></div>
                </div>
            ) : selectedMonth ? (
                <div className="space-y-10">
                    <div className="bg-[#1a1a1a] border-2 border-brand-neon p-8 rounded-3xl relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 right-0 p-8 opacity-5 text-brand-neon"><PieChart size={120} /></div>
                        <button onClick={() => setSelectedMonth(null)} className="flex items-center gap-2 text-brand-neon font-bold uppercase text-xs mb-6 hover:opacity-70 transition-opacity relative z-10"><ArrowLeft size={14} /> Voltar aos Meses</button>
                        <h3 className="text-5xl font-display uppercase text-brand-neon mb-4 relative z-10">{selectedMonth}</h3>
                        <div className="relative z-10"><h4 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Total Acumulado</h4><span className="text-7xl font-display text-white">{groupedData[selectedMonth].total}</span></div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-2"><MapPin size={18} className="text-brand-neon" /><h4 className="text-lg font-display uppercase tracking-wide text-white">Totais por Setor</h4></div>
                        <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-white/10 shadow-lg"><ColumnLayout accentColor="text-brand-neon" items={SECTORS_LIST.filter(s => (groupedData[selectedMonth].sectors[s] || 0) > 0).map(s => ({ label: `Setor ${s}`, value: selectedResp?.sectors?.[s] || groupedData[selectedMonth].sectors[s] }))} /></div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-2"><User size={18} className="text-brand-pink" /><h4 className="text-lg font-display uppercase tracking-wide text-white">Registros Individuais</h4></div>
                        <div className="grid grid-cols-1 gap-3">
                            {groupedData[selectedMonth].responsibles.map((record: any) => (
                                <button key={record.id} onClick={() => setSelectedResp(record)} className="w-full flex items-center justify-between p-6 bg-[#1a1a1a] border border-white/10 hover:border-brand-pink rounded-2xl transition-all group shadow-sm hover:translate-x-1">
                                    <div className="flex flex-col items-start text-left"><span className="text-lg font-bold uppercase text-white group-hover:text-brand-pink transition-colors">{record.responsible}</span><span className="text-[10px] font-bold uppercase text-white/30 tracking-widest">{new Date(record.created_at).toLocaleDateString()}</span></div>
                                    <div className="flex items-center gap-4"><div className="flex flex-col items-end"><span className="text-2xl font-display text-white">{record.total_general}</span><span className="text-[9px] font-bold uppercase text-white/30">Pessoas</span></div><ChevronRight size={20} className="text-white/20 group-hover:text-brand-pink transition-colors" /></div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {months.length > 0 ? months.map(m => (
                        <button key={m} onClick={() => setSelectedMonth(m)} className="w-full flex items-center justify-between p-6 bg-[#1a1a1a] hover:bg-brand-neon hover:text-black border border-white/10 rounded-2xl transition-all group shadow-sm">
                            <div className="flex items-center gap-4"><div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-black/20"><Calendar size={20} className="text-white group-hover:text-black" /></div><div className="text-left"><span className="block text-2xl font-display uppercase tracking-widest">{m}</span><span className="text-[10px] font-bold uppercase opacity-40 group-hover:opacity-60">{groupedData[m].total} Presenças</span></div></div>
                            <ChevronRight size={20} className="opacity-20 group-hover:opacity-100" />
                        </button>
                    )) : <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-3xl opacity-20 uppercase font-bold tracking-widest text-xs">Nenhum registro.</div>}
                </div>
            )}
        </div>
    );
};

const ShirtRequestsAdmin: React.FC = () => {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'todos' | 'pendente' | 'coletado'>('todos');
    const [requestToDelete, setRequestToDelete] = useState<any | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('pedidos_camisetas')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            if (data) setRequests(data);
        } catch (e) {
            console.error("Erro ao carregar pedidos:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const toggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'pendente' ? 'coletado' : 'pendente';
        try {
            const { error } = await supabase
                .from('pedidos_camisetas')
                .update({ status: newStatus })
                .eq('id', id);
            if (error) throw error;
            setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
        } catch (e) {
            alert("Erro ao atualizar status.");
        }
    };

    const handleDelete = async () => {
        if (!requestToDelete) return;
        setIsDeleting(true);
        try {
            const { error } = await supabase
                .from('pedidos_camisetas')
                .delete()
                .eq('id', requestToDelete.id);
            if (error) throw error;
            setRequests(requests.filter(r => r.id !== requestToDelete.id));
            setRequestToDelete(null);
        } catch (e) {
            alert("Erro ao excluir pedido.");
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredRequests = useMemo(() => {
        return requests.filter(req => {
            const matchesSearch = req.nome_completo.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'todos' || req.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [requests, searchTerm, filterStatus]);

    const stats = useMemo(() => {
        return {
            total: requests.length,
            sequenciados: requests.filter(r => r.status === 'coletado').length,
            pendentes: requests.filter(r => r.status === 'pendente').length
        };
    }, [requests]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 opacity-20">
            <RefreshCw className="animate-spin mb-4" />
            <span className="uppercase font-bold tracking-widest text-xs">Carregando Pedidos...</span>
        </div>
    );

    return (
        <div className="space-y-6 fluid-container">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <ClipboardList className="text-brand-neon" />
                    <h2 className="text-2xl font-display uppercase tracking-wider">Pedidos de Camisetas</h2>
                </div>
                <button onClick={fetchRequests} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-brand-neon transition-all">
                    <RefreshCw size={20} />
                </button>
            </div>

            {/* Contadores */}
            <div className="grid grid-cols-3 gap-2 md:gap-4 mb-8">
                <div className="bg-[#1a1a1a] p-3 md:p-6 rounded-2xl border border-white/5 relative overflow-hidden group text-center md:text-left">
                    <div className="hidden md:block absolute -right-2 -top-2 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Users size={60} className="text-white" />
                    </div>
                    <span className="text-[8px] md:text-[10px] uppercase font-bold text-white/30 tracking-widest block mb-1 truncate">Total</span>
                    <span className="text-2xl md:text-4xl font-display text-white">{stats.total}</span>
                </div>
                <div className="bg-[#1a1a1a] p-3 md:p-6 rounded-2xl border border-white/5 relative overflow-hidden group text-center md:text-left">
                    <div className="hidden md:block absolute -right-2 -top-2 opacity-5 group-hover:opacity-10 transition-opacity">
                        <CheckCircle2 size={60} className="text-green-500" />
                    </div>
                    <span className="text-[8px] md:text-[10px] uppercase font-bold text-white/30 tracking-widest block mb-1 truncate">Sequenciados</span>
                    <span className="text-2xl md:text-4xl font-display text-green-500">{stats.sequenciados}</span>
                </div>
                <div className="bg-[#1a1a1a] p-3 md:p-6 rounded-2xl border border-white/5 relative overflow-hidden group text-center md:text-left">
                    <div className="hidden md:block absolute -right-2 -top-2 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Clock size={60} className="text-brand-pink" />
                    </div>
                    <span className="text-[8px] md:text-[10px] uppercase font-bold text-white/30 tracking-widest block mb-1 truncate">Pendentes</span>
                    <span className="text-2xl md:text-4xl font-display text-brand-pink">{stats.pendentes}</span>
                </div>
            </div>

            {/* Filtros e Busca */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por nome..."
                        className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-brand-neon transition-all"
                    />
                </div>
                <div className="flex bg-[#1a1a1a] p-1 rounded-xl border border-white/10">
                    <button 
                        onClick={() => setFilterStatus('todos')}
                        className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${filterStatus === 'todos' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white'}`}
                    >
                        Todos
                    </button>
                    <button 
                        onClick={() => setFilterStatus('pendente')}
                        className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${filterStatus === 'pendente' ? 'bg-brand-pink/20 text-brand-pink' : 'text-white/30 hover:text-white'}`}
                    >
                        Pendentes
                    </button>
                    <button 
                        onClick={() => setFilterStatus('coletado')}
                        className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${filterStatus === 'coletado' ? 'bg-green-500/20 text-green-500' : 'text-white/30 hover:text-white'}`}
                    >
                        Sequenciados
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredRequests.length > 0 ? filteredRequests.map((req) => (
                    <motion.div 
                        layout
                        key={req.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`bg-[#1a1a1a] p-6 rounded-2xl border-2 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                            req.status === 'coletado' ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-white/5'
                        }`}
                    >
                        <div className="flex flex-col">
                            <h3 className="text-lg font-bold uppercase tracking-wide text-white">{req.nome_completo}</h3>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs font-mono text-white/40">{req.telefone}</span>
                                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/5 text-white/30">
                                    Origem: {req.origem}
                                </span>
                            </div>
                            <span className="text-[9px] text-white/20 uppercase mt-2">
                                Solicitado em: {new Date(req.created_at).toLocaleString()}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <a 
                                href={`https://wa.me/${req.telefone.replace(/\D/g, '')}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex-1 md:flex-none bg-green-500/10 text-green-500 border border-green-500/20 px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-green-500 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <Phone size={14} /> WhatsApp
                            </a>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => toggleStatus(req.id, req.status)}
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                                        req.status === 'coletado' 
                                            ? 'bg-green-500 text-white' 
                                            : 'bg-white/5 text-white/20 hover:bg-white/10 hover:text-white'
                                    }`}
                                    title={req.status === 'coletado' ? "Marcar como Pendente" : "Marcar como Coletado"}
                                >
                                    <CheckCircle2 size={24} />
                                </button>
                                <button 
                                    onClick={() => setRequestToDelete(req)}
                                    className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                                    title="Excluir Pedido"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )) : (
                    <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-3xl opacity-20 uppercase font-bold tracking-widest text-xs">
                        {searchTerm ? "Nenhum resultado para sua busca." : "Nenhum pedido encontrado."}
                    </div>
                )}
            </div>

            {/* Modal de Confirmação de Exclusão */}
            <AnimatePresence>
                {requestToDelete && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            onClick={() => setRequestToDelete(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            exit={{ scale: 0.9, opacity: 0 }} 
                            className="relative bg-[#1a1a1a] border-2 border-white/10 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl p-8 text-center"
                        >
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                                <Trash2 size={32} />
                            </div>
                            <h3 className="text-xl font-display uppercase text-white mb-2">Excluir Pedido?</h3>
                            <p className="text-white/40 text-sm mb-8">
                                Você está prestes a excluir o pedido de <b className="text-white">{requestToDelete.nome_completo}</b>. Esta ação não pode ser desfeita.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="w-full bg-red-500 text-white font-bold uppercase py-4 rounded-xl hover:bg-red-600 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isDeleting ? <RefreshCw className="animate-spin" size={18} /> : "Confirmar Exclusão"}
                                </button>
                                <button 
                                    onClick={() => setRequestToDelete(null)}
                                    className="w-full bg-white/5 text-white/50 font-bold uppercase py-4 rounded-xl hover:bg-white/10 hover:text-white transition-all"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

interface AdminDashboardProps { onBack: () => void; onNavigateOrg?: () => void; }
export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack, onNavigateOrg }) => {
  const stats = useAnalyticsDashboard();
  const { config, saveConfig } = useSiteConfig();
  const [draftConfig, setDraftConfig] = useState<SiteConfig>(config);
  const [activeTab, setActiveTab] = useState<'analytics' | 'builder' | 'keepalive' | 'presence' | 'bible' | 'lidera' | 'shirt_requests'>('analytics');
  const [adminView, setAdminView] = useState<'menu' | 'dashboard' | 'presence'>('menu');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  useEffect(() => { if (config) setDraftConfig({ ...DEFAULT_SITE_CONFIG, ...config }); }, [config]);
  const handleLogin = (e: React.FormEvent) => { e.preventDefault(); if (password === 'umademats2026' || password === 'admin' || password === 'macuxi') setIsAuthenticated(true); else alert('Senha incorreta'); };
  if (!isAuthenticated) return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
         <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-3xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-brand-neon rounded-full flex items-center justify-center mx-auto mb-6"><Lock className="text-black" size={32} /></div>
            <h2 className="text-2xl font-display text-white mb-2">Gestão Umademats</h2>
            <form onSubmit={handleLogin} className="flex flex-col gap-4 mt-6">
               <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-neon" />
               <button type="submit" className="w-full bg-brand-neon text-black font-bold uppercase py-3 rounded-xl hover:bg-brand-neon/80 transition-colors shadow-lg">Acessar</button>
            </form>
            <button onClick={onBack} className="mt-6 text-white/30 text-xs hover:text-white uppercase font-bold tracking-widest">Voltar ao Site</button>
         </motion.div>
      </div>
  );
  if (adminView === 'menu') return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 gap-8">
        <h2 className="text-3xl font-display uppercase text-white tracking-widest">Controle Administrativo</h2>
        <div className="flex flex-col gap-3 w-full max-w-sm">
          <button onClick={() => setAdminView('dashboard')} className="w-full bg-[#1a1a1a] border-2 border-white/10 hover:border-brand-neon p-6 rounded-lg text-lg font-bold uppercase text-white transition-all text-center">Gestão Umademats</button>
          <button onClick={() => onNavigateOrg?.()} className="w-full bg-brand-purple border-2 border-white/10 hover:border-brand-neon p-6 rounded-lg text-lg font-bold uppercase text-white transition-all text-center flex items-center justify-center gap-3"><LayoutGrid size={24} /> ORGANIZAÇÃO UMADEMATS</button>
          <button onClick={() => setAdminView('presence')} className="w-full bg-[#1a1a1a] border-2 border-white/10 hover:border-brand-neon p-6 rounded-lg text-lg font-bold uppercase text-white transition-all text-center">Contador de Culto</button>
        </div>
        <button onClick={onBack} className="text-white/30 hover:text-white uppercase font-bold text-sm tracking-widest flex items-center gap-2"><ArrowLeft size={16} /> Sair do Painel</button>
      </div>
  );
  if (adminView === 'presence') return <PresenceCounter onBack={() => setAdminView('menu')} />;
  const TABS = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'bg-white', textColor: 'text-black' },
    { id: 'lidera', label: 'Lidera UMADEMATS', icon: GraduationCap, color: 'bg-brand-neon', textColor: 'text-black' },
    { id: 'shirt_requests', label: 'Pedidos Camisetas', icon: ClipboardList, color: 'bg-brand-neon', textColor: 'text-black' },
    { id: 'bible', label: 'Leitura Bíblica', icon: BookOpen, color: 'bg-brand-purple', textColor: 'text-white' },
    { id: 'presence', label: 'Presença', icon: List, color: 'bg-brand-pink', textColor: 'text-white' },
    { id: 'keepalive', label: 'Monitor', icon: Activity, color: 'bg-blue-500', textColor: 'text-white' },
    { id: 'builder', label: 'Config Site', icon: Layout, color: 'bg-white', textColor: 'text-black' }
  ];
  const currentTab = TABS.find(t => t.id === activeTab) || TABS[0];
  return (
    <div className="min-h-screen bg-black flex flex-col h-screen overflow-hidden text-white font-sans">
      <div className="border-b border-white/10 flex flex-col md:flex-row items-center justify-between bg-[#0f0f0f] shrink-0 z-50">
         <div className="w-full md:w-auto h-16 flex items-center px-4 md:px-6">
             <div className="flex items-center gap-4">
                 <button onClick={() => setAdminView('menu')} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"><ArrowLeft size={20} /></button>
                 <div className="h-6 w-px bg-white/10 hidden md:block" />
                 <h1 className="text-lg font-display uppercase text-white tracking-wide">Gestão <span className="text-brand-neon">UMADEMATS</span></h1>
             </div>
         </div>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        <aside className="w-full md:w-80 border-r border-white/10 bg-[#0f0f0f] overflow-visible flex flex-col shrink-0 p-6 gap-2 relative z-40">
            <h3 className="text-[10px] uppercase font-bold text-white/30 tracking-[0.2em] mb-4 ml-2">Ferramentas</h3>
            <div className="relative z-50">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`w-full rounded-full px-6 py-4 flex items-center justify-between border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] relative overflow-hidden group transition-all active:scale-95 ${currentTab.color}`}>
                   <div className="flex items-center gap-3"><currentTab.icon size={20} className={currentTab.textColor} /><span className={`font-display italic text-2xl uppercase tracking-wide ${currentTab.textColor}`}>{currentTab.label}</span></div>
                   <div className="z-10 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full transition-colors group-hover:bg-black/10">{isMenuOpen ? <X className={currentTab.textColor} size={18} /> : <Menu className={currentTab.textColor} size={18} />}</div>
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
            
            {/* BUILDER SIDEBAR CONTROLS */}
            {activeTab === 'builder' && (
              <div className="mt-8 pt-6 border-t border-white/5 space-y-6 overflow-y-auto no-scrollbar pb-10">
                 <div className="px-2">
                    <h4 className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-4 flex items-center gap-2">
                       <Type size={12} /> Tipografia Desktop
                    </h4>
                    <div className="space-y-4">
                       <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                             <span className="text-xs font-bold text-white/60">Tamanho texto 1ª seção</span>
                             <span className="text-[10px] bg-brand-neon text-black px-2 py-0.5 rounded font-bold">
                                {Math.round(draftConfig.hero_desktopFontSizeFactor * 100)}%
                             </span>
                          </div>
                          <input 
                             type="range" 
                             min="0.8" 
                             max="1.5" 
                             step="0.05"
                             value={draftConfig.hero_desktopFontSizeFactor}
                             onChange={(e) => setDraftConfig({...draftConfig, hero_desktopFontSizeFactor: parseFloat(e.target.value)})}
                             className="w-full accent-brand-neon cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
                          />
                          <p className="text-[9px] text-white/30 italic">Ajusta apenas os títulos principais no computador.</p>
                       </div>
                    </div>
                 </div>

                 <button onClick={() => saveConfig(draftConfig)} className="w-full bg-brand-neon text-black font-bold uppercase py-3 rounded-xl flex items-center justify-center gap-2"><Save size={18} /> Publicar Alterações</button>
              </div>
            )}
        </aside>
        <main className="flex-1 overflow-y-auto bg-black p-4 md:p-8 custom-scrollbar">
          {activeTab === 'presence' && <PresenceControl />}
          {activeTab === 'shirt_requests' && <ShirtRequestsAdmin />}
          {activeTab === 'lidera' && <LideraAdmin />}
          {activeTab === 'bible' && <BibleAdmin />}
          {activeTab === 'keepalive' && <KeepaliveAdmin />}
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
          {activeTab === 'builder' && (
             <div className="w-full h-full rounded-2xl border-4 border-white/5 overflow-hidden shadow-2xl relative">
                <div className="w-full h-full origin-top scale-[0.6] md:scale-[0.8] lg:scale-100 bg-white shadow-inner"><div className="h-full overflow-y-auto overflow-x-hidden no-scrollbar"><HeroSection previewConfig={draftConfig} onNavigate={()=>{}} /><EventSection previewConfig={draftConfig} /><ActionSection previewConfig={draftConfig} onNavigate={()=>{}} /><AboutSection previewConfig={draftConfig} /></div></div>
             </div>
          )}
        </main>
      </div>
    </div>
  );
};
