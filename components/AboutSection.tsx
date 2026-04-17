
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Zap, User, MousePointer2, X, Instagram, ExternalLink } from 'lucide-react';
import { SubtleWaveDivider } from './SubtleWaveDivider';
import { DividerCreative } from './DividerCreative';
import { useSiteConfig, DEFAULT_SITE_CONFIG, SiteConfig } from '../hooks/useSiteConfig';

interface LeaderCardProps {
  role: string;
  name: string;
  image?: string;
  color: string; // Cor de destaque do card
  rotate: string; // Rotação leve para dar "messy look" de HQ
  className?: string; // Classe extra para o container (ex: col-span)
  imageAspect?: string; // Aspect ratio da imagem
  objectPosition?: string; // Posição da imagem (object-top, object-center, etc)
  onClick?: () => void; // Função de clique opcional
  showHighlight?: boolean; // Se deve mostrar o sticker de destaque
  enableDrag?: boolean; // Nova prop para drag
}

const LeaderCard: React.FC<LeaderCardProps> = ({ 
  role, 
  name, 
  image, 
  color, 
  rotate, 
  className = "", 
  imageAspect = "aspect-[4/5]",
  objectPosition = "object-center",
  onClick,
  showHighlight = false,
  enableDrag = false
}) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    whileHover={{ scale: 1.03, rotate: 0 }}
    whileDrag={{ scale: 1.05, zIndex: 100, cursor: 'grabbing' }}
    {...(enableDrag ? { drag: true, dragConstraints: { top: -20, left: -20, right: 20, bottom: 20 } } : {})}
    onClick={onClick}
    className={`
        relative group rounded-[1.5rem] md:rounded-[2.5rem] p-3 md:p-4 flex flex-col items-center text-center transition-all duration-300 ${rotate} ${className}
        ${onClick ? 'cursor-pointer' : ''}
        ${showHighlight 
            ? 'bg-white border-4 border-brand-neon shadow-[0_0_30px_rgba(204,255,0,0.5)] hover:shadow-[0_0_50px_rgba(204,255,0,0.8)]' 
            : 'bg-white border-[3px] md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
        }
    `}
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
      <h3 className="text-base md:text-2xl font-display uppercase text-black leading-none mt-1 md:mt-2 drop-shadow-sm">
        {name}
      </h3>
    </div>

    {/* Sticker de Destaque (Se ativado) - Posicionado na quina inferior direita, levemente para fora para não cobrir o nome */}
    {showHighlight && (
       <div className="absolute -bottom-3 -right-2 md:-bottom-5 md:-right-4 z-40 animate-bounce cursor-pointer pointer-events-none">
           <div className="bg-brand-neon border-2 border-black px-2 py-1 md:px-3 md:py-1.5 shadow-[3px_3px_0px_rgba(0,0,0,1)] -rotate-12 flex flex-col items-center justify-center hover:scale-110 transition-transform pointer-events-auto">
                <div className="flex items-center gap-1">
                    <MousePointer2 size={14} className="fill-black text-black" />
                    <span className="font-fun text-[10px] md:text-xs text-black leading-none uppercase">CLIQUE AQUI</span>
                </div>
                <span className="font-sans text-[8px] font-bold text-black leading-none uppercase tracking-tighter">Para conhecê-los</span>
           </div>
       </div>
    )}
  </motion.div>
);

