
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Plus, X, Trash2, CheckCircle2, 
  Circle, User, MessageSquare, 
  LayoutGrid, Save, Loader2, RefreshCw, AlertCircle,
  Clock, Send, ExternalLink, Check, MoreVertical, Edit2
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface OrgCard {
  id: string;
  created_at: string;
  title: string;
  column_id: 'planejamento' | 'execucao' | 'concluido';
}

interface OrgParticipant {
  id: string;
  card_id: string;
  name: string;
}

interface OrgTask {
  id: string;
  card_id: string;
  title: string;
  is_completed: boolean;
  needs_attention: boolean;
}

interface OrgComment {
  id: string;
  card_id: string;
  created_at: string;
  user_name: string;
  content: string;
}

const COLUMNS = [
  { id: 'atencao', title: 'AGUARDANDO LÍDERES', color: 'text-red-500', isVirtual: true },
  { id: 'planejamento', title: 'EM PLANEJAMENTO', color: 'text-zinc-600', isVirtual: false },
  { id: 'execucao', title: 'EM EXECUÇÃO', color: 'text-blue-500', isVirtual: false },
  { id: 'concluido', title: 'CONCLUÍDO', color: 'text-green-500', isVirtual: false }
];

export const OrganizationPortal: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [cards, setCards] = useState<OrgCard[]>([]);
  const [participants, setParticipants] = useState<OrgParticipant[]>([]);
  const [tasks, setTasks] = useState<OrgTask[]>([]);
  const [comments, setComments] = useState<OrgComment[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCard, setSelectedCard] = useState<OrgCard | null>(null);
  const [activeTaskMenu, setActiveTaskMenu] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newParticipantName, setNewParticipantName] = useState('');
  const [newComment, setNewComment] = useState({ name: '', content: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cardsRes, partRes, tasksRes, commRes] = await Promise.all([
        supabase.from('org_cards').select('*').order('created_at', { ascending: false }),
        supabase.from('org_participants').select('*'),
        supabase.from('org_tasks').select('*'),
        supabase.from('org_comments').select('*').order('created_at', { ascending: true })
      ]);
      
      if (cardsRes.data) setCards(cardsRes.data);
      if (partRes.data) setParticipants(partRes.data);
      if (tasksRes.data) setTasks(tasksRes.data);
      if (commRes.data) setComments(commRes.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleCreateCard = async (colId: string) => {
    if (!newCardTitle) return;
    setIsSaving(true);
    try {
      const { data, error } = await supabase.from('org_cards').insert({ title: newCardTitle, column_id: colId as any }).select().single();
      if (error) throw error;
      setCards([data, ...cards]);
      setNewCardTitle('');
      setIsModalOpen(false);
    } catch (e) { alert("Erro ao criar card"); } finally { setIsSaving(false); }
  };

  const handleCreateParticipant = async () => {
    if (!newParticipantName || !selectedCard) return;
    try {
      const { data, error } = await supabase.from('org_participants').insert({ card_id: selectedCard.id, name: newParticipantName }).select().single();
      if (error) throw error;
      setParticipants([...participants, data]);
      setNewParticipantName('');
    } catch (e) { console.error(e); }
  };

  const handleDeleteParticipant = async (id: string) => {
    try {
      await supabase.from('org_participants').delete().eq('id', id);
      setParticipants(participants.filter(p => p.id !== id));
    } catch (e) { console.error(e); }
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle || !selectedCard) return;
    try {
      const { data, error } = await supabase.from('org_tasks').insert({ card_id: selectedCard.id, title: newTaskTitle }).select().single();
      if (error) throw error;
      setTasks([...tasks, data]);
      setNewTaskTitle('');
    } catch (e) { console.error(e); }
  };

  const handleUpdateTask = async (id: string, updates: Partial<OrgTask>) => {
    setActiveTaskMenu(null);
    try {
      const { error } = await supabase.from('org_tasks').update(updates).eq('id', id);
      if (error) throw error;
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    } catch (e) { console.error(e); }
  };

  const handleDeleteTask = async (id: string) => {
    setActiveTaskMenu(null);
    if (!confirm("Excluir esta tarefa permanentemente?")) return;
    try {
      const { error } = await supabase.from('org_tasks').delete().eq('id', id);
      if (error) throw error;
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (e) { console.error(e); }
  };

  const handleCreateComment = async () => {
    if (!newComment.name || !newComment.content || !selectedCard) {
      alert("Preencha seu nome e o comentário");
      return;
    }
    try {
      const { data, error } = await supabase.from('org_comments').insert({
        card_id: selectedCard.id,
        user_name: newComment.name,
        content: newComment.content
      }).select().single();
      if (error) throw error;
      setComments([...comments, data]);
      setNewComment({ ...newComment, content: '' });
    } catch (e) { console.error(e); }
  };

  const handleDeleteCard = async (id: string) => {
    if (!confirm("Excluir card permanentemente?")) return;
    try {
      await supabase.from('org_cards').delete().eq('id', id);
      setCards(cards.filter(c => c.id !== id));
      setIsDetailOpen(false);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-zinc-900 flex flex-col font-sans overflow-hidden relative">
      <header className="sticky top-0 z-50 bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between min-w-full shadow-sm">
         <div className="flex items-center gap-6">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-zinc-100 transition-colors">
              <ArrowLeft size={20} className="text-zinc-500" />
            </button>
            <div>
               <h1 className="text-xl font-bold uppercase tracking-tight text-zinc-800">ORGANIZAÇÃO <span className="text-brand-purple">UMADEMATS</span></h1>
               <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-brand-neon shadow-[0_0_10px_#ccff00]" /><span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">UMADEMATS</span></div>
            </div>
         </div>
         <button onClick={fetchData} className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-400"><RefreshCw size={18} className={loading ? 'animate-spin' : ''} /></button>
      </header>

      <main className="flex-1 p-6 flex flex-col md:flex-row gap-4 h-[calc(100vh-80px)] overflow-x-auto custom-scrollbar">
        {COLUMNS.map((col) => (
          <div key={col.id} className="w-full md:w-[320px] flex flex-col bg-zinc-100/50 rounded-2xl border border-zinc-200 overflow-hidden shrink-0">
             <div className="p-4 flex items-center justify-between border-b border-zinc-200 bg-white/50">
                <h2 className={`text-xs font-black uppercase tracking-widest ${col.color}`}>{col.title}</h2>
                <div className="bg-zinc-200/50 text-zinc-500 px-2 py-0.5 rounded text-[10px] font-bold">
                  {col.isVirtual ? tasks.filter(t => t.needs_attention).length : cards.filter(c => c.column_id === col.id).length}
                </div>
             </div>

             <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {col.isVirtual ? (
                  tasks.filter(t => t.needs_attention).map((task) => {
                    const parentCard = cards.find(c => c.id === task.card_id);
                    return (
                      <div key={task.id} className="bg-white p-4 rounded-xl border-l-4 border-red-500 shadow-sm space-y-3">
                         <span className="text-[9px] font-black uppercase text-zinc-400 block tracking-widest">Atenção Solicitada em:</span>
                         <h3 className="text-sm font-bold leading-tight">{task.title}</h3>
                         <div className="flex items-center gap-2 pt-2 border-t border-zinc-50">
                            <button onClick={() => { if(parentCard) { setSelectedCard(parentCard); setIsDetailOpen(true); } }} className="text-[9px] font-black uppercase bg-zinc-100 px-3 py-1.5 rounded-lg hover:bg-zinc-200 transition-all flex items-center gap-1"><ExternalLink size={10} /> Ir até Card</button>
                            <button onClick={() => handleUpdateTask(task.id, { needs_attention: false })} className="text-[9px] font-black uppercase bg-green-50 text-green-600 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-all">Liberar</button>
                         </div>
                      </div>
                    );
                  })
                ) : (
                  <>
                    {cards.filter(c => c.column_id === col.id).map((card) => (
                      <motion.div key={card.id} layoutId={card.id} onClick={() => { setSelectedCard(card); setIsDetailOpen(true); }} className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm hover:border-zinc-300 cursor-pointer transition-all">
                         <h3 className="text-sm font-bold text-zinc-700 leading-tight">{card.title}</h3>
                      </motion.div>
                    ))}
                    <button onClick={() => { setSelectedCard({ column_id: col.id as any } as any); setIsModalOpen(true); }} className="w-full py-3 border-2 border-dashed border-zinc-200 rounded-xl text-zinc-400 hover:border-zinc-300 hover:text-zinc-500 transition-all flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest"><Plus size={14} /> Novo Card</button>
                  </>
                )}
             </div>
          </div>
        ))}
      </main>

      {/* MODAL DETALHE DO CARD */}
      <AnimatePresence>
        {isDetailOpen && selectedCard && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setIsDetailOpen(false); setActiveTaskMenu(null); }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="relative bg-white border border-zinc-200 rounded-[2rem] w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
               <div className="p-8 border-b border-zinc-100 flex items-center justify-between shrink-0">
                  <div>
                    <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block mb-1">Painel do Projeto</span>
                    <h3 className="text-2xl font-bold text-zinc-800">{selectedCard.title}</h3>
                  </div>
                  <button onClick={() => { setIsDetailOpen(false); setActiveTaskMenu(null); }} className="p-2 text-zinc-400 hover:text-zinc-900"><X size={24} /></button>
               </div>

               <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10">
                  {/* TAREFAS */}
                  <div className="space-y-4">
                     <h4 className="text-xs font-black uppercase text-zinc-400 tracking-widest flex items-center gap-2"><LayoutGrid size={14} className="text-brand-purple" /> Checklist de Tarefas</h4>
                     <div className="flex gap-2">
                        <input type="text" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleCreateTask()} placeholder="Nova tarefa..." className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm text-zinc-900 focus:border-brand-purple outline-none" />
                        <button onClick={handleCreateTask} className="bg-zinc-800 text-white p-3 rounded-xl hover:scale-105 transition-all shadow-md"><Plus size={20} /></button>
                     </div>
                     <div className="space-y-2">
                        {tasks.filter(t => t.card_id === selectedCard.id).map(task => (
                           <div 
                            key={task.id} 
                            onClick={(e) => { e.stopPropagation(); setActiveTaskMenu(activeTaskMenu === task.id ? null : task.id); }}
                            className={`flex flex-col p-4 rounded-xl border-2 transition-all relative cursor-pointer active:bg-zinc-50 hover:border-zinc-300 ${task.is_completed ? 'border-zinc-100 bg-zinc-50' : 'border-red-500 bg-white'}`}
                           >
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleUpdateTask(task.id, { is_completed: !task.is_completed }); }} 
                                    className={`p-1.5 rounded-full transition-all shrink-0 ${task.is_completed ? 'bg-green-500 text-white shadow-sm' : 'bg-zinc-100 text-zinc-300 hover:text-green-500'}`}
                                  >
                                    {task.is_completed ? <Check size={14} strokeWidth={4} /> : <Circle size={14} />}
                                  </button>
                                  <span className={`text-sm font-bold leading-tight ${task.is_completed ? 'text-zinc-400 line-through' : 'text-zinc-800'}`}>{task.title}</span>
                                </div>
                                <div className="flex items-center gap-2 relative">
                                  {task.needs_attention && <span className="text-[9px] font-black uppercase text-red-500 flex items-center gap-1 mr-1 shrink-0 bg-red-50 px-2 py-0.5 rounded-full"><AlertCircle size={10} /> Atenção</span>}
                                  <MoreVertical size={18} className="text-zinc-400 group-hover:text-zinc-900" />
                                  
                                  {/* MENU DE AÇÕES DA TAREFA */}
                                  <AnimatePresence>
                                    {activeTaskMenu === task.id && (
                                      <motion.div 
                                        initial={{ opacity: 0, scale: 0.95, y: 5 }} 
                                        animate={{ opacity: 1, scale: 1, y: 0 }} 
                                        exit={{ opacity: 0, scale: 0.95, y: 5 }} 
                                        className="absolute right-0 top-full mt-2 bg-white border border-zinc-200 rounded-2xl shadow-2xl z-[150] p-2 w-52 flex flex-col gap-1 overflow-hidden"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                         <button 
                                          onClick={(e) => { 
                                            e.stopPropagation();
                                            setActiveTaskMenu(null);
                                            // Timeout para garantir que o menu fechou antes do prompt abrir e travar o loop de eventos
                                            setTimeout(() => {
                                              const n = prompt("Editar título da tarefa:", task.title); 
                                              if(n && n.trim() !== "") handleUpdateTask(task.id, { title: n.trim() });
                                            }, 50);
                                          }} 
                                          className="flex items-center gap-3 p-3 hover:bg-zinc-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-600 transition-colors text-left"
                                         >
                                            <Edit2 size={16} className="text-zinc-400" /> Editar
                                         </button>
                                         <button 
                                          onClick={(e) => { 
                                            e.stopPropagation(); 
                                            handleDeleteTask(task.id); 
                                          }} 
                                          className="flex items-center gap-3 p-3 hover:bg-red-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 transition-colors text-left"
                                         >
                                            <Trash2 size={16} className="text-red-400" /> Excluir
                                         </button>
                                         {!task.is_completed && (
                                           <button 
                                            onClick={(e) => { 
                                              e.stopPropagation(); 
                                              handleUpdateTask(task.id, { needs_attention: !task.needs_attention }); 
                                            }} 
                                            className={`flex items-center gap-3 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-left ${task.needs_attention ? 'bg-red-500 text-white shadow-lg' : 'hover:bg-red-50 text-red-500'}`}
                                           >
                                              <AlertCircle size={16} /> {task.needs_attention ? 'Remover Atenção' : 'Solicitar Atenção'}
                                           </button>
                                         )}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* PARTICIPANTES INDIVIDUAIS */}
                  <div className="space-y-4">
                     <h4 className="text-xs font-black uppercase text-zinc-400 tracking-widest flex items-center gap-2"><User size={14} className="text-blue-500" /> Participantes</h4>
                     <div className="flex gap-2">
                        <input type="text" value={newParticipantName} onChange={e => setNewParticipantName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleCreateParticipant()} placeholder="Nome do participante..." className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm text-zinc-900 focus:border-blue-500 outline-none" />
                        <button onClick={handleCreateParticipant} className="bg-blue-500 text-white p-3 rounded-xl h-fit hover:scale-105 active:scale-95 transition-all shadow-md"><Plus size={20} /></button>
                     </div>
                     <div className="flex flex-wrap gap-2">
                        {participants.filter(p => p.card_id === selectedCard.id).map(p => (
                           <div key={p.id} className="bg-white border-2 border-zinc-100 rounded-full pl-4 pr-2 py-1.5 flex items-center gap-3 shadow-sm group hover:border-blue-200 transition-colors">
                              <span className="text-xs font-bold text-zinc-700">{p.name}</span>
                              <button onClick={() => handleDeleteParticipant(p.id)} className="p-1 rounded-full hover:bg-red-50 text-zinc-300 hover:text-red-500 transition-all"><X size={14} /></button>
                           </div>
                        ))}
                        {participants.filter(p => p.card_id === selectedCard.id).length === 0 && (
                          <span className="text-[10px] font-bold uppercase text-zinc-300 italic py-2">Nenhum participante adicionado</span>
                        )}
                     </div>
                  </div>

                  {/* COMENTÁRIOS / HISTÓRICO */}
                  <div className="space-y-4">
                     <h4 className="text-xs font-black uppercase text-zinc-400 tracking-widest flex items-center gap-2"><MessageSquare size={14} className="text-brand-purple" /> Histórico Permanente</h4>
                     <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-6 space-y-6">
                        <div className="space-y-3">
                           <input type="text" value={newComment.name} onChange={e => setNewComment({...newComment, name: e.target.value})} placeholder="Seu Nome (Obrigatório)" className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-xs font-bold uppercase outline-none focus:border-brand-purple" />
                           <div className="flex gap-2">
                              <textarea value={newComment.content} onChange={e => setNewComment({...newComment, content: e.target.value})} placeholder="Adicionar registro ao histórico..." className="flex-1 bg-white border border-zinc-200 rounded-xl p-4 text-sm text-zinc-900 focus:border-brand-purple outline-none resize-none h-24 shadow-sm" />
                              <button onClick={handleCreateComment} className="bg-zinc-800 text-white p-4 rounded-xl h-fit hover:scale-105 active:scale-95 transition-all shadow-md"><Send size={20} /></button>
                           </div>
                        </div>
                        <div className="space-y-6 border-t border-zinc-200 pt-6">
                           {[...comments].filter(c => c.card_id === selectedCard.id).reverse().map(comment => (
                              <div key={comment.id} className="flex flex-col gap-1">
                                 <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase text-zinc-800">{comment.user_name}</span>
                                    <span className="text-zinc-300">—</span>
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">{new Date(comment.created_at).toLocaleString()}</span>
                                 </div>
                                 <p className="text-sm text-zinc-600 leading-relaxed bg-white p-4 rounded-xl border border-zinc-100 shadow-sm">{comment.content}</p>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>

               <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between shrink-0">
                  <div className="flex gap-2">
                    {COLUMNS.filter(c => !c.isVirtual).map(c => (
                      <button key={c.id} onClick={async () => { await supabase.from('org_cards').update({ column_id: c.id as any }).eq('id', selectedCard.id); setCards(cards.map(card => card.id === selectedCard.id ? { ...card, column_id: c.id as any } : card)); setSelectedCard({ ...selectedCard, column_id: c.id as any }); }} className={`text-[9px] font-black uppercase px-4 py-2 rounded-lg transition-all ${selectedCard.column_id === c.id ? 'bg-zinc-800 text-white shadow-md' : 'bg-white border border-zinc-200 text-zinc-400 hover:border-zinc-300'}`}>Mover p/ {c.title.split(' ')[1] || c.title}</button>
                    ))}
                  </div>
                  <button onClick={() => handleDeleteCard(selectedCard.id)} className="p-2 text-red-400 hover:text-red-600 transition-colors"><Trash2 size={20} /></button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL CRIAÇÃO DE CARD */}
      <AnimatePresence>
        {isModalOpen && selectedCard && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="relative bg-white border border-zinc-200 p-8 rounded-[2rem] w-full max-w-md shadow-2xl">
               <h3 className="text-xl font-bold uppercase tracking-tight mb-6">Novo Card em <span className="text-brand-purple">{selectedCard.column_id}</span></h3>
               <div className="space-y-4">
                  <input type="text" value={newCardTitle} onChange={e => setNewCardTitle(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleCreateCard(selectedCard.column_id)} placeholder="Título do card..." autoFocus className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-5 text-zinc-900 focus:border-brand-purple outline-none font-bold" />
                  <div className="flex gap-3 pt-4">
                    <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-xl text-zinc-400 font-black uppercase text-[10px] tracking-widest">Cancelar</button>
                    <button onClick={() => handleCreateCard(selectedCard.column_id)} disabled={isSaving || !newCardTitle} className="flex-1 bg-zinc-800 text-white font-black uppercase py-4 rounded-xl text-[10px] tracking-widest shadow-lg disabled:opacity-30 flex items-center justify-center">{isSaving ? <Loader2 className="animate-spin" /> : 'Criar Card'}</button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
