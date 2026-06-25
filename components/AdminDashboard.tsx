
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Clock, Calendar, Users, ArrowLeft, Lock, Layout, Save, RotateCcw, ChevronDown, ChevronRight, Activity, RefreshCw, Presentation, List, PieChart, User, Menu, X, BookOpen, Trophy, Flame, AlertCircle, Database, ChevronUp, MapPin, ClipboardList, GraduationCap, Plus, Trash2, Globe, Eye, Image as ImageIcon, Upload, Terminal, CheckCircle2, Building2, Type, LayoutGrid, Phone, Search, Filter, ShoppingBag, Megaphone, Bell } from 'lucide-react';
import { useAnalyticsDashboard } from '../hooks/useSiteAnalytics';
import { useSiteConfig, SiteConfig, DEFAULT_SITE_CONFIG } from '../hooks/useSiteConfig';
import { useKeepalive } from '../hooks/useKeepalive';
import { HeroSection } from './HeroSection';
import { HeroCMS } from './HeroCMS';
import { ActionSection } from './ActionSection';
import { AboutSection } from './AboutSection';
import { PresenceCounter } from './PresenceCounter';
import { supabase } from '../lib/supabaseClient';
import { EstoqueUmadematsAdmin } from './EstoqueUmadematsAdmin';

const SECTORS_LIST = ["A", "B", "C1", "C2", "D", "E", "F", "G", "H", "I", "J", "M", "N", "VISITANTE"];

