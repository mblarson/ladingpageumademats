import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Shirt, ArrowRight, Star } from 'lucide-react';

export const ActionSection: React.FC = () => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <section className="relative w-full py-20 px-4 bg-brand-neon min-h-screen flex flex-col justify-center">
      
      {/* Title */}
      <div className="max-w-7xl mx-auto w-full mb-12">
         <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-display uppercase text-black mb-4"
         >
           Selecione o que
           <br />
           <span className="italic font-serif font-light">deseja fazer:</span>
         </motion.h2>
      </div>

      {/* Cards Container */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Games Card */}
        <motion.div
          onMouseEnter={() => setHoveredCard('games')}
          onMouseLeave={() => setHoveredCard(null)}
          whileHover={{ scale: 0.98, rotate: -1 }}
          className="relative bg-black rounded-[2.5rem] p-8 md:p-12 aspect-[4/5] md:aspect-square flex flex-col justify-between overflow-hidden cursor-pointer transition-colors"
        >
            <div className="absolute top-0 right-0 p-0 overflow-hidden opacity-20">
               <Gamepad2 size={300} strokeWidth={0.5} className="transform translate-x-10 -translate-y-10 text-white" />
            </div>

            <div className="relative z-10">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6">
                    <Gamepad2 className="text-black" size={32} />
                </div>
                <h3 className="text-5xl md:text-6xl font-display uppercase text-white mb-2">
                    Games
                    <br/>
                    <span className="text-brand-pink">Umademats</span>
                </h3>
                <p className="text-gray-400 font-sans max-w-xs">
                    Participe das competições, ganhe prêmios e divirta-se com a galera.
                </p>
            </div>

            <div className="relative z-10 flex items-center justify-between mt-8 border-t border-white/20 pt-8">
                <span className="text-white font-bold font-sans">ENTRAR NA ARENA</span>
                <motion.div 
                  animate={{ x: hoveredCard === 'games' ? 10 : 0 }}
                  className="bg-brand-pink p-3 rounded-full text-white"
                >
                    <ArrowRight />
                </motion.div>
            </div>
        </motion.div>

        {/* T-Shirt Card */}
        <motion.div
          onMouseEnter={() => setHoveredCard('shirt')}
          onMouseLeave={() => setHoveredCard(null)}
          whileHover={{ scale: 0.98, rotate: 1 }}
          className="relative bg-white rounded-[2.5rem] p-8 md:p-12 aspect-[4/5] md:aspect-square flex flex-col justify-between overflow-hidden cursor-pointer border-4 border-black"
        >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-10">
                <motion.div
                   animate={{ rotate: 360 }}
                   transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                >
                    <Star size={400} className="text-brand-purple" fill="currentColor" />
                </motion.div>
            </div>

            <div className="relative z-10">
                <div className="w-16 h-16 bg-brand-purple rounded-full flex items-center justify-center mb-6">
                    <Shirt className="text-white" size={32} />
                </div>
                <h3 className="text-5xl md:text-6xl font-display uppercase text-black mb-2">
                    Registro
                    <br/>
                    <span className="text-brand-purple">Camisetas</span>
                </h3>
                <p className="text-gray-600 font-sans max-w-xs">
                    Garanta sua camiseta oficial do Jubileu de Ouro. Edição limitada.
                </p>
            </div>

            <div className="relative z-10 flex items-center justify-between mt-8 border-t border-black/10 pt-8">
                <span className="text-black font-bold font-sans">FAZER PEDIDO</span>
                <motion.div 
                  animate={{ x: hoveredCard === 'shirt' ? 10 : 0 }}
                  className="bg-brand-purple p-3 rounded-full text-white"
                >
                    <ArrowRight />
                </motion.div>
            </div>
        </motion.div>

      </div>
    </section>
  );
};