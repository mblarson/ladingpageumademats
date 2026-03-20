import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, X, Gamepad2, Users, Book, Calendar, Zap, PlayCircle } from 'lucide-react';

interface WelcomeExperienceProps {
  name: string;
  customImage?: string;
  onFinish: () => void;
}

interface TourStep {
  id: string;
  targetId: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const tourSteps: TourStep[] = [
  {
    id: 'games',
    targetId: 'games-section',
    title: 'Jogo do Penteca',
    description: 'Nossa maior novidade! Participe das aventuras do Penteca, junte pontos e divirta-se.',
    icon: <Gamepad2 className="text-brand-pink" />,
    color: 'from-brand-pink to-purple-600'
  },
  {
    id: 'lidera',
    targetId: 'lidera-section',
    title: 'Lidera Umademats',
    description: 'Área exclusiva para nossos líderes. Aqui você encontra materiais e gestão completa.',
    icon: <Users className="text-brand-green" />,
    color: 'from-brand-green to-emerald-700'
  },
  {
    id: 'bible',
    targetId: 'bible-section',
    title: 'Leitura Bíblica',
    description: 'Mantenha sua vida espiritual em dia. Acompanhe o plano de leitura diária.',
    icon: <Book className="text-brand-neon" />,
    color: 'from-brand-purple to-indigo-800'
  },
  {
    id: 'event',
    targetId: 'event-section',
    title: 'Congresso 2026',
    description: 'Fique por dentro de tudo o que vai rolar no nosso grande congresso anual.',
    icon: <Calendar className="text-brand-neon" />,
    color: 'from-orange-500 to-red-600'
  }
];

export const WelcomeExperience: React.FC<WelcomeExperienceProps> = ({ name, customImage, onFinish }) => {
  const [currentStep, setCurrentStep] = useState(-1);
  const [spotlight, setSpotlight] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const updateSpotlight = useCallback(() => {
    if (currentStep === -1) return;
    const targetId = tourSteps[currentStep].targetId;
    const element = document.getElementById(targetId);
    if (element) {
      const rect = element.getBoundingClientRect();
      setSpotlight({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height
      });
    }
  }, [currentStep]);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      updateSpotlight();
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [updateSpotlight]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      
      const targetId = tourSteps[nextStep].targetId;
      const element = document.getElementById(targetId);
      
      if (element) {
        setIsScrolling(true);
        // Centraliza a seção no meio da tela (Mobile Priority)
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Aguarda o scroll terminar para atualizar o spotlight
        setTimeout(() => {
          updateSpotlight();
          setIsScrolling(false);
        }, 800);
      }
    } else {
      onFinish();
    }
  };

  const handleSkip = () => onFinish();

  // Intro Screen
  if (currentStep === -1) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-brand-dark overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-blue/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-green/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative z-10 max-w-2xl w-full px-6 text-center"
        >
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-neon blur-2xl opacity-20 animate-pulse" />
              <img 
                src={customImage || "https://raw.githubusercontent.com/mblarson/imagens/main/logo50anosquadrada.png"} 
                alt={name}
                className={`relative z-10 drop-shadow-[0_0_20px_rgba(204,255,0,0.3)] object-contain ${customImage ? 'h-48 md:h-64' : 'w-32 h-32 md:w-48 md:h-48'}`}
              />
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-display uppercase text-white mb-6 leading-tight">
            Paz do Senhor, <span className="text-brand-neon">{name}</span>!
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 font-sans mb-12 leading-relaxed">
            Espero que tenha feito uma boa viagem até aqui. 
            <br className="hidden md:block" />
            Seja bem-vindo ao novo portal oficial da <span className="text-white font-bold">UMADEMATS</span>.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <button 
              onClick={handleNext}
              className="w-full md:w-auto px-10 py-5 bg-brand-neon text-black font-display uppercase tracking-widest rounded-full hover:scale-105 transition-transform shadow-[0_0_30px_rgba(204,255,0,0.4)] flex items-center justify-center gap-3 group"
            >
              Iniciar Tour
              <PlayCircle className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={handleSkip} className="w-full md:w-auto px-10 py-5 bg-white/5 text-white font-display uppercase tracking-widest rounded-full hover:bg-white/10 transition-colors border border-white/10">
              Pular Tour
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentTourStep = tourSteps[currentStep];
  const tooltipPosition = spotlight 
    ? (spotlight.top - window.scrollY > window.innerHeight / 2 ? 'top' : 'bottom')
    : 'bottom';

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
      {/* Spotlight Overlay */}
      <div className="absolute inset-0 bg-black/80 transition-opacity duration-500 pointer-events-auto"
        style={{
          clipPath: spotlight 
            ? `polygon(0% 0%, 0% 100%, ${spotlight.left}px 100%, ${spotlight.left}px ${spotlight.top}px, ${spotlight.left + spotlight.width}px ${spotlight.top}px, ${spotlight.left + spotlight.width}px ${spotlight.top + spotlight.height}px, ${spotlight.left}px ${spotlight.top + spotlight.height}px, ${spotlight.left}px 100%, 100% 100%, 100% 0%)`
            : 'none'
        }}
      />

      {/* Spotlight Glow */}
      {spotlight && !isScrolling && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute border-2 border-brand-neon/50 rounded-lg pointer-events-none z-[10000]"
          style={{
            top: spotlight.top,
            left: spotlight.left,
            width: spotlight.width,
            height: spotlight.height,
            boxShadow: '0 0 30px rgba(204,255,0,0.3)',
          }}
        />
      )}

      {/* Tooltip Card */}
      <AnimatePresence mode="wait">
        {spotlight && !isScrolling && (
          <motion.div
            key={currentTourStep.id}
            initial={{ opacity: 0, y: tooltipPosition === 'top' ? 20 : -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed left-1/2 -translate-x-1/2 w-[90%] max-w-sm pointer-events-auto z-[10001]"
            style={{
              top: tooltipPosition === 'bottom' 
                ? spotlight.top + spotlight.height + 20 - window.scrollY
                : 'auto',
              bottom: tooltipPosition === 'top'
                ? (window.innerHeight - spotlight.top + 20 + window.scrollY)
                : 'auto'
            }}
          >
            <div className={`relative overflow-hidden rounded-3xl p-6 shadow-2xl border border-white/10 bg-gradient-to-br ${currentTourStep.color}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                  {currentTourStep.icon}
                </div>
                <div>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-white/60 block">Passo {currentStep + 1} / {tourSteps.length}</span>
                  <h2 className="text-xl font-display uppercase text-white">{currentTourStep.title}</h2>
                </div>
              </div>

              <p className="text-white/90 font-sans text-sm leading-relaxed mb-6">
                {currentTourStep.description}
              </p>

              <div className="flex items-center justify-between gap-4">
                <button onClick={handleSkip} className="text-white/60 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors">
                  Pular
                </button>
                <button onClick={handleNext} className="px-6 py-3 bg-white text-black font-display uppercase tracking-widest text-xs rounded-full hover:scale-105 transition-transform flex items-center gap-2">
                  {currentStep === tourSteps.length - 1 ? 'Finalizar' : 'Próximo'}
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Close Button */}
      <button onClick={handleSkip} className="fixed top-6 right-6 z-[10002] p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md border border-white/10 transition-all pointer-events-auto">
        <X size={24} />
      </button>
    </div>
  );
};
