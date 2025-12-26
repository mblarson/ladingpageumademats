import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check, ArrowLeft, BookOpen, Calendar, Trash2, AlertCircle, LogIn, User, ShieldCheck } from 'lucide-react';
import { useReadingProgress } from '../hooks/useReadingProgress';
import { supabase } from '../lib/supabaseClient';

// --- TYPES ---
interface ReadingItem {
  id: string; // unique string: "m1-d1-i1"
  ref: string; // e.g. "Gênesis 1"
  text: string[]; // Content
}

interface DayPlan {
  day: number;
  date: string;
  items: ReadingItem[];
}

interface MonthPlan {
  id: number; // 0-11
  name: string;
  days: DayPlan[];
}

// --- MOCK DATA GENERATOR ---
const generateMockData = (): MonthPlan[] => {
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  return months.map((monthName, mIndex) => {
    const daysInMonth = 30; // Simplified
    const days: DayPlan[] = Array.from({ length: daysInMonth }, (_, dIndex) => {
      const dayNum = dIndex + 1;
      
      // Mocking references based on day
      const items: ReadingItem[] = [
        {
          id: `m${mIndex}-d${dayNum}-i1`,
          ref: `Gênesis ${dayNum}`,
          text: [
            `Texto bíblico de Gênesis capítulo ${dayNum}.`,
            "No princípio criou Deus o céu e a terra.",
            "E a terra era sem forma e vazia; e havia trevas sobre a face do abismo.",
            "Esta é uma simulação do texto completo que só aparece ao clicar."
          ]
        },
        {
          id: `m${mIndex}-d${dayNum}-i2`,
          ref: `Salmos ${dayNum}`,
          text: [
            `Texto bíblico de Salmos capítulo ${dayNum}.`,
            "Bem-aventurado o homem que não anda segundo o conselho dos ímpios.",
            "Antes tem o seu prazer na lei do Senhor."
          ]
        }
      ];

      return {
        day: dayNum,
        date: `${dayNum.toString().padStart(2, '0')}/${(mIndex + 1).toString().padStart(2, '0')}`,
        items
      };
    });

    return { id: mIndex, name: monthName, days };
  });
};

const fullYearPlan = generateMockData();

interface BibleReadingPageProps {
  onBack: () => void;
}

