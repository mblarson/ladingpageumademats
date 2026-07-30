
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Star, Zap, Lock, X, Gamepad2, Users, Book } from 'lucide-react';
import { SubtleWaveDivider } from './SubtleWaveDivider';
import { DividerCreative } from './DividerCreative';
import { MarqueeBanner } from './MarqueeBanner';
import { useSiteConfig, DEFAULT_SITE_CONFIG, SiteConfig } from '../hooks/useSiteConfig';
import { PageType } from '../App';

interface ActionSectionProps {
  onNavigate: (page: PageType) => void;
  previewConfig?: SiteConfig;
  theme?: 'default' | 'copa';
}

export const ActionSection: React.FC<ActionSectionProps> = ({ onNavigate, previewConfig, theme = 'default' }) => {
  const { config: storedConfig, loading } = useSiteConfig();
  const activeConfig = previewConfig || (loading ? DEFAULT_SITE_CONFIG : storedConfig);
  const dragProps = activeConfig.ui_allowDrag ? { drag: true, dragConstraints: { top: -20, left: -20, right: 20, bottom: 20 }, whileDrag: { scale: 1.05, cursor: 'grabbing', zIndex: 100 } } : {};

  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [showBlockedModal, setShowBlockedModal] = useState(false);

  const isCopa = theme === 'copa';
  const bgColor = isCopa ? '#fffbc2' : '#fceed1';
  const checkColor = isCopa ? '#006c2c' : '#00376b';

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
      className="relative w-full pt-12 pb-24 md:pt-16 md:pb-20 lg:pt-10 lg:pb-12 overflow-hidden z-20"
      style={{
        backgroundColor: bgColor,
        backgroundImage: `conic-gradient(${checkColor} 90deg, ${bgColor} 90deg 180deg, ${checkColor} 180deg 270deg, ${bgColor} 270deg)`,
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
        
        <div className="flex flex-col items-center justify-center mb-12 md:mb-16 lg:mb-8 text-center">
            <div className="relative inline-block px-8 py-6 md:px-12 md:py-8 lg:px-8 lg:py-5 mb-4">
              <div className={`absolute inset-0 ${isCopa ? 'bg-[#002776]' : 'bg-[#00376b]'} border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] -rotate-1`} />
              <h2 className="relative z-10 text-[12vw] md:text-6xl lg:text-3xl font-display uppercase text-white leading-[0.85] tracking-tighter drop-shadow-lg">
                {activeConfig.action_title1}
                <br />
                <span className={`italic font-serif font-light ${isCopa ? 'text-[#ffdf00]' : 'text-brand-neon'} text-[10vw] md:text-5xl lg:text-2xl block mt-2`}>{activeConfig.action_title2}</span>
              </h2>
            </div>
            <SubtleWaveDivider className="mt-2 opacity-50" width="120px" height="8px" color={isCopa ? "#ffdf00" : "#CCFF00"} />
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-8 lg:gap-6 w-full lg:max-w-3xl mx-auto">
          
          <motion.div
            onMouseEnter={() => setHoveredCard('games')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => window.open('https://www.umadegames.com.br', '_blank', 'noopener,noreferrer')}
            whileHover={{ scale: 1.02, zIndex: 10 }}
            whileTap={{ scale: 0.98 }}
            className={`col-span-2 order-2 md:order-1 relative bg-[#1a1a1a] rounded-[1.5rem] md:rounded-[2.5rem] aspect-[2.5/1] md:aspect-[3/1] lg:aspect-[4.2/1] overflow-hidden cursor-pointer border-2 border-white/10 ${isCopa ? 'hover:border-[#ffdf00]' : 'hover:border-brand-neon'} group shadow-2xl transition-all`}
            style={{ willChange: 'transform' }}
          >
              {/* Mobile View: Cloudinary Image ONLY */}
              <img 
                src="https://res.cloudinary.com/dcmi2z6xp/image/upload/v1776967114/ChatGPT_Image_23_de_abr._de_2026_13_57_03_wltyjr.png" 
                alt="Games Umademats"
                className="lg:hidden absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />

              {/* Desktop View: Model Reversion (BG Image + Text) */}
              <div className="hidden lg:block absolute inset-0 z-0">
                  <div className="absolute inset-0 z-0 pointer-events-none">
                    <img 
                      src="https://raw.githubusercontent.com/mblarson/imagens/main/aventuraspenteca.png" 
                      alt="Aventuras Penteca Background"
                      className="w-full h-full object-cover object-[center_20%] opacity-60 transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  </div>

                  <div className="absolute top-0 right-0 p-0 overflow-hidden opacity-10 transition-opacity group-hover:opacity-20">
                    <Gamepad2 size={120} strokeWidth={0.5} className="transform translate-x-8 -translate-y-8 text-white" />
                  </div>

                  <div className="relative z-10 flex flex-col justify-center h-full max-w-[60%] p-8">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-4 rotate-3 group-hover:rotate-0 transition-transform shadow-lg">
                          <Gamepad2 className="text-black w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-display uppercase text-white mb-1 leading-[0.9] drop-shadow-md">
                          Games
                          <br/>
                          <span className={isCopa ? 'text-[#ffdf00]' : 'text-brand-neon'}>Umademats</span>
                      </h3>
                      <p className="text-gray-300 font-sans text-xs max-w-xs leading-relaxed drop-shadow-md">
                          Participe das competições e divirta-se.
                      </p>
                  </div>

                  <div className="absolute bottom-6 right-8 z-10">
                      <motion.div 
                        animate={{ x: hoveredCard === 'games' ? 5 : 0 }}
                        className={`${isCopa ? 'bg-[#ffdf00]' : 'bg-brand-neon'} p-3 rounded-full text-black shadow-lg`}
                      >
                          <ArrowRight className="w-5 h-5" />
                      </motion.div>
                  </div>
              </div>
          </motion.div>

          <motion.div
            onMouseEnter={() => setHoveredCard('lidera')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => onNavigate('lidera')}
            whileHover={{ scale: 1.02, zIndex: 10 }}
            whileTap={{ scale: 0.98 }}
            className={`col-span-2 md:col-span-1 order-3 md:order-2 relative bg-brand-dark rounded-[1.5rem] md:rounded-[2.5rem] aspect-[2.5/1] md:aspect-[1.5/1] lg:aspect-[2.1/1] overflow-hidden cursor-pointer border-2 border-white/10 ${isCopa ? 'hover:border-[#ffdf00]' : 'hover:border-brand-green'} group shadow-2xl transition-all`}
            style={{ willChange: 'transform' }}
          >
              <img 
                src="https://res.cloudinary.com/dcmi2z6xp/image/upload/v1776967114/ChatGPT_Image_23_de_abr._de_2026_13_57_10_py3coi.png" 
                alt="Lidera Umademats"
                className="lg:hidden absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />

              {/* Desktop View: Model Reversion */}
              <div className="hidden lg:block absolute inset-0 z-0 h-full w-full">
                  <div className="absolute inset-0 z-0 pointer-events-none opacity-20 group-hover:opacity-30 transition-opacity flex items-center justify-center">
                    <Users size={180} className="absolute -right-6 -bottom-6 text-white" />
                  </div>

                  <div className="relative z-10 flex flex-col justify-between h-full p-8">
                    <div>
                      <div className={`w-10 h-10 ${isCopa ? 'bg-[#ffdf00]' : 'bg-brand-green'} rounded-xl flex items-center justify-center mb-4 rotate-3 group-hover:rotate-0 transition-transform shadow-lg`}>
                          <Users className="text-black w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-display uppercase text-white mb-1 leading-[0.9] drop-shadow-md">
                          Lidera
                          <br/>
                          <span className={isCopa ? 'text-[#ffdf00]' : 'text-brand-green'}>Umademats</span>
                      </h3>
                      <p className="text-gray-400 font-sans text-xs max-w-xs leading-relaxed">
                          Portal exclusivo para líderes e oficiais.
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className={`${isCopa ? 'text-[#ffdf00]' : 'text-brand-green'} font-bold font-sans tracking-widest text-[10px] uppercase`}>ACESSAR PORTAL</span>
                        <motion.div 
                          animate={{ x: hoveredCard === 'lidera' ? 5 : 0 }}
                          className={`${isCopa ? 'bg-[#ffdf00]' : 'bg-brand-green'} p-3 rounded-full text-black shadow-lg`}
                        >
                            <ArrowRight className="w-5 h-5" />
                        </motion.div>
                    </div>
                  </div>
              </div>
          </motion.div>

          <motion.div
            onMouseEnter={() => setHoveredCard('devocional')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => onNavigate('bible')}
            whileHover={{ scale: 1.02, zIndex: 10 }}
            whileTap={{ scale: 0.98 }}
            className={`col-span-2 md:col-span-1 order-1 md:order-3 relative ${isCopa ? 'bg-[#002776]' : 'bg-brand-purple'} rounded-[1.5rem] md:rounded-[2.5rem] aspect-[2.5/1] md:aspect-[1.5/1] lg:aspect-[2.1/1] overflow-hidden cursor-pointer group shadow-2xl border-2 border-white/10 ${isCopa ? 'hover:border-[#ffdf00]' : 'hover:border-brand-neon'} transition-all`}
            style={{ willChange: 'transform' }}
          >
              <img 
                src="https://res.cloudinary.com/dcmi2z6xp/image/upload/v1776967114/ChatGPT_Image_23_de_abr._de_2026_13_56_52_jr56qo.png" 
                alt="Plano de Leitura"
                className="lg:hidden absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />

              {/* Desktop View: Model Reversion */}
              <div className="hidden lg:block absolute inset-0 z-0 h-full w-full">
                  <div className="absolute inset-0 z-0 pointer-events-none">
                      <img 
                        src="https://raw.githubusercontent.com/mblarson/imagens/main/mascotebiblia.png" 
                        alt="Mascote Bíblia"
                        className="w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-all duration-700 ease-out"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${isCopa ? 'from-[#002776] via-[#002776]/40' : 'from-brand-purple via-brand-purple/40'} to-transparent opacity-80`} />
                  </div>

                  <div className="relative z-10 flex flex-col justify-between h-full p-8">
                    <div>
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-4 rotate-3 group-hover:rotate-0 transition-transform shadow-lg">
                          <Book className={`${isCopa ? 'text-[#002776]' : 'text-brand-purple'} w-6 h-6`} />
                      </div>
                      <h3 className="text-2xl font-display uppercase text-white mb-1 leading-[0.9] drop-shadow-md">
                          Plano de
                          <br/>
                          <span className={isCopa ? 'text-[#ffdf00]' : 'text-brand-neon'}>Leitura</span>
                      </h3>
                      <p className="text-white/80 font-sans text-xs max-w-xs leading-relaxed font-medium">
                          Acompanhe o devocional diário.
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className={`${isCopa ? 'text-[#ffdf00]' : 'text-brand-neon'} font-bold font-sans tracking-widest text-[10px] uppercase`}>LER AGORA</span>
                        <motion.div 
                          animate={{ x: hoveredCard === 'devocional' ? 5 : 0 }}
                          className={`${isCopa ? 'bg-[#ffdf00]' : 'bg-brand-neon'} p-3 rounded-full text-black shadow-lg`}
                        >
                            <ArrowRight className="w-5 h-5" />
                        </motion.div>
                    </div>
                  </div>
              </div>
          </motion.div>

        </div>
      </div>

      <MarqueeBanner 
        items={[
          { text: "CONGRESSO 2026", icon: Zap },
          { text: "EXPERIÊNCIA ÚNICA", icon: Star }
        ]}
        bgColor={isCopa ? "bg-[#ffdf00]" : "bg-brand-neon"}
        textColor={isCopa ? "text-[#002776]" : "text-black"}
        rotate={0}
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
