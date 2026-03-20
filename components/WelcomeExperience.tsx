
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gamepad2, 
  BookOpen, 
  Users, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2,
  ChevronRight,
  Trophy,
  Target,
  Rocket
} from 'lucide-react';

interface WelcomeExperienceProps {
  name: string;
  onFinish: () => void;
}

const steps = [
  {
    id: 'intro',
    title: 'Bem-vindo ao Portal UMADEMATS!',
    icon: <Sparkles className="text-brand-neon" size={48} />,
    content: 'O portal oficial da juventude UMADEMATS. Aqui você encontra tudo o que precisa para crescer e se divertir no Reino.',
    color: 'from-brand-neon/20 to-transparent'
  },
  {
    id: 'games',
    title: '🎮 Jogo do Penteca',
    icon: <Gamepad2 className="text-brand-neon" size={48} />,
    content: 'O destaque principal! Divirta-se com os jogos do nosso mascote Penteca. É diversão garantida com propósito!',
    highlight: true,
    color: 'from-brand-neon/30 to-brand-neon/10'
  },
  {
    id: 'lidera',
    title: '📚 Lidera Umademats',
    icon: <Users className="text-brand-neon" size={48} />,
    content: 'Sua ferramenta essencial de liderança. Conteúdos exclusivos para capacitar você a guiar sua geração.',
    color: 'from-blue-500/20 to-transparent'
  },
  {
    id: 'bible',
    title: '📖 Leitura Bíblica',
    icon: <BookOpen className="text-brand-neon" size={48} />,
    content: 'Acompanhe seu progresso e mantenha a constância na Palavra. Um sistema feito para te ajudar a ler a Bíblia todo dia.',
    color: 'from-emerald-500/20 to-transparent'
  },
  {
    id: 'congress',
    title: '🎉 Congresso',
    icon: <Rocket className="text-brand-neon" size={48} />,
    content: 'Fique por dentro de tudo sobre o nosso congresso. Notícias, inscrições e momentos inesquecíveis.',
    color: 'from-purple-500/20 to-transparent'
  }
];

export function WelcomeExperience({ name, onFinish }: WelcomeExperienceProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onFinish();
    }
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[200] bg-brand-dark flex items-center justify-center p-4 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-neon/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-neon/5 rounded-full blur-[120px]" />
        
        {/* Geometric shapes */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 right-1/4 w-64 h-64 border border-white/5 rounded-full"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 left-1/4 w-96 h-96 border border-white/5 rounded-lg rotate-45"
        />
      </div>

      <div className="w-full max-w-2xl relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 md:p-12 shadow-2xl relative overflow-hidden`}
          >
            {/* Step Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-50 pointer-events-none transition-colors duration-700`} />

            <div className="relative z-10">
              {currentStep === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8"
                >
                  <span className="inline-block px-4 py-1.5 bg-brand-neon/10 text-brand-neon rounded-full text-xs font-bold tracking-widest uppercase mb-4">
                    Acesso Personalizado
                  </span>
                  <h1 className="text-2xl md:text-3xl font-display uppercase leading-tight">
                    Paz do Senhor, <span className="text-brand-neon">{name}</span>!<br />
                    Espero que tenha feito uma boa viagem até aqui.
                  </h1>
                </motion.div>
              )}

              <div className="flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                  className={`w-24 h-24 rounded-3xl bg-brand-dark border border-white/10 flex items-center justify-center mb-8 shadow-xl ${step.highlight ? 'ring-4 ring-brand-neon/20 shadow-brand-neon/10' : ''}`}
                >
                  {step.icon}
                </motion.div>

                <h2 className={`text-3xl md:text-4xl font-display uppercase mb-6 ${step.highlight ? 'text-brand-neon' : 'text-white'}`}>
                  {step.title}
                </h2>

                <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-lg mb-12">
                  {step.content}
                </p>

                {/* Progress Dots */}
                <div className="flex gap-2 mb-12">
                  {steps.map((_, idx) => (
                    <div 
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-8 bg-brand-neon' : 'w-2 bg-white/20'}`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextStep}
                  className="group relative flex items-center gap-3 px-8 py-4 bg-brand-neon text-black font-display uppercase tracking-wider rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(204,255,0,0.3)]"
                >
                  {currentStep === steps.length - 1 ? 'IR PARA O SITE' : 'CONTINUAR'}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Decorative elements */}
        <div className="absolute -top-4 -right-4 w-12 h-12 bg-brand-neon rounded-full blur-2xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-brand-neon rounded-full blur-2xl opacity-20 animate-pulse" />
      </div>
    </div>
  );
}
