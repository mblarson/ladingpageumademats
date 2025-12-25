import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Mic2, Music } from 'lucide-react';

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
    transition={{ delay, duration: 0.5 }}
    className="group relative overflow-hidden rounded-3xl aspect-[3/4]"
  >
    <img 
      src={image} 
      alt={name} 
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 grayscale group-hover:grayscale-0" 
    />
    <div className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90`} />
    
    <div className="absolute top-4 right-4">
      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase text-black ${color}`}>
        {role}
      </span>
    </div>

    <div className="absolute bottom-0 left-0 p-6 w-full">
      <h3 className="text-3xl font-display uppercase text-white leading-none mb-1">{name}</h3>
      <p className="text-gray-400 font-sans text-sm tracking-wide">CONFIRMADO</p>
    </div>
  </motion.div>
);

export const EventSection: React.FC = () => {
  const guests = [
    { name: "Pr. João Silva", role: "Preletor", image: "https://picsum.photos/400/600?random=1", color: "bg-brand-neon" },
    { name: "Band Resgate", role: "Louvor", image: "https://picsum.photos/400/600?random=2", color: "bg-brand-pink" },
    { name: "Pra. Maria", role: "Preletora", image: "https://picsum.photos/400/600?random=3", color: "bg-[#4F46E5] text-white" },
  ];

  return (
    <section className="relative w-full py-32 px-4 bg-[#111] text-white overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header Info - CENTERED */}
        <div className="flex flex-col items-center text-center mb-20">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-7xl md:text-9xl font-fun uppercase leading-[0.9] mb-2 tracking-wide">
              Congresso
            </h2>
            <h3 className="text-4xl md:text-6xl font-display uppercase text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-8">
              Jubileu de Ouro
            </h3>
          </motion.div>

          <motion.div 
             initial={{ y: 50, opacity: 0 }}
             whileInView={{ y: 0, opacity: 1 }}
             viewport={{ once: true }}
             className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12"
          >
            <div className="flex items-center gap-3 text-xl md:text-2xl font-bold font-sans">
              <Calendar className="text-brand-neon" />
              <span>03 e 04 de Abril</span>
            </div>
            <div className="flex items-center gap-3 text-xl md:text-2xl font-bold font-sans">
              <MapPin className="text-brand-pink" />
              <span>Bosque dos Ipês</span>
            </div>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 max-w-lg font-sans mt-8 text-center"
          >
            Prepare-se para dois dias inesquecíveis de adoração, comunhão e palavra. Não fique de fora deste momento histórico.
          </motion.p>
        </div>

        {/* Separator Line */}
        <motion.div 
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          className="h-1 w-full bg-white/20 mb-12 origin-center"
        />

        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
           <h3 className="text-2xl font-sans font-bold uppercase tracking-wider text-center md:text-left">Line-Up Convidados</h3>
           <span className="hidden md:block text-xs font-mono text-gray-500">SCROLL TO REVEAL</span>
        </div>

        {/* Guest Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guests.map((guest, index) => (
            <GuestCard 
              key={index}
              {...guest}
              delay={index * 0.2}
            />
          ))}
        </div>

      </div>

      {/* Wavy Bottom Transition */}
       <div className="absolute bottom-[-1px] left-0 w-full overflow-hidden leading-[0]">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(100%+1.3px)] h-[60px] md:h-[100px]">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-brand-neon"></path>
        </svg>
    </div>
    </section>
  );
};