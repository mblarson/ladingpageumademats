
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Sparkles, Zap } from 'lucide-react';

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
    viewport={{ once: true }}
    whileHover={{ scale: 1.02, rotate: 1 }}
    transition={{ delay, duration: 0.5 }}
    onClick={() => window.open(link, '_blank')}
    className={`group relative overflow-hidden rounded-[2rem] aspect-[16/9] md:aspect-[2/1] shadow-2xl w-full border-2 border-white/10 hover:border-brand-neon/50 transition-colors cursor-pointer ${color}`}
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
      `}</style>

      {/* Marquee Transition - Top of Green Section */}
      <div className="absolute -top-8 md:-top-12 left-0 right-0 z-[100] rotate-2 scale-110 border-y-4 border-black bg-brand-pink py-4 shadow-2xl">
         <motion.div 
            className="flex whitespace-nowrap font-fun text-3xl md:text-5xl text-black uppercase tracking-wide"
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

      {/* TOP PART: CHANGED TO YELLOW (brand-neon) */}
      <div className="relative w-full bg-brand-neon pt-20 pb-20 md:pb-32 px-4 overflow-hidden z-20">
         {/* Background Grid - Changed to #4F46E5 for visibility on yellow */}
         <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#4F46E5_1px,transparent_1px),linear-gradient(to_bottom,#4F46E5_1px,transparent_1px)] bg-[size:40px_40px]" />

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
                 <div className="animate-wiggle-slow origin-center">
                    {/* Updated text color to #4F46E5 (Purple/Navy) for contrast on Yellow */}
                    <h2 className="text-[19vw] md:text-[13rem] font-fun text-[#4F46E5] uppercase leading-[0.8] drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] md:drop-shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:scale-105 transition-transform cursor-pointer select-none">
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

            {/* Date and Location - Updated text colors to #4F46E5 for contrast on Yellow */}
            <motion.div 
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center justify-center gap-3 mt-4 md:mt-8 w-full max-w-full overflow-hidden"
            >
              <div 
                onClick={addToCalendar}
                className="group flex items-center gap-1.5 md:gap-3 text-xs sm:text-sm md:text-3xl font-bold font-sans whitespace-nowrap bg-[#4F46E5]/10 backdrop-blur-md text-[#4F46E5] px-2.5 py-2 md:px-4 md:py-2 rounded-xl border-2 border-[#4F46E5]/20 hover:border-[#4F46E5] transition-all hover:scale-105 cursor-pointer flex-shrink-0"
              >
                <Calendar className="text-[#4F46E5] w-3.5 h-3.5 md:w-8 md:h-8 group-hover:animate-bounce" />
                <span>03 e 04 de Abril</span>
              </div>
              <div className="group flex items-center gap-1.5 md:gap-3 text-xs sm:text-sm md:text-3xl font-bold font-sans whitespace-nowrap bg-[#4F46E5]/10 backdrop-blur-md text-[#4F46E5] px-2.5 py-2 md:px-4 md:py-2 rounded-xl border-2 border-[#4F46E5]/20 hover:border-[#4F46E5] transition-all hover:scale-105 cursor-default flex-shrink-0">
                <MapPin className="text-[#4F46E5] w-3.5 h-3.5 md:w-8 md:h-8 group-hover:animate-bounce" />
                <span>Bosque Expo - Shopping Bosque dos Ipês</span>
              </div>
            </motion.div>
         </div>

         {/* Wave Transition */}
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

        {/* Floating Background Shapes */}
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

        {/* Pink Marquee at Bottom */}
        <div className="absolute -bottom-6 left-0 right-0 z-50 border-y-4 border-black bg-brand-pink py-3 md:py-6 overflow-hidden rotate-1 scale-105 origin-bottom-left shadow-2xl hover:rotate-0 transition-transform duration-500">
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
      </div>
    </section>
  );
};
