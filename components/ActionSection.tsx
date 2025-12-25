
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Shirt, ArrowRight, Star } from 'lucide-react';

export const ActionSection: React.FC = () => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <section className="relative w-full pt-20 pb-12 md:pt-40 md:pb-24 px-2 md:px-4 bg-brand-dark flex flex-col justify-center">
      
      {/* Title - Increased font size and added top margin for distance from marquee */}
      <div className="max-w-7xl mx-auto w-full mb-10 px-2">
         <motion.h2 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-[14vw] md:text-8xl font-display uppercase text-white mb-2 leading-[0.85] tracking-tighter"
         >
           Selecione o que
           <br />
           <span className="italic font-serif font-light text-brand-neon text-[11vw] md:text-7xl block mt-2">deseja fazer:</span>
         </motion.h2>
      </div>

      {/* Cards Container - Fixed side-by-side (grid-cols-2) */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-2 gap-3 md:gap-10">
        
        {/* Games Card */}
        <motion.div
          onMouseEnter={() => setHoveredCard('games')}
          onMouseLeave={() => setHoveredCard(null)}
          whileHover={{ scale: 0.98, rotate: -0.5 }}
          className="relative bg-[#1a1a1a] rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-10 aspect-[3/4] md:aspect-[4/3] flex flex-col justify-between overflow-hidden cursor-pointer border border-white/10 group"
        >
            <div className="absolute top-0 right-0 p-0 overflow-hidden opacity-10 transition-opacity group-hover:opacity-20">
               <Gamepad2 size={150} strokeWidth={0.5} className="md:size-[280px] transform translate-x-6 -translate-y-6 md:translate-x-12 md:-translate-y-12 text-white" />
            </div>

            <div className="relative z-10">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-white rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-6 rotate-3 group-hover:rotate-0 transition-transform">
                    <Gamepad2 className="text-black" size={16} md:size={24} />
                </div>
                <h3 className="text-xl md:text-5xl font-display uppercase text-white mb-1 md:mb-2 leading-[0.9]">
                    Games
                    <br/>
                    <span className="text-brand-pink">Umademats</span>
                </h3>
                <p className="text-gray-400 font-sans text-[10px] md:text-base max-w-xs leading-tight md:leading-relaxed line-clamp-2 md:line-clamp-none">
                    Participe das competições e divirta-se.
                </p>
            </div>

            <div className="relative z-10 flex items-center justify-between mt-4 border-t border-white/10 pt-4">
                <span className="text-white font-bold font-sans tracking-widest text-[8px] md:text-xs">ENTRAR</span>
                <motion.div 
                  animate={{ x: hoveredCard === 'games' ? 5 : 0 }}
                  className="bg-brand-pink p-1.5 md:p-3 rounded-full text-white shadow-lg"
                >
                    <ArrowRight size={14} md:size={20} />
                </motion.div>
            </div>
        </motion.div>

        {/* T-Shirt Card */}
        <motion.div
          onMouseEnter={() => setHoveredCard('shirt')}
          onMouseLeave={() => setHoveredCard(null)}
          whileHover={{ scale: 0.98, rotate: 0.5 }}
          className="relative bg-brand-neon rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-10 aspect-[3/4] md:aspect-[4/3] flex flex-col justify-between overflow-hidden cursor-pointer group"
        >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-20">
                <motion.div
                   animate={{ rotate: 360 }}
                   transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                >
                    <Star size={180} className="md:size-[350px] text-black" fill="currentColor" />
                </motion.div>
            </div>

            <div className="relative z-10">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-black rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-6 -rotate-3 group-hover:rotate-0 transition-transform">
                    <Shirt className="text-brand-neon" size={16} md:size={24} />
                </div>
                <h3 className="text-xl md:text-5xl font-display uppercase text-black mb-1 md:mb-2 leading-[0.9]">
                    Registro
                    <br/>
                    <span className="text-brand-purple">Camisetas</span>
                </h3>
                <p className="text-black/70 font-sans text-[10px] md:text-base max-w-xs leading-tight md:leading-relaxed font-medium line-clamp-2 md:line-clamp-none">
                    Garanta sua camiseta oficial.
                </p>
            </div>

            <div className="relative z-10 flex items-center justify-between mt-4 border-t border-black/10 pt-4">
                <span className="text-black font-bold font-sans tracking-widest text-[8px] md:text-xs uppercase">PEDIR</span>
                <motion.div 
                  animate={{ x: hoveredCard === 'shirt' ? 5 : 0 }}
                  className="bg-black p-1.5 md:p-3 rounded-full text-brand-neon shadow-lg"
                >
                    <ArrowRight size={14} md:size={20} />
                </motion.div>
            </div>
        </motion.div>

      </div>
    </section>
  );
};
