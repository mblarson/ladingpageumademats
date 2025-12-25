
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Shirt, ArrowRight, Star, Zap, Book, Plus } from 'lucide-react';

export const ActionSection: React.FC = () => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Background shapes for animation
  const bgElements = [...Array(15)].map((_, i) => ({
    id: i,
    size: Math.random() * 20 + 10,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
  }));

  const handleCardClick = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <section id="action-section" className="relative w-full pt-20 pb-4 md:pt-40 md:pb-8 px-2 md:px-4 bg-brand-dark flex flex-col justify-center overflow-visible z-20">
      
      {/* --- BACKGROUND ANIMATIONS --- */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Animated Moving Grid */}
        <motion.div 
          initial={{ y: 0 }}
          animate={{ y: [0, -40] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:40px_40px]"
        />

        {/* Floating Particles (Stars and Pluses) */}
        {bgElements.map((el) => (
          <motion.div
            key={el.id}
            initial={{ opacity: 0, x: `${el.x}%`, y: `${el.y}%` }}
            animate={{ 
              y: [`${el.y}%`, `${el.y - 10}%`, `${el.y}%`],
              opacity: [0, 0.2, 0],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: el.duration, 
              repeat: Infinity, 
              delay: el.delay,
              ease: "easeInOut"
            }}
            className="absolute text-brand-neon"
            style={{ width: el.size, height: el.size }}
          >
            {el.id % 2 === 0 ? <Star size={el.size} fill="currentColor" /> : <Plus size={el.size} />}
          </motion.div>
        ))}

        {/* Pulsing Color Blobs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-pink rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.05, 0.1, 0.05],
            x: [0, -60, 0],
            y: [0, -40, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-brand-purple rounded-full blur-[150px]"
        />
      </div>

      {/* --- CONTENT --- */}
      <div className="relative z-10">
        {/* Title */}
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

        {/* Cards Container - Reduced margin-bottom */}
        <div className="max-w-7xl mx-auto w-full grid grid-cols-2 gap-3 md:gap-10 mb-8">
          
          {/* Games Card */}
          <motion.div
            onMouseEnter={() => setHoveredCard('games')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleCardClick('https://umadegames.com.br')}
            whileHover={{ scale: 0.98, rotate: -0.5 }}
            className="relative bg-[#1a1a1a] rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-10 aspect-[3/4] md:aspect-[4/3] flex flex-col justify-between overflow-hidden cursor-pointer border border-white/10 group shadow-2xl"
          >
              <div className="absolute inset-0 z-0 pointer-events-none">
                 <img 
                   src="https://raw.githubusercontent.com/mblarson/imagens/main/aventuraspenteca.png" 
                   alt="Aventuras Penteca Background"
                   className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700 ease-out"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              </div>

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
                  <p className="text-gray-200 font-sans text-[10px] md:text-base max-w-xs leading-tight md:leading-relaxed line-clamp-2 md:line-clamp-none drop-shadow-md">
                      Participe das competições e divirta-se.
                  </p>
              </div>

              <div className="relative z-10 flex items-center justify-between mt-4 border-t border-white/20 pt-4">
                  <span className="text-white font-bold font-sans tracking-widest text-[8px] md:text-xs drop-shadow-md">ENTRAR</span>
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
            onClick={() => handleCardClick('https://projeto-camiseta.vercel.app')}
            whileHover={{ scale: 0.98, rotate: 0.5 }}
            className="relative bg-brand-neon rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-10 aspect-[3/4] md:aspect-[4/3] flex flex-col justify-between overflow-hidden cursor-pointer group shadow-2xl"
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

          {/* Devocional Card */}
          <motion.div
            onMouseEnter={() => setHoveredCard('devocional')}
            onMouseLeave={() => setHoveredCard(null)}
            whileHover={{ scale: 0.99 }}
            className="col-span-2 relative bg-brand-purple rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-12 aspect-[21/9] flex flex-col justify-between overflow-hidden cursor-pointer group shadow-2xl border border-white/5"
          >
              <div className="absolute inset-0 z-0 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700">
                 <img 
                   src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1600&auto=format&fit=crop" 
                   alt="Bible Devocional Background"
                   className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000"
                 />
                 <div className="absolute inset-0 bg-gradient-to-r from-brand-purple via-brand-purple/40 to-transparent" />
              </div>

              <div className="absolute top-1/2 right-10 transform -translate-y-1/2 opacity-10">
                  <Book size={400} strokeWidth={0.5} className="text-white" />
              </div>

              <div className="relative z-10">
                  <div className="w-10 h-10 md:w-16 md:h-16 bg-brand-neon rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-8 group-hover:rotate-6 transition-transform">
                      <Book className="text-black" size={24} md:size={32} />
                  </div>
                  <h3 className="text-3xl md:text-7xl font-display uppercase text-white mb-2 leading-[0.8] tracking-tighter">
                      Devocional
                      <br/>
                      <span className="text-brand-neon">Umademats</span>
                  </h3>
                  <p className="text-white/80 font-sans text-xs md:text-xl max-w-md leading-snug md:leading-relaxed font-medium">
                      Fortaleça sua fé diariamente com meditações exclusivas feitas especialmente para você.
                  </p>
              </div>

              <div className="relative z-10 flex items-center justify-between mt-6 border-t border-white/10 pt-6">
                  <span className="text-white font-bold font-sans tracking-[0.2em] text-[10px] md:text-sm uppercase">LER AGORA</span>
                  <motion.div 
                    animate={{ x: hoveredCard === 'devocional' ? 10 : 0 }}
                    className="bg-brand-neon p-2 md:p-4 rounded-full text-black shadow-xl"
                  >
                      <ArrowRight size={18} md:size={28} />
                  </motion.div>
              </div>
          </motion.div>
        </div>
      </div>

      {/* Animated Transition Section Divider */}
      <div className="absolute bottom-0 left-0 right-0 z-50 pointer-events-none transform translate-y-[60%] md:translate-y-[50%]">
        <motion.div 
          className="bg-brand-pink py-2 md:py-4 border-y-2 border-black -rotate-3 scale-110 shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1.1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="flex whitespace-nowrap items-center font-display uppercase text-lg md:text-3xl text-black italic tracking-tighter"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
          >
            {[...Array(10)].map((_, i) => (
              <span key={i} className="flex items-center gap-6 md:gap-10 mr-10">
                <span>CONGRESSO 2026</span>
                <Zap className="fill-black" size={24} />
                <span>EXPERIÊNCIA ÚNICA</span>
                <Star className="fill-black" size={24} />
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
