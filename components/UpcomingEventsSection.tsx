import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Sparkles, Clock, MapPin } from 'lucide-react';
import { getDirectDriveUrl } from '../lib/heroUtils';

export interface EventCardItem {
  id: string;
  title: string;
  category: string;
  date: string;
  time?: string;
  location: string;
  description: string;
  imageUrl?: string;
  isDefaultCard?: boolean;
  tagColor?: string;
  linkUrl?: string;
}

const DEFAULT_CULTO_CARD: EventCardItem = {
  id: 'default-culto',
  title: 'TODO TERCEIRO SÁBADO DO MÊS TEM CULTO DA UMADEMATS!',
  category: 'AGENDA FIXA',
  date: 'Todo 3º Sábado do Mês',
  time: '19:30h',
  location: 'Todas as Congregações IEADMS',
  description: 'Culto Unificado de Mocidade e Adolescentes em todas as igrejas do estado.',
  imageUrl: '',
  isDefaultCard: true,
  tagColor: '#D6F200',
};

const MOCK_EVENTS: EventCardItem[] = [
  DEFAULT_CULTO_CARD,
  {
    id: '1',
    title: 'Escola de Formação de Líderes 2026',
    category: 'ESCOLA DE LÍDERES',
    date: '18 a 20 de Abril, 2026',
    time: '19:30h',
    location: 'Sede IEADMS • Cuiabá / MT',
    description: 'Imersão intensiva de capacitação espiritual, ministerial e estratégica para a liderança de mocidade e adolescentes de Mato Grosso.',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80',
    tagColor: '#D6F200',
  },
  {
    id: '2',
    title: 'Curso de Capacitação de Pregadores',
    category: 'CURSO',
    date: '10 de Maio, 2026',
    time: '08:00h às 17:00h',
    location: 'Centro de Eventos UMADEMATS',
    description: 'Treinamento prático de hermenêutica, homilética e oratória direcionado aos jovens vocacionados ao ministério da Palavra.',
    imageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1000&q=80',
    tagColor: '#70D4CC',
  },
  {
    id: '3',
    title: 'Congresso Estadual UMADEMATS 2026',
    category: 'CONGRESSO ESTADUAL',
    date: '17 a 19 de Julho, 2026',
    time: 'Abertura às 19:00h',
    location: 'Ginásio Aecim Tocantins • Cuiabá',
    description: 'O maior ajuntamento de jovens e adolescentes do estado. Dias de adoração profunda, avivamento e comunhão inesquecíveis.',
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80',
    tagColor: '#FF5E97',
  },
  {
    id: '4',
    title: 'Acampamento Pentecostes',
    category: 'RETIRO & ACAMPAMENTO',
    date: '11 a 13 de Setembro, 2026',
    time: 'Saída às 18:00h',
    location: 'Chapada dos Guimarães / MT',
    description: 'Três dias longe da rotina no meio da natureza, com gincanas, fogueira, cultos ao ar livre e experiência com o Espírito Santo.',
    imageUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1000&q=80',
    tagColor: '#FFC800',
  },
  {
    id: '5',
    title: 'Encontro Regional de Juventude',
    category: 'ENCONTRO REGIONAL',
    date: '24 de Outubro, 2026',
    time: '18:30h',
    location: 'Região Sul • Rondonópolis / MT',
    description: 'União das juventudes da Região Sul para um clamor unificado e fortalecimento da comunhão da mocidade local.',
    imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1000&q=80',
    tagColor: '#4BC8FF',
  }
];

interface UpcomingEventsSectionProps {
  firstImageUrl?: string;
}

