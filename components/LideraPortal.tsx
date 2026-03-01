
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, GraduationCap, Zap, Star } from 'lucide-react';

interface LideraPortalProps {
  onBack: () => void;
}

export const LideraPortal: React.FC<LideraPortalProps> = ({ onBack }) => {
  // BLOQUEIO TEMPORÁRIO ATIVADO
  // Esta tela substitui temporariamente o portal de liderança conforme solicitado.
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a2a] via-black to-black flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-purple/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-neon/5 blur-[120px] rounded-full" />
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        className="relative z-10 flex flex-col items-center max-w-2xl"
      >
        {/* Ícone Pulsante */}
        <motion.div 
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-24 bg-brand-neon rounded-3xl flex items-center justify-center mb-10 shadow-[0_0_50px_rgba(204,255,0,0.2)] border-2 border-white/20"
        >
          <GraduationCap size={48} className="text-black" />
          
          {/* Partículas flutuantes ao redor do ícone */}
          <motion.div animate={{ y: [-10, 10, -10] }} className="absolute -top-4 -right-4 text-brand-pink"><Star size={20} fill="currentColor" /></motion.div>
          <motion.div animate={{ y: [10, -10, 10] }} className="absolute -bottom-2 -left-6 text-brand-purple"><Zap size={24} fill="currentColor" /></motion.div>
        </motion.div>
        
        {/* Título da Marca */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-display uppercase text-white leading-none mb-6 tracking-tighter">
          LIDERA <br /> <span className="text-brand-neon">UMADEMATS</span>
        </h1>
        
        {/* MENSAGEM PRINCIPAL (SOLICITADA) */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 md:p-10 lg:p-12 rounded-[2rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-pink via-brand-purple to-brand-neon" />
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-display uppercase text-white leading-[1.1] mb-2 tracking-tight">
                SEGURA MAIS <br className="hidden md:block" /> UM POUCO.
            </h2>
            <p className="text-brand-neon font-fun text-xl md:text-3xl lg:text-4xl uppercase tracking-wider">
                EM BREVE LANÇAREMOS
            </p>
        </div>
        
        {/* Navegação de volta */}
        <motion.button 
          onClick={onBack} 
          whileHover={{ x: -5 }}
          className="mt-12 text-white/30 text-[11px] font-bold uppercase tracking-[0.3em] hover:text-white transition-colors flex items-center gap-3 border-b border-transparent hover:border-white/20 pb-1"
        >
          <ArrowLeft size={16} /> Voltar ao Portal Principal
        </motion.button>
      </motion.div>

      {/* Footer minimalista */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
         <p className="text-white/10 text-[9px] uppercase font-bold tracking-[0.5em] select-none">Preparando o melhor para a liderança</p>
      </div>
    </div>
  );
};
