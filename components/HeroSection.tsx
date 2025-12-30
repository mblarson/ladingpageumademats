
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Church, Gamepad2, Calendar, Users, Book, Menu, X, ArrowRight } from 'lucide-react';
import { useSiteConfig, DEFAULT_SITE_CONFIG, SiteConfig } from '../hooks/useSiteConfig';

interface HeroSectionProps {
  // Se passado, usa essa config (modo Preview do Admin). Se não, busca do hook.
  previewConfig?: SiteConfig; 
}

export const HeroSection: React.FC<HeroSectionProps> = ({ previewConfig }) => {
  const { config: storedConfig, loading } = useSiteConfig();
  
  // Decide qual config usar: A prop (se editando) ou a do banco (se visitando)
  const activeConfig = previewConfig || (loading ? DEFAULT_SITE_CONFIG : storedConfig);
  const dragProps = activeConfig.ui_allowDrag ? { drag: true, dragConstraints: { top: -50, left: -50, right: 50, bottom: 50 }, dragElastic: 0.1 } : {};
  const dragFreeProps = activeConfig.ui_allowDrag ? { drag: true, dragConstraints: { top: -200, left: -200, right: 200, bottom: 200 }, whileDrag: { scale: 1.1, cursor: 'grabbing', zIndex: 100 } } : {};

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % 3);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMenuOpen(false); // Fecha o menu ao clicar
    const element = document.getElementById(id);
    if (element) {
      // 'block: center' garante que o elemento fique no meio da tela
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleInstagramClick = () => {
    window.open('https://www.instagram.com/umademats/', '_blank');
  };

  const slideVariants = {
    enter: { x: "100%", opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 }
  };

  // Itens do Menu para o Overlay
  const menuItems = [
    { label: activeConfig.hero_button1, icon: Calendar, action: () => scrollToSection('congress-timer-anchor') },
    { label: activeConfig.hero_button2, icon: Gamepad2, action: () => scrollToSection('action-section') },
    { label: "LEIA A BÍBLIA", icon: Book, action: () => scrollToSection('bible-card') },
    { label: activeConfig.hero_button3, icon: Users, action: () => scrollToSection('leaders-grid') },
  ];

  return (
    <section 
      className="relative w-full min-h-screen flex flex-col items-center justify-end px-4 pb-24 md:pb-32 overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: activeConfig.hero_bgColor }}
    >
      
      {/* Top Marquee Transition - Dinâmico */}
      <div 
        className="absolute top-0 left-0 right-0 z-[100] -rotate-1 scale-110 border-b-2 md:border-b-4 border-black py-2 md:py-4 shadow-xl"
        style={{ backgroundColor: activeConfig.hero_accentColor }}
      >
         <motion.div 
            className="flex whitespace-nowrap font-fun text-xl md:text-4xl text-black uppercase tracking-wide"
            animate={{ x: ["-50%", "0%"] }}
            transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
            style={{ willChange: 'transform' }}
          >
            {[...Array(10)].map((_, i) => (
              <span key={i} className="mx-4 md:mx-6 flex items-center gap-4">
                {activeConfig.hero_marqueeText}
              </span>
            ))}
         </motion.div>
      </div>

      {/* --- NAVBAR TOTALMENTE CLICÁVEL --- */}
      <motion.nav 
        {...(activeConfig.ui_allowDrag ? { drag: true, dragConstraints: { top: 0, left: -20, right: 20, bottom: 50 } } : {})}
        className="absolute top-[14%] left-1/2 -translate-x-1/2 w-[85%] max-w-lg z-[95]"
      >
        <button 
            onClick={() => setIsMenuOpen(true)}
            className="w-full rounded-full px-5 py-2 md:px-6 md:py-3 flex items-center justify-between border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] relative overflow-hidden group transition-all active:scale-95"
            style={{ backgroundColor: activeConfig.hero_accentColor }} 
        >
             {/* Logo Texto Esquerda */}
             <div className="flex items-center gap-2 z-10">
                 <span className="font-display text-xl md:text-3xl text-black tracking-tight uppercase translate-y-[1px] md:translate-y-[2px]">
                    UMADEMATS
                 </span>
             </div>

             {/* Ícone Menu Direita */}
             <div className="z-10 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full transition-colors group-hover:bg-black/10">
                <Menu className="text-black w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
             </div>
             
             {/* Brilho decorativo que desliza no hover */}
             <div className="absolute top-0 right-0 w-24 h-full bg-white/20 skew-x-[-20deg] blur-md pointer-events-none group-hover:translate-x-full transition-transform duration-700" />
        </button>
      </motion.nav>

      {/* --- MENU OVERLAY --- */}
      <AnimatePresence>
        {isMenuOpen && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-6"
            >
                <button 
                    onClick={() => setIsMenuOpen(false)}
                    className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
                >
                    <X size={32} />
                </button>

                <div className="flex flex-col gap-6 w-full max-w-md">
                    {menuItems.map((item, idx) => (
                        <motion.button
                            key={idx}
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={item.action}
                            className="group flex items-center justify-between p-4 rounded-2xl bg-[#1a1a1a] border border-white/10 hover:border-brand-neon hover:bg-brand-neon/10 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-brand-neon group-hover:text-black transition-colors">
                                    <item.icon size={20} />
                                </div>
                                <span className="font-display text-2xl text-white uppercase tracking-wide group-hover:text-brand-neon transition-colors">
                                    {item.label}
                                </span>
                            </div>
                            <ArrowRight className="text-white/30 group-hover:text-brand-neon group-hover:translate-x-1 transition-all" />
                        </motion.button>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-white/30 text-xs uppercase tracking-widest font-bold">UMADEMATS 2026</p>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
            className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:2.5rem_2.5rem]"
        />

        <div 
            className="absolute top-[-10%] right-[-10%] w-64 h-64 md:w-96 md:h-96 border-[20px] border-white/10 rounded-full border-dashed z-0 animate-[spin_20s_linear_infinite]"
        />
        
        <div 
             className="absolute bottom-[10%] left-[-10%] w-48 h-48 md:w-72 md:h-72 rounded-full z-0 animate-[spin_25s_linear_infinite]"
             style={{ 
               background: `radial-gradient(circle, ${activeConfig.hero_accentColor}33 0%, transparent 70%)` 
             }}
        />
        
        <motion.div
            style={{ perspective: 1000, color: activeConfig.hero_secondaryColor }}
            animate={{ rotateY: [0, 360], y: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[20%] left-[10%] opacity-40"
        >
            <Church size={80} strokeWidth={1} fill="currentColor" />
        </motion.div>

        <motion.div
            style={{ perspective: 1000, color: activeConfig.hero_accentColor }}
            animate={{ rotateY: [360, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[30%] right-[10%] opacity-40"
        >
            <Church size={60} strokeWidth={1} fill="currentColor" />
        </motion.div>
        
        <motion.img
          src="https://raw.githubusercontent.com/mblarson/imagens/main/mascoteviao.png"
          alt="Flying Mascot"
          className="absolute top-[58%] md:top-[60%] z-20 w-24 md:w-32 object-contain pointer-events-auto"
          style={{ willChange: 'transform' }}
          initial={{ x: -200, opacity: 1 }}
          animate={{
            x: ["calc(-20vw - 100px)", "calc(100vw + 200px)"], 
            y: [0, -15, 0] 
          }}
          transition={{
            x: { duration: 8, repeat: Infinity, repeatDelay: 1, ease: "linear" },
            y: { duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
          }}
          {...dragFreeProps}
        />
      </div>

      {/* Swinging Spider Mascot */}
      {activeConfig.hero_showMascot && (
        <motion.div
            {...dragFreeProps}
            className="absolute top-0 left-1/2 -translate-x-1/2 md:left-[68%] z-[90] origin-top flex flex-col items-center"
            initial={{ rotate: 5 }}
            animate={{ rotate: [-5, 5] }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            style={{ willChange: 'transform' }}
        >
            <div className="w-1 h-48 md:w-1.5 md:h-80 bg-white/60 shadow-lg" />
            <img
            src={activeConfig.hero_mascotUrl}
            alt="Mascot"
            className="w-[60vw] md:w-[30vw] -mt-2 drop-shadow-2xl hover:scale-110 transition-transform cursor-grab active:cursor-grabbing" 
            />
        </motion.div>
      )}

      {/* Main Content */}
      <div className="relative z-10 text-center flex flex-col items-center justify-center w-full max-w-7xl mx-auto md:mt-56">
        
        <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-2 md:mb-6 md:mt-8 z-20 relative"
            {...dragProps}
        >
            <div className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 shadow-lg cursor-grab active:cursor-grabbing">
            <span className="text-white font-sans text-[10px] md:text-sm font-bold tracking-[0.2em] uppercase">
                BEM VINDO AO PORTAL
            </span>
            </div>
        </motion.div>

        <div className="relative w-full min-h-[35vh] md:min-h-[45vh] flex items-center justify-center overflow-visible">
          <AnimatePresence mode="wait">
            
            {currentIndex === 0 && (
              <motion.div
                key="logo"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute inset-0 flex items-center justify-center"
                {...dragProps}
              >
                <h1 className="text-[34vw] md:text-[11vw] leading-[0.75] font-display uppercase text-white tracking-tighter text-center scale-y-110 scale-x-105 transform origin-center drop-shadow-2xl cursor-grab active:cursor-grabbing">
                  UMADE<span style={{ color: activeConfig.hero_accentColor }}>MATS</span>
                  <br />
                  <span style={{ color: activeConfig.hero_accentColor }}>MATS</span>
                </h1>
              </motion.div>
            )}

            {currentIndex === 1 && (
              <motion.div
                key="game"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute inset-0 flex flex-col items-center justify-center px-4"
                {...dragProps}
              >
                <h2 className="text-[12vw] md:text-[6vw] leading-[0.9] font-display uppercase text-white text-center drop-shadow-lg cursor-grab active:cursor-grabbing">
                  JOGUE AGORA
                </h2>
                <div 
                    className="mt-4 md:mt-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-4 py-2 md:px-8 md:py-4 -rotate-2 transform"
                    style={{ backgroundColor: activeConfig.hero_accentColor }}
                >
                  <h3 className="text-[6vw] md:text-[3.5vw] leading-none font-fun text-black uppercase text-center">
                    "AS AVENTURAS DE PENTECA"
                  </h3>
                </div>
              </motion.div>
            )}

            {currentIndex === 2 && (
              <motion.div
                key="bible"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute inset-0 flex flex-col items-center justify-center px-4"
                {...dragProps}
              >
                 <h2 className="text-[12vw] md:text-[6vw] leading-[0.9] font-display uppercase text-white text-center drop-shadow-lg cursor-grab active:cursor-grabbing">
                  LEIA A BÍBLIA
                </h2>
                <div 
                    className="mt-4 md:mt-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-4 py-2 md:px-8 md:py-4 rotate-2 transform"
                    style={{ backgroundColor: activeConfig.hero_secondaryColor }}
                >
                  <h3 className="text-[6vw] md:text-[3.5vw] leading-none font-fun text-white uppercase text-center">
                    JUNTO COM A UMADEMATS
                  </h3>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-4 md:mt-0 max-w-2xl text-lg md:text-xl text-white/90 font-sans font-medium text-center px-4 uppercase"
        >
          ASSEMBLEIA DE DEUS DE MATO GROSSO DO SUL.
        </motion.p>

        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 1 }}
           className="mt-8"
           {...dragProps}
        >
          <button 
            onClick={handleInstagramClick}
            className="flex items-center justify-center w-14 h-14 rounded-2xl shadow-xl hover:scale-110 transition-transform cursor-pointer border-2 border-white/20"
            style={{ background: `linear-gradient(to top right, ${activeConfig.hero_secondaryColor}, #a855f7, ${activeConfig.hero_bgColor})` }}
          >
            <Instagram className="text-white" size={28} />
          </button>
        </motion.div>
      </div>

    </section>
  );
};
