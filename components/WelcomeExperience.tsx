import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, X, Gamepad2, Users, Book, Calendar, Zap, PlayCircle } from 'lucide-react';

interface WelcomeExperienceProps {
  name: string;
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
    id: 'intro',
    targetId: 'hero-section',
    title: 'Bem-vindo ao Portal',
    description: 'Preparamos este tour rápido para você conhecer as novidades do nosso portal oficial.',
    icon: <Sparkles className="text-brand-neon" />,
    color: 'from-brand-blue to-brand-green'
  },
  {
    id: 'games',
    targetId: 'games-section',
    title: 'Jogo do Penteca',
    description: 'Nossa maior novidade! Participe das aventuras do Penteca, junte pontos e divirta-se com a galera.',
    icon: <Gamepad2 className="text-brand-pink" />,
    color: 'from-brand-pink to-purple-600'
  },
  {
    id: 'lidera',
    targetId: 'lidera-section',
    title: 'Lidera Umademats',
    description: 'Área exclusiva para nossos líderes. Aqui você encontra materiais, orientações e gestão completa.',
    icon: <Users className="text-brand-green" />,
    color: 'from-brand-green to-emerald-700'
  },
  {
    id: 'bible',
    targetId: 'bible-section',
    title: 'Leitura Bíblica',
    description: 'Mantenha sua vida espiritual em dia. Acompanhe o plano de leitura e marque seu progresso.',
    icon: <Book className="text-brand-neon" />,
    color: 'from-brand-purple to-indigo-800'
  },
  {
    id: 'event',
    targetId: 'event-section',
    title: 'Congresso 2026',
    description: 'Fique por dentro de tudo o que vai rolar no nosso grande congresso. Inscrições, preletores e muito mais.',
    icon: <Calendar className="text-brand-neon" />,
    color: 'from-orange-500 to-red-600'
  }
];

export const WelcomeExperience: React.FC<WelcomeExperienceProps> = ({ name, onFinish }) => {
  const [currentStep, setCurrentStep] = useState(-1); // -1 is the initial personalized welcome
  const [spotlight, setSpotlight] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    // Prevent body scroll during tour
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const updateSpotlight = (targetId: string) => {
    const element = document.getElementById(targetId);
    if (element) {
      const rect = element.getBoundingClientRect();
      setSpotlight({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height
      });
    } else {
      setSpotlight(null);
    }
  };

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      
      const targetId = tourSteps[nextStep].targetId;
      const element = document.getElementById(targetId);
      
      if (element) {
        setIsScrolling(true);
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Wait for scroll to finish
        setTimeout(() => {
          updateSpotlight(targetId);
          setIsScrolling(false);
        }, 800);
      } else {
        setSpotlight(null);
      }
    } else {
      onFinish();
    }
  };

  const handleSkip = () => {
    onFinish();
  };

  // Initial personalized welcome screen
  if (currentStep === -1) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-brand-dark overflow-hidden">
        {/* Modern Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-blue/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-green/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
          
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 border-2 border-brand-neon/30 rounded-full animate-[spin_30s_linear_infinite]" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 border-2 border-brand-blue/30 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
          </div>
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
                src="https://raw.githubusercontent.com/mblarson/imagens/main/logo50anosquadrada.png" 
                alt="UMADEMATS 50 Anos"
                className="w-32 h-32 md:w-48 md:h-48 relative z-10 drop-shadow-[0_0_20px_rgba(204,255,0,0.3)]"
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
              Iniciar Tour Guiado
              <PlayCircle className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={handleSkip}
              className="w-full md:w-auto px-10 py-5 bg-white/5 text-white font-display uppercase tracking-widest rounded-full hover:bg-white/10 transition-colors border border-white/10"
            >
              Pular e Ir para o Site
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentTourStep = tourSteps[currentStep];

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
      {/* Dark Overlay with Spotlight */}
      <div 
        className="absolute inset-0 bg-black/80 transition-opacity duration-500 pointer-events-auto"
        style={{
          clipPath: spotlight 
            ? `polygon(0% 0%, 0% 100%, ${spotlight.left}px 100%, ${spotlight.left}px ${spotlight.top}px, ${spotlight.left + spotlight.width}px ${spotlight.top}px, ${spotlight.left + spotlight.width}px ${spotlight.top + spotlight.height}px, ${spotlight.left}px ${spotlight.top + spotlight.height}px, ${spotlight.left}px 100%, 100% 100%, 100% 0%)`
            : 'none'
        }}
      />

      {/* Tour Content Card */}
      <AnimatePresence mode="wait">
        {!isScrolling && (
          <motion.div
            key={currentTourStep.id}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-lg pointer-events-auto"
          >
            <div className={`relative overflow-hidden rounded-[2rem] p-8 shadow-2xl border-2 border-white/10 bg-gradient-to-br ${currentTourStep.color}`}>
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Zap size={100} className="text-white" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                    {currentTourStep.icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 mb-1 block">Passo {currentStep + 1} de {tourSteps.length}</span>
                    <h2 className="text-2xl md:text-3xl font-display uppercase text-white leading-none">
                      {currentTourStep.title}
                    </h2>
                  </div>
                </div>

                <p className="text-white/90 font-sans text-sm md:text-base leading-relaxed mb-8">
                  {currentTourStep.description}
                </p>

                <div className="flex items-center justify-between gap-4">
                  <button 
                    onClick={handleSkip}
                    className="text-white/60 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
                  >
                    Pular Tour
                  </button>
                  
                  <button 
                    onClick={handleNext}
                    className="px-8 py-4 bg-white text-black font-display uppercase tracking-widest text-sm rounded-full hover:scale-105 transition-transform flex items-center gap-2 shadow-xl"
                  >
                    {currentStep === tourSteps.length - 1 ? 'Finalizar' : 'Próximo'}
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 h-1.5 bg-white/20 w-full">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
                  className="h-full bg-white"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Skip Button (Top Right) */}
      <button 
        onClick={handleSkip}
        className="fixed top-6 right-6 z-[10000] p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md border border-white/10 transition-all pointer-events-auto group"
      >
        <X size={24} className="group-rotate-90 transition-transform" />
      </button>
    </div>
  );
};
