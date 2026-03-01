
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo, useInView } from 'framer-motion';
import { Calendar, MapPin, Sparkles, Zap, MousePointer2, Navigation, X, Star, Clock } from 'lucide-react';
import { useSiteConfig, DEFAULT_SITE_CONFIG, SiteConfig } from '../hooks/useSiteConfig';

interface GuestCardProps {
  name: string;
  role: string;
  image: string;
  color: string;
  delay: number;
  link: string;
  enableDrag: boolean;
}

const GuestCard: React.FC<GuestCardProps> = ({ name, role, image, color, delay, link, enableDrag }) => (
  <motion.div 
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    whileHover={{ scale: 1.02 }}
    whileDrag={{ scale: 1.05, zIndex: 50, cursor: 'grabbing' }}
    {...(enableDrag ? { drag: true, dragConstraints: { top: -20, left: -20, right: 20, bottom: 20 } } : {})}
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
    
    <div className="absolute top-4 right-4 md:top-6 md:right-6">
      <span className={`px-4 py-1.5 md:px-6 md:py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider text-black bg-white shadow-lg animate-pulse`}>
        {role}
      </span>
    </div>

    <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 z-40 animate-bounce cursor-pointer pointer-events-none">
        <div className="bg-brand-neon border-2 border-black px-2 py-1 md:px-3 md:py-1.5 shadow-[3px_3px_0px_rgba(0,0,0,1)] -rotate-12 flex flex-col items-center justify-center hover:scale-110 transition-transform pointer-events-auto">
            <div className="flex items-center gap-1">
                <MousePointer2 size={12} className="fill-black text-black" />
                <span className="font-fun text-[10px] md:text-xs text-black leading-none uppercase">CLIQUE AQUI</span>
            </div>
            <span className="font-sans text-[8px] font-bold text-black leading-none uppercase tracking-tighter">Para conhecer</span>
        </div>
    </div>

    <div className="absolute bottom-0 left-0 p-5 md:p-8 w-full flex flex-col items-start pointer-events-none">
      <h3 className="text-2xl md:text-3xl font-display uppercase text-white leading-none mb-1 md:mb-2 drop-shadow-lg">{name}</h3>
      <div className="flex items-center gap-2">
         <div className="w-2 h-2 rounded-full bg-brand-neon animate-ping" />
         <p className="text-brand-neon font-sans text-[10px] md:text-xs tracking-[0.2em] font-bold uppercase shadow-black drop-shadow-md">CONFIRMADO</p>
      </div>
    </div>
  </motion.div>
);

const ComingSoonCard: React.FC<{ delay: number }> = ({ delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ delay, duration: 0.5 }}
    className="relative overflow-hidden rounded-[2rem] aspect-[16/9] md:aspect-[2/1] shadow-2xl w-full border-2 border-white/10 bg-[#0d0d0d] flex items-center justify-center group select-none"
  >
    {/* Animated Question Mark */}
    <motion.div 
        animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="text-white/10 pointer-events-none"
    >
       <span className="text-[8rem] md:text-[8rem] font-display font-bold leading-none">?</span>
    </motion.div>

    {/* Construction Tape Overlay */}
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
         <div className="w-[110%] bg-brand-neon py-3 md:py-3 -rotate-2 border-y-[4px] border-black shadow-lg relative overflow-hidden flex items-center justify-center">
             {/* Zebra Stripes */}
             <div className="absolute inset-0 opacity-20" 
                  style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0px, #000 10px, transparent 10px, transparent 20px)' }} 
             />
             <span className="relative z-10 text-black font-display text-2xl md:text-3xl uppercase tracking-[0.2em] font-black drop-shadow-sm">
                EM BREVE
             </span>
         </div>
    </div>
  </motion.div>
);

interface EventSectionProps {
  previewConfig?: SiteConfig;
}