export const UpcomingEventsSection: React.FC<UpcomingEventsSectionProps> = ({ firstImageUrl }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const eventsList = useMemo(() => {
    if (!firstImageUrl || !firstImageUrl.trim()) return MOCK_EVENTS;
    const directUrl = getDirectDriveUrl(firstImageUrl.trim());
    if (!directUrl || !directUrl.trim()) return MOCK_EVENTS;

    return MOCK_EVENTS.map((evt, idx) => {
      if (idx === 0) {
        return {
          ...evt,
          imageUrl: directUrl.trim(),
          isDefaultCard: false,
        };
      }
      return evt;
    });
  }, [firstImageUrl]);

  const totalCards = eventsList.length;

  /**
   * Mathematics of the Stack Carousel:
   * Calculate offset relative to active card:
   * 0 -> Active Card: translate(0,0), scale(1), opacity(1), blur(0px), zIndex(40)
   * 1 -> 1st behind: translate(-14px, 16px), scale(0.96), opacity(0.85), blur(2px), zIndex(30)
   * 2 -> 2nd behind: translate(-28px, 32px), scale(0.92), opacity(0.70), blur(3px), zIndex(20)
   * 3 -> Last behind: translate(-48px, 52px), scale(0.88), opacity(0.55), blur(4px), zIndex(10)
   */
  const getStackPositionStyles = (index: number) => {
    const offset = (index - activeIndex + totalCards) % totalCards;

    if (offset === 0) {
      return {
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        filter: 'blur(0px)',
        zIndex: 40,
        pointerEvents: 'auto' as const,
      };
    }

    if (offset === 1) {
      return {
        x: -14,
        y: 16,
        scale: 0.96,
        opacity: 0.85,
        filter: 'blur(2px)',
        zIndex: 30,
        pointerEvents: 'auto' as const,
      };
    }

    if (offset === 2) {
      return {
        x: -28,
        y: 32,
        scale: 0.92,
        opacity: 0.70,
        filter: 'blur(3px)',
        zIndex: 20,
        pointerEvents: 'auto' as const,
      };
    }

    if (offset === 3) {
      return {
        x: -48,
        y: 52,
        scale: 0.88,
        opacity: 0.55,
        filter: 'blur(4px)',
        zIndex: 10,
        pointerEvents: 'auto' as const,
      };
    }

    // For any card further back in the loop
    return {
      x: -48,
      y: 52,
      scale: 0.84,
      opacity: 0,
      filter: 'blur(5px)',
      zIndex: 5,
      pointerEvents: 'none' as const,
    };
  };

  return (
    <section 
      id="proximos-encontros" 
      className="relative w-full py-12 md:py-20 lg:py-12 overflow-hidden select-none"
      style={{
        background: 'linear-gradient(180deg, #D6F200 0%, #70D4CC 55%, #BCECF2 100%)',
      }}
    >
      {/* Glow Radial Azul atrás do título */}
      <div 
        className="absolute top-0 left-0 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] pointer-events-none rounded-full z-0 opacity-90 transition-all duration-700"
        style={{
          background: 'radial-gradient(circle, rgba(75,200,255,.45), transparent 65%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* CABEÇALHO */}
        <motion.div 
          className="mb-6 sm:mb-10"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ willChange: 'transform, opacity' }}
        >
          {/* Título Principal em duas linhas */}
          <h2 className="font-[900] font-sans uppercase text-white tracking-tight leading-[0.85] text-4xl sm:text-6xl md:text-7xl lg:text-[4.5rem] drop-shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
            PRÓXIMOS<br />ENCONTROS
          </h2>
          {/* Subtítulo em tom Azul */}
          <p className="text-sm sm:text-base font-bold uppercase tracking-wider text-[#002776] mt-2 sm:mt-3 drop-shadow-sm">
            Acompanhe a Umademats
          </p>
        </motion.div>

        {/* CONTAINER DO CARROSSEL EM PILHA (STACK) */}
        <div className="relative w-full flex items-center justify-center my-4 md:my-8 lg:my-6 min-h-[260px] sm:min-h-[360px] md:min-h-[420px] lg:min-h-[320px]">
          
          {/* ÁREA DA PILHA DE CARDS - ASPECT 16:9 (aspect-video) COM ANIMAÇÃO DE FLUTUAÇÃO */}
          <div className="relative w-[86vw] max-w-[480px] sm:max-w-[620px] md:max-w-[720px] lg:max-w-[560px] aspect-video flex items-center justify-center animate-float">
            {eventsList.map((event, index) => {
              const offset = (index - activeIndex + totalCards) % totalCards;
              const stackStyle = getStackPositionStyles(index);
              const isActive = offset === 0;

              return (
                <motion.div
                  key={event.id}
                  initial={false}
                  animate={stackStyle}
                  transition={{
                    duration: 0.5,
                    ease: [0.22, 0.61, 0.36, 1],
                  }}
                  style={{
                    willChange: 'transform, opacity, filter',
                    transformOrigin: 'center center',
                  }}
                  onClick={() => {
                    if (!isActive) {
                      setActiveIndex(index);
                    }
                  }}
                  className={`absolute inset-0 w-full h-full rounded-[20px] sm:rounded-[28px] border-[3px] sm:border-[4px] border-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden cursor-pointer ${
                    isActive ? 'ring-2 ring-white/30' : 'hover:brightness-105'
                  }`}
                >
                  {/* Imagem do Card ou Card Padrão Institucional */}
                  {event.isDefaultCard || !event.imageUrl || failedImages[event.id] ? (
                    <div className="relative w-full h-full bg-[#0A0D14] flex flex-col justify-between p-3 sm:p-5 md:p-6 overflow-hidden select-none">
                      {/* Ambient Glows */}
                      <div className="absolute -top-12 -left-12 w-48 sm:w-64 h-48 sm:h-64 rounded-full bg-[#D6F200]/20 blur-3xl pointer-events-none" />
                      <div className="absolute -bottom-12 -right-12 w-48 sm:w-64 h-48 sm:h-64 rounded-full bg-[#10B981]/25 blur-3xl pointer-events-none" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(112,212,204,0.15)_0%,transparent_70%)] pointer-events-none" />

                      {/* Glassmorphism Inner Container */}
                      <div className="relative z-10 w-full h-full flex flex-col justify-between rounded-xl sm:rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-md p-3 sm:p-4 md:p-5 shadow-2xl">
                        
                        {/* Top Header Tag */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-[#D6F200]/15 border border-[#D6F200]/40 text-[#D6F200] text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-sm">
                            <Calendar className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#D6F200]" />
                            <span>AGENDA FIXA</span>
                          </div>
                          <div className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-white/10 text-white/90 text-[10px] sm:text-xs font-bold tracking-widest uppercase border border-white/10">
                            <Sparkles className="w-3 h-3 text-[#70D4CC]" />
                            <span>IEADMS</span>
                          </div>
                        </div>

                        {/* Main Message Title */}
                        <div className="my-auto py-1 sm:py-1.5">
                          <p className="text-white/80 font-extrabold uppercase text-[10px] sm:text-xs md:text-sm lg:text-xs tracking-widest mb-1 sm:mb-1.5">
                            TODO TERCEIRO SÁBADO DO MÊS
                          </p>
                          <h3 className="font-black uppercase text-base sm:text-2xl md:text-3xl lg:text-2xl leading-[1.05] sm:leading-[1.0] tracking-tight bg-gradient-to-r from-[#D6F200] via-[#10B981] to-[#70D4CC] bg-clip-text text-transparent drop-shadow-[0_4px_12px_rgba(214,242,0,0.3)]">
                            TEM CULTO DA UMADEMATS!
                          </h3>
                        </div>

                        {/* Footer Details */}
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 pt-1.5 sm:pt-2 border-t border-white/10 text-white/90 text-[9px] sm:text-xs font-bold">
                          <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-black/50 border border-white/10">
                            <Clock className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#D6F200]" />
                            <span>19:30H</span>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-black/50 border border-white/10">
                            <MapPin className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#70D4CC]" />
                            <span>CONGREGAÇÕES IEADMS</span>
                          </div>
                        </div>

                      </div>
                    </div>
                  ) : (
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover select-none pointer-events-none"
                      loading={index === 0 ? 'eager' : 'lazy'}
                      onError={() => {
                        setFailedImages(prev => ({ ...prev, [event.id]: true }));
                      }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

