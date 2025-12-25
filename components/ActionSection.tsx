
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Shirt, ArrowRight, Star } from 'lucide-react';

export const ActionSection: React.FC = () => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <section className="relative w-full py-32 px-4 bg-brand-dark min-h-screen flex flex-col justify-center">
      
      {/* Title - Adjusted to white for dark background */}
      <div className="max-w-7xl mx-auto w-full mb-16 px-2">
         <motion.h2 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-8xl font-display uppercase text-white mb-4 leading-none"
         >
           Selecione o que
           <br />
           <span className="italic font-serif font-light text-brand-neon">deseja fazer:</span>
         </motion.h2>
      </div>

      {/* Cards Container */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        
        {/* Games Card */}
        <motion.div
          onMouseEnter={() => setHoveredCard('games')}
          onMouseLeave={() => setHoveredCard(null)}
          whileHover={{ scale: 0.98, rotate: -0.5 }}
          className="relative bg-[#1a1a1a] rounded-[3rem] p-10 md:p-14 aspect-[4/5] md:aspect-square flex flex-col justify-between overflow-hidden cursor-pointer border border-white/10 group"
        >
            <div className="absolute top-0 right-0 p-0 overflow-hidden opacity-10 transition-opacity group-hover:opacity-20">
               <Gamepad2 size={350} strokeWidth={0.5} className="transform translate-x-16 -translate-y-16 text-white" />
            </div>

            <div className="relative z-10">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 rotate-3 group-hover:rotate-0 transition-transform">
                    <Gamepad2 className="text-black" size={32} />
                </div>
                <h3 className="text-5xl md:text-7xl font-display uppercase text-white mb-4 leading-[0.9]">
                    Games
                    <br/>
                    <span className="text-brand-pink">Umademats</span>
                </h3>
                <p className="text-gray-400 font-sans text-lg max-w-xs leading-relaxed">
                    Participe das competições, ganhe prêmios e divirta-se com a galera.
                </p>
            </div>

            <div className="relative z-10 flex items-center justify-between mt-8 border-t border-white/10 pt-8">
                <span className="text-white font-bold font-sans tracking-widest text-sm">ENTRAR NA ARENA</span>
                <motion.div 
                  animate={{ x: hoveredCard === 'games' ? 10 : 0 }}
                  className="bg-brand-pink p-4 rounded-full text-white shadow-lg"
                >
                    <ArrowRight size={24} />
                </motion.div>
            </div>
        </motion.div>

        {/* T-Shirt Card */}
        <motion.div
          onMouseEnter={() => setHoveredCard('shirt')}
          onMouseLeave={() => setHoveredCard(null)}
          whileHover={{ scale: 0.98, rotate: 0.5 }}
          className="relative bg-brand-neon rounded-[3rem] p-10 md:p-14 aspect-[4/5] md:aspect-square flex flex-col justify-between overflow-hidden cursor-pointer group"
        >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-20">
                <motion.div
                   animate={{ rotate: 360 }}
                   transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                >
                    <Star size={450} className="text-black" fill="currentColor" />
                </motion.div>
            </div>

            <div className="relative z-10">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-8 -rotate-3 group-hover:rotate-0 transition-transform">
                    <Shirt className="text-brand-neon" size={32} />
                </div>
                <h3 className="text-5xl md:text-7xl font-display uppercase text-black mb-4 leading-[0.9]">
                    Registro
                    <br/>
                    <span className="text-brand-purple">Camisetas</span>
                </h3>
                <p className="text-black/70 font-sans text-lg max-w-xs leading-relaxed font-medium">
                    Garanta sua camiseta oficial do Jubileu de Ouro. Edição limitada.
                </p>
            </div>

            <div className="relative z-10 flex items-center justify-between mt-8 border-t border-black/10 pt-8">
                <span className="text-black font-bold font-sans tracking-widest text-sm uppercase">Fazer Pedido Agora</span>
                <motion.div 
                  animate={{ x: hoveredCard === 'shirt' ? 10 : 0 }}
                  className="bg-black p-4 rounded-full text-brand-neon shadow-lg"
                >
                    <ArrowRight size={24} />
                </motion.div>
            </div>
        </motion.div>

      </div>
    </section>
  );
};