// --- MAIN COMPONENT ---
export const BibleReadingPage: React.FC<BibleReadingPageProps> = ({ onBack }) => {
  // Navigation State
  const [view, setView] = useState<'months' | 'days' | 'reading'>('months');
  const [selectedMonthId, setSelectedMonthId] = useState<number>(0);
  const [selectedReadingItem, setSelectedReadingItem] = useState<ReadingItem | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  // Data Logic (Extracted to Hook)
  const { completedItems, toggleItemCompletion, resetProgress, isItemComplete, user, loading } = useReadingProgress();

  // --- AUTH HANDLERS ---
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.href, // Retorna para a mesma página
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) {
      console.error("Erro detalhado do login:", error);
      alert('Erro ao conectar com Google: ' + (error.message || JSON.stringify(error)));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Handle visual confirmation reset
  const handleResetConfirmAction = () => {
    resetProgress();
    setShowResetConfirm(false);
  };

  // --- HELPERS ---
  const isDayComplete = (day: DayPlan) => {
    return day.items.every(item => completedItems.includes(item.id));
  };

  const getMonthProgress = (monthId: number) => {
    const month = fullYearPlan[monthId];
    let totalItems = 0;
    let readItems = 0;
    
    month.days.forEach(day => {
      day.items.forEach(item => {
        totalItems++;
        if (completedItems.includes(item.id)) readItems++;
      });
    });

    return totalItems === 0 ? 0 : Math.round((readItems / totalItems) * 100);
  };

  // --- HANDLERS ---
  const handleMonthSelect = (id: number) => {
    setSelectedMonthId(id);
    setView('days');
  };

  const handleReadingSelect = (item: ReadingItem) => {
    setSelectedReadingItem(item);
    setView('reading');
  };

  const handleBack = () => {
    if (view === 'reading') {
      setView('days');
      setSelectedReadingItem(null);
    } else if (view === 'days') {
      setView('months');
    } else {
      onBack();
    }
  };

  // --- RENDERERS ---

  // 1. MONTHS GRID (Home)
  const renderMonths = () => (
    <div className="flex flex-col w-full">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 pb-12">
        {fullYearPlan.map((month) => {
          const progress = getMonthProgress(month.id);
          const isComplete = progress === 100;
          
          return (
            <motion.button
              key={month.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleMonthSelect(month.id)}
              className={`
                relative overflow-hidden rounded-2xl p-6 aspect-[4/3] flex flex-col justify-between text-left
                border transition-all duration-300
                ${isComplete 
                  ? 'bg-brand-neon/10 border-brand-neon text-white' 
                  : 'bg-[#1a1a1a] border-white/5 hover:border-white/20 text-gray-300'}
              `}
            >
              {isComplete && (
                <div className="absolute top-0 right-0 p-3">
                  <div className="bg-brand-neon rounded-full p-1">
                    <Check size={12} className="text-black" strokeWidth={3} />
                  </div>
                </div>
              )}
              
              <div>
                <span className="text-xs font-sans font-bold uppercase tracking-widest opacity-50 block mb-1">Mês {(month.id + 1).toString().padStart(2,'0')}</span>
                <h3 className={`text-2xl font-display uppercase tracking-wide ${isComplete ? 'text-brand-neon' : 'text-white'}`}>
                  {month.name}
                </h3>
              </div>

              <div className="w-full">
                <div className="flex justify-between text-[10px] uppercase font-bold mb-1 opacity-70">
                  <span>Progresso</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-black/30 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className={`h-full rounded-full ${isComplete ? 'bg-brand-neon' : 'bg-brand-pink'}`}
                  />
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Footer Settings Area */}
      <div className="w-full px-6 py-8 border-t border-white/5 mt-auto flex justify-center">
         {!showResetConfirm ? (
           <button 
             onClick={() => setShowResetConfirm(true)}
             className="text-white/30 text-xs uppercase tracking-widest hover:text-red-500 transition-colors flex items-center gap-2"
           >
             <Trash2 size={14} />
             Reiniciar Histórico de Leitura
           </button>
         ) : (
            <div className="flex flex-col items-center gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
               <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle size={16} />
                  <span className="text-sm font-bold">Apagar todo o progresso?</span>
               </div>
               <div className="flex gap-3">
                 <button 
                   onClick={() => setShowResetConfirm(false)}
                   className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-wide text-white"
                 >
                   Cancelar
                 </button>
                 <button 
                   onClick={handleResetConfirmAction}
                   className="px-4 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-xs font-bold uppercase tracking-wide text-white shadow-lg"
                 >
                   Sim, Apagar
                 </button>
               </div>
            </div>
         )}
      </div>
    </div>
  );

  // 2. DAYS LIST (Inside a Month)
  const renderDays = () => {
    const month = fullYearPlan[selectedMonthId];
    
    return (
      <div className="flex flex-col gap-4 p-4 pb-24 max-w-3xl mx-auto w-full">
        <div className="mb-6">
           <h2 className="text-brand-pink font-sans text-xs font-bold uppercase tracking-[0.2em] mb-2">Visualizando</h2>
           <h1 className="text-4xl md:text-5xl font-display text-white uppercase">{month.name}</h1>
        </div>

        {month.days.map((day) => {
          const dayComplete = isDayComplete(day);
          
          return (
            <div 
              key={day.day} 
              className={`
                rounded-xl border transition-all duration-300 overflow-hidden
                ${dayComplete ? 'border-brand-neon/30 bg-brand-neon/5' : 'border-white/5 bg-[#1a1a1a]'}
              `}
            >
              {/* Day Header */}
              <div className="px-5 py-3 flex items-center justify-between bg-black/20 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center font-bold font-display text-lg
                    ${dayComplete ? 'bg-brand-neon text-black' : 'bg-white/10 text-white'}
                  `}>
                    {day.day}
                  </div>
                  <span className="text-white/60 font-sans text-xs font-bold uppercase tracking-wider">
                    {day.date}
                  </span>
                </div>
                {dayComplete && <Check size={16} className="text-brand-neon" />}
              </div>

              {/* References List - Clickable Items */}
              <div className="divide-y divide-white/5">
                {day.items.map((item) => {
                  const itemCompleted = isItemComplete(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleReadingSelect(item)}
                      className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                         <div className={`
                           w-4 h-4 rounded border flex items-center justify-center transition-colors
                           ${itemCompleted ? 'bg-brand-pink border-brand-pink' : 'border-white/30 group-hover:border-white'}
                         `}>
                           {itemCompleted && <Check size={10} className="text-white" strokeWidth={4} />}
                         </div>
                         <span className={`
                           font-serif text-lg transition-colors
                           ${itemCompleted ? 'text-white/50 line-through decoration-brand-pink/50' : 'text-white group-hover:text-brand-neon'}
                         `}>
                           {item.ref}
                         </span>
                      </div>
                      
                      <ChevronRight size={16} className="text-white/20 group-hover:text-white transition-colors" />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // 3. READING VIEW (Full Text)
  const renderReading = () => {
    if (!selectedReadingItem) return null;
    const isCompleted = isItemComplete(selectedReadingItem.id);

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="max-w-2xl mx-auto w-full px-6 py-8 pb-32 flex flex-col h-full"
      >
        <div className="flex-1">
          <div className="mb-8 border-b border-white/10 pb-6">
            <span className="text-brand-neon font-sans text-xs font-bold uppercase tracking-widest mb-2 block">
              Leitura de Hoje
            </span>
            <h1 className="text-4xl md:text-5xl font-display text-white mb-4">
              {selectedReadingItem.ref}
            </h1>
            <div className="flex items-center gap-2 text-white/40 text-sm">
               <BookOpen size={16} />
               <span>Versão NVI</span>
            </div>
          </div>

          <article className="prose prose-invert prose-lg md:prose-xl leading-relaxed text-gray-200 font-serif">
            {selectedReadingItem.text.map((paragraph, idx) => (
              <p key={idx} className="mb-6 opacity-90">
                {paragraph}
              </p>
            ))}
          </article>
        </div>

        {/* Floating Action Bar */}
        <div className="fixed bottom-8 left-0 right-0 px-6 flex justify-center z-50 pointer-events-none">
           <motion.button
             whileTap={{ scale: 0.95 }}
             onClick={() => {
               toggleItemCompletion(selectedReadingItem.id);
               if (!isCompleted) {
                   handleBack(); // Optional: Auto go back on complete
               }
             }}
             className={`
               pointer-events-auto shadow-2xl flex items-center gap-3 px-8 py-4 rounded-full transition-all duration-300 border-2
               ${isCompleted 
                 ? 'bg-[#1a1a1a] border-brand-neon text-brand-neon' 
                 : 'bg-brand-neon border-brand-neon text-black'}
             `}
           >
             {isCompleted ? (
               <>
                 <span className="font-sans font-bold uppercase tracking-widest text-sm">Marcar como não lido</span>
               </>
             ) : (
               <>
                 <Check size={20} />
                 <span className="font-sans font-bold uppercase tracking-widest text-sm">Concluir Leitura</span>
               </>
             )}
           </motion.button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#0f0f0f] text-gray-200 flex flex-col font-sans">
      
      {/* --- HEADER --- */}
      <header className="sticky top-0 z-40 bg-[#0f0f0f]/95 backdrop-blur-md border-b border-white/5">
        <div className="px-4 py-4 flex items-center justify-between max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBack}
              className="p-2 rounded-full hover:bg-white/10 transition-colors text-white group"
            >
              <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            
            <div className="flex flex-col justify-center h-full pt-1">
              <h1 className="font-display uppercase text-2xl tracking-tight text-white leading-[0.8]">
                UIMADE<span className="text-brand-neon">MATS</span>
              </h1>
              <span className="text-[10px] uppercase tracking-[0.3em] text-brand-pink font-bold opacity-80 mt-1">
                Leitura Bíblica 2026
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
             {/* LOGIN BUTTON / AVATAR */}
             {!loading && (
               <>
                 {user ? (
                   <button 
                     onClick={handleLogout}
                     className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-red-500/20 hover:text-red-500 rounded-full border border-white/10 transition-all group"
                   >
                      <div className="w-6 h-6 rounded-full overflow-hidden border border-white/20">
                         {user.user_metadata.avatar_url ? (
                           <img src={user.user_metadata.avatar_url} alt="User" className="w-full h-full object-cover" />
                         ) : (
                           <User size={14} className="text-white/70 m-auto mt-1" />
                         )}
                      </div>
                      <span className="hidden md:block text-xs font-bold uppercase tracking-wider opacity-70 group-hover:opacity-100">
                        Sair
                      </span>
                   </button>
                 ) : (
                   <button 
                     onClick={handleLogin}
                     className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full border border-gray-300 hover:bg-gray-100 transition-colors shadow-lg"
                   >
                      {/* Google "G" Icon simulation */}
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      <span className="text-xs font-bold font-sans text-gray-700 tracking-wide">
                        Entrar com Google
                      </span>
                   </button>
                 )}
               </>
             )}
          </div>
        </div>
        
        {/* Breadcrumb / Progress Bar when inside */}
        {view !== 'months' && (
           <motion.div 
             initial={{ opacity: 0, height: 0 }}
             animate={{ opacity: 1, height: 'auto' }}
             className="w-full bg-brand-purple/10 border-t border-white/5"
           >
             <div className="max-w-6xl mx-auto px-16 py-1">
                <span className="text-[10px] uppercase tracking-widest text-brand-purple font-bold">
                  {view === 'days' ? 'Selecione o dia e o texto' : 'Modo Leitura'}
                </span>
             </div>
           </motion.div>
        )}
      </header>

      {/* --- CONTENT AREA --- */}
      <main className="flex-1 w-full max-w-6xl mx-auto relative">
        <AnimatePresence mode="wait">
          {view === 'months' && (
            <motion.div 
              key="months"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full"
            >
               <div className="px-6 pt-8 pb-4">
                  <h2 className="text-3xl font-display uppercase text-white">Selecione o Mês</h2>
                  <div className="flex items-center gap-2 text-white/50 text-sm">
                    <p>Acompanhe seu progresso anual.</p>
                    {/* Small Security Badge */}
                    <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                      <ShieldCheck size={10} className="text-green-500" />
                      <span className="text-[10px] uppercase font-bold tracking-wider">Site Seguro</span>
                    </div>
                  </div>
               </div>
               {renderMonths()}
            </motion.div>
          )}

          {view === 'days' && (
            <motion.div 
              key="days"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full"
            >
               {renderDays()}
            </motion.div>
          )}

          {view === 'reading' && (
            <motion.div 
              key="reading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full"
            >
               {renderReading()}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

    </div>
  );
};