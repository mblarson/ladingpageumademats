
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Clock, Calendar, Users, ArrowLeft, Lock, Layout, Save, RotateCcw, ChevronDown, ChevronRight, Activity, RefreshCw, Presentation, List, PieChart, User, Menu, X, BookOpen, Trophy, Flame, AlertCircle, Database, ChevronUp, MapPin, ClipboardList, GraduationCap, Plus, Trash2, Globe, Eye } from 'lucide-react';
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

// --- LIDERA ADMIN COMPONENTS ---
const LideraAdmin: React.FC = () => {
    const [orientations, setOrientations] = useState<any[]>([]);
    const [editingOrientation, setEditingOrientation] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchOrientations();
    }, []);

    const fetchOrientations = async () => {
        setLoading(true);
        const { data } = await supabase.from('lidera_orientations').select('*').order('created_at', { ascending: false });
        if (data) setOrientations(data);
        setLoading(false);
    };

    const handleNew = () => {
        setEditingOrientation({
            title: '',
            subtitle: '',
            comment: '',
            is_published: false,
            materials: []
        });
    };

    const handleEdit = async (ori: any) => {
        const { data: materials } = await supabase.from('lidera_materials').select('*').eq('orientation_id', ori.id);
        setEditingOrientation({ ...ori, materials: materials || [] });
    };

    const handleSave = async () => {
        if (!editingOrientation.title) return alert("Título é obrigatório");
        setIsSaving(true);
        try {
            const { materials, ...oriData } = editingOrientation;
            const { data: savedOri, error: oriError } = await supabase
                .from('lidera_orientations')
                .upsert({ ...oriData }, { onConflict: 'id' })
                .select()
                .single();

            if (oriError) throw oriError;

            // Delete old materials and insert new ones
            await supabase.from('lidera_materials').delete().eq('orientation_id', savedOri.id);
            if (materials.length > 0) {
                const materialsToInsert = materials.map((m: any) => ({
                    orientation_id: savedOri.id,
                    name: m.name,
                    link: m.link
                }));
                await supabase.from('lidera_materials').insert(materialsToInsert);
            }

            alert("Orientação salva com sucesso!");
            setEditingOrientation(null);
            fetchOrientations();
        } catch (e: any) {
            alert("Erro: " + e.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Remover esta publicação permanentemente?")) return;
        await supabase.from('lidera_orientations').delete().eq('id', id);
        fetchOrientations();
        setEditingOrientation(null);
    };

    if (loading) return <div className="p-10 text-center uppercase tracking-widest opacity-20">Carregando Liderança...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <GraduationCap className="text-brand-neon" />
                    <h2 className="text-2xl font-display uppercase tracking-wider">Lidera UMADEMATS</h2>
                </div>
                <button onClick={handleNew} className="bg-brand-neon text-black px-6 py-2 rounded-xl font-bold uppercase text-xs flex items-center gap-2 hover:scale-105 transition-all">
                    <Plus size={16} /> Nova Orientação
                </button>
            </div>

            {editingOrientation ? (
                <div className="bg-[#1a1a1a] border-2 border-brand-neon p-6 md:p-10 rounded-[2.5rem] space-y-8">
                    <div className="flex items-center justify-between">
                         <button onClick={() => setEditingOrientation(null)} className="text-white/50 hover:text-white uppercase font-bold text-xs flex items-center gap-2"><ArrowLeft size={14} /> Voltar</button>
                         <div className="flex items-center gap-4">
                            {editingOrientation.id && (
                                <button onClick={() => handleDelete(editingOrientation.id)} className="text-red-500 hover:text-red-400 p-2"><Trash2 size={20} /></button>
                            )}
                            <button onClick={handleSave} disabled={isSaving} className="bg-brand-neon text-black px-8 py-3 rounded-xl font-bold uppercase text-sm flex items-center gap-2">
                                {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />} {editingOrientation.is_published ? 'Salvar Alterações' : 'Publicar'}
                            </button>
                         </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-white/50 text-[10px] uppercase font-bold tracking-widest ml-2">Título da Orientação</label>
                            <input type="text" value={editingOrientation.title} onChange={(e) => setEditingOrientation({...editingOrientation, title: e.target.value})} className="bg-black border border-white/10 rounded-xl p-4 text-white focus:border-brand-neon outline-none" placeholder="Ex: Manual do Líder 2026" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-white/50 text-[10px] uppercase font-bold tracking-widest ml-2">Subtítulo Curto</label>
                            <input type="text" value={editingOrientation.subtitle} onChange={(e) => setEditingOrientation({...editingOrientation, subtitle: e.target.value})} className="bg-black border border-white/10 rounded-xl p-4 text-white focus:border-brand-neon outline-none" placeholder="Ex: Orientações para o Jubileu" />
                        </div>
                        <div className="md:col-span-2 flex flex-col gap-2">
                            <label className="text-white/50 text-[10px] uppercase font-bold tracking-widest ml-2">Texto de Orientação (Comentário)</label>
                            <textarea value={editingOrientation.comment} onChange={(e) => setEditingOrientation({...editingOrientation, comment: e.target.value})} className="bg-black border border-white/10 rounded-xl p-4 text-white focus:border-brand-neon outline-none h-40 resize-none" placeholder="Escreva as instruções para os líderes..." />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-white font-display uppercase tracking-widest border-b border-white/10 pb-2">Materiais de Apoio</h4>
                        {editingOrientation.materials.map((mat: any, idx: number) => (
                            <div key={idx} className="flex flex-col md:flex-row gap-3 bg-black/40 p-4 rounded-xl border border-white/5">
                                <input type="text" value={mat.name} onChange={(e) => {
                                    const newMats = [...editingOrientation.materials];
                                    newMats[idx].name = e.target.value;
                                    setEditingOrientation({...editingOrientation, materials: newMats});
                                }} placeholder="Nome do Arquivo" className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-xs text-white" />
                                <input type="text" value={mat.link} onChange={(e) => {
                                    const newMats = [...editingOrientation.materials];
                                    newMats[idx].link = e.target.value;
                                    setEditingOrientation({...editingOrientation, materials: newMats});
                                }} placeholder="Link do Google Drive" className="flex-[2] bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-xs text-white" />
                                <button onClick={() => {
                                    const newMats = editingOrientation.materials.filter((_: any, i: number) => i !== idx);
                                    setEditingOrientation({...editingOrientation, materials: newMats});
                                }} className="p-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={18} /></button>
                            </div>
                        ))}
                        <button onClick={() => setEditingOrientation({...editingOrientation, materials: [...editingOrientation.materials, {name: '', link: ''}]})} className="w-full py-4 border-2 border-dashed border-white/10 rounded-xl text-white/30 hover:text-white hover:border-white/30 transition-all uppercase text-xs font-bold tracking-widest flex items-center justify-center gap-2">
                            <Plus size={16} /> Adicionar Link de Material
                        </button>
                    </div>

                    <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl">
                         <button onClick={() => setEditingOrientation({...editingOrientation, is_published: !editingOrientation.is_published})} className={`w-12 h-6 rounded-full relative p-1 transition-colors ${editingOrientation.is_published ? 'bg-brand-neon' : 'bg-white/20'}`}>
                            <motion.div animate={{ x: editingOrientation.is_published ? 24 : 0 }} className="w-4 h-4 bg-white rounded-full" />
                         </button>
                         <span className="text-xs font-bold uppercase tracking-widest">{editingOrientation.is_published ? 'Publicado no Portal' : 'Rascunho (Não visível)'}</span>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {orientations.length > 0 ? orientations.map((ori) => (
                        <button key={ori.id} onClick={() => handleEdit(ori)} className="bg-[#1a1a1a] border-2 border-white/5 p-6 rounded-3xl flex items-center justify-between group hover:border-brand-neon transition-all">
                            <div className="flex items-center gap-4 text-left">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${ori.is_published ? 'bg-brand-neon text-black' : 'bg-white/10 text-white/30'}`}>
                                    {ori.is_published ? <Globe size={20} /> : <Eye size={20} />}
                                </div>
                                <div>
                                    <h3 className="font-display uppercase text-xl leading-none text-white">{ori.title}</h3>
                                    <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest">{ori.subtitle}</p>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-white/20 group-hover:text-brand-neon" />
                        </button>
                    )) : (
                        <div className="col-span-2 p-20 text-center border-2 border-dashed border-white/5 rounded-3xl opacity-20 uppercase font-bold tracking-widest text-xs">Nenhuma orientação cadastrada.</div>
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
                    <button onClick={() => setSelectedResp(null)} className="flex items-center gap-2 text-brand-pink font-bold uppercase text-xs mb-6 hover:opacity-70 transition-opacity"><ArrowLeft size={14} /> Voltar ao Mês</button>
                    <h3 className="text-3xl font-display uppercase mb-2">{selectedResp.responsible}</h3>
                    <p className="text-white/40 text-xs uppercase font-bold tracking-widest mb-8">{selectedResp.month} • {new Date(selectedResp.created_at).toLocaleString()}</p>
                    <div className="bg-black/40 p-8 rounded-2xl border border-white/5">
                        <ColumnLayout accentColor="text-brand-pink" items={SECTORS_LIST.filter(s => Number(selectedResp.sectors?.[s]) > 0).map(s => ({ label: `Setor ${s}`, value: selectedResp.sectors[s] }))} />
                    </div>
                </div>
            ) : selectedMonth ? (
                <div className="space-y-10">
                    <div className="bg-[#1a1a1a] border-2 border-brand-neon p-8 rounded-3xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 text-brand-neon"><PieChart size={120} /></div>
                        <button onClick={() => setSelectedMonth(null)} className="flex items-center gap-2 text-brand-neon font-bold uppercase text-xs mb-6 hover:opacity-70 transition-opacity relative z-10"><ArrowLeft size={14} /> Voltar aos Meses</button>
                        <h3 className="text-5xl font-display uppercase text-brand-neon mb-4 relative z-10">{selectedMonth}</h3>
                        <div className="relative z-10"><h4 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Total Acumulado</h4><span className="text-7xl font-display text-white">{groupedData[selectedMonth].total}</span></div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-2"><MapPin size={18} className="text-brand-neon" /><h4 className="text-lg font-display uppercase tracking-wide text-white">Totais por Setor</h4></div>
                        <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-white/10">
                            <ColumnLayout accentColor="text-brand-neon" items={SECTORS_LIST.filter(s => (groupedData[selectedMonth].sectors[s] || 0) > 0).map(s => ({ label: `Setor ${s}`, value: groupedData[selectedMonth].sectors[s] }))} />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {months.length > 0 ? months.map(m => (
                        <button key={m} onClick={() => setSelectedMonth(m)} className="w-full flex items-center justify-between p-6 bg-[#1a1a1a] hover:bg-brand-neon hover:text-black border border-white/10 rounded-2xl transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-black/20"><Calendar size={20} className="text-white group-hover:text-black" /></div>
                                <div className="text-left"><span className="block text-2xl font-display uppercase tracking-widest">{m}</span><span className="text-[10px] font-bold uppercase opacity-40 group-hover:opacity-60">{groupedData[m].total} Presenças Registradas</span></div>
                            </div>
                            <ChevronRight size={20} className="opacity-20 group-hover:opacity-100" />
                        </button>
                    )) : (<div className="p-20 text-center border-2 border-dashed border-white/5 rounded-3xl opacity-20 uppercase font-bold tracking-widest text-xs">Nenhum registro de presença encontrado.</div>)}
                </div>
            )}
        </div>
    );
};

// Fix: Missing interface for AdminDashboard props
interface AdminDashboardProps {
  onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const stats = useAnalyticsDashboard();
  const { config, saveConfig } = useSiteConfig();
  const { autoPingEnabled, setAutoPingEnabled } = useKeepalive();
  
  const [draftConfig, setDraftConfig] = useState<SiteConfig>(config);
  const [activeTab, setActiveTab] = useState<'analytics' | 'builder' | 'keepalive' | 'presence' | 'bible' | 'lidera'>('analytics');
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
    { id: 'lidera', label: 'Lidera UMADEMATS', icon: GraduationCap, color: 'bg-brand-neon', textColor: 'text-black' },
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
                 <h1 className="text-lg font-display uppercase text-white tracking-wide">Painel <span className="text-brand-neon">UMADEMATS</span></h1>
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
            {activeTab === 'builder' && (<div className="mt-8 pt-6 border-t border-white/5"><button onClick={() => saveConfig(draftConfig)} className="w-full bg-brand-neon text-black font-bold uppercase py-3 rounded-xl flex items-center justify-center gap-2"><Save size={18} /> Salvar Site</button></div>)}
        </aside>

        <main className="flex-1 overflow-y-auto bg-black p-4 md:p-8 custom-scrollbar">
          {activeTab === 'presence' && <PresenceControl />}
          {activeTab === 'lidera' && <LideraAdmin />}
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
                <div className="w-full h-full origin-top scale-[0.6] md:scale-[0.8] lg:scale-100 bg-white"><div className="h-full overflow-y-auto overflow-x-hidden no-scrollbar"><HeroSection previewConfig={draftConfig} /><EventSection previewConfig={draftConfig} /><ActionSection previewConfig={draftConfig} /><AboutSection previewConfig={draftConfig} /></div></div>
             </div>
          )}
        </main>
      </div>
    </div>
  );
};
