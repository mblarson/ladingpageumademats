
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DividerCreative } from './DividerCreative';
import { MarqueeBanner } from './MarqueeBanner';
import { SubtleWaveDivider } from './SubtleWaveDivider';
import { CreativeDivider } from './CreativeDivider';
import { Instagram, Church, Gamepad2, Calendar, Users, Book, Menu, X, ArrowRight, GraduationCap, Zap, Star, Music, Camera, ExternalLink } from 'lucide-react';
import { useSiteConfig, DEFAULT_SITE_CONFIG, SiteConfig } from '../hooks/useSiteConfig';
import { PageType } from '../App';
import { supabase } from '../lib/supabaseClient';
import { HeroSlide } from '../types';
import { getDirectDriveUrl } from '../lib/heroUtils';

interface HeroSectionProps {
  previewConfig?: SiteConfig; 
  onNavigate: (page: PageType) => void;
  onDimensionsDetected?: (width: number, height: number) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ previewConfig, onNavigate, onDimensionsDetected }) => {
  const { config: storedConfig, loading: configLoading } = useSiteConfig();
  const activeConfig = previewConfig || (configLoading ? DEFAULT_SITE_CONFIG : storedConfig);
  const dragProps = activeConfig.ui_allowDrag ? { drag: true, dragConstraints: { top: -50, left: -50, right: 50, bottom: 50 }, dragElastic: 0.1 } : {};
  const dragFreeProps = activeConfig.ui_allowDrag ? { drag: true, dragConstraints: { top: -200, left: -200, right: 200, bottom: 200 }, whileDrag: { scale: 1.1, cursor: 'grabbing', zIndex: 100 } } : {};
  const containerRef = useRef<HTMLDivElement>(null);

  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPhotosInfoModal, setShowPhotosInfoModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Detecção de Dimensões
  const lastDimensions = useRef({ width: 0, height: 0 });
  useEffect(() => {
    if (!onDimensionsDetected) return;

    const detect = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        if (Math.round(lastDimensions.current.width) !== Math.round(width) || Math.round(lastDimensions.current.height) !== Math.round(height)) {
          lastDimensions.current = { width, height };
          onDimensionsDetected(width, height);
        }
      }
    };
    
    detect();
    window.addEventListener('resize', detect);
    const observer = new ResizeObserver(detect);
    if (containerRef.current) observer.observe(containerRef.current);
    
    return () => {
      window.removeEventListener('resize', detect);
      observer.disconnect();
    };
  }, [onDimensionsDetected]);

  // Busca Slides
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const { data, error } = await supabase
          .from('hero_slides')
          .select('*')
          .eq('is_active', true)
          .order('order', { ascending: true });
        
        if (!error && data && data.length > 0) {
          setSlides(data);
        } else {
          // Fallback slides if none found
          setSlides([
            { id: '1', title: 'FOTOS DO CONGRESSO', subtitle: 'CLIQUE AQUI', link: 'https://drive.google.com/drive/folders/1-ii9LgbBjl57vvVWYob2qZxrw0sBqMLa?usp=sharing', image_desktop_url: '', image_mobile_url: '', use_mobile_image: false, order: 0, is_active: true },
            { id: '2', title: 'UMADE', subtitle: 'MATS', link: '', image_desktop_url: '', image_mobile_url: '', use_mobile_image: false, order: 1, is_active: true },
            { id: '3', title: 'LIDERA', subtitle: 'UMADEMATS', link: '/lidera', image_desktop_url: '', image_mobile_url: '', use_mobile_image: false, order: 2, is_active: true },
            { id: '4', title: 'JOGUE AGORA', subtitle: '"AS AVENTURAS DE PENTECA"', link: '', image_desktop_url: '', image_mobile_url: '', use_mobile_image: false, order: 3, is_active: true },
            { id: '5', title: 'LEIA A BÍBLIA', subtitle: 'JUNTO COM A UMADEMATS', link: '/bible', image_desktop_url: '', image_mobile_url: '', use_mobile_image: false, order: 4, is_active: true },
          ]);
        }
      } catch (e) {
        console.error("Erro ao carregar slides:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchSlides();
  }, []);

  // Timer do Slider
  useEffect(() => {
    if (slides.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000); // Exacto 5 segundos por slide
    
    return () => clearInterval(interval);
  }, [slides.length]); // Removido currentIndex para não reiniciar o timer atoa

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
    enter: { x: "100%" },
    center: { x: 0 },
    exit: { x: "-100%" }
  };

  const handleDragEndContent = (e: any, info: any) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    } else if (info.offset.x > swipeThreshold) {
      setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  const [isDraggingSlider, setIsDraggingSlider] = useState(false);

  const handleSlideClick = (slide: HeroSlide) => {
      if (isDraggingSlider) return;

      // Prioridade 1: Novo campo redirect_url (clique no slide inteiro)
      if (slide.redirect_url) {
        if (slide.redirect_url.startsWith('/')) {
          onNavigate(slide.redirect_url.substring(1) as PageType);
        } else {
          window.open(slide.redirect_url, '_blank');
        }
        return;
      }

      // Prioridade 2: Fallback para o comportamento original (baseado no link do botão)
      if (slide.link === '/lidera') onNavigate('lidera');
      else if (slide.link === '/bible') onNavigate('bible');
      else if (slide.link.includes('drive.google.com')) {
        setShowPhotosInfoModal(true);
        setTimeout(() => {
          setShowPhotosInfoModal(false);
          window.open(slide.link, '_blank');
        }, 3000);
      } else if (slide.link) {
        window.open(slide.link, '_blank');
      }
  };

  const currentSlide = slides[currentIndex];
  // Usa uma flag ou um item vazio pro TS não reclamar, mas o loading trata isso
  const HERO_PRELOAD_URL = "https://res.cloudinary.com/dcmi2z6xp/image/upload/v1776888819/SLIDEEMP%C3%89_faxad2.webp";

  return (
    <section ref={containerRef} className="relative w-full min-h-[80vh] md:min-h-screen lg:min-h-[85vh] overflow-hidden bg-black">
      {/* Background Pre-render for the very first load/preload match */}
      <div 
        className="absolute inset-0 z-[1] pointer-events-none transition-opacity duration-1000"
        style={{ 
          backgroundImage: `url(${HERO_PRELOAD_URL})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: slides.length > 0 ? 0 : 1 // Sempre escondido assim que os slides carregam (causa do bug de repetição)
        }}
      />

      {/* Nav Menu renderizado imediatamente */}
      <motion.nav className="hero-nav-menu absolute top-[12%] md:top-[10%] lg:top-[110px] left-1/2 -translate-x-1/2 w-[85%] max-w-md z-[110]">
        <button onClick={() => setIsMenuOpen(true)} className="w-full rounded-full px-5 py-2 md:px-5 md:py-2.5 flex items-center justify-between border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] relative overflow-hidden group transition-transform active:scale-95" style={{ backgroundColor: activeConfig.hero_accentColor }}>
             <div className="flex items-center gap-2 z-10"><span className="font-display italic text-xl md:text-2xl lg:text-2xl text-black tracking-tight uppercase">UMADEMATS</span></div>
             <div className="z-10 w-8 h-8 md:w-8 md:h-8 flex items-center justify-center rounded-full group-hover:bg-black/10"><Menu className="text-black w-5 h-5 md:w-5 md:h-5" strokeWidth={2.5} /></div>
        </button>
      </motion.nav>

      {/* Marquee Superior - RENDERIZADO IMEDIATAMENTE */}
      <div className="absolute top-0 left-0 right-0 z-[100] -rotate-1 scale-110 border-b-2 md:border-b-4 border-black py-2 md:py-2.5 shadow-lg" style={{ backgroundColor: activeConfig.hero_accentColor }}>
         <motion.div className="flex whitespace-nowrap font-fun text-xl md:text-2xl text-black uppercase tracking-wide" animate={{ x: ["-50%", "0%"] }} transition={{ repeat: Infinity, duration: 25, ease: "linear" }} style={{ willChange: 'transform' }}>
            {[...Array(10)].map((_, i) => (
              <span key={i} className="mx-4 md:mx-6 flex items-center gap-4">{activeConfig.hero_marqueeText}</span>
            ))}
         </motion.div>
      </div>

      {/* Mascot - RENDERIZADO IMEDIATAMENTE */}
      <div className="absolute top-0 right-[5%] md:right-[10%] z-[115] pointer-events-none flex flex-col items-center">
        <motion.div className="w-[2px] bg-white/20" animate={{ height: [100, 200, 100] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} style={{ willChange: 'height' }} />
        <motion.img src="https://raw.githubusercontent.com/mblarson/imagens/main/mascotearanha.png" className="w-44 md:w-72 lg:w-56 object-contain pointer-events-auto cursor-grab active:cursor-grabbing" animate={{ y: [-15, 15, -15], rotate: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} style={{ willChange: 'transform' }} {...dragFreeProps} />
      </div>

      {/* Container fix: always render the section to prevent layout jumping */}
      {!currentSlide ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-brand-neon border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <style>{`
            @media (min-width: 768px) {
              .hero-main-title { font-size: clamp(3rem, calc(6vw * ${activeConfig.hero_desktopFontSizeFactor}), 7rem) !important; }
              .hero-secondary-title { font-size: clamp(2.5rem, calc(4vw * ${activeConfig.hero_desktopFontSizeFactor}), 5rem) !important; }
              .hero-box-title { font-size: clamp(1.5rem, calc(2.5vw * ${activeConfig.hero_desktopFontSizeFactor}), 3.5rem) !important; }
            }
            @media (min-width: 1601px) {
              .hero-main-title { font-size: 8rem !important; }
              .hero-secondary-title { font-size: 5.5rem !important; }
              .hero-box-title { font-size: 3.5rem !important; }
            }
          `}</style>

          {/* Background Image / Color */}
          <AnimatePresence initial={false}>
            <motion.div
               key={currentSlide.id + (currentSlide.image_desktop_url ? '_img' : '_bg')}
               initial={{ x: "100%" }}
               animate={{ x: 0 }}
               exit={{ x: "-100%" }}
               transition={{ type: "spring", stiffness: 300, damping: 30 }}
               className="absolute inset-0 z-0"
            >
              {currentSlide.image_desktop_url ? (
                <>
                  {/* Desktop Image */}
                  <picture className="w-full h-full">
                    {currentSlide.use_mobile_image && currentSlide.image_mobile_url && (
                       <source media="(max-width: 767px)" srcSet={getDirectDriveUrl(currentSlide.image_mobile_url)} />
                    )}
                    <img 
                      src={getDirectDriveUrl(currentSlide.image_desktop_url)} 
                      alt={currentSlide.title} 
                      className="w-full h-full object-cover"
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                    />
                  </picture>
                </>
              ) : (
                <div 
                  className="w-full h-full" 
                  style={{ backgroundColor: (currentIndex === 0 || currentIndex === 2) ? '#000000' : activeConfig.hero_bgColor }} 
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Content Slider */}
          <AnimatePresence initial={false}>
            <motion.div
              key={currentIndex}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ x: { type: "spring", stiffness: 300, damping: 30 } }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragStart={() => setIsDraggingSlider(true)}
              onDragEnd={(e, info) => {
                 setTimeout(() => setIsDraggingSlider(false), 100);
                 handleDragEndContent(e, info);
              }}
              className="absolute inset-0 flex flex-col items-center justify-start pt-[30%] md:pt-0 px-4 pb-12 cursor-pointer z-10 active:cursor-grabbing"
              onClick={() => handleSlideClick(currentSlide)}
            >
              {/* Grid Background Effect (only if no image) */}
              {!currentSlide.image_desktop_url && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:2.5rem_2.5rem]" />
                </div>
              )}

              <div className="relative z-10 text-center flex flex-col items-center md:justify-start justify-center w-full max-w-7xl mx-auto flex-1 md:pt-[7%]">
                <div className="relative w-full flex-1 flex items-center justify-center overflow-visible py-4 md:py-4">
                  {/* Dynamic Content Mapping */}
                  {currentSlide.id === '1' && slides.length <= 5 && !currentSlide.image_desktop_url ? (
                    // Original Photos Slide
                    <motion.div className="flex flex-col items-center justify-center px-4 w-full h-full relative" {...dragProps}>
                      <h2 className="hero-secondary-title text-[18vw] md:text-[5vw] xl:text-[5.5vw] leading-[0.85] font-display italic uppercase text-white text-center">FOTOS DO CONGRESSO</h2>
                      <div className="absolute bottom-[10%] md:bottom-[15%] left-1/2 -translate-x-1/2 w-full flex justify-center"><SubtleWaveDivider className="opacity-50" width="250px" height="15px" color="#FFD700" /></div>
                      <div className="mt-6 md:mt-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] px-8 py-5 md:px-10 md:py-4 rotate-2 transform relative flex items-center gap-4 group hover:scale-105 transition-transform" style={{ backgroundColor: '#FFD700' }}>
                        <Camera className="text-black w-8 h-8 md:w-12 md:h-12" />
                        <h3 className="hero-box-title text-[11vw] md:text-[4vw] xl:text-[4.5vw] leading-none font-fun text-black uppercase tracking-tight">CLIQUE AQUI</h3>
                      </div>
                    </motion.div>
                  ) : currentSlide.id === '2' && slides.length <= 5 && !currentSlide.image_desktop_url ? (
                     // Original Main Slide
                     <motion.div className="flex flex-col items-center justify-center w-full h-full relative" {...dragProps}>
                       <h1 className="hero-main-title text-[42vw] md:text-[8vw] xl:text-[9vw] leading-[0.75] font-display uppercase text-white tracking-tighter drop-shadow-2xl">UMADE<br /><span style={{ color: activeConfig.hero_accentColor }}>MATS</span></h1>
                       <div className="absolute bottom-[10%] md:bottom-[15%] left-1/2 -translate-x-1/2 w-full flex justify-center"><SubtleWaveDivider className="opacity-40" width="300px" height="15px" color={activeConfig.hero_accentColor} /></div>
                     </motion.div>
                  ) : (
                    // CMS Component Style
                    <motion.div className="flex flex-col items-center justify-center px-4 w-full h-full relative" {...dragProps}>
                      <h2 className="hero-secondary-title text-[15vw] md:text-[5vw] xl:text-[6vw] leading-[0.85] font-display italic uppercase text-white text-center drop-shadow-2xl">{currentSlide.title}</h2>
                      {currentSlide.subtitle && (
                        <div className="mt-6 md:mt-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] px-8 py-5 md:px-10 md:py-4 rotate-[-1deg] transform relative flex items-center gap-4 group hover:scale-105 transition-all" style={{ backgroundColor: activeConfig.hero_accentColor }}>
                          <h3 className="hero-box-title text-[9vw] md:text-[3.5vw] xl:text-[4vw] leading-none font-fun text-black uppercase tracking-tight">{currentSlide.subtitle}</h3>
                          {currentSlide.link && <ExternalLink size={24} className="text-black" />}
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Progress Bars */}
          <div className="absolute bottom-[120px] left-1/2 -translate-x-1/2 z-[100] flex gap-2 w-full max-w-[200px] px-4">
            {slides.map((_, i) => (
              <div key={i} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                {i === currentIndex && (
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 5, ease: "linear" }}
                    className="h-full bg-brand-neon"
                  />
                )}
              </div>
            ))}
          </div>
        </>
      )}

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
