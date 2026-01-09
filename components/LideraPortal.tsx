
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lock, ArrowRight, FileText, ChevronRight, X, GraduationCap, Download, Zap, Star, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface Orientation {
  id: string;
  title: string;
  subtitle: string;
  comment: string;
  cover_url?: string;
  materials: { name: string; link: string }[];
}

export const LideraPortal: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [orientations, setOrientations] = useState<Orientation[]>([]);
  const [selectedOrientation, setSelectedOrientation] = useState<Orientation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrientations();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isAuthenticated]);

  const fetchOrientations = async () => {
    setLoading(true);
    try {
      const { data: orientationsData, error: orientationsError } = await supabase
        .from('lidera_orientations')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (orientationsError) throw orientationsError;

      const orientationsWithMaterials = await Promise.all(
        (orientationsData || []).map(async (ori) => {
          const { data: materialsData } = await supabase
            .from('lidera_materials')
            .select('name, link')
            .eq('orientation_id', ori.id);
          return { ...ori, materials: materialsData || [] };
        })
      );

      setOrientations(orientationsWithMaterials);
    } catch (e) {
      console.error("Erro ao buscar orientações:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'lideranca@umademats') {
      setIsAuthenticated(true);
      setShowLogin(false);
    } else {
      alert("Senha incorreta!");
    }
  };

  if (!isAuthenticated && !showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 via-slate-950 to-black flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        {/* Glows de fundo ajustados para Azul */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[size:30px_30px]" />
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center"
        >
          <motion.div 
            initial={{ scale: 0.8, rotate: 0 }}
            animate={{ scale: 1, rotate: 6 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-24 h-24 bg-brand-neon rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(204,255,0,0.3)]"
          >
            <GraduationCap size={48} className="text-black" />
          </motion.div>
          
          <motion.h1 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl font-display uppercase text-white leading-none mb-4"
          >
            BEM-VINDO AO <br /> <span className="text-brand-neon">LIDERA UMADEMATS</span>
          </motion.h1>
          
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-white/50 font-sans text-sm md:text-lg max-w-md uppercase tracking-wider mb-10 font-bold"
          >
            Portal exclusivo para líderes com materiais e orientações oficiais.
          </p>
          
          <motion.div 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col gap-4 w-full max-w-xs"
          >
            <button onClick={() => setShowLogin(true)} className="w-full py-5 bg-brand-neon text-black font-bold uppercase rounded-2xl shadow-xl hover:scale-105 transition-all">
              ACESSAR
            </button>
            <button onClick={onBack} className="text-white/30 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2">
              <ArrowLeft size={14} /> Voltar ao Site
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-950 via-black to-black flex flex-col items-center justify-center p-6 relative">
         <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-[#1a1a1a] border-4 border-brand-neon p-8 md:p-12 rounded-[2.5rem] w-full max-w-md shadow-2xl relative">
            <button onClick={() => setShowLogin(false)} className="absolute top-6 right-6 text-white/30 hover:text-white"><X size={24} /></button>
            <div className="w-16 h-16 bg-brand-neon rounded-2xl flex items-center justify-center mb-6 mx-auto"><Lock size={32} className="text-black" /></div>
            <h2 className="text-2xl font-display text-white text-center uppercase mb-8">Acesso Restrito</h2>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-white/50 text-[10px] uppercase font-bold tracking-widest ml-2">Digite a Senha</label>
                <input 
                  type="text" 
                  autoFocus
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Senha de liderança"
                  className="w-full bg-black border-2 border-white/10 rounded-xl px-5 py-4 text-white font-bold text-center focus:border-brand-neon outline-none"
                />
              </div>
              <button type="submit" className="w-full bg-brand-neon text-black font-bold uppercase py-4 rounded-xl shadow-lg mt-4">Entrar</button>
            </form>
         </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-black to-black text-white flex flex-col">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
           <div className="flex items-center gap-4">
              <button onClick={() => isAuthenticated ? setIsAuthenticated(false) : onBack()} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ArrowLeft size={24} /></button>
              <h1 className="font-display text-xl md:text-2xl uppercase tracking-tighter">LIDERA <span className="text-brand-neon">UMADEMATS</span></h1>
           </div>
           <div className="hidden md:flex items-center gap-2 text-white/30 text-[10px] uppercase font-bold tracking-[0.2em]">
              <GraduationCap size={14} /> Portal da Liderança
           </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8 relative">
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-20"><Zap className="animate-spin mb-4" /> <span className="uppercase font-bold tracking-widest">Carregando Materiais...</span></div>
        ) : orientations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {orientations.map((ori) => (
              <motion.button 
                key={ori.id} 
                whileHover={{ scale: 1.02, translateY: -5 }}
                onClick={() => setSelectedOrientation(ori)}
                className="bg-[#151515] border-2 border-white/5 rounded-3xl overflow-hidden group hover:border-brand-neon transition-all relative flex flex-col text-left h-full shadow-2xl"
              >
                <div className="w-full aspect-video bg-black relative">
                   {ori.cover_url ? (
                     <img src={ori.cover_url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt={ori.title} />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-white/5 opacity-40">
                       <ImageIcon size={64} />
                     </div>
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                   <div className="absolute bottom-4 left-6 right-6">
                      <h3 className="text-2xl md:text-3xl font-display uppercase leading-none text-white mb-1 drop-shadow-lg">{ori.title}</h3>
                      <p className="text-brand-neon text-[10px] font-sans font-bold uppercase tracking-widest opacity-80">{ori.subtitle}</p>
                   </div>
                </div>
                <div className="p-4 flex items-center justify-between border-t border-white/5 bg-white/5 group-hover:bg-brand-neon/5 transition-colors">
                   <span className="text-[10px] uppercase font-bold text-white/30 tracking-widest">Acessar conteúdo</span>
                   <ChevronRight size={16} className="text-brand-neon opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-white/20 uppercase font-bold tracking-widest">Nenhuma orientação disponível no momento.</div>
        )}
      </main>

      <AnimatePresence>
        {selectedOrientation && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedOrientation(null)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
             <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="relative bg-[#151515] w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] border border-white/10 flex flex-col overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-[#1a1a1a]">
                   <div>
                      <h2 className="text-3xl font-display uppercase text-white mb-1">{selectedOrientation.title}</h2>
                      <p className="text-brand-neon font-sans text-xs font-bold uppercase tracking-widest">{selectedOrientation.subtitle}</p>
                   </div>
                   <button onClick={() => setSelectedOrientation(null)} className="p-2 text-white/30 hover:text-white transition-colors"><X size={28} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10">
                   {selectedOrientation.materials.length > 0 && (
                     <div>
                        <h4 className="text-white/30 text-[10px] uppercase font-bold tracking-widest mb-4 flex items-center gap-2">
                           <Download size={14} /> Materiais para Download
                        </h4>
                        <div className="flex flex-col gap-2">
                           {selectedOrientation.materials.map((mat, idx) => (
                             <a key={idx} href={mat.link} target="_blank" rel="noopener noreferrer" className="bg-[#202020] border border-white/5 hover:border-brand-neon p-4 rounded-xl flex items-center justify-between group transition-all">
                                <span className="font-bold text-white uppercase text-sm">{mat.name}</span>
                                <Download size={16} className="text-white/30 group-hover:text-brand-neon transition-colors" />
                             </a>
                           ))}
                        </div>
                     </div>
                   )}

                   <div>
                      <h4 className="text-white/30 text-[10px] uppercase font-bold tracking-widest mb-4 flex items-center gap-2">
                         <FileText size={14} /> Orientação Geral
                      </h4>
                      <p className="text-white/80 font-sans text-lg leading-relaxed whitespace-pre-wrap">
                        {selectedOrientation.comment}
                      </p>
                   </div>
                </div>

                <div className="p-6 border-t border-white/5 flex justify-center bg-[#1a1a1a]">
                   <button onClick={() => setSelectedOrientation(null)} className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-white transition-all">Fechar</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
