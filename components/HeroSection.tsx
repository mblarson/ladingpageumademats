import React from 'react';
import { motion } from 'framer-motion';
import { Instagram } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative w-full min-h-screen bg-[#4F46E5] flex flex-col items-center justify-start md:justify-center px-4 pt-48 md:pt-20 pb-40">
      
      {/* Background Elements Wrapper (Handles Overflow) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
        {/* Decorative Scribbles */}
        <svg className="absolute top-20 left-10 w-24 h-24 text-black/20 rotate-12" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="5">
          <path d="M10 50 Q 25 25, 50 50 T 90 50" />
        </svg>
      </div>

      {/* Swinging Spider Mascot */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 z-50 origin-top"
        initial={{ rotate: 10 }}
        animate={{ rotate: [-10, 10] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      >
        <div className="w-1.5 h-12 bg-white/50 mx-auto" /> {/* Spider Web String */}
        <img
          src="https://raw.githubusercontent.com/mblarson/imagens/main/mascotearanha.png"
          alt="Spider Mascot"
          className="w-[1000vw] md:w-[45vw] -mt-2 drop-shadow-2xl" 
        />
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 text-center flex flex-col items-center mt-10 md:mt-0">
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6 flex items-center justify-center gap-2"
        >
          <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white font-sans text-sm font-bold tracking-widest uppercase border border-white/30">
            Bem vindo ao Portal
          </span>
        </motion.div>

        {/* GIANT TEXT REPLACING FLOW */}
        <div className="relative">
          <motion.h1 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, type: "spring", bounce: 0.5 }}
            className="text-[28vw] md:text-[12vw] leading-[0.8] font-display uppercase text-white tracking-tighter"
          >
            UMADE
            <br />
            <span className="text-orange-500">MATS</span>
          </motion.h1>
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 max-w-xl text-lg md:text-xl text-white/90 font-sans font-medium text-center"
        >
          SEJA BEM VINDO AO PORTAL DA UMADEMATS.
          <br/>
          <span className="text-sm opacity-70">A safe, inclusive and fun space for youth.</span>
        </motion.p>

        {/* Expandable Button */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 1 }}
           className="mt-20"
        >
          <button className="group flex items-center justify-start w-12 hover:w-48 h-12 bg-gradient-to-r from-brand-pink to-brand-purple rounded-full cursor-pointer relative overflow-hidden transition-all duration-300 shadow-[0_0_20px_rgba(236,72,153,0.5)]">
            <div className="flex items-center justify-center w-12 h-12 shrink-0 transition-all duration-300">
              <Instagram className="text-white transition-transform duration-300 group-hover:rotate-12" size={24} />
            </div>
            <div className="absolute left-12 opacity-0 text-white font-bold uppercase tracking-widest text-sm whitespace-nowrap transition-all duration-300 group-hover:opacity-100 pr-4">
              Instagram
            </div>
          </button>
        </motion.div>
      </div>

      {/* Marquee Transition - Overlapping Next Section */}
      <div className="absolute -bottom-16 left-0 right-0 z-30 rotate-2 scale-110 border-y-4 border-black bg-brand-neon py-3 shadow-2xl">
         <motion.div 
            className="flex whitespace-nowrap font-fun text-3xl md:text-4xl text-black uppercase tracking-wide"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          >
            {[...Array(20)].map((_, i) => (
              <span key={i} className="mx-4 flex items-center gap-4">
                UMADEMATS 2024 • JUBILEU DE OURO • 
              </span>
            ))}
         </motion.div>
      </div>
    </section>
  );
};