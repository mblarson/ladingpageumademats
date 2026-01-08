
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Church, Gamepad2, Calendar, Users, Book, Menu, X, ArrowRight, GraduationCap } from 'lucide-react';
import { useSiteConfig, DEFAULT_SITE_CONFIG, SiteConfig } from '../hooks/useSiteConfig';
import { PageType } from '../App';

interface HeroSectionProps {
  previewConfig?: SiteConfig; 
  onNavigate: (page: PageType) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ previewConfig, onNavigate }) => {
  const { config: storedConfig, loading } = useSiteConfig();
  const activeConfig = previewConfig || (loading ? DEFAULT_SITE_CONFIG : storedConfig);
  const dragProps = activeConfig.ui_allowDrag ? { drag: true, dragConstraints: { top: -50, left: -50, right: 50, bottom: 50 }, dragElastic: 0.1 } : {};
  const dragFreeProps = activeConfig.ui_allowDrag ? { drag: true, dragConstraints: { top: -200, left: -200, right: 200, bottom: 200 }, whileDrag: { scale: 1.1, cursor: 'grabbing', zIndex: 100 } } : {};

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Lógica de Intervalo do Slider
  useEffect(() => {
    // Início após 1 segundo
    const initialTimeout = setTimeout(() => {
      setCurrentIndex(1);
      
      // Ciclo a cada 4 segundos
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % 4);
      }, 4000);

      return () => clearInterval(interval);
    }, 1000);

    return () => clearTimeout(initialTimeout);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMenuOpen(false);
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const menuItems = [
    { label: activeConfig.hero_button1, icon: Calendar, action: () => scrollToSection('congress-timer-anchor') },
    { label: activeConfig.hero_button2, icon: Gamepad2, action: () => scrollToSection('action-section') },
    { label: "LEIA A BÍBLIA", icon: Book, action: () => onNavigate('bible') },
    { label: "LIDERA UMADEMATS", icon: GraduationCap, action: () => onNavigate('lidera') },
    { label: activeConfig.hero_button3, icon: Users, action: () => scrollToSection('leaders-grid') },
  ];

  const slideVariants = {
    enter: { x: "100%", opacity: 1 },
    center: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 1 }
  };

  // Cores de fundo por slide
  const getSlideBg = (index: number) => {
    if (index === 1) return '#000000'; // Slide LIDERA é preto
    return activeConfig.hero_bgColor; // Outros são o azul original
  };

  return (
    <section className="relative w-full min-h-[85vh] md:min-h-screen overflow-hidden bg-black">
      {/* ELEMENTOS FIXOS (FORA DA ANIMAÇÃO DE SLIDE) */}
      
      {/* 1. MARQUEE SUPERIOR */}
      <div className="absolute top-0 left-0 right-0 z-[100] -rotate-1 scale-110 border-b-2 md:border-b-4 border-black py-2 md:py-4 shadow-xl" style={{ backgroundColor: activeConfig.hero_accentColor }}>
         <motion.div className="flex whitespace-nowrap font-fun text-xl md:text-4xl text-black uppercase tracking-wide" animate={{ x: ["-50%", "0%"] }} transition={{ repeat: Infinity, duration: 25, ease: "linear" }}>
            {[...Array(10)].map((_, i) => (
              <span key={i} className="mx-4 md:mx-6 flex items-center gap-4">{activeConfig.hero_marqueeText}</span>
            ))}
         </motion.div>
      </div>

      {/* 2. MENU NAVEGAÇÃO */}
      <motion.nav {...(activeConfig.ui_allowDrag ? { drag: true, dragConstraints: { top: 0, left: -20, right: 20, bottom: 50 } } : {})} className="absolute top-[10%] md:top-[12%] left-1/2 -translate-x-1/2 w-[85%] max-w-lg z-[110]">
        <button onClick={() => setIsMenuOpen(true)} className="w-full rounded-full px-5 py-2 md:px-6 md:py-3 flex items-center justify-between border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] relative overflow-hidden group transition-all active:scale-95" style={{ backgroundColor: activeConfig.hero_accentColor }}>
             <div className="flex items-center gap-2 z-10"><span className="font-display italic text-xl md:text-3xl text-black tracking-tight uppercase">UMADEMATS</span></div>
             <div className="z-10 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full transition-colors group-hover:bg-black/10"><Menu className="text-black w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} /></div>
             <div className="absolute top-0 right-0 w-24 h-full bg-white/20 skew-x-[-20deg] blur-md pointer-events-none group-hover:translate-x-full transition-transform duration-700" />
        </button>
      </motion.nav>

      {/* 3. MASCOTE (FIXO EM RELAÇÃO AO SLIDE) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[105]">
        <motion.img 
          src="https://raw.githubusercontent.com/mblarson/imagens/main/mascoteviao.png" 
          alt="Mascot" 
          className="absolute top-[70%] md:top-[75%] w-24 md:w-32 object-contain pointer-events-auto" 
          initial={{ x: -200, opacity: 1 }} 
          animate={{ x: ["calc(-20vw - 100px)", "calc(100vw + 200px)"], y: [0, -15, 0] }} 
          transition={{ x: { duration: 8, repeat: Infinity, repeatDelay: 1, ease: "linear" }, y: { duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" } }} 
          {...dragFreeProps} 
        />
      </div>

      {/* SLIDER ANIMADO (FUNDO + TEXTO) */}
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={currentIndex}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
          className="absolute inset-0 flex flex-col items-center justify-start pt-[18%] md:pt-[18%] px-4 pb-12 cursor-pointer"
          style={{ backgroundColor: getSlideBg(currentIndex) }}
          onClick={() => currentIndex === 1 && onNavigate('lidera')}
        >
          {/* Grid de fundo do slide */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:2.5rem_2.5rem]" />
          </div>

          <div className="relative z-10 text-center flex flex-col items-center justify-center w-full max-w-7xl mx-auto flex-1">
            {/* BADGE BEM VINDO - SUBIDA PARA FICAR LOGO ABAIXO DO MENU */}
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="mb-4 md:mb-6 z-20 relative" {...dragProps}>
                <div className="bg-white/10 backdrop-blur-md px-6 py-1.5 md:py-2 rounded-full border border-white/20 shadow-lg">
                  <span className="text-white font-sans text-[10px] md:text-sm font-bold tracking-[0.2em] uppercase">
                    {currentIndex === 1 ? 'ÁREA DA LIDERANÇA' : 'BEM VINDO AO PORTAL'}
                  </span>
                </div>
            </motion.div>

            <div className="relative w-full flex-1 flex items-center justify-center overflow-visible py-4 md:py-6">
              {currentIndex === 0 && (
                <div className="flex items-center justify-center w-full" {...dragProps}>
                  <h1 className="text-[38vw] md:text-[16vw] leading-[0.75] font-display uppercase text-white tracking-tighter drop-shadow-2xl">UMADE<br /><span style={{ color: activeConfig.hero_accentColor }}>MATS</span></h1>
                </div>
              )}
              {currentIndex === 1 && (
                <div className="flex flex-col items-center justify-center px-4 w-full" {...dragProps}>
                  <h2 className="text-[18vw] md:text-[12vw] leading-[0.85] font-display italic uppercase text-white text-center">LIDERA</h2>
                  <div className="mt-4 md:mt-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] px-8 py-4 md:px-16 md:py-10 -rotate-2 transform" style={{ backgroundColor: activeConfig.hero_accentColor }}>
                    <h3 className="text-[10vw] md:text-[8vw] leading-none font-fun text-black uppercase tracking-tight">UMADEMATS</h3>
                  </div>
                </div>
              )}
              {currentIndex === 2 && (
                <div className="flex flex-col items-center justify-center px-4 w-full" {...dragProps}>
                  <h2 className="text-[18vw] md:text-[12vw] leading-[0.85] font-display italic uppercase text-white text-center">JOGUE AGORA</h2>
                  <div className="mt-6 md:mt-10 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] px-8 py-5 md:px-16 md:py-10 -rotate-2 transform relative" style={{ backgroundColor: activeConfig.hero_accentColor }}>
                    <div className="absolute -top-12 md:-top-16 left-1/2 -translate-x-1/2 w-20 md:w-28 z-20 pointer-events-none">
                      <img src="https://raw.githubusercontent.com/mblarson/imagens/main/mascoteviao.png" alt="Mini Mascot" className="w-full h-auto drop-shadow-md" />
                    </div>
                    <h3 className="text-[8vw] md:text-[6vw] leading-none font-fun text-black uppercase tracking-tight">"AS AVENTURAS DE PENTECA"</h3>
                  </div>
                </div>
              )}
              {currentIndex === 3 && (
                <div className="flex flex-col items-center justify-center px-4 w-full" {...dragProps}>
                   <h2 className="text-[18vw] md:text-[12vw] leading-[0.85] font-display italic uppercase text-white text-center">LEIA A BÍBLIA</h2>
                  <div className="mt-4 md:mt-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] px-8 py-4 md:px-16 md:py-10 rotate-2 transform" style={{ backgroundColor: activeConfig.hero_secondaryColor }}>
                    <h3 className="text-[8vw] md:text-[6vw] leading-none font-fun text-white uppercase text-center tracking-tight">JUNTO COM A UMADEMATS</h3>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* MODAL DO MENU (FIXO) */}
      <AnimatePresence>
        {isMenuOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-6">
                <button onClick={() => setIsMenuOpen(false)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"><X size={32} /></button>
                <div className="flex flex-col gap-4 w-full max-w-md">
                    {menuItems.map((item, idx) => (
                        <motion.button key={idx} initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: idx * 0.1 }} onClick={item.action} className="group flex items-center justify-between p-4 rounded-2xl bg-[#1a1a1a] border border-white/10 hover:border-brand-neon hover:bg-brand-neon/10 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-brand-neon group-hover:text-black transition-colors"><item.icon size={20} /></div>
                                <span className="font-display italic text-2xl text-white uppercase tracking-wide group-hover:text-brand-neon transition-colors">{item.label}</span>
                            </div>
                            <ArrowRight className="text-white/30 group-hover:text-brand-neon group-hover:translate-x-1 transition-all" />
                        </motion.button>
                    ))}
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
