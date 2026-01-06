
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, ArrowLeft, CheckCircle2, Lock, FileDown, LogOut, ChevronRight, User, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const SECTORS = ["A", "B", "C1", "C2", "D", "E", "F", "G", "H", "I", "J", "M", "N", "VISITANTE"];
const MONTHS = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
const DEBOUNCE_TIME = 2000;

export const PresenceCounter: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [screen, setScreen] = useState<'month' | 'responsible' | 'counter' | 'summary'>('month');
  
  // Sugerir Mês Atual
  const [month, setMonth] = useState(() => {
     const d = new Date();
     return MONTHS[d.getMonth()];
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [responsible, setResponsible] = useState('');
  const [counts, setCounts] = useState<Record<string, number>>(
    SECTORS.reduce((acc, s) => ({ ...acc, [s]: 0 }), {} as Record<string, number>)
  );
  const [lastClickTimes, setLastClickTimes] = useState<Record<string, number>>({});
  const [isFinishing, setIsFinishing] = useState(false);
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const totalGeneral = useMemo(() => {
    return (Object.values(counts) as number[]).reduce((sum, val) => sum + val, 0);
  }, [counts]);

  const handleAdjust = (sector: string, delta: number) => {
    const now = Date.now();
    const lastTime = lastClickTimes[sector] || 0;
    if (now - lastTime < DEBOUNCE_TIME) return;

    setCounts(prev => ({
      ...prev,
      [sector]: Math.max(0, prev[sector] + delta)
    }));
    setLastClickTimes(prev => ({ ...prev, [sector]: now }));
  };

  const handleFinish = async () => {
    if (password === 'macuxi') {
      setIsSaving(true);
      try {
        const { error } = await supabase.from('presence_records').insert({
          month,
          responsible,
          sectors: counts,
          total_general: totalGeneral
        });
        if (error) throw error;
        setScreen('summary');
        setIsFinishing(false);
      } catch (e: any) {
        alert("Erro ao salvar: " + e.message);
      } finally {
        setIsSaving(false);
      }
    } else {
      alert("Senha incorreta!");
    }
  };

  const generatePDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 flex flex-col items-center">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; color: black; background: white; padding: 20px; }
          .no-print { display: none !important; }
        }
      `}</style>

      <AnimatePresence mode="wait">
        {screen === 'month' && (
          <motion.div 
            key="month"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-8 mt-20 w-full max-w-md relative"
          >
            <h2 className="text-3xl font-display uppercase tracking-widest text-center">Selecione o mês do culto</h2>
            
            <div className="w-full relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full bg-[#1a1a1a] border-2 border-white/10 p-5 rounded-2xl text-xl flex items-center justify-between hover:border-brand-neon transition-colors"
                >
                    <span className="font-bold uppercase tracking-wider">{month}</span>
                    <ChevronDown className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                    {isDropdownOpen && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border-2 border-white/10 rounded-2xl overflow-hidden z-50 max-h-60 overflow-y-auto custom-scrollbar"
                        >
                            {MONTHS.map(m => (
                                <button
                                    key={m}
                                    onClick={() => { setMonth(m); setIsDropdownOpen(false); }}
                                    className={`w-full p-4 text-left font-bold uppercase text-sm hover:bg-brand-neon hover:text-black transition-colors border-b border-white/5 last:border-none ${m === month ? 'text-brand-neon' : 'text-white'}`}
                                >
                                    {m}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex gap-4 w-full">
                <button onClick={onBack} className="flex-1 py-4 border-2 border-white/10 rounded-xl font-bold uppercase text-xs">Voltar</button>
                <button 
                  onClick={() => setScreen('responsible')}
                  className="flex-[2] bg-brand-neon text-black font-bold uppercase py-4 rounded-xl text-lg hover:bg-brand-neon/80 transition-all"
                >
                  Prosseguir
                </button>
            </div>
          </motion.div>
        )}

        {screen === 'responsible' && (
          <motion.div 
            key="responsible"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col items-center gap-8 mt-20 w-full max-w-md"
          >
            <h2 className="text-3xl font-display uppercase tracking-widest text-center">Informe o Responsável</h2>
            <div className="w-full relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                <input 
                  type="text" 
                  value={responsible} 
                  onChange={(e) => setResponsible(e.target.value)}
                  placeholder="Nome do responsável"
                  className="w-full bg-[#1a1a1a] border-2 border-white/10 p-5 pl-12 rounded-2xl text-xl focus:border-brand-neon outline-none transition-colors"
                />
            </div>
            <div className="flex gap-4 w-full">
                <button onClick={() => setScreen('month')} className="flex-1 py-4 border-2 border-white/10 rounded-xl font-bold uppercase text-xs">Voltar</button>
                <button 
                  disabled={!responsible}
                  onClick={() => setScreen('counter')}
                  className="flex-[2] bg-brand-neon text-black font-bold uppercase py-4 rounded-xl text-lg disabled:opacity-30 transition-all"
                >
                  Prosseguir
                </button>
            </div>
          </motion.div>
        )}

        {screen === 'counter' && (
          <motion.div 
            key="counter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-4xl flex flex-col gap-8 pb-24"
          >
            <div className="text-center">
              <h2 className="text-4xl font-display uppercase text-brand-neon mb-2 tracking-tighter">Controle de Presença</h2>
              <p className="text-white/50 font-bold uppercase text-sm">Toque no setor que você pertence • <span className="text-white">{month}</span></p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SECTORS.map(s => (
                <div key={s} className="bg-[#1a1a1a] border-2 border-white/10 p-6 rounded-3xl flex items-center justify-between gap-4">
                  <span className="text-4xl font-display w-24">{s}</span>
                  <div className="flex items-center gap-4">
                    <button onClick={() => handleAdjust(s, -1)} className="w-16 h-16 bg-white/5 border-2 border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all"><Minus size={24} /></button>
                    <span className="text-5xl font-mono min-w-[80px] text-center text-brand-neon">{counts[s]}</span>
                    <button onClick={() => handleAdjust(s, 1)} className="w-16 h-16 bg-brand-neon text-black rounded-2xl flex items-center justify-center active:scale-90 transition-all"><Plus size={24} /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md p-6 border-t-4 border-brand-neon flex items-center justify-between z-50">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-white/50">Total Geral</span>
                  <span className="text-4xl font-display text-brand-neon">{totalGeneral}</span>
                </div>
                <button onClick={() => setIsFinishing(true)} className="bg-brand-pink text-white font-bold uppercase py-4 px-8 rounded-xl shadow-lg active:scale-95">Encerrar Culto</button>
            </div>

            <AnimatePresence>
              {isFinishing && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-[#1a1a1a] border-4 border-brand-pink p-8 rounded-3xl w-full max-sm text-center">
                    <Lock size={48} className="mx-auto mb-4 text-brand-pink" />
                    <h3 className="text-xl font-bold uppercase mb-4">Senha de Encerramento</h3>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black border-2 border-white/20 p-4 rounded-xl text-center mb-4 text-white focus:border-brand-pink outline-none" />
                    <div className="flex gap-2">
                       <button onClick={() => setIsFinishing(false)} className="flex-1 py-3 text-white/50 uppercase font-bold text-xs">Cancelar</button>
                       <button onClick={handleFinish} className="flex-1 py-3 bg-brand-pink text-white font-bold uppercase rounded-lg">Confirmar</button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {screen === 'summary' && (
          <motion.div 
            key="summary"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-[#1a1a1a] border-4 border-brand-neon p-8 rounded-[2.5rem] mt-10 flex flex-col gap-6 no-print"
          >
            <div id="print-area">
                <div className="text-center mb-8">
                    <CheckCircle2 size={64} className="text-brand-neon mx-auto mb-4 no-print" />
                    <h2 className="text-4xl font-display uppercase">Resumo do Culto</h2>
                    <p className="text-brand-neon font-bold">{month} • Resp: {responsible}</p>
                </div>

                <div className="space-y-3">
                   {SECTORS.map(s => counts[s] > 0 && (
                     <div key={s} className="flex justify-between border-b border-white/5 pb-2">
                       <span className="font-bold uppercase opacity-50">Setor {s}</span>
                       <span className="font-mono text-xl">{counts[s]}</span>
                     </div>
                   ))}
                   <div className="flex justify-between border-t-4 border-brand-neon pt-4 mt-4">
                      <span className="font-display text-2xl uppercase">Total Geral</span>
                      <span className="font-display text-4xl text-brand-neon">{totalGeneral}</span>
                   </div>
                </div>
            </div>

            <div className="flex flex-col gap-3 mt-8 no-print">
               <button onClick={generatePDF} className="w-full py-6 bg-white text-black font-bold uppercase rounded-2xl flex items-center justify-center gap-2"><FileDown size={20} /> Gerar PDF do Resumo</button>
               <button onClick={onBack} className="w-full py-4 text-white/50 uppercase font-bold tracking-widest flex items-center justify-center gap-2"><LogOut size={16} /> Retornar ao Menu</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
