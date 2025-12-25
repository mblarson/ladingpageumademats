
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Sparkles, Zap } from 'lucide-react';

interface GuestCardProps {
  name: string;
  role: string;
  image: string;
  color: string;
  delay: number;
}

const GuestCard: React.FC<GuestCardProps> = ({ name, role, image, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    whileHover={{ scale: 1.02, rotate: 1 }}
    transition={{ delay, duration: 0.5 }}
    className="group relative overflow-hidden rounded-[2rem] aspect-[16/9] md:aspect-[2/1] shadow-2xl w-full border-4 border-black/5 hover:border-black/20 transition-colors"
  >
    <img 
      src={image} 
      alt={name} 
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
    />
    <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent`} />
    
    {/* Badge Top Right */}
    <div className="absolute top-4 right-4 md:top-6 md:right-6">
      <span className={`px-4 py-1.5 md:px-6 md:py-2 rounded-full text-[10px] md:text-sm font-bold uppercase tracking-wider text-black bg-white shadow-lg animate-pulse`}>
        {role}
      </span>
    </div>

    {/* Name and Status Bottom Left */}
    <div className="absolute bottom-0 left-0 p-5 md:p-8 w-full flex flex-col items-start">
      <h3 className="text-2xl md:text-5xl font-display uppercase text-white leading-none mb-1 md:mb-2 drop-shadow-lg">{name}</h3>
      <div className="flex items-center gap-2">
         <div className="w-2 h-2 rounded-full bg-brand-neon animate-ping" />
         <p className="text-brand-neon font-sans text-[10px] md:text-sm tracking-[0.2em] font-bold uppercase shadow-black drop-shadow-md">CONFIRMADO</p>
      </div>
    </div>
  </motion.div>
);

export const EventSection: React.FC = () => {
  const guests = [
    { 
      name: "Pr. Elizeu Rodrigues", 
      role: "Preletor", 
      image: "https://raw.githubusercontent.com/mblarson/imagens/main/elizeu.png", 
      color: "bg-white" 
    },
    { 
      name: "Lukas Agustinho", 
      role: "Louvor", 
      image: "https://raw.githubusercontent.com/mblarson/imagens/main/lukas.png", 
      color: "bg-brand-pink text-white" 
    },
    { 
      name: "Carol Braga", 
      role: "Louvor", 
      image: "https://raw.githubusercontent.com/mblarson/imagens/main/carol.png", 
      color: "bg-[#4F46E5] text-white" 
    },
    {
      name: "Pr. Josué Brandão",
      role: "Preletor",
      image: "https://raw.githubusercontent.com/mblarson/imagens/main/josue.png",
      color: "bg-white"
    }
  ];

  return (
    <section id="event-section" className="relative w-full pt-20 pb-28 md:pb-36 px-4 bg-brand-neon text-black overflow-hidden z-10">
      
      {/* CSS Styles for this section */}
      <style>{`
        @keyframes slide-stripes {
            0% { background-position: 0 0; }
            100% { background-position: 50px 50px; }
        }
        .animated-bg-stripes {
            background-image: linear-gradient(
                45deg, 
                rgba(0,0,0,0.03) 25%, 
                transparent 25%, 
                transparent 50%, 
                rgba(0,0,0,0.03) 50%, 
                rgba(0,0,0,0.03) 75%, 
                transparent 75%, 
                transparent
            );
            background-size: 40px 40px;
            animation: slide-stripes 2s linear infinite;
        }
        @keyframes float-slow {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            33% { transform: translate(10px, -20px) rotate(10deg); }
            66% { transform: translate(-10px, 10px) rotate(-5deg); }
        }
        .animate-float {
            animation: float-slow 8s ease-in-out infinite;
        }
        @keyframes wiggle {
            0%, 100% { transform: rotate(-3deg); }
            50% { transform: rotate(3deg); }
        }
        .animate-wiggle-slow {
            animation: wiggle 3s ease-in-out infinite;
        }
      `}</style>

      {/* Dynamic Background Pattern */}
      <div className="absolute inset-0 animated-bg-stripes pointer-events-none z-0" />

      {/* Floating Background Shapes */}
      <div className="absolute bottom-40 right-[-5%] text-brand-pink/20 animate-float" style={{ animationDelay: '2s', animationDuration: '10s' }}>
          <Zap size={150} fill="currentColor" />
      </div>
      <div className="absolute top-1/3 right-[10%] text-black/5 animate-spin" style={{ animationDuration: '20s' }}>
          <Sparkles size={80} />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Header Info */}
        <div className="flex flex-col items-center text-center mb-8 relative">
          
          {/* Animated Main Title - CONGRESSO */}
          <motion.div
            className="relative z-10"
            initial={{ scale: 0, rotate: -15, y: 50 }}
            whileInView={{ scale: 1, rotate: -3, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", bounce: 0.6, duration: 1 }}
          >
             {/* Using CSS animation for continuous movement */}
             <div className="animate-wiggle-slow origin-center">
                <h2 className="text-[19vw] md:text-[13rem] font-fun text-brand-purple uppercase leading-[0.8] drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] md:drop-shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:scale-105 transition-transform cursor-pointer select-none">
                  Congresso
                </h2>
             </div>
          </motion.div>

          {/* Animated Subtitle Badge - JUBILEU DE OURO */}
          <motion.div
            initial={{ scale: 0, rotate: 15 }}
            whileInView={{ scale: 1, rotate: 2 }}
            viewport={{ once: true }}
            transition={{ type: "spring", bounce: 0.5, duration: 1, delay: 0.2 }}
            className="bg-brand-pink border-[3px] md:border-4 border-black px-6 py-2 md:px-10 md:py-4 rounded-full shadow-[4px_4px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_rgba(0,0,0,1)] -mt-4 md:-mt-10 z-20 relative hover:rotate-0 transition-transform hover:scale-110"
          >
            <h3 className="text-[6vw] md:text-5xl font-display uppercase text-white tracking-widest leading-none">
                Jubileu de Ouro
            </h3>
          </motion.div>
        </div>

        {/* Date and Location - SIDE BY SIDE ON MOBILE */}
        <motion.div 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-row flex-nowrap items-center justify-center gap-2 md:gap-16 mt-4 md:mt-8 w-full mb-8 max-w-full overflow-hidden"
        >
          <div className="group flex items-center gap-1.5 md:gap-3 text-xs sm:text-sm md:text-3xl font-bold font-sans whitespace-nowrap bg-white/50 backdrop-blur-sm px-2.5 py-2 md:px-4 md:py-2 rounded-xl border-2 border-transparent hover:border-black/10 transition-all hover:scale-105 cursor-default flex-shrink-0">
            <Calendar className="text-brand-purple w-3.5 h-3.5 md:w-8 md:h-8 group-hover:animate-bounce" />
            <span>03 e 04 de Abril</span>
          </div>
          <div className="group flex items-center gap-1.5 md:gap-3 text-xs sm:text-sm md:text-3xl font-bold font-sans whitespace-nowrap bg-white/50 backdrop-blur-sm px-2.5 py-2 md:px-4 md:py-2 rounded-xl border-2 border-transparent hover:border-black/10 transition-all hover:scale-105 cursor-default flex-shrink-0">
            <MapPin className="text-brand-pink w-3.5 h-3.5 md:w-8 md:h-8 group-hover:animate-bounce" />
            <span>Bosque dos Ipês</span>
          </div>
        </motion.div>

        {/* Full Width Blue Strip */}
        <div className="w-screen relative left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] h-3 md:h-5 bg-blue-600 mb-12 shadow-lg" />
          
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-8 mb-10 flex flex-col items-center"
        >
            <div className="relative">
              <h3 className="text-4xl md:text-7xl font-display uppercase italic font-black text-black leading-none mb-2 z-10 relative">
                CONFIRMADOS
              </h3>
              <div className="absolute -inset-2 bg-brand-neon blur-xl opacity-50 animate-pulse z-0"></div>
            </div>
            
            <p className="text-black/60 font-sans text-xs md:text-sm font-bold tracking-[0.2em] uppercase">
              EM BREVE MAIS CONFIRMADOS
            </p>
        </motion.div>

        {/* Guest Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {guests.map((guest, index) => (
            <GuestCard 
              key={index}
              {...guest}
              delay={index * 0.2}
            />
          ))}
        </div>

      </div>

      {/* Pink Marquee at Bottom (Replacing Wave) */}
      <div className="absolute bottom-0 left-0 right-0 z-20 border-y-4 border-black bg-brand-pink py-3 md:py-6 overflow-hidden rotate-1 scale-105 origin-bottom-left shadow-2xl hover:rotate-0 transition-transform duration-500">
         <motion.div 
            className="flex whitespace-nowrap font-fun text-2xl md:text-5xl text-black uppercase tracking-wide"
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
