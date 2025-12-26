
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Sparkles, Zap, MousePointer2, Navigation, X, Star } from 'lucide-react';

interface GuestCardProps {
  name: string;
  role: string;
  image: string;
  color: string;
  delay: number;
  link: string;
}

const GuestCard: React.FC<GuestCardProps> = ({ name, role, image, color, delay, link }) => (
  <motion.div 
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    whileHover={{ scale: 1.02 }}
    transition={{ delay, duration: 0.5 }}
    onClick={() => window.open(link, '_blank')}
    className={`group relative overflow-hidden rounded-[2rem] aspect-[16/9] md:aspect-[2/1] shadow-2xl w-full border-2 border-white/10 hover:border-brand-neon/50 transition-colors cursor-pointer ${color}`}
    style={{ willChange: 'transform' }}
  >
    <img 
      src={image} 
      alt={name} 
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
      loading="lazy"
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
  const [showMapModal, setShowMapModal] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0); // 0: Text, 1: Shirt 1, 2: Shirt 2

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const guests = [
    { 
      name: "Pr. Elizeu Rodrigues", 
      role: "Preletor", 
      image: "https://raw.githubusercontent.com/mblarson/imagens/main/elizeu.png", 
      color: "bg-[#1a1a1a]",
      link: "https://www.instagram.com/elizeurodriguesoficial/"
    },
    { 
      name: "Lukas Agustinho", 
      role: "Louvor", 
      image: "https://raw.githubusercontent.com/mblarson/imagens/main/lukas.png", 
      color: "bg-[#1a1a1a]",
      link: "https://www.instagram.com/lukasagustinho/"
    },
    { 
      name: "Carol Braga", 
      role: "Louvor", 
      image: "https://raw.githubusercontent.com/mblarson/imagens/main/carol.png", 
      color: "bg-[#4F46E5] text-white",
      link: "https://www.instagram.com/carolbragabr/"
    },
    {
      name: "Pr. Josué Brandão", 
      role: "Preletor", 
      image: "https://raw.githubusercontent.com/mblarson/imagens/main/josue.png", 
      color: "bg-[#1a1a1a]",
      link: "https://www.instagram.com/prjosuebrandao/"
    }
  ];

  const addToCalendar = () => {
    const event = {
      title: "UMADEMATS 2026 - Jubileu de Ouro",
      description: "Congresso UMADEMATS 2026 - Jubileu de Ouro. Participe deste momento histórico!",
      location: "Bosque Expo - Shopping Bosque dos Ipês",
      start: "20260403T180000",
      end: "20260404T220000"
    };

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//UMADEMATS//Portal//PT",
      "BEGIN:VEVENT",
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description}`,
      `LOCATION:${event.location}`,
      `DTSTART:${event.start}`,
      `DTEND:${event.end}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'umademats-2026.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const address = "Av. Cônsul Assaf Trad, 4796 - Parque dos Novos Estados, Campo Grande - MS, 79035-900";
  const encodedAddress = encodeURIComponent(address);

  const openMap = () => {
    setShowMapModal(true);
  };

  const handleMapChoice = (url: string) => {
    window.open(url, '_blank');
    setShowMapModal(false);
  };

  return (
    <section id="event-section" className="relative w-full flex flex-col z-30">
      
      {/* CSS Styles for this section */}
      <style>{`
        @keyframes slide-stripes {
            0% { background-position: 0 0; }
            100% { background-position: 50px 50px; }
        }
        .animated-bg-stripes {
            background-image: linear-gradient(
                45deg, 
                rgba(204, 255, 0, 0.05) 25%, 
                transparent 25%, 
                transparent 50%, 
                rgba(204, 255, 0, 0.05) 50%, 
                rgba(204, 255, 0, 0.05) 75%, 
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
        @keyframes pulse-scale {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        .animate-pulse-scale {
            animation: pulse-scale 1.5s ease-in-out infinite;
        }
        
        /* ANIMAÇÃO STICKER 1 (Direita Superior) */
        @keyframes sticker-wiggle {
            0%, 100% { transform: rotate(6deg); }
            50% { transform: rotate(12deg) scale(1.05); }
        }
        .animate-sticker {
            animation: sticker-wiggle 2s ease-in-out infinite;
        }

        /* ANIMAÇÃO STICKER 2 (Direita Inferior / Invertido) */
        @keyframes sticker-wiggle-reverse {
            0%, 100% { transform: rotate(-6deg); }
            50% { transform: rotate(-12deg) scale(1.05); }
        }
        .animate-sticker-reverse {
            animation: sticker-wiggle-reverse 2.5s ease-in-out infinite;
            animation-delay: 0.5s; /* Delay para dessincronizar do outro */
        }

        @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Marquee Transition */}
      <div className="absolute -top-6 md:-top-12 left-0 right-0 z-[100] rotate-2 scale-110 border-y-2 md:border-y-4 border-black bg-brand-pink py-2 md:py-4 shadow-2xl">
         <motion.div 
            className="flex whitespace-nowrap font-fun text-xl md:text-4xl text-black uppercase tracking-wide"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            style={{ willChange: 'transform' }}
          >
            {[...Array(10)].map((_, i) => (
              <span key={i} className="mx-6 flex items-center gap-4">
                UMADEMATS 2026 • JUBILEU DE OURO • 
              </span>
            ))}
         </motion.div>
      </div>

      {/* TOP PART: GREEN SECTION */}
      <div className="relative w-full bg-brand-neon pt-20 pb-20 md:pb-32 px-4 overflow-hidden z-20">
         {/* Background Grid */}
         <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#4F46E5_1px,transparent_1px),linear-gradient(to_bottom,#4F46E5_1px,transparent_1px)] bg-[size:40px_40px]" />

         {/* CONTENT WRAPPER */}
         {/* IMPORTANTE: Este container define a altura baseada no conteúdo de texto, evitando reflow. */}
         <div className="max-w-5xl mx-auto relative z-10">
            
            {/* 1. ORIGINAL CONTENT (TEXTO) */}
            {/* Mantemos este conteúdo RELATIVE para que ele ocupe espaço físico e defina a altura da div pai. */}
            {/* Quando não for o slide 0, apenas reduzimos a opacidade e movemos visualmente, mas o espaço continua lá. */}
            <motion.div
                animate={{
                    x: slideIndex === 0 ? 0 : -30,
                    opacity: slideIndex === 0 ? 1 : 0,
                    pointerEvents: slideIndex === 0 ? 'auto' : 'none', // Impede clique quando invisível
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="flex flex-col items-center justify-center w-full"
            >
                {/* Header Info */}
                <div className="flex flex-col items-center text-center mb-8 relative">
                  
                  {/* Animated Main Title - CONGRESSO */}
                  <motion.div
                    className="relative z-10"
                    initial={{ scale: 0.9 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                  >
                     <div className="animate-wiggle-slow origin-center">
                        <h2 className="text-[19vw] md:text-[13rem] font-fun text-[#4F46E5] uppercase leading-[0.8] drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] md:drop-shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:scale-105 transition-transform cursor-pointer select-none">
                          Congresso
                        </h2>
                     </div>
                  </motion.div>

                  {/* Animated Subtitle Badge - JUBILEU DE OURO */}
                  <div
                    className="bg-brand-pink border-[3px] md:border-4 border-black px-6 py-2 md:px-10 md:py-4 rounded-full shadow-[4px_4px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_rgba(0,0,0,1)] -mt-4 md:-mt-10 z-20 relative hover:rotate-0 transition-transform hover:scale-110"
                  >
                    <h3 className="text-[6vw] md:text-5xl font-display uppercase text-white tracking-widest leading-none">
                        Jubileu de Ouro
                    </h3>
                  </div>
                </div>

                {/* Date and Location - BOTOES REVERTIDOS AO TAMANHO ORIGINAL */}
                <div 
                    className="flex flex-col items-center justify-center gap-6 mt-12 md:mt-16 w-full max-w-full overflow-visible"
                >
                  {/* BUTTON 1: CALENDAR */}
                  <div 
                    onClick={addToCalendar}
                    className="relative group flex items-center gap-1.5 md:gap-3 text-xs sm:text-sm md:text-3xl font-bold font-sans whitespace-nowrap bg-[#4F46E5]/10 backdrop-blur-md text-[#4F46E5] px-2.5 py-2 md:px-6 md:py-3 rounded-xl border-2 border-[#4F46E5] hover:bg-[#4F46E5] hover:text-white transition-all hover:scale-105 cursor-pointer flex-shrink-0 shadow-[0_0_15px_rgba(79,70,229,0.3)] animate-pulse-scale"
                  >
                    <div className="absolute -top-8 -right-4 md:-top-10 md:-right-10 z-50 animate-sticker origin-bottom-left pointer-events-none">
                        <div className="bg-white border-2 border-black px-2 py-0.5 md:px-3 md:py-1 shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-center gap-1">
                             <span className="text-[10px] md:text-sm font-fun text-brand-pink tracking-wide leading-none">CLIQUE P/ AGENDAR!</span>
                             <MousePointer2 size={12} className="text-black fill-black rotate-[-15deg]" />
                        </div>
                    </div>

                    <Calendar className="w-3.5 h-3.5 md:w-8 md:h-8 group-hover:animate-bounce" />
                    <span>03 e 04 de Abril</span>
                  </div>
                  
                  {/* BUTTON 2: LOCATION */}
                  <div 
                    onClick={openMap}
                    className="relative group flex items-center gap-1.5 md:gap-3 text-xs sm:text-sm md:text-3xl font-bold font-sans whitespace-nowrap bg-[#4F46E5]/10 backdrop-blur-md text-[#4F46E5] px-2.5 py-2 md:px-4 md:py-2 rounded-xl border-2 border-[#4F46E5]/20 hover:border-[#4F46E5] hover:bg-[#4F46E5] hover:text-white transition-all hover:scale-105 cursor-pointer flex-shrink-0"
                  >
                     <div 
                      className="absolute -bottom-6 -right-2 md:-bottom-8 md:-right-6 z-40 animate-sticker-reverse origin-top-left cursor-pointer"
                    >
                        <div className="bg-white border-2 border-black px-2 py-0.5 md:px-3 md:py-1 shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-center gap-1">
                             <Navigation size={12} className="text-brand-pink fill-brand-pink" />
                             <span className="text-[10px] md:text-sm font-fun text-brand-pink tracking-wide leading-none">ABRIR NO GPS</span>
                        </div>
                    </div>

                    <MapPin className="text-[#4F46E5] group-hover:text-white w-3.5 h-3.5 md:w-8 md:h-8 group-hover:animate-bounce" />
                    <span>Bosque Expo - Shopping Bosque dos Ipês</span>
                  </div>
                </div>
            </motion.div>

            {/* 2. OVERLAY LAYER FOR SHIRTS */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <AnimatePresence mode="wait">
                    {/* SLIDE 1: CAMISETA TERRACOTA */}
                    {slideIndex === 1 && (
                        <motion.div
                            key="shirt-terracota"
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -50, opacity: 0 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="absolute inset-0"
                        >
                             <div className="relative w-full h-full flex flex-col items-center justify-center">
                                 {/* BACKGROUND DECORATIONS (CSS LIGHTWEIGHT) */}
                                 <div className="absolute inset-0 flex items-center justify-center opacity-40 z-0">
                                     {/* Rotating Ring */}
                                     <div className="absolute w-[50vh] h-[50vh] md:w-[60vh] md:h-[60vh] border-[2px] border-dashed border-[#4F46E5] rounded-full animate-[spin_20s_linear_infinite]" />
                                     <div className="absolute w-[40vh] h-[40vh] md:w-[50vh] md:h-[50vh] border border-[#4F46E5]/30 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                                     {/* Glow Center */}
                                     <div className="absolute w-[30vh] h-[30vh] bg-brand-pink/20 blur-3xl rounded-full animate-pulse" />
                                     {/* Floating Stars */}
                                     <div className="absolute top-[20%] right-[20%] text-brand-pink animate-bounce"><Star size={24} fill="currentColor" /></div>
                                     <div className="absolute bottom-[30%] left-[20%] text-[#4F46E5] animate-bounce" style={{ animationDelay: '0.5s' }}><Star size={16} fill="currentColor" /></div>
                                 </div>
                                 
                                 {/* TOP TEXT: CAMISETA CONGRESSO (Reduzido) */}
                                 <div className="absolute top-0 left-0 right-0 flex flex-col items-center pt-2 md:pt-4 z-20 pointer-events-none">
                                     <h2 className="text-[10vw] md:text-[6rem] leading-[0.8] font-fun text-[#4F46E5] opacity-80 select-none mix-blend-multiply transform -rotate-2 text-center whitespace-nowrap drop-shadow-sm">
                                         CAMISETA CONGRESSO
                                     </h2>
                                 </div>

                                 {/* IMG - Ocupando espaço de forma inteligente */}
                                 <div className="relative z-10 w-full flex items-center justify-center h-full translate-y-[5%] md:translate-y-0">
                                    <img 
                                        src="https://raw.githubusercontent.com/mblarson/imagens/main/camisetaterracota.png"
                                        alt="Camiseta Terracota Oficial"
                                        className="h-[50vh] md:h-[65vh] w-auto object-contain drop-shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500"
                                    />
                                    
                                    {/* Spotlight on floor */}
                                    <div className="absolute bottom-[10%] w-[60%] h-[20px] bg-black/20 blur-xl rounded-[100%]" />
                                 </div>

                                 {/* BADGE - Positioned BELOW the shirt (Absolute Bottom) */}
                                 <div className="absolute bottom-[12%] md:bottom-[5%] left-1/2 -translate-x-1/2 bg-white border-2 border-black px-4 py-1.5 -rotate-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] z-30 whitespace-nowrap hover:scale-105 transition-transform">
                                     <span className="font-display text-sm md:text-2xl text-brand-pink uppercase tracking-wide">Garanta a sua</span>
                                 </div>
                             </div>
                        </motion.div>
                    )}

                    {/* SLIDE 2: CAMISETA VERDE */}
                    {slideIndex === 2 && (
                        <motion.div
                            key="shirt-green"
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -50, opacity: 0 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="absolute inset-0"
                        >
                            <div className="relative w-full h-full flex flex-col items-center justify-center">
                                 {/* BACKGROUND DECORATIONS (CSS LIGHTWEIGHT) */}
                                 <div className="absolute inset-0 flex items-center justify-center opacity-40 z-0">
                                     {/* Rotating Sunburst Effect */}
                                      <div 
                                        className="absolute w-[80vh] h-[80vh] animate-[spin_30s_linear_infinite]"
                                        style={{ background: 'repeating-conic-gradient(from 0deg, rgba(79, 70, 229, 0.05) 0deg 10deg, transparent 10deg 20deg)' }}
                                     />
                                     <div className="absolute w-[50vh] h-[50vh] border-4 border-dashed border-white/40 rounded-full animate-spin-slow" />
                                     <div className="absolute top-[15%] left-[10%] text-[#4F46E5] animate-pulse"><Zap size={32} fill="currentColor" /></div>
                                 </div>

                                 {/* TOP TEXT: CAMISETA CONGRESSO (Reduzido) */}
                                 <div className="absolute top-0 left-0 right-0 flex flex-col items-center pt-2 md:pt-4 z-20 pointer-events-none">
                                     <h2 className="text-[10vw] md:text-[6rem] leading-[0.8] font-fun text-[#4F46E5] opacity-80 select-none mix-blend-multiply transform -rotate-2 text-center whitespace-nowrap drop-shadow-sm">
                                         CAMISETA CONGRESSO
                                     </h2>
                                 </div>

                                 {/* IMG - Ocupando espaço de forma inteligente */}
                                 <div className="relative z-10 w-full flex items-center justify-center h-full translate-y-[5%] md:translate-y-0">
                                    <img 
                                        src="https://raw.githubusercontent.com/mblarson/imagens/main/camisetaverde.png"
                                        alt="Camiseta Verde Oficial"
                                        className="h-[50vh] md:h-[65vh] w-auto object-contain drop-shadow-2xl -rotate-2 hover:rotate-0 transition-transform duration-500"
                                    />
                                    {/* Spotlight on floor */}
                                    <div className="absolute bottom-[10%] w-[60%] h-[20px] bg-black/20 blur-xl rounded-[100%]" />
                                 </div>

                                 {/* BADGE - Positioned BELOW the shirt (Absolute Bottom) */}
                                 <div className="absolute bottom-[12%] md:bottom-[5%] left-1/2 -translate-x-1/2 bg-brand-pink border-2 border-black px-4 py-1.5 rotate-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] z-30 whitespace-nowrap hover:scale-105 transition-transform">
                                     <span className="font-display text-sm md:text-2xl text-white uppercase tracking-wide">Edição Especial</span>
                                 </div>
                             </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
         </div>

         {/* Wave Transition (MANTIDO INTACTO) */}
         <div className="absolute bottom-0 left-0 right-0 w-full z-20 leading-none translate-y-[1px]">
            <svg className="w-full h-12 md:h-24 fill-black" viewBox="0 0 1440 320" preserveAspectRatio="none">
              <path fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,202.7C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
         </div>
      </div>

      {/* BOTTOM PART: BLACK WITH NEON STRIPES */}
      <div className="relative w-full bg-black pt-16 pb-28 md:pb-36 px-4 overflow-visible z-10">
        
        {/* Dynamic Background Pattern - Adjusted for Black Background */}
        <div className="absolute inset-0 animated-bg-stripes pointer-events-none z-0" />

        {/* Floating Background Shapes - OTIMIZAÇÃO: CSS Animations */}
        <div className="absolute bottom-40 right-[-5%] text-brand-pink/20 animate-float" style={{ animationDelay: '2s', animationDuration: '10s' }}>
            <Zap size={150} fill="currentColor" />
        </div>
        <div className="absolute top-1/3 right-[10%] text-white/5 animate-spin" style={{ animationDuration: '20s' }}>
            <Sparkles size={80} />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mb-10 flex flex-col items-center"
          >
              <div className="relative">
                {/* Updated Title Color to Neon */}
                <h3 className="text-4xl md:text-7xl font-display uppercase italic font-black text-brand-neon leading-none mb-2 z-10 relative drop-shadow-[0_0_15px_rgba(204,255,0,0.5)] animate-pulse-scale">
                  CONFIRMADOS
                </h3>
              </div>
              
              <p className="text-white/60 font-sans text-xs md:text-sm font-bold tracking-[0.2em] uppercase">
                EM BREVE MAIS CONFIRMADOS
              </p>
          </motion.div>

          {/* Guest Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12">
            {guests.map((guest, index) => (
              <GuestCard 
                key={index}
                {...guest}
                delay={index * 0.2}
              />
            ))}
          </div>

        </div>

        {/* Pink Marquee at Bottom - OTIMIZAÇÃO: Array reduzido */}
        <div className="absolute -bottom-6 left-0 right-0 z-50 border-y-4 border-black bg-brand-pink py-3 md:py-6 overflow-hidden rotate-1 scale-105 origin-bottom-left shadow-2xl hover:rotate-0 transition-transform duration-500">
           <motion.div 
              className="flex whitespace-nowrap font-fun text-2xl md:text-5xl text-black uppercase tracking-wide"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
              style={{ willChange: 'transform' }}
            >
              {[...Array(10)].map((_, i) => (
                <span key={i} className="mx-6 flex items-center gap-4">
                  UMADEMATS 2026 • JUBILEU DE OURO • 
                </span>
              ))}
           </motion.div>
        </div>
      </div>

      {/* MODAL DE SELEÇÃO DE GPS */}
      <AnimatePresence>
        {showMapModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
             {/* Backdrop */}
             <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMapModal(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
             />
             
             {/* Modal Content */}
             <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-[#1a1a1a] border-4 border-brand-neon p-6 md:p-8 rounded-3xl w-full max-w-sm shadow-[0_0_50px_rgba(204,255,0,0.3)] overflow-hidden"
             >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-pink via-brand-purple to-brand-neon" />

                <button 
                  onClick={() => setShowMapModal(false)}
                  className="absolute top-4 right-4 text-white/50 hover:text-white hover:rotate-90 transition-all"
                >
                  <X size={24} />
                </button>

                <div className="flex flex-col items-center mb-6">
                   <div className="w-16 h-16 bg-brand-neon rounded-full flex items-center justify-center mb-4 border-2 border-white shadow-lg">
                      <Navigation size={32} className="text-black fill-black" />
                   </div>
                   <h3 className="text-2xl font-display uppercase text-white text-center leading-none">
                      Abrir com
                   </h3>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => handleMapChoice(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`)}
                    className="group w-full py-4 px-4 rounded-2xl bg-[#1a1a1a] border-2 border-white/10 hover:border-[#4285F4] hover:bg-[#4285F4]/10 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-[#4285F4] flex items-center justify-center text-white font-bold">G</div>
                       <span className="text-white font-bold uppercase tracking-wide group-hover:text-[#4285F4] transition-colors">Google Maps</span>
                    </div>
                    <MapPin size={18} className="text-white/30 group-hover:text-[#4285F4]" />
                  </button>

                  <button
                    onClick={() => handleMapChoice(`https://waze.com/ul?q=${encodedAddress}&navigate=yes`)}
                    className="group w-full py-4 px-4 rounded-2xl bg-[#1a1a1a] border-2 border-white/10 hover:border-[#33CCFF] hover:bg-[#33CCFF]/10 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-[#33CCFF] flex items-center justify-center text-white font-bold">W</div>
                       <span className="text-white font-bold uppercase tracking-wide group-hover:text-[#33CCFF] transition-colors">Waze</span>
                    </div>
                    <MapPin size={18} className="text-white/30 group-hover:text-[#33CCFF]" />
                  </button>

                  <button
                    onClick={() => handleMapChoice(`http://maps.apple.com/?q=${encodedAddress}`)}
                    className="group w-full py-4 px-4 rounded-2xl bg-[#1a1a1a] border-2 border-white/10 hover:border-white hover:bg-white/10 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black font-bold">A</div>
                       <span className="text-white font-bold uppercase tracking-wide group-hover:text-white transition-colors">Apple Maps</span>
                    </div>
                    <MapPin size={18} className="text-white/30 group-hover:text-white" />
                  </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
};
