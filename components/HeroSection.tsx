
import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Church, Gamepad2, Calendar } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleInstagramClick = () => {
    window.open('https://www.instagram.com/umademats/', '_blank');
  };

  return (
    <section className="relative w-full min-h-screen bg-[#4F46E5] flex flex-col items-center justify-end px-4 pb-24 md:pb-32">
      
      {/* Top Marquee Transition - Added based on user feedback */}
      <div className="absolute top-0 left-0 right-0 z-[100] -rotate-1 scale-110 border-b-2 md:border-b-4 border-black bg-brand-neon py-2 md:py-4 shadow-xl">
         <motion.div 
            className="flex whitespace-nowrap font-fun text-xl md:text-4xl text-black uppercase tracking-wide"
            animate={{ x: ["-50%", "0%"] }}
            transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          >
            {[...Array(20)].map((_, i) => (
              <span key={i} className="mx-4 md:mx-6 flex items-center gap-4">
                UMADEMATS 2026 • JUBILEU DE OURO • 
              </span>
            ))}
         </motion.div>
      </div>

      {/* Navigation Buttons Area - Fun System Style - SMALLER ON MOBILE */}
      <div className="absolute top-[18%] left-[5%] md:left-[10%] flex flex-row gap-3 md:gap-4 z-[60] items-start">
        <motion.button
          whileHover={{ scale: 1.05, rotate: -3, y: -2 }}
          whileTap={{ scale: 0.95, rotate: 0 }}
          onClick={() => scrollToSection('action-section')}
          className="group relative px-3 py-1.5 md:px-5 md:py-2.5 bg-brand-neon border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-200"
        >
          <div className="flex items-center gap-1.5 md:gap-2">
            <Gamepad2 className="w-3.5 h-3.5 md:w-5 md:h-5 text-black" />
            <span className="font-display text-sm md:text-xl uppercase text-black tracking-wider">Games</span>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05, rotate: 3, y: -2 }}
          whileTap={{ scale: 0.95, rotate: 0 }}
          onClick={() => scrollToSection('event-section')}
          className="group relative px-3 py-1.5 md:px-5 md:py-2.5 bg-brand-pink border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-200"
        >
          <div className="flex items-center gap-1.5 md:gap-2">
            <Calendar className="w-3.5 h-3.5 md:w-5 md:h-5 text-white" />
            <span className="font-display text-sm md:text-xl uppercase text-white tracking-wider">Congresso</span>
          </div>
        </motion.button>
      </div>

      {/* Background Elements Wrapper */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Y2K Grid */}
        <div 
            className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:2.5rem_2.5rem]"
        />

        {/* Floating Animated Elements Background */}
        <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] right-[-10%] w-64 h-64 md:w-96 md:h-96 border-[20px] border-white/10 rounded-full border-dashed z-0"
        />
        <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[10%] left-[-10%] w-48 h-48 md:w-72 md:h-72 bg-brand-neon/20 rounded-full blur-3xl z-0"
        />
        
        {/* 3D Churches */}
        <motion.div
            style={{ perspective: 1000 }}
            animate={{ 
              rotateY: [0, 360],
              rotateX: [10, -10, 10],
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
              rotateX: [-15, 15, -15],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[30%] right-[10%] text-brand-neon opacity-40"
        >
            <Church size={60} strokeWidth={1} fill="currentColor" />
        </motion.div>

        <motion.div
            style={{ perspective: 1000 }}
            animate={{ 
              rotateZ: [0, 360],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-[40%] right-[5%] text-white"
        >
            <Church size={40} strokeWidth={1.5} />
        </motion.div>
        
        {/* Decorative Scribbles */}
        <svg className="absolute top-20 left-10 w-24 h-24 text-black/10 rotate-12" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M10 50 Q 25 25, 50 50 T 90 50" />
        </svg>
      </div>

      {/* Swinging Spider Mascot */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 md:left-[68%] z-50 origin-top flex flex-col items-center"
        initial={{ rotate: 5 }}
        animate={{ rotate: [-5, 5] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      >
        <div className="w-1.5 h-20 md:h-24 bg-white/40" />
        <img
          src="https://raw.githubusercontent.com/mblarson/imagens/main/mascotearanha.png"
          alt="Spider Mascot"
          className="w-[60vw] md:w-[30vw] -mt-2 drop-shadow-2xl" 
        />
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 text-center flex flex-col items-center">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-4 flex items-center justify-center gap-2"
        >
          <span className="bg-white/10 backdrop-blur-md px-5 py-2 rounded-full text-white font-sans text-sm font-bold tracking-widest uppercase border border-white/20">
            Bem vindo ao Portal
          </span>
        </motion.div>

        {/* GIANT TEXT */}
        <div className="relative">
          <motion.h1 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, type: "spring", bounce: 0.5 }}
            className="text-[28vw] md:text-[12vw] leading-[0.8] font-display uppercase text-white tracking-tighter"
          >
            UMADE
            <br />
            <span className="text-brand-neon">MATS</span>
          </motion.h1>
        </div>

        {/* RESTORED TEXT PARAGRAPH - UPDATED TEXT */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 max-w-2xl text-lg md:text-xl text-white/90 font-sans font-medium text-center px-4 uppercase"
        >
          ASSEMBLEIA DE DEUS DE MATO GROSSO DO SUL.
        </motion.p>

        {/* Action Button - Social - ADDED LINK */}
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

      {/* Marquee Transition - Bottom - Changed to Pink */}
      <div className="absolute -bottom-8 md:-bottom-12 left-0 right-0 z-[100] rotate-2 scale-110 border-y-4 border-black bg-brand-pink py-4 shadow-2xl">
         <motion.div 
            className="flex whitespace-nowrap font-fun text-3xl md:text-5xl text-black uppercase tracking-wide"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          >
            {[...Array(20)].map((_, i) => (
              <span key={i} className="mx-6 flex items-center gap-4">
                UMADEMATS 2026 • JUBILEU DE OURO • 
              </span>
            ))}
         </motion.div>
      </div>
    </section>
  );
};
