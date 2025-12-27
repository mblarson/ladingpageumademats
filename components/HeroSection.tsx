import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Church, Gamepad2, Calendar, Users } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % 3);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      console.warn(`Elemento com id ${id} não encontrado.`);
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

  return (
    <section className="relative w-full min-h-screen bg-[#4F46E5] flex flex-col items-center justify-end px-4 pb-24 md:pb-32 overflow-hidden">
      
      {/* Top Marquee Transition */}
      <div className="absolute top-0 left-0 right-0 z-[100] -rotate-1 scale-110 border-b-2 md:border-b-4 border-black bg-brand-neon py-2 md:py-4 shadow-xl">
         <motion.div 
            className="flex whitespace-nowrap font-fun text-xl md:text-4xl text-black uppercase tracking-wide"
            animate={{ x: ["-50%", "0%"] }}
            transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
            style={{ willChange: 'transform' }}
          >
            {[...Array(10)].map((_, i) => (
              <span key={i} className="mx-4 md:mx-6 flex items-center gap-4">
                UIMADEMATS 2026 • JUBILEU DE OURO • 
              </span>
            ))}
         </motion.div>
      </div>

      {/* CUSTOM NAV MENU - PILL SHAPE (ONDULADO) */}
      {/* Z-INDEX AUMENTADO PARA 95 PARA FICAR ACIMA DA ARANHA (que é z-90) */}
      <nav className="absolute top-[14%] left-1/2 -translate-x-1/2 w-[95%] md:w-full max-w-5xl z-[95]">
        <ul className="flex w-full border-2 border-black shadow-[0_10px_20px_rgba(0,0,0,0.3)] rounded-full overflow-hidden bg-white/5 backdrop-blur-sm">
          
          {/* Item 1: Congresso - Green #69AF23 */}
          <li className="flex-1">
            <button
              onClick={() => scrollToSection('event-section')}
              className="w-full h-full py-3 md:py-4 text-xs md:text-xl font-bold font-sans text-white/90 hover:text-white bg-[#69AF23] hover:bg-[#7bc92b] transition-colors flex items-center justify-center gap-1 md:gap-2 group cursor-pointer relative z-10"
            >
              <Calendar className="w-4 h-4 md:w-6 md:h-6 text-white/70 group-hover:text-white transition-colors" />
              <span className="uppercase tracking-wider">Congresso</span>
            </button>
          </li>

          {/* Item 2: GAMES - Pink #E62D87 */}
          {/* Direciona para action-section (Selecione o que deseja fazer) */}
          {/* Borda lateral suavizada (opacity) para diminuir peso visual */}
           <li className="flex-1 border-l border-black/40">
            <button
              onClick={() => scrollToSection('action-section')}
              className="w-full h-full py-3 md:py-4 text-xs md:text-xl font-bold font-sans text-white/90 hover:text-white bg-[#E62D87] hover:bg-[#ff4aa3] transition-colors flex items-center justify-center gap-1 md:gap-2 group cursor-pointer relative z-10"
            >
              <Gamepad2 className="w-4 h-4 md:w-6 md:h-6 text-white/70 group-hover:text-white transition-colors" />
              <span className="uppercase tracking-wider">GAMES</span>
            </button>
          </li>

          {/* Item 3: Quem Somos - Yellow #FFC300 */}
          {/* Direciona para about-section */}
          <li className="flex-1 border-l border-black/40">
            <button
              onClick={() => scrollToSection('about-section')}
              className="w-full h-full py-3 md:py-4 text-xs md:text-xl font-bold font-sans text-white/90 hover:text-white bg-[#FFC300] hover:bg-[#ffcf33] transition-colors flex items-center justify-center gap-1 md:gap-2 group cursor-pointer relative z-10"
            >
              <Users className="w-4 h-4 md:w-6 md:h-6 text-white/70 group-hover:text-white transition-colors" />
              <span className="uppercase tracking-wider whitespace-nowrap">Quem Somos</span>
            </button>
          </li>

        </ul>
      </nav>

      {/* Background Elements Wrapper */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Y2K Grid */}
        <div 
            className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:2.5rem_2.5rem]"
        />

        {/* Floating Animated Elements Background - OTIMIZAÇÃO: CSS Animations ao invés de JS */}
        <div 
            className="absolute top-[-10%] right-[-10%] w-64 h-64 md:w-96 md:h-96 border-[20px] border-white/10 rounded-full border-dashed z-0 animate-[spin_20s_linear_infinite]"
        />
        
        {/* OTIMIZAÇÃO: Blur-3xl substituído por Gradient Radial (muito mais leve) */}
        <div 
             className="absolute bottom-[10%] left-[-10%] w-48 h-48 md:w-72 md:h-72 rounded-full z-0 animate-[spin_25s_linear_infinite]"
             style={{ 
               background: 'radial-gradient(circle, rgba(204, 255, 0, 0.2) 0%, transparent 70%)'
             }}
        />
        
        {/* 3D Churches - Optimized props */}
        <motion.div
            style={{ perspective: 1000 }}
            animate={{ 
              rotateY: [0, 360],
              y: [0, -20, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[20%] left-[10%] text-brand-pink opacity-40"
        >
            <Church size={80} strokeWidth={1} fill="currentColor" />
        </motion.div>

        <motion.div
            style={{ perspective: 1000 }}
            animate={{ 
              rotateY: [360, 0],
              scale: [1, 1.1, 1] // Scale reduzido para menos repainting
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[30%] right-[10%] text-brand-neon opacity-40"
        >
            <Church size={60} strokeWidth={1} fill="currentColor" />
        </motion.div>
        
        {/* Flying Plane Mascot - OTIMIZAÇÃO: will-change */}
        <motion.img
          src="https://raw.githubusercontent.com/mblarson/imagens/main/mascoteviao.png"
          alt="Flying Mascot"
          className="absolute top-[58%] md:top-[60%] z-20 w-24 md:w-32 object-contain"
          style={{ willChange: 'transform' }}
          initial={{ x: -200, opacity: 1 }}
          animate={{
            x: ["calc(-20vw - 100px)", "calc(100vw + 200px)"], 
            y: [0, -15, 0] 
          }}
          transition={{
            x: {
              duration: 8, 
              repeat: Infinity,
              repeatDelay: 1, 
              ease: "linear",
            },
            y: {
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }
          }}
        />

        {/* Decorative Scribbles */}
        <svg className="absolute top-20 left-10 w-24 h-24 text-black/10 rotate-12" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M10 50 Q 25 25, 50 50 T 90 50" />
        </svg>
      </div>

      {/* Swinging Spider Mascot - SIGNIFICANTLY INCREASED WEB SIZE */}
      {/* Z-Index 90 é menor que o menu (95), evitando bloqueio de clique */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 md:left-[68%] z-[90] origin-top flex flex-col items-center"
        initial={{ rotate: 5 }}
        animate={{ rotate: [-5, 5] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
        style={{ willChange: 'transform' }}
      >
        {/* Teia alongada para 48 (mobile) e 80 (desktop) */}
        <div className="w-1 h-48 md:w-1.5 md:h-80 bg-white/60 shadow-lg" />
        <img
          src="https://raw.githubusercontent.com/mblarson/imagens/main/mascotearanha.png"
          alt="Spider Mascot"
          className="w-[60vw] md:w-[30vw] -mt-2 drop-shadow-2xl hover:scale-110 transition-transform cursor-grab active:cursor-grabbing" 
        />
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 text-center flex flex-col items-center justify-center w-full max-w-7xl mx-auto">
        
        {/* Static Welcome Badge */}
        {/* MODIFIED: Increased margin-bottom to move the badge up relative to the title below it */}
        <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-2 md:mb-6 z-20 relative"
        >
            <div className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 shadow-lg">
            <span className="text-white font-sans text-[10px] md:text-sm font-bold tracking-[0.2em] uppercase">
                BEM VINDO AO PORTAL
            </span>
            </div>
        </motion.div>

        {/* Dynamic Title Carousel Container */}
        <div className="relative w-full min-h-[35vh] md:min-h-[50vh] flex items-center justify-center overflow-visible">
          <AnimatePresence mode="wait">
            
            {/* STATE 0: UIMADEMATS */}
            {currentIndex === 0 && (
              <motion.div
                key="logo"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {/* 
                    UPDATED: Increased Text Size and Scale for Width/Height 
                    Mobile: text-[34vw] (was 28vw)
                    Desktop: text-[15vw] (was 12vw)
                    Scale: scale-y-110 (stretches height), scale-x-105 (stretches width)
                */}
                <h1 className="text-[34vw] md:text-[15vw] leading-[0.75] font-display uppercase text-white tracking-tighter text-center scale-y-110 scale-x-105 transform origin-center drop-shadow-2xl">
                  UIMADE
                  <br />
                  <span className="text-brand-neon">MATS</span>
                </h1>
              </motion.div>
            )}

            {/* STATE 1: JOGUE AGORA */}
            {currentIndex === 1 && (
              <motion.div
                key="game"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute inset-0 flex flex-col items-center justify-center px-4"
              >
                <h2 className="text-[12vw] md:text-[6vw] leading-[0.9] font-display uppercase text-white text-center drop-shadow-lg">
                  JOGUE AGORA
                </h2>
                <div className="mt-4 md:mt-6 bg-brand-neon border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-4 py-2 md:px-8 md:py-4 -rotate-2 transform">
                  <h3 className="text-[6vw] md:text-[3.5vw] leading-none font-fun text-black uppercase text-center">
                    "AS AVENTURAS DE PENTECA"
                  </h3>
                </div>
              </motion.div>
            )}

            {/* STATE 2: LEIA BÍBLIA */}
            {currentIndex === 2 && (
              <motion.div
                key="bible"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute inset-0 flex flex-col items-center justify-center px-4"
              >
                 <h2 className="text-[12vw] md:text-[6vw] leading-[0.9] font-display uppercase text-white text-center drop-shadow-lg">
                  LEIA A BÍBLIA
                </h2>
                <div className="mt-4 md:mt-6 bg-brand-pink border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-4 py-2 md:px-8 md:py-4 rotate-2 transform">
                  <h3 className="text-[6vw] md:text-[3.5vw] leading-none font-fun text-white uppercase text-center">
                    JUNTO COM A UIMADEMATS
                  </h3>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Static Paragraph */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-4 md:mt-0 max-w-2xl text-lg md:text-xl text-white/90 font-sans font-medium text-center px-4 uppercase"
        >
          ASSEMBLEIA DE DEUS DE MATO GROSSO DO SUL.
        </motion.p>

        {/* Action Button - Social */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 1 }}
           className="mt-8"
        >
          <button 
            onClick={handleInstagramClick}
            className="flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-brand-pink via-purple-500 to-brand-purple rounded-2xl shadow-xl hover:scale-110 transition-transform cursor-pointer border-2 border-white/20"
          >
            <Instagram className="text-white" size={28} />
          </button>
        </motion.div>
      </div>

    </section>
  );
};