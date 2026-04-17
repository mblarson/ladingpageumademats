
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DividerCreative } from './DividerCreative';
import { MarqueeBanner } from './MarqueeBanner';
import { SubtleWaveDivider } from './SubtleWaveDivider';
import { CreativeDivider } from './CreativeDivider';
import { Instagram, Church, Gamepad2, Calendar, Users, Book, Menu, X, ArrowRight, GraduationCap, Zap, Star, Music, Camera } from 'lucide-react';
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
  const [showPhotosInfoModal, setShowPhotosInfoModal] = useState(false);

  // Lógica de Intervalo do Slider - Fotos Primeiro (10s)
  useEffect(() => {
    // O slide 0 (Fotos) fica por 10 segundos
    const initialTimeout = setTimeout(() => {
      setCurrentIndex(1);
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % 5);
      }, 4500);
      return () => clearInterval(interval);
    }, 10000);
    return () => clearTimeout(initialTimeout);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMenuOpen(false);
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const menuItems = [
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

  const getSlideBg = (index: number) => {
    if (index === 0 || index === 2) return '#000000'; // 0: Fotos, 2: Lidera
    return activeConfig.hero_bgColor;
  };

  const handleSlideClick = () => {
      if (currentIndex === 2) onNavigate('lidera');
      if (currentIndex === 0) {
        setShowPhotosInfoModal(true);
        setTimeout(() => {
          setShowPhotosInfoModal(false);
          window.location.href = 'https://drive.google.com/drive/folders/1-ii9LgbBjl57vvVWYob2qZxrw0sBqMLa?usp=sharing';
        }, 3000);
      }
  };

  return (
    <section className="relative w-full min-h-[80vh] md:min-h-screen overflow-hidden bg-black">
      <style>{`
        @media (min-width: 768px) {
          .hero-main-title { font-size: clamp(4rem, calc(8vw * ${activeConfig.hero_desktopFontSizeFactor}), 10rem) !important; }
          .hero-secondary-title { font-size: clamp(3rem, calc(6vw * ${activeConfig.hero_desktopFontSizeFactor}), 7rem) !important; }
          .hero-box-title { font-size: clamp(2rem, calc(4vw * ${activeConfig.hero_desktopFontSizeFactor}), 5rem) !important; }
        }
        @media (min-width: 1601px) {
          .hero-main-title { font-size: 9rem !important; }
          .hero-secondary-title { font-size: 6.5rem !important; }
          .hero-box-title { font-size: 4.5rem !important; }
        }
      `}</style>

      {/* Marquee Superior */}
      <div className="absolute top-0 left-0 right-0 z-[100] -rotate-1 scale-110 border-b-2 md:border-b-4 border-black py-2 md:py-2.5 shadow-xl" style={{ backgroundColor: activeConfig.hero_accentColor }}>
         <motion.div className="flex whitespace-nowrap font-fun text-xl md:text-2xl text-black uppercase tracking-wide" animate={{ x: ["-50%", "0%"] }} transition={{ repeat: Infinity, duration: 25, ease: "linear" }}>
            {[...Array(10)].map((_, i) => (
              <span key={i} className="mx-4 md:mx-6 flex items-center gap-4">{activeConfig.hero_marqueeText}</span>
            ))}
         </motion.div>
      </div>

      {/* Nav Menu */}
      <motion.nav className="hero-nav-menu absolute top-[12%] md:top-[10%] lg:top-[80px] left-1/2 -translate-x-1/2 w-[85%] max-w-md z-[110]">
        <button onClick={() => setIsMenuOpen(true)} className="w-full rounded-full px-5 py-2 md:px-5 md:py-2.5 flex items-center justify-between border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] relative overflow-hidden group transition-transform active:scale-95" style={{ backgroundColor: activeConfig.hero_accentColor }}>
             <div className="flex items-center gap-2 z-10"><span className="font-display italic text-xl md:text-2xl lg:text-3xl text-black tracking-tight uppercase">UMADEMATS</span></div>
             <div className="z-10 w-8 h-8 md:w-8 md:h-8 flex items-center justify-center rounded-full group-hover:bg-black/10"><Menu className="text-black w-5 h-5 md:w-5 md:h-5" strokeWidth={2.5} /></div>
        </button>
      </motion.nav>

      {/* Mascot */}
      <div className="absolute top-0 right-[5%] md:right-[10%] z-[115] pointer-events-none flex flex-col items-center">
        <motion.div className="w-[2px] bg-white/20" animate={{ height: [100, 200, 100] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />
        <motion.img src="https://raw.githubusercontent.com/mblarson/imagens/main/mascotearanha.png" className="w-44 md:w-72 object-contain pointer-events-auto cursor-grab active:cursor-grabbing" animate={{ y: [-15, 15, -15], rotate: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} {...dragFreeProps} />
      </div>

      {/* Slider */}
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={currentIndex}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
          className="absolute inset-0 flex flex-col items-center justify-start pt-[30%] md:pt-0 px-4 pb-12 cursor-pointer"
          style={{ backgroundColor: getSlideBg(currentIndex) }}
          onClick={handleSlideClick}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:2.5rem_2.5rem]" />
          </div>

          <div className="relative z-10 text-center flex flex-col items-center md:justify-start justify-center w-full max-w-7xl mx-auto flex-1 md:pt-[7%]">
            <div className="relative w-full flex-1 flex items-center justify-center overflow-visible py-4 md:py-4">
              {currentIndex === 0 && (
                <motion.div 
                  className="flex flex-col items-center justify-center px-4 w-full h-full relative" 
                  {...dragProps}
                >
                  <h2 className="hero-secondary-title text-[18vw] md:text-[5vw] xl:text-[5.5vw] leading-[0.85] font-display italic uppercase text-white text-center">FOTOS DO CONGRESSO</h2>
                  <div className="absolute bottom-[10%] md:bottom-[15%] left-1/2 -translate-x-1/2 w-full flex justify-center">
                    <SubtleWaveDivider className="opacity-50" width="250px" height="15px" color="#FFD700" />
                  </div>
                  <div className="mt-6 md:mt-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] px-8 py-5 md:px-10 md:py-4 rotate-2 transform relative flex items-center gap-4 group hover:scale-105 transition-transform" style={{ backgroundColor: '#FFD700' }}>
                    <Camera className="text-black w-8 h-8 md:w-12 md:h-12" />
                    <h3 className="hero-box-title text-[11vw] md:text-[4vw] xl:text-[4.5vw] leading-none font-fun text-black uppercase tracking-tight">CLIQUE AQUI</h3>
                  </div>
                </motion.div>
              )}
              {currentIndex === 1 && (
                <motion.div className="flex flex-col items-center justify-center w-full h-full relative" {...dragProps}>
                  <h1 className="hero-main-title text-[42vw] md:text-[8vw] xl:text-[9vw] leading-[0.75] font-display uppercase text-white tracking-tighter drop-shadow-2xl">UMADE<br /><span style={{ color: activeConfig.hero_accentColor }}>MATS</span></h1>
                  <div className="absolute bottom-[10%] md:bottom-[15%] left-1/2 -translate-x-1/2 w-full flex justify-center">
                    <SubtleWaveDivider className="opacity-40" width="300px" height="15px" color={activeConfig.hero_accentColor} />
                  </div>
                </motion.div>
              )}
              {currentIndex === 2 && (
                <motion.div className="flex flex-col items-center justify-center px-4 w-full" {...dragProps}>
                  <h2 className="hero-secondary-title text-[22vw] md:text-[6vw] xl:text-[6.5vw] leading-[0.85] font-display italic uppercase text-white text-center">LIDERA</h2>
                  <div className="mt-4 md:mt-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] px-8 py-4 md:px-10 md:py-4 -rotate-2 transform" style={{ backgroundColor: activeConfig.hero_accentColor }}><h3 className="hero-box-title text-[12vw] md:text-[4vw] xl:text-[4.5vw] leading-none font-fun text-black uppercase tracking-tight">UMADEMATS</h3></div>
                </motion.div>
              )}
              {currentIndex === 3 && (
                <motion.div className="flex flex-col items-center justify-center px-4 w-full" {...dragProps}>
                  <h2 className="hero-secondary-title text-[22vw] md:text-[6vw] xl:text-[6.5vw] leading-[0.85] font-display italic uppercase text-white text-center">JOGUE AGORA</h2>
                  <div className="mt-6 md:mt-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] px-8 py-5 md:px-10 md:py-4 -rotate-2 transform relative" style={{ backgroundColor: activeConfig.hero_accentColor }}><h3 className="hero-box-title text-[11vw] md:text-[4vw] xl:text-[4.5vw] leading-none font-fun text-black uppercase tracking-tight">"AS AVENTURAS DE PENTECA"</h3></div>
                </motion.div>
              )}
              {currentIndex === 4 && (
                <motion.div className="flex flex-col items-center justify-center px-4 w-full" {...dragProps}>
                  <h2 className="hero-secondary-title text-[22vw] md:text-[6vw] xl:text-[6.5vw] leading-[0.85] font-display italic uppercase text-white text-center">LEIA A BÍBLIA</h2>
                  <div className="mt-4 md:mt-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] px-8 py-4 md:px-10 md:py-4 rotate-2 transform" style={{ backgroundColor: activeConfig.hero_secondaryColor }}><h3 className="hero-box-title text-[10vw] md:text-[4vw] xl:text-[4.5vw] leading-none font-fun text-white uppercase text-center tracking-tight">JUNTO COM A UMADEMATS</h3></div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Divider Transition to ActionSection */}
      <div className="absolute bottom-0 left-0 right-0 w-full z-20">
        <DividerCreative variant="particles" color="text-brand-neon" lineColor="bg-brand-neon" opacity={0.4} />
      </div>

      <MarqueeBanner 
        items={[
          { text: "Aqui Jesus Reina", icon: Zap },
          { text: "Aqui Jesus Reina", icon: Star }
        ]}
        bgColor="bg-brand-green"
        textColor="text-white"
        rotate={1}
        zIndex={60}
      />

      <AnimatePresence>
        {showPhotosInfoModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[300] bg-black/90 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-md bg-[#1a1a1a] border-2 border-brand-neon p-8 rounded-3xl shadow-[0_0_50px_rgba(204,255,0,0.2)]"
            >
              <div className="w-16 h-16 bg-brand-neon rounded-full flex items-center justify-center mx-auto mb-6">
                <Camera className="text-black w-8 h-8" />
              </div>
              <h3 className="text-2xl font-display uppercase text-white mb-4">Avisos de Galeria</h3>
              <p className="text-white/80 font-sans text-sm leading-relaxed mb-6">
                Devido a quantidade de fotos, pode ser que algumas estejam duplicadas ou fora da pasta do seu período.
              </p>
              <div className="flex items-center justify-center gap-3">
                 <motion.div 
                   animate={{ rotate: 360 }} 
                   transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                   className="w-5 h-5 border-2 border-brand-neon border-t-transparent rounded-full"
                 />
                 <span className="text-brand-neon font-display text-sm tracking-widest animate-pulse">REDIRECIONANDO...</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMenuOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-6">
                <button onClick={() => setIsMenuOpen(false)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"><X size={32} /></button>
                <div className="flex flex-col gap-4 w-full max-w-md">
                    {menuItems.map((item, idx) => (
                        <motion.button key={idx} initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: idx * 0.1 }} onClick={item.action} className="group flex items-center justify-between p-4 rounded-2xl bg-[#1a1a1a] border border-white/10 hover:border-brand-neon hover:bg-brand-neon/10 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-brand-neon group-hover:text-black"><item.icon size={20} /></div>
                                <span className="font-display italic text-2xl text-white uppercase tracking-wide group-hover:text-brand-neon">{item.label}</span>
                            </div>
                            <ArrowRight className="text-white/30 group-hover:text-brand-neon group-hover:translate-x-1" />
                        </motion.button>
                    ))}
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
