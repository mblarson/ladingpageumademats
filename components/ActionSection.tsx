
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Shirt, ArrowRight, Star, Zap, Book, Plus, Lock, X } from 'lucide-react';
import { useSiteConfig, DEFAULT_SITE_CONFIG, SiteConfig } from '../hooks/useSiteConfig';
import { PageType } from '../App';

interface ActionSectionProps {
  onNavigate: (page: PageType) => void;
  previewConfig?: SiteConfig;
}

export const ActionSection: React.FC<ActionSectionProps> = ({ onNavigate, previewConfig }) => {
  const { config: storedConfig, loading } = useSiteConfig();
  const activeConfig = previewConfig || (loading ? DEFAULT_SITE_CONFIG : storedConfig);
  const dragProps = activeConfig.ui_allowDrag ? { drag: true, dragConstraints: { top: -20, left: -20, right: 20, bottom: 20 }, whileDrag: { scale: 1.05, cursor: 'grabbing', zIndex: 100 } } : {};

  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [showBlockedModal, setShowBlockedModal] = useState(false);

  const bgElements = [...Array(6)].map((_, i) => ({
    id: i,
    size: Math.random() * 20 + 10,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
  }));

  const handleCardClick = (url: string) => {
    if (url.startsWith('http')) {
      window.open(url, '_blank');
    } else if (url === '/pedidoscamisetas') {
      // Vercel handles redirect, but in preview we can just warn or handle differently
      window.location.href = 'https://projeto-camiseta.vercel.app/';
    }
  };

  return (
    <section id="action-section" className="relative w-full py-24 md:py-32 bg-[#4F46E5] overflow-hidden z-20">
      
      <div className="absolute top-0 left-0 right-0 leading-none z-10">
        <svg className="w-full h-16 md:h-24 fill-black" viewBox="0 0 1440 100" preserveAspectRatio="none">
           <path d="M0,0 C240,90 480,90 720,50 C960,10 1200,10 1440,50 L1440,0 L0,0 Z" />
        </svg>
      </div>

      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div 
          initial={{ y: 0 }}
          animate={{ y: [0, -40] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:40px_40px]"
          style={{ willChange: 'transform' }}
        />

        {bgElements.map((el) => (
          <motion.div
            key={el.id}
            initial={{ opacity: 0, x: `${el.x}%`, y: `${el.y}%` }}
            animate={{ 
              y: [`${el.y}%`, `${el.y - 10}%`, `${el.y}%`],
              opacity: [0, 0.2, 0],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: el.duration, 
              repeat: Infinity, 
              delay: el.delay,
              ease: "easeInOut"
            }}
            className="absolute text-brand-neon"
            style={{ width: el.size, height: el.size, willChange: 'transform, opacity' }}
          >
            {el.id % 2 === 0 ? <Star size={el.size} fill="currentColor" /> : <Plus size={el.size} />}
          </motion.div>
        ))}

        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.4, 0.3],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 -left-20 w-96 h-96 rounded-full"
          style={{ 
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.8) 0%, rgba(0,0,0,0) 70%)',
            willChange: 'transform'
          }}
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.3, 0.2],
            x: [0, -60, 0],
            y: [0, -40, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] rounded-full"
          style={{ 
            background: 'radial-gradient(circle, rgba(91, 33, 182, 0.8) 0%, rgba(0,0,0,0) 70%)',
            willChange: 'transform'
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        
        <div className="flex flex-col items-center justify-center mb-12 md:mb-20 text-center">
             <h2 className="text-[14vw] md:text-8xl font-display uppercase text-white mb-2 leading-[0.85] tracking-tighter drop-shadow-lg">
             {activeConfig.action_title1}
             <br />
             <span className="italic font-serif font-light text-brand-neon text-[11vw] md:text-7xl block mt-2">{activeConfig.action_title2}</span>
           </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-8 w-full">
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.1 }}
            onMouseEnter={() => setHoveredCard('games')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleCardClick(activeConfig.action_gameLink)}
            whileHover={{ scale: 0.98 }}
            {...dragProps}
            className="relative bg-[#1a1a1a] rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-8 aspect-[3/4] md:aspect-[4/3] flex flex-col justify-between overflow-hidden cursor-pointer border-2 border-white/5 hover:border-brand-pink/50 group shadow-2xl transition-all"
            style={{ willChange: 'transform' }}
          >
              <div className="absolute inset-0 z-0 pointer-events-none">
                 <img 
                   src="https://raw.githubusercontent.com/mblarson/imagens/main/aventuraspenteca.png" 
                   alt="Aventuras Penteca Background"
                   className="w-full h-full object-cover opacity-60 transition-transform duration-700 ease-out group-hover:scale-105"
                   loading="lazy"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              </div>

              <div className="absolute top-0 right-0 p-0 overflow-hidden opacity-10 transition-opacity group-hover:opacity-20">
                 <Gamepad2 size={100} strokeWidth={0.5} className="md:size-[200px] transform translate-x-4 -translate-y-4 md:translate-x-12 md:-translate-y-12 text-white" />
              </div>

              <div className="relative z-10">
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-white rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-6 rotate-3 group-hover:rotate-0 transition-transform shadow-lg">
                      <Gamepad2 className="text-black w-4 h-4 md:w-6 md:h-6" />
                  </div>
                  <h3 className="text-xl md:text-4xl font-display uppercase text-white mb-1 md:mb-2 leading-[0.9] drop-shadow-md">
                      Games
                      <br/>
                      <span className="text-brand-pink">Umademats</span>
                  </h3>
                  <p className="text-gray-200 font-sans text-[10px] md:text-sm max-w-xs leading-tight md:leading-relaxed line-clamp-2 md:line-clamp-none drop-shadow-md">
                      Participe das competições e divirta-se.
                  </p>
              </div>

              <div className="relative z-10 flex items-center justify-between mt-4 border-t border-white/20 pt-4">
                  <span className="text-white font-bold font-sans tracking-widest text-[8px] md:text-xs drop-shadow-md">ENTRAR</span>
                  <motion.div 
                    animate={{ x: hoveredCard === 'games' ? 5 : 0 }}
                    className="bg-brand-pink p-1.5 md:p-3 rounded-full text-white shadow-lg"
                  >
                      <ArrowRight className="w-3.5 h-3.5 md:w-5 md:h-5" />
                  </motion.div>
              </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.2 }}
            onMouseEnter={() => setHoveredCard('shirt')}
            onMouseLeave={() => setHoveredCard(null)}
            // AÇÃO ALTERADA: Bloqueio via Modal
            onClick={() => setShowBlockedModal(true)}
            whileHover={{ scale: 0.98 }}
            {...dragProps}
            className="relative bg-brand-neon rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-8 aspect-[3/4] md:aspect-[4/3] flex flex-col justify-between overflow-hidden cursor-pointer group shadow-2xl border-2 border-transparent hover:border-white transition-all"
            style={{ willChange: 'transform' }}
          >
              <div className="absolute inset-0 z-0 pointer-events-none">
                 <img 
                   src="https://raw.githubusercontent.com/mblarson/imagens/main/camisetapedido.png" 
                   alt="Camiseta Pedido"
                   className="w-full h-full object-cover opacity-50 mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-105"
                   loading="lazy"
                 />
              </div>

              <div className="relative z-10">
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-black rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-6 -rotate-3 group-hover:rotate-0 transition-transform shadow-lg">
                      <Shirt className="text-brand-neon w-4 h-4 md:w-6 md:h-6" />
                  </div>
                  <h3 className="text-xl md:text-4xl font-display uppercase text-black mb-1 md:mb-2 leading-[0.9]">
                      Registro
                      <br/>
                      <span className="text-brand-purple">Camisetas</span>
                  </h3>
                  <p className="text-black/70 font-sans text-[10px] md:text-sm max-w-xs leading-tight md:leading-relaxed font-medium line-clamp-2 md:line-clamp-none">
                      Garanta sua camiseta oficial.
                  </p>
              </div>

              <div className="relative z-10 flex items-center justify-between mt-4 border-t border-black/10 pt-4">
                  <span className="text-black font-bold font-sans tracking-widest text-[8px] md:text-xs uppercase">PEDIR</span>
                  <motion.div 
                    animate={{ x: hoveredCard === 'shirt' ? 5 : 0 }}
                    className="bg-black p-1.5 md:p-3 rounded-full text-brand-neon shadow-lg"
                  >
                      <ArrowRight className="w-3.5 h-3.5 md:w-5 md:h-5" />
                  </motion.div>
              </div>
          </motion.div>

          <motion.div
            id="bible-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.3 }}
            onMouseEnter={() => setHoveredCard('devocional')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => onNavigate('bible')}
            whileHover={{ scale: 0.99 }}
            {...dragProps}
            className="col-span-2 relative bg-brand-purple rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-8 aspect-[2.5/1] md:aspect-[3/1] flex flex-row items-center justify-between overflow-hidden cursor-pointer group shadow-2xl border-2 border-white/5 hover:border-brand-neon/50 transition-all"
            style={{ willChange: 'transform' }}
          >
              <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
                  <div className="absolute -right-20 -bottom-20 animate-[spin_20s_linear_infinite]">
                      <Zap size={300} className="text-black" fill="currentColor" />
                  </div>
              </div>
              
              <div className="absolute right-[-2rem] bottom-[-2rem] md:right-0 md:bottom-0 h-[120%] md:h-[110%] w-auto z-0 pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity">
                  <img 
                      src="https://raw.githubusercontent.com/mblarson/imagens/main/mascotebiblia.png" 
                      alt="Mascote Bíblia"
                      className="h-full w-auto object-contain drop-shadow-2xl"
                      loading="lazy"
                  />
              </div>

              <div className="relative z-10 flex flex-col justify-center h-full max-w-[60%]">
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-white rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-6 rotate-3 group-hover:rotate-0 transition-transform shadow-lg">
                      <Book className="text-brand-purple w-4 h-4 md:w-6 md:h-6" />
                  </div>
                  <h3 className="text-xl md:text-5xl font-display uppercase text-white mb-1 md:mb-2 leading-[0.9] drop-shadow-md">
                      Plano de
                      <br/>
                      <span className="text-brand-neon">Leitura</span>
                  </h3>
                  <p className="text-white/80 font-sans text-[10px] md:text-lg max-w-md leading-tight md:leading-relaxed font-medium drop-shadow-sm">
                      Acompanhe o devocional diário.
                  </p>
                  
                  <div className="flex items-center gap-2 mt-4">
                      <span className="text-white font-bold font-sans tracking-widest text-[8px] md:text-xs uppercase border-b border-white/30 pb-0.5">ACESSAR AGORA</span>
                  </div>
              </div>

              <div className="relative z-10 h-full flex items-end pb-2">
                  <motion.div 
                    animate={{ x: hoveredCard === 'devocional' ? 5 : 0 }}
                    className="bg-brand-neon p-2 md:p-4 rounded-full text-black shadow-lg"
                  >
                      <ArrowRight className="w-4 h-4 md:w-6 md:h-6" />
                  </motion.div>
              </div>
          </motion.div>

        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-50 pointer-events-none">
        <motion.div 
          className="bg-brand-pink py-2 md:py-4 border-y-2 border-black -rotate-1 scale-105 shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1.1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="flex whitespace-nowrap items-center font-display uppercase text-lg md:text-3xl text-black italic tracking-tighter"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
            style={{ willChange: 'transform' }}
          >
            {[...Array(6)].map((_, i) => (
              <span key={i} className="flex items-center gap-6 md:gap-10 mr-10">
                <span>CONGRESSO 2026</span>
                <Zap className="fill-black" size={24} />
                <span>EXPERIÊNCIA ÚNICA</span>
                <Star className="fill-black" size={24} />
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* MODAL DE BLOQUEIO DE ACESSO */}
      <AnimatePresence>
        {showBlockedModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
             {/* Backdrop */}
             <motion.div
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setShowBlockedModal(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
             />
             
             {/* Modal Content */}
             <motion.div
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-[#1a1a1a] border-2 border-white/10 p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl overflow-hidden"
             >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-pink via-brand-purple to-brand-neon" />
                
                <button
                    onClick={() => setShowBlockedModal(false)}
                    className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-lg">
                    <Lock size={32} className="text-white" />
                </div>

                <h3 className="text-2xl font-display uppercase text-white mb-4 leading-none">ACESSO BLOQUEADO</h3>
                <p className="text-white/60 font-sans text-sm leading-relaxed mb-8">
                    Acesso exclusivo para liderança.<br/>
                    Solicite o acesso para a secretaria da UMADEMATS.
                </p>

                <button
                    onClick={() => setShowBlockedModal(false)}
                    className="w-full py-4 bg-white text-black font-bold uppercase rounded-xl hover:bg-gray-200 transition-colors shadow-lg active:scale-95"
                >
                    Fechar
                </button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
