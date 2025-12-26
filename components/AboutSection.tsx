
import React from 'react';
import { motion } from 'framer-motion';
import { Star, Zap, User } from 'lucide-react';

interface LeaderCardProps {
  role: string;
  name: string;
  image?: string;
  color: string; // Cor de destaque do card
  rotate: string; // Rotação leve para dar "messy look" de HQ
  className?: string; // Classe extra para o container (ex: col-span)
  imageAspect?: string; // Aspect ratio da imagem
  objectPosition?: string; // Posição da imagem (object-top, object-center, etc)
}

const LeaderCard: React.FC<LeaderCardProps> = ({ 
  role, 
  name, 
  image, 
  color, 
  rotate, 
  className = "", 
  imageAspect = "aspect-[4/5]",
  objectPosition = "object-center"
}) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    whileHover={{ scale: 1.03, rotate: 0 }}
    className={`relative group bg-white border-[3px] md:border-4 border-black rounded-[1.5rem] md:rounded-[2.5rem] p-3 md:p-4 flex flex-col items-center text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform duration-300 ${rotate} ${className}`}
  >
    {/* Decorative Tape/Sticker */}
    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-20 md:w-24 h-5 md:h-6 ${color} border-2 border-black rotate-[-2deg] opacity-100 z-20`} />

    {/* Image Container */}
    <div className={`relative w-full ${imageAspect} rounded-[1.2rem] md:rounded-[2rem] overflow-hidden border-2 border-black mb-3 md:mb-4 bg-gray-100`}>
      {image ? (
        <img 
            src={image} 
            alt={name} 
            className={`w-full h-full object-cover ${objectPosition} transition-transform duration-500 group-hover:scale-110`}
            loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-200">
             <User size={64} className="text-gray-400" />
        </div>
      )}
      
      {/* Halftone Overlay Effect on Image */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,black_1px,transparent_1px)] bg-[size:10px_10px] opacity-10 pointer-events-none" />
    </div>

    {/* Content */}
    <div className="w-full flex flex-col items-center gap-1 z-10 pb-1 md:pb-2">
      <span className={`inline-block px-2 py-0.5 md:px-3 md:py-1 rounded-full ${color} border border-black text-[8px] md:text-xs font-bold font-sans uppercase tracking-widest shadow-[2px_2px_0px_rgba(0,0,0,1)] whitespace-nowrap`}>
        {role}
      </span>
      <h3 className="text-base md:text-3xl font-display uppercase text-black leading-none mt-1 md:mt-2 drop-shadow-sm">
        {name}
      </h3>
    </div>
  </motion.div>
);

export const AboutSection: React.FC = () => {
  return (
    <section id="about-section" className="relative w-full bg-[#0a0a2a] pt-24 pb-32 overflow-hidden z-20">
      
      {/* CSS Styles Localizados */}
      <style>{`
        .bg-halftone-blue {
            background-image: radial-gradient(#1e1b4b 2px, transparent 2px);
            background-size: 30px 30px;
        }
        @keyframes float-mini {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
      `}</style>

      {/* Background Patterns */}
      <div className="absolute inset-0 bg-halftone-blue opacity-20 pointer-events-none" />
      
      {/* TOP DIVIDER (Transition from Indigo to Navy) */}
      <div className="absolute top-0 left-0 right-0 leading-none z-10">
        <svg className="w-full h-16 md:h-24 fill-[#4F46E5]" viewBox="0 0 1440 100" preserveAspectRatio="none">
           <path d="M0,0 C240,90 480,90 720,50 C960,10 1200,10 1440,50 L1440,0 L0,0 Z" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center mb-8 md:mb-12 relative">
             {/* Decorative Background for Title */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[150%] bg-white/5 blur-3xl rounded-full z-0" />
             
             <motion.div
               initial={{ scale: 0.8, opacity: 0 }}
               whileInView={{ scale: 1, opacity: 1 }}
               viewport={{ once: true }}
               className="relative z-10"
             >
                <h2 className="text-[15vw] md:text-9xl font-fun text-white text-center leading-[0.8] drop-shadow-[5px_5px_0px_#000] tracking-wide select-none">
                    QUEM
                    <span className="text-brand-neon block md:inline md:ml-6">SOMOS</span>
                </h2>
                
                {/* Decorative Elements around Title */}
                <div className="absolute -top-4 -right-4 md:-right-12 text-brand-pink animate-[spin_10s_linear_infinite]">
                    <Zap size={40} className="md:w-16 md:h-16 fill-current" />
                </div>
                <div className="absolute -bottom-2 -left-2 md:-left-12 text-brand-purple animate-bounce">
                    <Star size={30} className="md:w-12 md:h-12 fill-current" />
                </div>
             </motion.div>

             <p className="mt-6 text-white/70 font-sans text-sm md:text-lg max-w-2xl text-center uppercase tracking-wider font-bold">
                Conheça quem faz a obra acontecer
             </p>
        </div>

        {/* IEADMS Banner Image & Text */}
        <div className="w-full flex flex-col items-center mb-10 md:mb-16">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="w-full md:max-w-5xl aspect-video rounded-[1rem] md:rounded-[2rem] overflow-hidden border-[3px] md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white relative z-10"
            >
                <img 
                    src="https://raw.githubusercontent.com/mblarson/imagens/main/ieadms.png" 
                    alt="IEADMS Banner"
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
            </motion.div>

            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-white text-center font-sans text-sm md:text-xl font-medium max-w-4xl mx-auto leading-relaxed tracking-wide opacity-90 drop-shadow-md"
            >
              Igreja com visão para o século XXI, dedicada a apresentar Deus ao mundo, cumprir o evangelho de Cristo, incentivar a fé e fortalecer uma comunidade vitoriosa sustentada pela promessa de que as portas do inferno não prevalecerão. Estamos em Campo Grande - MS no endereço Av. Dr. João Rosa Píres, 482 - Amambai.
            </motion.p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-10 px-2 md:px-0">
            
            {/* Card 1 */}
            <LeaderCard 
                role="Pastores IEADMS"
                name="Pr. Elial e Jane"
                image="https://raw.githubusercontent.com/mblarson/imagens/main/elieljane.jpg" 
                color="bg-brand-neon text-black"
                rotate="rotate-[-2deg]"
                imageAspect="aspect-[4/5]"
            />

            {/* Card 2 */}
            <LeaderCard 
                role="Executivos"
                name="Pr. Felipe e Hyanna"
                image="https://raw.githubusercontent.com/mblarson/imagens/main/felipehyanna.jpg" 
                color="bg-brand-pink text-white"
                rotate="rotate-[2deg]"
                imageAspect="aspect-[4/5]"
            />

            {/* Card 3 - Full Width on Mobile with 16:9 Image */}
            <LeaderCard 
                role="Líderes UMADEMATS"
                name="Pr. Joelson e Mariana"
                image="https://raw.githubusercontent.com/mblarson/imagens/main/IMG_0043.jpeg" 
                color="bg-brand-purple text-white"
                rotate="rotate-[-1deg]"
                className="col-span-2 md:col-span-1"
                imageAspect="aspect-[16/9] md:aspect-[4/5]"
                
                // ALTERE O VALOR ABAIXO PARA AJUSTAR O POSICIONAMENTO DA FOTO
                // [center_25%] significa: Centralizado horizontalmente, 25% do topo verticalmente.
                // Aumente a % para mostrar mais a parte de baixo da foto. Diminua para mostrar o topo.
                objectPosition="object-[center_30%]" 
            />

        </div>
      </div>

      {/* BOTTOM DIVIDER (Transition to Footer/Black) */}
      <div className="absolute bottom-0 left-0 right-0 leading-none z-10 translate-y-1">
         <svg className="w-full h-16 md:h-24 fill-black" viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,60 C320,140 640,0 960,60 C1280,120 1440,60 1440,60 V120 H0 V60 Z"></path>
         </svg>
      </div>

    </section>
  );
};