// --- BIBLE ADMIN COMPONENT ---
const BibleAdmin: React.FC = () => {
    const { config, saveConfig } = useSiteConfig();
    const [progressData, setProgressData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showReadersModal, setShowReadersModal] = useState(false);

    // --- ANNOUNCEMENTS STATES ---
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [announcementsLoading, setAnnouncementsLoading] = useState(true);
    const [showNewAnnouncementModal, setShowNewAnnouncementModal] = useState(false);
    const [isAnnouncementSaving, setIsAnnouncementSaving] = useState(false);
    const [isUsingAnnouncementFallback, setIsUsingAnnouncementFallback] = useState(false);
    const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', type: 'info', is_active: true, user_name: '' });
    const [recipientSearch, setRecipientSearch] = useState('');
    const [expandedAnnouncementUsers, setExpandedAnnouncementUsers] = useState<Record<string, boolean>>({});
    const [copiedSql, setCopiedSql] = useState(false);

    // --- AUDIT SYSTEM STATES ---
    const [allAuditLogs, setAllAuditLogs] = useState<any[]>([]);
    const [selectedAnnouncementForAudit, setSelectedAnnouncementForAudit] = useState<any | null>(null);
    const [detailedAuditLogs, setDetailedAuditLogs] = useState<any[]>([]);
    const [detailedAuditLoading, setDetailedAuditLoading] = useState(false);

    const fetchAllAuditLogs = async () => {
        try {
            if (isUsingAnnouncementFallback) {
                const saved = localStorage.getItem('umademats_bible_announcements_audit');
                setAllAuditLogs(saved ? JSON.parse(saved) : []);
            } else {
                const { data, error } = await supabase
                    .from('bible_announcements_audit')
                    .select('announcement_id, created_at, user_name, acao');
                if (error) throw error;
                setAllAuditLogs(data || []);
            }
        } catch (e) {
            console.warn("Could not load public audit summaries from Supabase, trying local fallback:", e);
            const saved = localStorage.getItem('umademats_bible_announcements_audit');
            setAllAuditLogs(saved ? JSON.parse(saved) : []);
        }
    };

    const handleOpenAuditModal = async (announcement: any) => {
        setSelectedAnnouncementForAudit(announcement);
        setDetailedAuditLoading(true);
        try {
            if (isUsingAnnouncementFallback || announcement.id.startsWith('sample-') || announcement.id.startsWith('local-')) {
                const saved = localStorage.getItem('umademats_bible_announcements_audit');
                const list = saved ? JSON.parse(saved) : [];
                const filtered = list.filter((a: any) => a.announcement_id === announcement.id);
                setDetailedAuditLogs(filtered);
            } else {
                const { data, error } = await supabase
                    .from('bible_announcements_audit')
                    .select('*')
                    .eq('announcement_id', announcement.id)
                    .order('created_at', { ascending: false });
                if (error) throw error;
                setDetailedAuditLogs(data || []);
            }
        } catch (e) {
            console.error("Error fetching detailed audit:", e);
            const saved = localStorage.getItem('umademats_bible_announcements_audit');
            const list = saved ? JSON.parse(saved) : [];
            const filtered = list.filter((a: any) => a.announcement_id === announcement.id);
            setDetailedAuditLogs(filtered);
        } finally {
            setDetailedAuditLoading(false);
        }
    };

    const fetchAnnouncements = async () => {
        setAnnouncementsLoading(true);
        try {
            const { data, error } = await supabase
                .from('bible_announcements')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            if (data) {
                setAnnouncements(data);
                setIsUsingAnnouncementFallback(false);
            }
        } catch (e: any) {
            console.warn("Table bible_announcements not found or other error, falling back to localStorage:", e);
            setIsUsingAnnouncementFallback(true);
            const saved = localStorage.getItem('umademats_bible_announcements');
            if (saved) {
                setAnnouncements(JSON.parse(saved));
            } else {
                // Initialize empty because all announcements must be strictly individual to a user.
                setAnnouncements([]);
                localStorage.setItem('umademats_bible_announcements', JSON.stringify([]));
            }
        } finally {
            setAnnouncementsLoading(false);
            // Fetch audit summary logs as well
            fetchAllAuditLogs();
        }
    };

    const handleSaveAnnouncement = async () => {
        if (!newAnnouncement.user_name) {
            alert('Por favor, selecione o destinatário (leitor) para este aviso!');
            return;
        }
        if (!newAnnouncement.title || !newAnnouncement.content) {
            alert('Por favor, preencha o título e o conteúdo!');
            return;
        }

        setIsAnnouncementSaving(true);
        try {
            if (isUsingAnnouncementFallback) {
                const item = {
                    id: 'local-' + Date.now(),
                    ...newAnnouncement,
                    created_at: new Date().toISOString()
                };
                const updatedList = [item, ...announcements];
                setAnnouncements(updatedList);
                localStorage.setItem('umademats_bible_announcements', JSON.stringify(updatedList));
                setShowNewAnnouncementModal(false);
                setNewAnnouncement({ title: '', content: '', type: 'info', is_active: true, user_name: '' });
                setRecipientSearch('');
            } else {
                const { error } = await supabase
                    .from('bible_announcements')
                    .insert([newAnnouncement]);
                
                if (error) throw error;
                await fetchAnnouncements();
                setShowNewAnnouncementModal(false);
                setNewAnnouncement({ title: '', content: '', type: 'info', is_active: true, user_name: '' });
                setRecipientSearch('');
            }
        } catch (e: any) {
            console.error("Error saving announcement:", e);
            let userFriendlyMsg = e.message || 'Ocorreu um erro inesperado.';
            if (userFriendlyMsg.includes('user_name') || userFriendlyMsg.includes('column') || userFriendlyMsg.includes('relation') || userFriendlyMsg.includes('violates')) {
                userFriendlyMsg += '\n\n⚠️ Dica: Parece que a tabela "bible_announcements" não possui a coluna obrigatória "user_name" no Supabase, ou a tabela precisa ser criada.\n\nPor favor, copie o Script SQL fornecido no painel de avisos e execute-o no console SQL do Supabase para adicionar a coluna ou recriar a tabela!';
            }
            alert('Erro ao salvar aviso: ' + userFriendlyMsg);
        } finally {
            setIsAnnouncementSaving(false);
        }
    };

    const handleToggleAnnouncementActive = async (id: string, currentStatus: boolean) => {
        try {
            if (isUsingAnnouncementFallback || id.startsWith('sample-') || id.startsWith('local-')) {
                const updatedList = announcements.map(a => a.id === id ? { ...a, is_active: !currentStatus } : a);
                setAnnouncements(updatedList);
                localStorage.setItem('umademats_bible_announcements', JSON.stringify(updatedList));
            } else {
                const { error } = await supabase
                    .from('bible_announcements')
                    .update({ is_active: !currentStatus })
                    .eq('id', id);
                
                if (error) throw error;
                await fetchAnnouncements();
            }
        } catch (e: any) {
            console.error("Error toggling announcement active state:", e);
            alert('Erro ao alterar status: ' + e.message);
        }
    };

    const handleDeleteAnnouncement = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este aviso?')) return;
        try {
            if (isUsingAnnouncementFallback || id.startsWith('sample-') || id.startsWith('local-')) {
                const updatedList = announcements.filter(a => a.id !== id);
                setAnnouncements(updatedList);
                localStorage.setItem('umademats_bible_announcements', JSON.stringify(updatedList));
            } else {
                const { error } = await supabase
                    .from('bible_announcements')
                    .delete()
                    .eq('id', id);
                
                if (error) throw error;
                await fetchAnnouncements();
            }
        } catch (e: any) {
            console.error("Error deleting announcement:", e);
            alert('Erro ao excluir aviso: ' + e.message);
        }
    };

    const groupedAnnouncements = useMemo(() => {
        const groups: Record<string, { active: any[], inactive: any[], all: any[] }> = {};
        announcements.forEach(item => {
            const recipient = item.user_name || 'Desconhecido';
            if (!groups[recipient]) {
                groups[recipient] = { active: [], inactive: [], all: [] };
            }
            groups[recipient].all.push(item);
            if (item.is_active) {
                groups[recipient].active.push(item);
            } else {
                groups[recipient].inactive.push(item);
            }
        });
        return Object.entries(groups).sort((a, b) => b[1].active.length - a[1].active.length);
    }, [announcements]);

    const handleCopySql = () => {
        const sql = `-- ==========================================================
-- OPÇÃO 1: SE VOCÊ JÁ TEM A TABELA E PRECISA APENAS DA COLUNA user_name
-- ==========================================================
ALTER TABLE public.bible_announcements ADD COLUMN IF NOT EXISTS user_name TEXT;
ALTER TABLE public.bible_announcements ADD COLUMN IF NOT EXISTS last_acknowledged_at TIMESTAMPTZ NULL;

-- Atualizar registros antigos para que não violem a restrição (opcional)
-- UPDATE public.bible_announcements SET user_name = 'Leitor Padrão' WHERE user_name IS NULL;

-- Tornar a coluna obrigatória
ALTER TABLE public.bible_announcements ALTER COLUMN user_name SET NOT NULL;


-- ==========================================================
-- OPÇÃO 2: SE DESEJA RECRIAR A TABELA DO ZERO (DELETA OS AVISOS ANTERIORES)
-- ==========================================================
DROP TABLE IF EXISTS public.bible_announcements;

CREATE TABLE public.bible_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'success', 'important'
    is_active BOOLEAN NOT NULL DEFAULT true,
    user_name TEXT NOT NULL, -- Destinatário obrigatório do aviso (Leitor)
    last_acknowledged_at TIMESTAMPTZ NULL -- Última confirmação do aviso (ENTENDI)
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.bible_announcements ENABLE ROW LEVEL SECURITY;

-- Criar Políticas de Acesso Público/Admin
CREATE POLICY "Leitura pública de avisos" ON public.bible_announcements FOR SELECT USING (true);
CREATE POLICY "Controle administrativo de avisos" ON public.bible_announcements FOR ALL USING (true);`;
        
        navigator.clipboard.writeText(sql);
        setCopiedSql(true);
        setTimeout(() => setCopiedSql(false), 2000);
    };

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
        fetchAnnouncements();
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
                    <BookOpen className="text-[#f59a1e]" />
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
                        className={`w-14 h-7 rounded-full relative p-1 transition-all duration-300 ${config.bible_campaign_active ? 'bg-[#f36b2e] shadow-[0_0_15px_rgba(243,107,46,0.3)]' : 'bg-white/10'}`}
                    >
                        <motion.div 
                            animate={{ x: config.bible_campaign_active ? 28 : 0 }}
                            className={`w-5 h-5 rounded-full shadow-md transition-colors ${config.bible_campaign_active ? 'bg-black' : 'bg-white/40'}`}
                        />
                    </button>
                    <span className={`text-[10px] font-black uppercase tracking-tighter w-8 ${config.bible_campaign_active ? 'text-[#f36b2e]' : 'text-white/20'}`}>
                        {config.bible_campaign_active ? 'ON' : 'OFF'}
                    </span>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-white/30 tracking-widest block mb-1">Total de Leituras</span>
                    <span className="text-4xl font-display text-white">{progressData.length}</span>
                </div>
                <button onClick={() => setShowReadersModal(true)} className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5 text-left hover:border-[#f36b2e] transition-colors group">
                    <span className="text-[10px] uppercase font-bold text-white/30 tracking-widest block mb-1 group-hover:text-[#f36b2e]">Leitores</span>
                    <div className="flex items-center justify-between">
                        <span className="text-4xl font-display text-white">{userStats.length}</span>
                        <ChevronRight size={20} className="text-white/10 group-hover:text-[#f36b2e] transition-colors" />
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
                    <Trophy size={18} className="text-[#f36b2e]" />
                </div>
                <div className="divide-y divide-white/5">
                    {userStats.length > 0 ? userStats.slice(0, 3).map(([name, data], idx) => (
                        <div key={idx} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${idx === 0 ? 'bg-[#f36b2e] text-black' : 'bg-white/10 text-white'}`}>
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

            {/* --- SEÇÃO: SISTEMA DE AVISOS PARA LEITORES --- */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl overflow-hidden shadow-lg space-y-6">
                <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Megaphone size={18} className="text-[#f59a1e]" />
                        <h3 className="text-sm font-bold uppercase tracking-widest">Avisos para os Leitores</h3>
                    </div>
                    <button 
                        onClick={() => setShowNewAnnouncementModal(true)} 
                        className="bg-brand-purple hover:bg-brand-purple/80 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95"
                    >
                        <Plus size={14} /> Novo Aviso
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {!isUsingAnnouncementFallback ? (
                        <div className="bg-green-500/10 border border-green-500/20 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <span className="text-[10px] uppercase font-black tracking-widest text-green-400 flex items-center gap-1">
                                    <Database size={12} /> Sincronização em Nuvem Ativa
                                </span>
                                <p className="text-xs text-white/70">
                                    Os avisos estão sendo salvos e lidos em tempo real na tabela <code className="bg-white/10 px-1 py-0.5 rounded text-green-300">bible_announcements</code> do Supabase.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                                <button 
                                    onClick={handleCopySql} 
                                    className="flex-1 md:flex-none bg-white/10 hover:bg-white/20 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                                >
                                    {copiedSql ? 'Copiado! 📋' : 'Visualizar SQL 📋'}
                                </button>
                                <button
                                    onClick={() => setIsUsingAnnouncementFallback(true)}
                                    className="flex-1 md:flex-none bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/20 text-[#f59a1e] text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                                    title="Alternar temporariamente para salvar offline em localStorage"
                                >
                                    Forçar Local
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <span className="text-[10px] uppercase font-black tracking-widest text-amber-500 flex items-center gap-1">
                                    <Database size={12} /> Modo Persistência Local Ativo
                                </span>
                                <p className="text-xs text-white/70">
                                    A tabela <code className="bg-white/10 px-1 py-0.5 rounded text-amber-300">bible_announcements</code> não possui a coluna <code className="bg-white/10 px-1 py-0.5 rounded text-amber-300">user_name</code> ou não existe no Supabase. Os avisos estão sendo salvos localmente neste navegador. Para habilitar a sincronização em nuvem global, execute o script SQL.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                                <button 
                                    onClick={handleCopySql} 
                                    className="flex-1 md:flex-none bg-white/10 hover:bg-white/20 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                                >
                                    {copiedSql ? 'Copiado! 📋' : 'Copiar Script SQL 📋'}
                                </button>
                                <button
                                    onClick={fetchAnnouncements}
                                    className="flex-1 md:flex-none bg-green-500/15 hover:bg-green-500/25 border border-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                                >
                                    Tentar Conectar
                                </button>
                            </div>
                        </div>
                    )}

                    {announcementsLoading ? (
                        <div className="flex items-center justify-center py-12 text-white/20">
                            <RefreshCw className="animate-spin mr-2" size={18} />
                            <span className="text-xs uppercase font-bold tracking-widest">Buscando Avisos...</span>
                        </div>
                    ) : announcements.length === 0 ? (
                        <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-2xl">
                            <Bell size={32} className="text-white/10 mx-auto mb-3" />
                            <p className="text-white/30 text-xs uppercase font-bold tracking-widest">Nenhum aviso publicado até o momento.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {groupedAnnouncements.map(([recipient, groupData]) => {
                                const activeCount = groupData.active.length;
                                const isExpanded = !!expandedAnnouncementUsers[recipient];
                                
                                return (
                                    <div key={recipient} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all hover:border-white/15">
                                        {/* Row Representing Recipient */}
                                        <button 
                                            onClick={() => setExpandedAnnouncementUsers(prev => ({ ...prev, [recipient]: !prev[recipient] }))}
                                            className="w-full text-left p-5 flex items-center justify-between hover:bg-white/5 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-[#253c96]/20 flex items-center justify-center text-[#253c96]">
                                                    <User size={18} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-white font-bold text-sm uppercase tracking-wide">
                                                            {recipient}
                                                        </span>
                                                        {activeCount > 0 && (
                                                            <span className="bg-[#f59a1e]/15 text-[#f59a1e] text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-[#f59a1e]/20">
                                                                {activeCount}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-white/40 uppercase font-semibold">
                                                        Total: {groupData.all.length} aviso(s) • Ativos: {activeCount}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] uppercase font-bold text-white/30 tracking-widest">
                                                    {isExpanded ? 'Ocultar' : 'Ver avisos'}
                                                </span>
                                                {isExpanded ? <ChevronUp size={16} className="text-white/30" /> : <ChevronDown size={16} className="text-white/30" />}
                                            </div>
                                        </button>

                                        {/* Announcement list for this recipient */}
                                        <AnimatePresence initial={false}>
                                            {isExpanded && (
                                                <motion.div 
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="border-t border-white/5 bg-black/20 divide-y divide-white/5 overflow-hidden"
                                                >
                                                    {groupData.all.map((item) => {
                                                        let badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                                                        if (item.type === 'success') badgeColor = 'bg-green-500/10 text-green-400 border-green-500/20';
                                                        if (item.type === 'warning') badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                                                        if (item.type === 'important') badgeColor = 'bg-red-500/10 text-red-400 border-red-500/20';

                                                        return (
                                                            <div key={item.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                                <div className="space-y-1.5 flex-1">
                                                                    <div className="flex items-center gap-3 flex-wrap">
                                                                        <span className={`text-[9px] uppercase font-bold tracking-widest border px-2 py-0.5 rounded-md ${badgeColor}`}>
                                                                            {item.type}
                                                                        </span>
                                                                        <span className="text-[10px] text-white/30 font-bold uppercase">
                                                                            {new Date(item.created_at).toLocaleDateString('pt-BR')} às {new Date(item.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                                                                        </span>
                                                                    </div>
                                                                    <h4 className="text-white font-bold text-sm uppercase tracking-wide">{item.title}</h4>
                                                                    <p className="text-xs text-white/70 leading-relaxed whitespace-pre-wrap mb-3">{item.content}</p>

                                                                    {/* Métricas de Auditoria e Confirmações do Aviso */}
                                                                    {(() => {
                                                                        const logsForItem = allAuditLogs.filter(log => log.announcement_id === item.id);
                                                                        const numConfirmations = logsForItem.length;
                                                                        const lastLog = logsForItem.length > 0 
                                                                            ? logsForItem.reduce((latest, current) => new Date(current.created_at) > new Date(latest.created_at) ? current : latest)
                                                                            : null;
                                                                        const lastConfirmationStr = lastLog 
                                                                            ? `${new Date(lastLog.created_at).toLocaleDateString('pt-BR')} ${new Date(lastLog.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` 
                                                                            : 'Nenhuma';

                                                                        return (
                                                                            <div className="flex flex-wrap gap-2 pt-1 text-[10px] text-white/60">
                                                                                <div className="bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-xl flex items-center gap-1">
                                                                                    <span className="font-bold text-white/40 uppercase">Leitor:</span>
                                                                                    <span className="font-semibold text-white uppercase">{item.user_name}</span>
                                                                                </div>
                                                                                <div className="bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-xl flex items-center gap-1">
                                                                                    <span className="font-bold text-white/40 uppercase">Confirmações:</span>
                                                                                    <span className="font-bold text-[#f59a1e]">{numConfirmations}</span>
                                                                                </div>
                                                                                <div className="bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-xl flex items-center gap-1">
                                                                                    <span className="font-bold text-white/40 uppercase">Última Confirmação:</span>
                                                                                    <span className="font-semibold text-white">
                                                                                        {item.last_acknowledged_at 
                                                                                            ? `${new Date(item.last_acknowledged_at).toLocaleDateString('pt-BR')} ${new Date(item.last_acknowledged_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` 
                                                                                            : 'Nunca confirmado'}
                                                                                    </span>
                                                                                </div>
                                                                                <button
                                                                                    onClick={() => handleOpenAuditModal(item)}
                                                                                    className="bg-[#253c96]/15 hover:bg-[#253c96]/35 border border-[#253c96]/25 text-white/90 hover:text-white px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition-all active:scale-[0.98] font-bold uppercase tracking-wider text-[9px]"
                                                                                >
                                                                                    <ClipboardList size={11} className="text-[#f59a1e]" /> Ver Histórico
                                                                                </button>
                                                                            </div>
                                                                        );
                                                                    })()}
                                                                </div>

                                                                <div className="flex items-center gap-4 shrink-0 border-t border-white/5 md:border-t-0 pt-4 md:pt-0">
                                                                    {/* Status Toggle */}
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[9px] uppercase font-bold text-white/40 tracking-wider">Ativo</span>
                                                                        <button 
                                                                            onClick={() => handleToggleAnnouncementActive(item.id, item.is_active)}
                                                                            className={`w-10 h-5 rounded-full relative p-0.5 transition-colors ${item.is_active ? 'bg-green-500' : 'bg-white/10'}`}
                                                                        >
                                                                            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${item.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
                                                                        </button>
                                                                    </div>

                                                                    {/* Delete Button */}
                                                                    <button 
                                                                        onClick={() => handleDeleteAnnouncement(item.id)}
                                                                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl transition-colors active:scale-95"
                                                                        title="Excluir Aviso"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal: Novo Aviso */}
            <AnimatePresence>
                {showNewAnnouncementModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNewAnnouncementModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-[#111111] border border-white/10 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                            {/* Header */}
                            <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-brand-purple">
                                    <Megaphone size={20} />
                                    <h3 className="font-display uppercase text-lg font-bold tracking-wider">Criar Novo Aviso</h3>
                                </div>
                                <button onClick={() => setShowNewAnnouncementModal(false)} className="text-white/30 hover:text-white p-1 rounded-full hover:bg-white/5 transition-all"><X size={22} /></button>
                            </div>

                            {/* Form Body */}
                            <div className="p-6 overflow-y-auto space-y-4 custom-scrollbar">
                                {/* DESTINATÁRIO - Campo pesquisável */}
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Destinatário (Obrigatório)</label>
                                    
                                    {newAnnouncement.user_name ? (
                                        <div className="flex items-center justify-between p-3 bg-[#253c96]/15 border border-[#253c96]/30 rounded-xl">
                                            <div className="flex items-center gap-2">
                                                <User size={14} className="text-[#f59a1e]" />
                                                <div>
                                                    <p className="text-xs font-bold text-white uppercase">{newAnnouncement.user_name.includes('@') ? newAnnouncement.user_name.split('@')[0] : newAnnouncement.user_name}</p>
                                                    {newAnnouncement.user_name.includes('@') && (
                                                        <p className="text-[10px] text-white/40">{newAnnouncement.user_name}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={() => setNewAnnouncement(prev => ({ ...prev, user_name: '' }))}
                                                className="text-[10px] uppercase font-bold text-red-400 hover:text-red-300 transition-colors"
                                            >
                                                Trocar
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <input 
                                                type="text" 
                                                value={recipientSearch}
                                                onChange={(e) => setRecipientSearch(e.target.value)}
                                                placeholder="Pesquise o leitor pelo nome..."
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:border-brand-purple focus:outline-none transition-colors"
                                            />
                                            <div className="max-h-36 overflow-y-auto border border-white/5 rounded-xl bg-black/40 divide-y divide-white/5 custom-scrollbar">
                                                {userStats.length === 0 ? (
                                                    <div className="p-3 text-center text-[10px] uppercase font-bold text-white/30 tracking-widest">Nenhum leitor registrado no progresso</div>
                                                ) : (
                                                    userStats
                                                        .map(([name]) => name)
                                                        .filter(name => name.toLowerCase().includes(recipientSearch.toLowerCase()))
                                                        .map((name) => {
                                                            const isEmail = name.includes('@');
                                                            const dispName = isEmail ? name.split('@')[0] : name;
                                                            return (
                                                                <button
                                                                    key={name}
                                                                    type="button"
                                                                    onClick={() => setNewAnnouncement(prev => ({ ...prev, user_name: name }))}
                                                                    className="w-full p-2.5 text-left text-xs uppercase hover:bg-white/5 font-bold tracking-wide text-white/70 hover:text-white flex items-center justify-between transition-colors"
                                                                >
                                                                    <div>
                                                                        <span>{dispName}</span>
                                                                        {isEmail && <span className="block text-[9px] text-white/30 lowercase font-medium">{name}</span>}
                                                                    </div>
                                                                    <Plus size={12} className="text-white/20" />
                                                                </button>
                                                            );
                                                        })
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Title */}
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Título do Aviso</label>
                                    <input 
                                        type="text" 
                                        value={newAnnouncement.title}
                                        onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Ex: Campanha de Julho Iniciada!"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:border-brand-purple focus:outline-none transition-colors"
                                    />
                                </div>

                                {/* Content */}
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Conteúdo do Aviso</label>
                                    <textarea 
                                        value={newAnnouncement.content}
                                        onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                                        placeholder="Digite os detalhes do aviso..."
                                        rows={4}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:border-brand-purple focus:outline-none transition-colors resize-none"
                                    />
                                </div>

                                {/* Type selection */}
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider block">Estilo / Importância</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { id: 'info', name: 'Informativo', color: 'border-blue-500/20 text-blue-400 bg-blue-500/5' },
                                            { id: 'success', name: 'Novidade / Sucesso', color: 'border-green-500/20 text-green-400 bg-green-500/5' },
                                            { id: 'warning', name: 'Alerta / Atenção', color: 'border-amber-500/20 text-amber-400 bg-amber-500/5' },
                                            { id: 'important', name: 'Importante', color: 'border-red-500/20 text-red-400 bg-red-500/5' }
                                        ].map((t) => (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => setNewAnnouncement(prev => ({ ...prev, type: t.id }))}
                                                className={`p-3 rounded-xl border text-xs font-bold text-left uppercase transition-all ${newAnnouncement.type === t.id ? 'border-brand-purple text-brand-purple ring-1 ring-brand-purple/50 bg-brand-purple/5' : 'border-white/10 text-white/60 hover:border-white/20 bg-transparent'}`}
                                            >
                                                <span className={t.color + ' px-1.5 py-0.5 rounded text-[10px] border mr-2 block w-max mb-1'}>
                                                    {t.id}
                                                </span>
                                                {t.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Active toggle */}
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-white uppercase">Publicar Imediatamente</span>
                                        <span className="text-[10px] text-white/40 uppercase">O aviso ficará visível para os leitores na tela inicial</span>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setNewAnnouncement(prev => ({ ...prev, is_active: !prev.is_active }))}
                                        className={`w-12 h-6 rounded-full relative p-0.5 transition-colors ${newAnnouncement.is_active ? 'bg-green-500' : 'bg-white/10'}`}
                                    >
                                        <div className={`w-5 h-5 rounded-full bg-white transition-transform ${newAnnouncement.is_active ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-white/5 bg-white/5 flex gap-3">
                                <button 
                                    onClick={() => setShowNewAnnouncementModal(false)}
                                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={handleSaveAnnouncement}
                                    disabled={isAnnouncementSaving || !newAnnouncement.user_name}
                                    className="flex-1 bg-brand-purple hover:bg-brand-purple/90 text-white py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                >
                                    {isAnnouncementSaving ? <RefreshCw className="animate-spin" size={14} /> : 'Publicar'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal: Histórico de Auditoria Detalhado */}
            <AnimatePresence>
                {selectedAnnouncementForAudit && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            onClick={() => setSelectedAnnouncementForAudit(null)} 
                            className="absolute inset-0 bg-black/85 backdrop-blur-sm" 
                        />
                        <motion.div 
                            initial={{ scale: 0.93, opacity: 0, y: 15 }} 
                            animate={{ scale: 1, opacity: 1, y: 0 }} 
                            exit={{ scale: 0.93, opacity: 0, y: 15 }} 
                            className="relative bg-[#111111] border border-white/15 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
                                <div className="space-y-1">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-[#f59a1e] flex items-center gap-1.5">
                                        <ClipboardList size={12} /> Log de Auditoria
                                    </span>
                                    <h3 className="font-display uppercase text-base font-extrabold text-white tracking-wide">
                                        Histórico de Visualização
                                    </h3>
                                </div>
                                <button 
                                    onClick={() => setSelectedAnnouncementForAudit(null)} 
                                    className="text-white/40 hover:text-white p-1.5 rounded-full hover:bg-white/5 transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Details header for selected announcement */}
                            <div className="px-6 py-4 bg-white/[0.02] border-b border-white/5 space-y-1.5">
                                <p className="text-[11px] uppercase font-bold text-white/50">
                                    Aviso: <span className="text-white">{selectedAnnouncementForAudit.title}</span>
                                </p>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-white/40 uppercase font-semibold">
                                    <span>Destinatário: <strong className="text-white/80">{selectedAnnouncementForAudit.user_name}</strong></span>
                                    <span>Criado em: <strong className="text-white/80">{new Date(selectedAnnouncementForAudit.created_at).toLocaleDateString('pt-BR')}</strong></span>
                                </div>
                            </div>

                            {/* Chronological List of Audits */}
                            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 min-h-[30vh]">
                                {detailedAuditLoading ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-white/20 space-y-2">
                                        <RefreshCw className="animate-spin text-[#f59a1e]" size={24} />
                                        <span className="text-xs uppercase font-extrabold tracking-widest">Carregando Auditoria...</span>
                                    </div>
                                ) : detailedAuditLogs.length === 0 ? (
                                    <div className="py-16 text-center border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center space-y-2">
                                        <ClipboardList size={28} className="text-white/10" />
                                        <p className="text-white/40 text-xs uppercase font-bold tracking-widest">
                                            Nenhuma confirmação registrada ainda.
                                        </p>
                                        <p className="text-white/20 text-[10px] uppercase font-bold tracking-tight">
                                            O leitor receberá o aviso na Leitura Bíblica e clicará em "ENTENDI" para confirmar.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">
                                            Entradas em ordem cronológica reversa ({detailedAuditLogs.length})
                                        </p>
                                        <div className="divide-y divide-white/5 border border-white/10 bg-black/30 rounded-2xl overflow-hidden">
                                            {detailedAuditLogs.map((log, idx) => (
                                                <div key={log.id || idx} className="p-4 flex items-center justify-between text-xs hover:bg-white/[0.01] transition-colors">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <User size={12} className="text-white/30" />
                                                            <span className="font-bold text-white uppercase tracking-wide">
                                                                {log.user_name}
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] text-white/40 font-semibold uppercase">
                                                            ID do Usuário: <span className="font-mono text-white/30">{log.user_id}</span>
                                                        </p>
                                                    </div>
                                                    <div className="text-right space-y-1 shrink-0">
                                                        <span className="bg-green-500/10 text-green-400 border border-green-500/20 text-[9px] font-black uppercase px-2 py-0.5 rounded-md">
                                                            {log.acao || 'ENTENDI'}
                                                        </span>
                                                        <p className="text-[10px] text-white/40 font-semibold uppercase">
                                                            {new Date(log.created_at).toLocaleDateString('pt-BR')} às {new Date(log.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-white/10 bg-white/5">
                                <button 
                                    onClick={() => setSelectedAnnouncementForAudit(null)}
                                    className="w-full bg-white/10 hover:bg-white/15 border border-white/10 text-white py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95"
                                >
                                    Fechar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
    const [requestToDelete, setRequestToDelete] = useState<any | null>(null);
    const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showClearAllModal, setShowClearAllModal] = useState(false);

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

    const handleDeleteGroup = async () => {
        if (!requestToDelete) return;
        setIsDeleting(true);
        try {
            // Delete all records for this person (Name + Phone)
            const { error } = await supabase
                .from('pedidos_camisetas')
                .delete()
                .eq('nome_completo', requestToDelete.nome_completo)
                .eq('telefone', requestToDelete.telefone);
            
            if (error) throw error;
            setRequests(requests.filter(r => 
                r.nome_completo !== requestToDelete.nome_completo || 
                r.telefone !== requestToDelete.telefone
            ));
            setRequestToDelete(null);
            setSelectedGroup(null);
        } catch (e) {
            alert("Erro ao excluir pedido.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClearAll = async () => {
        setIsDeleting(true);
        try {
            const { error } = await supabase
                .from('pedidos_camisetas')
                .delete()
                .not('id', 'is', null); // Deleta tudo
            if (error) throw error;
            setRequests([]);
            setShowClearAllModal(false);
        } catch (e) {
            alert("Erro ao limpar pedidos.");
        } finally {
            setIsDeleting(false);
        }
    };

    const groupedRequests = useMemo(() => {
        const groups: Record<string, any> = {};
        
        requests.forEach(req => {
            const key = `${req.nome_completo}-${req.telefone}`;
            if (!groups[key]) {
                groups[key] = {
                    nome_completo: req.nome_completo,
                    telefone: req.telefone,
                    items: [],
                    totalQuantity: 0,
                    lastCreatedAt: req.created_at,
                    id: req.id // representative ID for layout
                };
            }
            groups[key].items.push(req);
            groups[key].totalQuantity += (req.quantidade || 0);
            if (new Date(req.created_at) > new Date(groups[key].lastCreatedAt)) {
                groups[key].lastCreatedAt = req.created_at;
            }
        });

        return Object.values(groups).sort((a, b) => 
            new Date(b.lastCreatedAt).getTime() - new Date(a.lastCreatedAt).getTime()
        );
    }, [requests]);

    const filteredGroups = useMemo(() => {
        return groupedRequests.filter(group => {
            const matchesSearch = (group.nome_completo || '').toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        });
    }, [groupedRequests, searchTerm]);

    const totalShirts = useMemo(() => {
        return requests.reduce((acc, curr) => acc + (curr.quantidade || 0), 0);
    }, [requests]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 opacity-20">
            <RefreshCw className="animate-spin mb-4" />
            <span className="uppercase font-bold tracking-widest text-xs">Carregando Pedidos...</span>
        </div>
    );

    const getWhatsAppLink = (phone: string) => {
        const cleanPhone = phone.replace(/\D/g, '');
        const message = encodeURIComponent("Paz do Senhor, tudo bem? Você sinalizou que tem interesse em fazer o pedido da camiseta do Congresso?");
        return `https://wa.me/${cleanPhone}?text=${message}`;
    };

    return (
        <div className="max-container py-6 md:py-10 space-y-6 md:space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-neon/10 rounded-xl md:rounded-2xl flex items-center justify-center border border-brand-neon/20">
                        <ClipboardList className="text-brand-neon" size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-3xl font-display uppercase tracking-tight text-white leading-none">Gestão de Camisetas</h2>
                        <p className="text-[9px] uppercase font-bold text-white/30 tracking-[0.1em] mt-1">Pedidos Congresso 2026</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setShowClearAllModal(true)}
                        className="px-4 py-2.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest active:scale-95"
                    >
                        Limpar Base
                    </button>
                    <button onClick={fetchRequests} className="p-2.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-brand-neon transition-all active:rotate-180 duration-500">
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#0a0a0a] p-5 md:p-8 rounded-2xl md:rounded-[2rem] border border-white/5 flex flex-col gap-2 md:gap-4 relative overflow-hidden group">
                    <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Users size={60} className="md:w-20 md:h-20" />
                    </div>
                    <span className="text-[9px] uppercase font-black text-white/20 tracking-[0.2em]">Solicitantes</span>
                    <span className="text-3xl md:text-5xl font-display text-white leading-none">{groupedRequests.length}</span>
                </div>
                <div className="bg-[#0a0a0a] p-5 md:p-8 rounded-2xl md:rounded-[2rem] border border-white/5 flex flex-col gap-2 md:gap-4 relative overflow-hidden group">
                    <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity">
                        <ShoppingBag size={60} className="md:w-20 md:h-20" />
                    </div>
                    <span className="text-[9px] uppercase font-black text-white/20 tracking-[0.2em]">Total Camisetas</span>
                    <span className="text-3xl md:text-5xl font-display text-brand-neon leading-none">{totalShirts}</span>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Filtrar por nome..."
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl md:rounded-[2rem] pl-14 pr-6 py-4 text-white focus:outline-none focus:border-brand-neon transition-all text-xs font-medium shadow-xl"
                />
            </div>

            <div className="grid grid-cols-1 gap-3">
                {filteredGroups.map((group) => (
                    <motion.div 
                        layout
                        key={`group-${group.nome_completo}-${group.telefone}`} 
                        onClick={() => setSelectedGroup(group)}
                        className="bg-[#0d0d0d] border border-white/5 p-5 md:p-8 rounded-2xl md:rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between gap-4 group cursor-pointer hover:border-brand-neon/30 hover:bg-[#111] transition-all relative overflow-hidden"
                    >
                        <div className="flex flex-col gap-1.5">
                            <h3 className="text-xl md:text-2xl font-display uppercase tracking-wide text-white group-hover:text-brand-neon transition-colors">{group.nome_completo}</h3>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                                <div className="flex items-center gap-1.5">
                                    <Phone size={12} className="text-white/20" />
                                    <span className="text-xs font-mono text-white/40 tracking-wider font-bold">{group.telefone}</span>
                                </div>
                                <div className="px-3 py-1 rounded-full bg-brand-neon/10 border border-brand-neon/20 flex items-center gap-2">
                                    <ShoppingBag size={10} className="text-brand-neon" />
                                    <span className="text-[10px] font-black text-brand-neon uppercase tracking-widest">Total: {group.totalQuantity}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-3 md:pt-0 border-t md:border-0 border-white/5" onClick={(e) => e.stopPropagation()}>
                            <a 
                                href={getWhatsAppLink(group.telefone)}
                                target="_blank" 
                                rel="noreferrer"
                                className="flex-1 md:flex-none h-11 md:h-14 px-6 rounded-xl md:rounded-2xl bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all flex items-center justify-center gap-2 border border-green-500/20 font-black uppercase text-[9px] tracking-widest active:scale-95"
                                title="WhatsApp"
                            >
                                <Phone size={14} /> WhatsApp
                            </a>
                            <button 
                                onClick={() => setRequestToDelete(group)}
                                className="w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-500/20 active:scale-95"
                                title="Excluir"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </motion.div>
                ))}
                {filteredGroups.length === 0 && (
                    <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
                        <ClipboardList className="mx-auto text-white/10 mb-2" size={32} />
                        <span className="uppercase font-black tracking-widest text-[9px] text-white/20">Sem registros</span>
                    </div>
                )}
            </div>

            {/* Modals */}
            <AnimatePresence mode="wait">
                {selectedGroup && (
                    <div key="details-modal" className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedGroup(null)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="relative bg-[#0d0d0d] border border-white/10 w-full max-w-sm md:max-w-md rounded-[2rem] overflow-hidden shadow-2xl">
                            <div className="p-6 md:p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-xl md:text-2xl font-display uppercase text-white leading-tight mb-1">{selectedGroup.nome_completo}</h2>
                                        <p className="text-brand-neon font-mono text-[10px] tracking-widest font-bold">{selectedGroup.telefone}</p>
                                    </div>
                                    <button onClick={() => setSelectedGroup(null)} className="p-2.5 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                                        <X size={16} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[9px] uppercase font-black text-white/20 tracking-[0.3em] whitespace-nowrap">Itens do Pedido</span>
                                        <div className="h-px w-full bg-white/5" />
                                    </div>

                                    <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar">
                                        {selectedGroup.items.map((item: any, idx: number) => {
                                            // Fix for legacy items affected by the hyphen splitting bug
                                            const isVerdeOlivaBug = item.cor === 'VERDE' && item.tamanho?.startsWith('OLIVA');
                                            const displayColor = isVerdeOlivaBug ? 'VERDE-OLIVA' : item.cor;
                                            const displayTamanho = isVerdeOlivaBug ? item.tamanho.replace('OLIVA', '').trim() : item.tamanho;

                                            return (
                                                <div key={idx} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl group hover:bg-white/[0.04] transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-1.5 h-8 rounded-full ${displayColor === 'TERRACOTA' ? 'bg-orange-600' : 'bg-green-600'}`} />
                                                        <div>
                                                            <p className="text-base font-display text-white uppercase leading-none mb-1">{displayColor}</p>
                                                            <p className="text-[9px] text-white/40 uppercase font-black tracking-wider">{displayTamanho}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-xl font-display text-brand-neon">x{item.quantidade}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                                    <span className="text-[9px] uppercase font-black text-white/30 tracking-[0.3em]">Total Geral</span>
                                    <span className="text-2xl font-display text-white">{selectedGroup.totalQuantity} Itens</span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 bg-white/[0.02] border-t border-white/5">
                                <a 
                                    href={getWhatsAppLink(selectedGroup.telefone)}
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="h-16 flex items-center justify-center gap-3 text-green-500 font-black uppercase text-[10px] tracking-widest hover:bg-green-500/10 transition-all border-r border-white/5 active:bg-green-500/20"
                                >
                                    <Phone size={16} /> WhatsApp
                                </a>
                                <button 
                                    onClick={() => {
                                        setRequestToDelete(selectedGroup);
                                    }}
                                    className="h-16 flex items-center justify-center gap-3 text-red-500 font-black uppercase text-[10px] tracking-widest hover:bg-red-500/10 transition-all active:bg-red-500/20"
                                >
                                    <Trash2 size={16} /> Excluir
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {requestToDelete && (
                    <div key="delete-modal" className="fixed inset-0 z-[210] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setRequestToDelete(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-[#1a1a1a] border-2 border-white/10 w-full max-w-sm rounded-3xl p-8 text-center">
                            <Trash2 size={40} className="mx-auto text-red-500 mb-4" />
                            <h3 className="text-xl font-display uppercase mb-2">Excluir Tudo?</h3>
                            <p className="text-white/40 text-sm mb-8">Confirmar exclusão de TODOS os pedidos de <b className="text-white">{requestToDelete.nome_completo}</b>?</p>
                            <div className="flex flex-col gap-2">
                                <button onClick={handleDeleteGroup} className="w-full bg-red-500 py-4 rounded-xl font-bold uppercase">Sim, Excluir</button>
                                <button onClick={() => setRequestToDelete(null)} className="w-full py-4 text-white/50 uppercase font-bold text-xs">Cancelar</button>
                            </div>
                        </motion.div>
                    </div>
                )}
                {showClearAllModal && (
                    <div key="clear-modal" className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowClearAllModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-[#1a1a1a] border-2 border-red-500/50 w-full max-w-sm rounded-3xl p-8 text-center shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                            <AlertCircle size={40} className="mx-auto text-red-500 mb-4" />
                            <h3 className="text-xl font-display uppercase mb-2">Limpar TUDO?</h3>
                            <p className="text-white/40 text-sm mb-8">Esta ação irá apagar TODOS os pedidos de camisetas permanentemente.</p>
                            <div className="flex flex-col gap-2">
                                <button onClick={handleClearAll} className="w-full bg-red-500 py-4 rounded-xl font-bold uppercase">Sim, Excluir Tudo</button>
                                <button onClick={() => setShowClearAllModal(false)} className="w-full py-4 text-white/50 uppercase font-bold text-xs">Cancelar</button>
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
  const [adminView, setAdminView] = useState<'menu' | 'dashboard' | 'presence' | 'estoque'>('menu');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [builderSubTab, setBuilderSubTab] = useState<'hero'>('hero');
  const [heroDimensions, setHeroDimensions] = useState({ width: 0, height: 0 });

  const handleDimensionsDetected = React.useCallback((width: number, height: number) => {
    setHeroDimensions(prev => {
      if (Math.round(prev.width) === Math.round(width) && Math.round(prev.height) === Math.round(height)) return prev;
      return { width, height };
    });
  }, []);

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
          <button onClick={() => setAdminView('estoque')} className="w-full bg-[#ccff00] hover:bg-[#b5e000] text-black border-2 border-transparent p-6 rounded-lg text-lg font-bold uppercase transition-all text-center flex items-center justify-center gap-2"><ShoppingBag size={22} strokeWidth={2.5} /> Estoque Umademats</button>
          <button onClick={() => onNavigateOrg?.()} className="w-full bg-brand-purple border-2 border-white/10 hover:border-brand-neon p-6 rounded-lg text-lg font-bold uppercase text-white transition-all text-center flex items-center justify-center gap-3"><LayoutGrid size={24} /> ORGANIZAÇÃO UMADEMATS</button>
          <button onClick={() => setAdminView('presence')} className="w-full bg-[#1a1a1a] border-2 border-white/10 hover:border-brand-neon p-6 rounded-lg text-lg font-bold uppercase text-white transition-all text-center">Contador de Culto</button>
        </div>
        <button onClick={onBack} className="text-white/30 hover:text-white uppercase font-bold text-sm tracking-widest flex items-center gap-2"><ArrowLeft size={16} /> Sair do Painel</button>
      </div>
  );
  if (adminView === 'presence') return <PresenceCounter onBack={() => setAdminView('menu')} />;
  if (adminView === 'estoque') return <EstoqueUmadematsAdmin onBack={() => setAdminView('menu')} />;
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
                 <div className="px-2 space-y-2">
                    <div className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-brand-neon text-black">
                      <div className="flex items-center gap-2">
                         <span className="text-xs font-bold uppercase tracking-widest">Seção HERO</span>
                         <span className="bg-black/10 px-1.5 py-0.5 rounded text-[8px] font-black">CMS</span>
                      </div>
                      <ChevronRight size={14} />
                    </div>
                 </div>

                 <div className="h-px w-full bg-white/5 mx-2" />

                 <div className="px-2 space-y-4">
                    <div className="p-4 bg-brand-neon/10 border border-brand-neon/20 rounded-2xl">
                       <p className="text-[9px] text-brand-neon font-black uppercase tracking-widest mb-1">Status CMS</p>
                       <p className="text-xs text-white/80 uppercase font-bold">Gerenciamento de Slides Ativado</p>
                    </div>
                    <p className="text-[9px] text-white/20 uppercase font-bold tracking-widest px-2">As alterações nos slides são aplicadas instantaneamente.</p>
                 </div>
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
             <div className="w-full h-full flex flex-col md:flex-row gap-6 relative">
                {activeTab === 'builder' && (
                   <motion.div 
                     initial={{ opacity: 0, y: 20 }} 
                     animate={{ opacity: 1, y: 0 }} 
                     className={`flex-1 ${typeof window !== 'undefined' && window.innerWidth < 768 ? 'fixed inset-0 z-[100] bg-black p-4' : 'max-w-5xl mx-auto'}`}
                   >
                      <div className="md:hidden flex items-center gap-4 mb-6 pt-2">
                        <button onClick={() => setAdminView('menu')} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white"><ArrowLeft size={20} /></button>
                        <h2 className="text-xl font-display uppercase text-white">Seção HERO CMS</h2>
                      </div>
                      <div className="h-full overflow-y-auto no-scrollbar pb-20">
                        <HeroCMS heroDimensions={heroDimensions} />
                      </div>
                   </motion.div>
                )}
             </div>
          )}
        </main>
      </div>
    </div>
  );
};
