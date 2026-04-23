
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Zap, Lock, X } from 'lucide-react';
import { SubtleWaveDivider } from './SubtleWaveDivider';
import { DividerCreative } from './DividerCreative';
import { MarqueeBanner } from './MarqueeBanner';
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

  const handleCardClick = (url: string) => {
    if (url.startsWith('http')) {
      window.open(url, '_blank');
    } else if (url === '/pedidoscamisetas') {
      // Vercel handles redirect, but in preview we can just warn or handle differently
      window.location.href = 'https://projeto-camiseta.vercel.app/';
    }
  };

  return (
    <section 
      id="action-section" 
      className="relative w-full pt-12 pb-24 md:pt-16 md:pb-20 overflow-hidden z-20"
      style={{
        backgroundColor: '#fceed1',
        backgroundImage: 'conic-gradient(#00376b 90deg, #fceed1 90deg 180deg, #00376b 180deg 270deg, #fceed1 270deg)',
        backgroundSize: '100px 100px'
      }}
    >
      
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Subtle halftone overlay to add texture to the checkerboard without using images */}
        <div 
          className="absolute inset-0 opacity-[0.05]"
          style={{ 
            backgroundImage: 'radial-gradient(#000 1px, transparent 0)', 
            backgroundSize: '20px 20px' 
          }}
        />
      </div>

      <div className="max-container max-w-6xl mx-auto px-4 relative z-10">
        
        <div className="flex flex-col items-center justify-center mb-12 md:mb-16 text-center">
            <div className="relative inline-block px-8 py-6 md:px-12 md:py-8 mb-4">
              <div className="absolute inset-0 bg-[#00376b] border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] -rotate-1" />
              <h2 className="relative z-10 text-[12vw] md:text-6xl font-display uppercase text-white leading-[0.85] tracking-tighter drop-shadow-lg">
                {activeConfig.action_title1}
                <br />
                <span className="italic font-serif font-light text-brand-neon text-[10vw] md:text-5xl block mt-2">{activeConfig.action_title2}</span>
              </h2>
            </div>
            <SubtleWaveDivider className="mt-2 opacity-50" width="120px" height="8px" color="#CCFF00" />
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
            className="col-span-2 order-2 md:order-1 relative bg-[#1a1a1a] rounded-[1.5rem] md:rounded-[2.5rem] aspect-[2.5/1] md:aspect-[3/1] overflow-hidden cursor-pointer border-2 border-white/5 hover:border-brand-neon/50 group shadow-2xl transition-all"
            style={{ willChange: 'transform' }}
          >
              <img 
                src="https://res.cloudinary.com/dcmi2z6xp/image/upload/v1776967114/ChatGPT_Image_23_de_abr._de_2026_13_57_03_wltyjr.png" 
                alt="Games Umademats"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.2 }}
            onMouseEnter={() => setHoveredCard('lidera')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => onNavigate('lidera')}
            whileHover={{ scale: 0.98 }}
            {...dragProps}
            className="col-span-2 md:col-span-1 order-3 md:order-2 relative bg-brand-dark rounded-[1.5rem] md:rounded-[2.5rem] aspect-[2.5/1] md:aspect-[1.5/1] overflow-hidden cursor-pointer border-2 border-white/5 hover:border-brand-green/50 group shadow-2xl transition-all"
            style={{ willChange: 'transform' }}
          >
              <img 
                src="https://res.cloudinary.com/dcmi2z6xp/image/upload/v1776967114/ChatGPT_Image_23_de_abr._de_2026_13_57_10_py3coi.png" 
                alt="Lidera Umademats"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.3 }}
            onMouseEnter={() => setHoveredCard('devocional')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => onNavigate('bible')}
            whileHover={{ scale: 0.98 }}
            {...dragProps}
            className="col-span-2 md:col-span-1 order-1 md:order-3 relative bg-brand-purple rounded-[1.5rem] md:rounded-[2.5rem] aspect-[2.5/1] md:aspect-[1.5/1] overflow-hidden cursor-pointer group shadow-2xl border-2 border-white/5 hover:border-brand-neon/50 transition-all"
            style={{ willChange: 'transform' }}
          >
              <img 
                src="https://res.cloudinary.com/dcmi2z6xp/image/upload/v1776967114/ChatGPT_Image_23_de_abr._de_2026_13_56_52_jr56qo.png" 
                alt="Plano de Leitura"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
          </motion.div>

        </div>
      </div>

      <MarqueeBanner 
        items={[
          { text: "CONGRESSO 2026", icon: Zap },
          { text: "EXPERIÊNCIA ÚNICA", icon: Star }
        ]}
        bgColor="bg-brand-neon"
        textColor="text-black"
        rotate={-1}
      />

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
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-neon via-brand-purple to-brand-neon" />
                
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