export const EventSection: React.FC<EventSectionProps> = ({ previewConfig }) => {
  const { config: storedConfig, loading } = useSiteConfig();
  const activeConfig = previewConfig || (loading ? DEFAULT_SITE_CONFIG : storedConfig);
  const dragProps = activeConfig.ui_allowDrag ? { drag: true, dragConstraints: { top: -20, left: -20, right: 20, bottom: 20 }, whileDrag: { scale: 1.1, cursor: 'grabbing', zIndex: 50 } } : {};

  const [showMapModal, setShowMapModal] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0); 
  
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date('2026-04-03T18:00:00');
    const updateTimer = () => {
        const now = new Date();
        const difference = targetDate.getTime() - now.getTime();
        if (difference > 0) {
            setTimeLeft({
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            });
        }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);
  
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { amount: 0.3, once: false });

  useEffect(() => {
    if (!isInView) return; 
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % 1);
    }, 6000);
    return () => clearInterval(timer);
  }, [isInView]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x < -threshold) setSlideIndex((prev) => (prev + 1) % 1);
    else if (info.offset.x > threshold) setSlideIndex((prev) => (prev === 0 ? 0 : prev - 1));
  };

  const guests = [
    { name: "Pr. Elizeu Rodrigues", role: "Preletor", image: "https://raw.githubusercontent.com/mblarson/imagens/main/elizeu.png", color: "bg-[#1a1a1a]", link: "https://www.instagram.com/elizeurodriguesoficial/" },
    { name: "Lukas Agustinho", role: "Louvor", image: "https://raw.githubusercontent.com/mblarson/imagens/main/lukas.png", color: "bg-[#1a1a1a]", link: "https://www.instagram.com/lukasagustinho/" },
    { name: "Carol Braga", role: "Louvor", image: "https://raw.githubusercontent.com/mblarson/imagens/main/carol.png", color: "bg-[#4F46E5] text-white", link: "https://www.instagram.com/carolbragabr/" },
    { name: "Pr. Josué Brandão", role: "Preletor", image: "https://raw.githubusercontent.com/mblarson/imagens/main/josue.png", color: "bg-[#1a1a1a]", link: "https://www.instagram.com/prjosuebrandao/" },
    { name: "ATTOS 2 WORSHIP", role: "Louvor", image: "https://raw.githubusercontent.com/mblarson/imagens/main/Portal%20Umademats/attos2.png", color: "bg-[#1a1a1a]", link: "https://www.instagram.com/attos2worship/" },
    { name: "GABRIELA LOPES", role: "Preletora", image: "https://raw.githubusercontent.com/mblarson/imagens/main/Portal%20Umademats/gabrielalopessite.png", color: "bg-[#1a1a1a]", link: "https://www.instagram.com/gabrielalopes_oficial/" }
  ];

  const addToCalendar = () => {
    const event = {
      title: `${activeConfig.event_title} - ${activeConfig.event_badge}`,
      description: `Congresso UMADEMATS. Participe deste momento histórico no Jubileu de Ouro!`,
      location: activeConfig.event_location,
      start: "20260403T180000",
      end: "20260404T220000"
    };

    // Detecção de Dispositivo
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isAndroid) {
      // Formato para Google Calendar (Melhor para Android)
      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.start}/${event.end}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
      window.open(googleCalendarUrl, '_blank');
    } else {
      // Formato iCalendar (.ics) - Melhor para iOS/Outlook
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
    }
  };

  const address = activeConfig.event_location;
  const encodedAddress = encodeURIComponent(address);
  const openMap = () => setShowMapModal(true);
  const handleMapChoice = (url: string) => {
    window.open(url, '_blank');
    setShowMapModal(false);
  };

  return (
    <section id="event-section" ref={sectionRef} className="relative w-full flex flex-col z-30 hero-section-container">
      <style>{`
        @keyframes slide-stripes { 0% { background-position: 0 0; } 100% { background-position: 50px 50px; } }
        .animated-bg-stripes { background-image: linear-gradient(45deg, rgba(204,255,0,0.05) 25%, transparent 25%, transparent 50%, rgba(204,255,0,0.05) 50%, rgba(204,255,0,0.05) 75%, transparent 75%, transparent); background-size: 40px 40px; animation: slide-stripes 2s linear infinite; }
        @keyframes float-slow { 0%, 100% { transform: translate(0, 0) rotate(0deg); } 33% { transform: translate(10px, -20px) rotate(10deg); } 66% { transform: translate(-10px, 10px) rotate(-5deg); } }
        .animate-float { animation: float-slow 8s ease-in-out infinite; }
        @keyframes wiggle { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
        .animate-wiggle-slow { animation: wiggle 3s ease-in-out infinite; }
        @keyframes pulse-scale { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        .animate-pulse-scale { animation: pulse-scale 1.5s ease-in-out infinite; }
        @keyframes sticker-wiggle { 0%, 100% { transform: rotate(6deg); } 50% { transform: rotate(12deg) scale(1.05); } }
        .animate-sticker { animation: sticker-wiggle 2s ease-in-out infinite; }
        @keyframes sticker-wiggle-reverse { 0%, 100% { transform: rotate(-6deg); } 50% { transform: rotate(-12deg) scale(1.05); } }
        .animate-sticker-reverse { animation: sticker-wiggle-reverse 2.5s ease-in-out infinite; animation-delay: 0.5s; }
        .comic-halftone { background-image: radial-gradient(circle, #4F46E5 2px, transparent 2.5px); background-size: 30px 30px; }
      `}</style>

      <div className="absolute -top-6 md:-top-12 left-0 right-0 z-[100] rotate-2 scale-110 border-y-2 md:border-y-2 border-black bg-brand-pink py-2 md:py-2.5 shadow-2xl">
         <motion.div className="flex whitespace-nowrap font-fun text-xl md:text-2xl text-black uppercase tracking-wide" animate={{ x: ["0%", "-50%"] }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }}>
            {[...Array(10)].map((_, i) => ( <span key={i} className="mx-6 flex items-center gap-4">{activeConfig.event_marqueeText}</span> ))}
         </motion.div>
      </div>

      <div className="relative w-full bg-brand-neon pt-20 pb-20 md:pb-24 px-4 overflow-hidden z-20">
         <div className="absolute inset-0 pointer-events-none">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.6)_0%,rgba(204,255,0,0)_60%,rgba(0,0,0,0.05)_100%)]" />
             <div className="absolute inset-0 opacity-10 comic-halftone" />
             <div className="absolute inset-0 opacity-[0.05] bg-[repeating-linear-gradient(45deg,#000_0,#000_1px,transparent_0,transparent_50%)] bg-[size:10px_10px]" />
         </div>

         <div className="max-container max-w-5xl mx-auto relative z-10 cursor-grab active:cursor-grabbing">
            <motion.div
                drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.2} onDragEnd={handleDragEnd}
                animate={{ x: slideIndex === 0 ? 0 : -30, opacity: slideIndex === 0 ? 1 : 0, pointerEvents: slideIndex === 0 ? 'auto' : 'none' }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="flex flex-col items-center justify-center w-full"
            >
                {/* Adicionado ID para navegação específica do menu */}
                <div id="congress-timer-anchor" className="flex flex-col items-center text-center mb-8 relative">
                  <motion.div className="relative z-10" initial={{ scale: 0.9 }} whileInView={{ scale: 1 }} viewport={{ once: true }} {...dragProps}>
                     <div className="animate-wiggle-slow origin-center">
                        <h2 className="text-[19vw] md:text-[8rem] 2xl:text-[9rem] font-fun text-[#4F46E5] uppercase leading-[0.8] drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] md:drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:scale-105 transition-transform cursor-pointer select-none">
                          {activeConfig.event_title}
                        </h2>
                     </div>
                  </motion.div>
                  <motion.div 
                    {...dragProps}
                    className="bg-brand-pink border-[3px] md:border-4 border-black px-6 py-2 md:px-6 md:py-3 rounded-full shadow-[4px_4px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_rgba(0,0,0,1)] -mt-4 md:-mt-6 z-20 relative hover:rotate-0 transition-transform hover:scale-110"
                  >
                    <h3 className="text-[6vw] md:text-3xl font-display uppercase text-white tracking-widest leading-none"> {activeConfig.event_badge} </h3>
                  </motion.div>
                </div>

                <div className="w-full flex flex-col items-center mt-4 mb-4">
                    <div className="bg-black text-brand-neon px-4 py-1.5 rounded-t-lg text-[10px] md:text-xs font-display uppercase tracking-[0.3em] border-x-2 border-t-2 border-black flex items-center gap-2 shadow-lg translate-y-1">
                        <Zap size={14} className="fill-brand-neon animate-pulse" />
                        T-MINUS
                    </div>
                    <motion.div 
                        {...dragProps}
                        className="flex flex-wrap items-center justify-center gap-2 md:gap-4 px-2 py-4 bg-[#0a0a2a] border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                    >
                        {[
                          { val: timeLeft.days, label: "Dias" },
                          { val: timeLeft.hours, label: "Horas" },
                          { val: timeLeft.minutes, label: "Min" },
                          { val: timeLeft.seconds, label: "Seg", color: "text-brand-pink" }
                        ].map((unit, i) => (
                           <React.Fragment key={unit.label}>
                             <div className="flex flex-col items-center min-w-[65px] md:min-w-[80px]">
                                <span className={`text-3xl md:text-5xl font-fun leading-none tracking-tighter ${unit.color || 'text-white'} drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]`}>
                                  {String(unit.val).padStart(2, '0')}
                                </span>
                                <span className="text-[8px] md:text-xs font-display uppercase text-white/40 tracking-widest mt-1 font-black">
                                  {unit.label}
                                </span>
                             </div>
                             {i < 3 && <div className="text-xl md:text-4xl font-fun text-white/20 pb-4 hidden sm:block">:</div>}
                           </React.Fragment>
                        ))}
                    </motion.div>
                </div>

                <div className="flex flex-col items-center justify-center gap-6 mt-6 md:mt-8 w-full">
                  <motion.div {...dragProps} onClick={addToCalendar} className="relative group flex items-center gap-2 md:gap-3 text-sm md:text-xl font-bold font-sans whitespace-nowrap bg-[#4F46E5]/10 backdrop-blur-md text-[#4F46E5] px-4 py-2.5 md:px-6 md:py-3 rounded-xl border-4 border-black hover:bg-[#4F46E5] hover:text-white transition-all hover:scale-105 cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="absolute -top-8 -right-4 md:-top-10 md:-right-10 z-50 animate-sticker origin-bottom-left cursor-pointer">
                        <div className="bg-white border-2 border-black px-2 py-0.5 md:px-3 md:py-1 shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-center gap-1">
                             <span className="text-[10px] md:text-sm font-fun text-brand-pink tracking-wide leading-none">CLIQUE P/ AGENDAR!</span>
                             <MousePointer2 size={12} className="text-black fill-black rotate-[-15deg]" />
                        </div>
                    </div>
                    <Calendar className="w-4 h-4 md:w-6 md:h-6" />
                    <span>{activeConfig.event_date}</span>
                  </motion.div>
                  
                  <motion.div {...dragProps} onClick={openMap} className="relative group flex items-center gap-2 md:gap-3 text-sm md:text-lg font-bold font-sans md:whitespace-nowrap bg-white/40 backdrop-blur-md text-[#4F46E5] px-4 py-2 rounded-xl border-2 border-black hover:border-[#4F46E5] hover:bg-[#4F46E5] hover:text-white transition-all hover:scale-105 cursor-pointer">
                     <div className="absolute -bottom-6 -right-2 md:-bottom-8 md:-right-6 z-40 animate-sticker-reverse origin-top-left cursor-pointer">
                        <div className="bg-white border-2 border-black px-2 py-0.5 md:px-3 md:py-1 shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-center gap-1">
                             <Navigation size={12} className="text-brand-pink fill-brand-pink" />
                             <span className="text-[10px] md:text-sm font-fun text-brand-pink tracking-wide leading-none">ABRIR NO GPS</span>
                        </div>
                    </div>
                    <MapPin className="text-[#4F46E5] group-hover:text-white w-4 h-4 md:w-5 md:h-5 shrink-0" />
                    <span className="text-left leading-tight">{activeConfig.event_location}</span>
                  </motion.div>
                </div>
            </motion.div>

            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <AnimatePresence mode="wait">
                </AnimatePresence>
            </div>
         </div>

         <div className="absolute bottom-0 left-0 right-0 w-full z-20 leading-none translate-y-[1px]">
            <svg className="w-full h-12 md:h-24 fill-black" viewBox="0 0 1440 320" preserveAspectRatio="none">
              <path fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,202.7C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
         </div>
      </div>

      <div className="relative w-full bg-black pt-16 pb-28 md:pb-32 px-4 overflow-visible z-10">
        <div className="absolute inset-0 animated-bg-stripes pointer-events-none z-0" />
        <div className="absolute bottom-40 right-[-5%] text-brand-pink/20 animate-float" style={{ animationDelay: '2s', animationDuration: '10s' }}><Zap size={150} fill="currentColor" /></div>
        <div className="absolute top-1/3 right-[10%] text-white/5 animate-spin" style={{ animationDuration: '20s' }}><Sparkles size={80} /></div>

        <div className="max-container max-w-5xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="mb-10 flex flex-col items-center">
              <h3 className="text-4xl md:text-5xl font-display uppercase italic font-black text-brand-neon leading-none mb-2 z-10 relative drop-shadow-[0_0_15px_rgba(204,255,0,0.5)] animate-pulse-scale">{activeConfig.event_guestTitle}</h3>
              <p className="text-white/60 font-sans text-xs md:text-sm font-bold tracking-[0.2em] uppercase">EM BREVE MAIS CONFIRMADOS</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12">
            {guests.map((guest, index) => ( <GuestCard key={index} {...guest} delay={index * 0.2} enableDrag={activeConfig.ui_allowDrag} /> ))}
          </div>
        </div>

        <div className="absolute -bottom-6 left-0 right-0 z-50 border-y-4 border-black bg-brand-pink py-3 md:py-6 overflow-hidden rotate-1 scale-105 origin-bottom-left shadow-2xl">
           <motion.div className="flex whitespace-nowrap font-fun text-2xl md:text-4xl text-black uppercase tracking-wide" animate={{ x: ["0%", "-50%"] }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }}>
              {[...Array(10)].map((_, i) => ( <span key={i} className="mx-6 flex items-center gap-4">{activeConfig.event_marqueeText}</span> ))}
           </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showMapModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMapModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-[#1a1a1a] border-4 border-brand-neon p-6 md:p-8 rounded-3xl w-full max-sm shadow-[0_0_50px_rgba(204,255,0,0.3)] overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-pink via-brand-purple to-brand-neon" />
                <button onClick={() => setShowMapModal(false)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-all"><X size={24} /></button>
                <div className="flex flex-col items-center mb-6">
                   <div className="w-16 h-16 bg-brand-neon rounded-full flex items-center justify-center mb-4 border-2 border-white shadow-lg"><Navigation size={32} className="text-black fill-black" /></div>
                   <h3 className="text-2xl font-display uppercase text-white text-center leading-none">Abrir com</h3>
                </div>
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleMapChoice(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`)} className="group w-full py-4 px-4 rounded-2xl bg-[#1a1a1a] border-2 border-white/10 hover:border-[#4285F4] hover:bg-[#4285F4]/10 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-[#4285F4] flex items-center justify-center text-white font-bold">G</div><span className="text-white font-bold uppercase tracking-wide group-hover:text-[#4285F4]">Google Maps</span></div>
                    <MapPin size={18} className="text-white/30 group-hover:text-[#4285F4]" />
                  </button>
                  <button onClick={() => handleMapChoice(`https://waze.com/ul?q=${encodedAddress}&navigate=yes`)} className="group w-full py-4 px-4 rounded-2xl bg-[#1a1a1a] border-2 border-white/10 hover:border-[#33CCFF] hover:bg-[#33CCFF]/10 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-[#33CCFF] flex items-center justify-center text-white font-bold">W</div><span className="text-white font-bold uppercase tracking-wide group-hover:text-[#33CCFF]">Waze</span></div>
                    <MapPin size={18} className="text-white/30 group-hover:text-[#33CCFF]" />
                  </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