interface AboutSectionProps {
  previewConfig?: SiteConfig;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ previewConfig }) => {
  const { config: storedConfig, loading } = useSiteConfig();
  const activeConfig = previewConfig || (loading ? DEFAULT_SITE_CONFIG : storedConfig);

  const [showLeadersModal, setShowLeadersModal] = useState(false);

  const handleInstagramRedirect = (url: string) => {
    window.open(url, '_blank');
    setShowLeadersModal(false);
  };

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
      
      <div className="max-container max-w-7xl mx-auto px-4 relative z-10">
        
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
                <h2 className="text-[15vw] md:text-7xl font-fun text-white text-center leading-[0.8] drop-shadow-[5px_5px_0px_#000] tracking-wide select-none">
                    {activeConfig.about_title}
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
             <SubtleWaveDivider className="mt-8 opacity-30" width="180px" height="10px" color="#CCFF00" />
        </div>

        {/* IEADMS Banner Image & Text */}
        <div className="w-full flex flex-col items-center mb-10 md:mb-16">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="w-full md:max-w-4xl aspect-video rounded-[1rem] md:rounded-[2rem] overflow-hidden border-[3px] md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white relative z-10"
            >
                <img 
                    src={activeConfig.about_bannerUrl} 
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
              className="mt-6 text-white text-center font-sans text-sm md:text-lg font-medium max-w-4xl mx-auto leading-relaxed tracking-wide opacity-90 drop-shadow-md"
            >
              {activeConfig.about_text}
            </motion.p>
        </div>

        {/* Cards Grid - Adicionado ID para navegação */}
        <div id="leaders-grid" className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-10 px-2 md:px-0">
            
            {/* Card 1 */}
            <LeaderCard 
                role="Presidentes IEADMS"
                name="Pr. Eliel e Jane"
                image="https://raw.githubusercontent.com/mblarson/imagens/main/elieljane.jpg" 
                color="bg-brand-neon text-black"
                rotate="rotate-[-2deg]"
                imageAspect="aspect-[4/5]"
                enableDrag={activeConfig.ui_allowDrag}
            />

            {/* Card 2 */}
            <LeaderCard 
                role="Presidentes Executivos"
                name="Pr. Felipe e Hyanna"
                image="https://raw.githubusercontent.com/mblarson/imagens/main/felipehyanna.jpg" 
                color="bg-brand-pink text-white"
                rotate="rotate-[2deg]"
                imageAspect="aspect-[4/5]"
                enableDrag={activeConfig.ui_allowDrag}
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
                objectPosition="object-[center_30%]"
                enableDrag={activeConfig.ui_allowDrag}
                
                // --- NOVAS PROPS PARA INTERATIVIDADE ---
                onClick={() => setShowLeadersModal(true)}
                showHighlight={true}
            />

        </div>
      </div>

      {/* BOTTOM DIVIDER (Transition to Footer/Black) */}
      <div className="absolute bottom-0 left-0 right-0 w-full z-10">
        <DividerCreative variant="particles" color="text-brand-purple" lineColor="bg-brand-purple" opacity={0.3} />
      </div>

      {/* --- MODAL DE SELEÇÃO DE INSTAGRAM --- */}
      <AnimatePresence>
        {showLeadersModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
             {/* Backdrop */}
             <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowLeadersModal(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
             />
             
             {/* Modal Content */}
             <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-[#1a1a1a] border-4 border-brand-purple p-6 md:p-8 rounded-3xl w-full max-w-sm shadow-[0_0_50px_rgba(91,33,182,0.5)] overflow-hidden"
             >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-pink via-brand-purple to-brand-neon" />

                <button 
                  onClick={() => setShowLeadersModal(false)}
                  className="absolute top-4 right-4 text-white/50 hover:text-white hover:rotate-90 transition-all"
                >
                  <X size={24} />
                </button>

                <div className="flex flex-col items-center mb-8">
                   <div className="w-16 h-16 bg-brand-purple rounded-full flex items-center justify-center mb-4 border-2 border-white shadow-lg animate-pulse">
                      <Instagram size={32} className="text-white" />
                   </div>
                   <h3 className="text-2xl font-display uppercase text-white text-center leading-none">
                      Quem você quer conhecer?
                   </h3>
                   <p className="text-white/50 text-xs mt-2 uppercase tracking-wide">Selecione um perfil para visitar</p>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Option 1: Joelson */}
                  <button
                    onClick={() => handleInstagramRedirect('https://www.instagram.com/joelsonsilva_santos/')}
                    className="group w-full py-4 px-4 rounded-2xl bg-[#1a1a1a] border-2 border-white/10 hover:border-brand-neon hover:bg-brand-neon/10 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-white/10 group-hover:bg-brand-neon flex items-center justify-center text-white group-hover:text-black font-bold transition-colors">
                         <User size={20} />
                       </div>
                       <div className="flex flex-col items-start">
                          <span className="text-white font-bold uppercase tracking-wide group-hover:text-brand-neon transition-colors">Pr. Joelson</span>
                          <span className="text-white/40 text-[10px]">@joelsonsilva_santos</span>
                       </div>
                    </div>
                    <ExternalLink size={18} className="text-white/30 group-hover:text-brand-neon" />
                  </button>

                  {/* Option 2: Mariana */}
                  <button
                    onClick={() => handleInstagramRedirect('https://www.instagram.com/marianalima_rb/')}
                    className="group w-full py-4 px-4 rounded-2xl bg-[#1a1a1a] border-2 border-white/10 hover:border-brand-pink hover:bg-brand-pink/10 transition-all flex items-center justify-between"
                  >
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-white/10 group-hover:bg-brand-pink flex items-center justify-center text-white font-bold transition-colors">
                         <User size={20} />
                       </div>
                       <div className="flex flex-col items-start">
                          <span className="text-white font-bold uppercase tracking-wide group-hover:text-brand-pink transition-colors">Mariana</span>
                          <span className="text-white/40 text-[10px]">@marianalima_rb</span>
                       </div>
                    </div>
                    <ExternalLink size={18} className="text-white/30 group-hover:text-brand-pink" />
                  </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
};
