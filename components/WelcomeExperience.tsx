import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, X, Gamepad2, Users, Book, Zap, CheckCircle2, PlayCircle } from 'lucide-react';

interface WelcomeExperienceProps {
  name: string;
  onFinish: () => void;
}

export const WelcomeExperience: React.FC<WelcomeExperienceProps> = ({ name, onFinish }) => {
  const [showFeatures, setShowFeatures] = useState(false);

  useEffect(() => {
    // Prevent body scroll during presentation
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const userImage = name.includes('Sulamita') 
    ? 'https://raw.githubusercontent.com/mblarson/imagens/main/sulamita.jpg'
    : 'https://raw.githubusercontent.com/mblarson/imagens/main/gilmarfiuza.jpg';

  const features = [
    {
      id: 'games',
      title: 'Jogo do Penteca',
      description: 'A maior novidade! Uma aventura épica com o nosso mascote. Junte pontos e divirta-se!',
      icon: <Gamepad2 className="text-brand-pink" />,
      highlight: true
    },
    {
      id: 'lidera',
      title: 'Lidera Umademats',
      description: 'Portal exclusivo para líderes com materiais e gestão.',
      icon: <Users className="text-brand-green" />
    },
    {
      id: 'bible',
      title: 'Leitura Bíblica',
      description: 'Acompanhe seu plano de leitura diária de forma simples.',
      icon: <Book className="text-brand-neon" />
    }
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-brand-dark overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-blue/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-green/20 rounded-full blur-[150px]" />
        
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 border-2 border-brand-neon/30 rounded-full animate-[spin_30s_linear_infinite]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 border-2 border-brand-blue/30 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!showFeatures ? (
          <motion.div 
            key="welcome"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="relative z-10 max-w-2xl w-full px-6 text-center"
          >
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-brand-neon blur-2xl opacity-20 animate-pulse" />
                <img 
                  src={userImage} 
                  alt={name}
                  className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover border-4 border-brand-neon relative z-10 shadow-2xl"
                />
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-display uppercase text-white mb-6 leading-tight">
              Paz do Senhor, <span className="text-brand-neon">{name}</span>!
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 font-sans mb-12 leading-relaxed">
              Seja bem-vindo ao novo portal oficial da <span className="text-white font-bold">UMADEMATS</span>.
              <br className="hidden md:block" />
              Preparamos um espaço moderno e interativo para você.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => setShowFeatures(true)}
                className="w-full md:w-auto px-10 py-5 bg-brand-neon text-black font-display uppercase tracking-widest rounded-full hover:scale-105 transition-transform shadow-[0_0_30px_rgba(204,255,0,0.4)] flex items-center justify-center gap-3 group"
              >
                Conhecer o Portal
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={onFinish}
                className="w-full md:w-auto px-10 py-5 bg-white/5 text-white font-display uppercase tracking-widest rounded-full hover:bg-white/10 transition-colors border border-white/10"
              >
                Ir para o Site
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="features"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative z-10 max-w-4xl w-full px-6"
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-5xl font-display uppercase text-white mb-2">O que você vai encontrar</h2>
              <p className="text-gray-400 font-sans">Recursos pensados para a nossa juventude</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12">
              {features.map((f) => (
                <motion.div 
                  key={f.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`relative p-6 rounded-3xl border-2 ${f.highlight ? 'border-brand-pink bg-brand-pink/5' : 'border-white/10 bg-white/5'} flex flex-col items-center text-center`}
                >
                  {f.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-pink text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                      Destaque Especial
                    </div>
                  )}
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                    {f.icon}
                  </div>
                  <h3 className={`text-xl font-display uppercase mb-2 ${f.highlight ? 'text-brand-pink' : 'text-white'}`}>{f.title}</h3>
                  <p className="text-gray-400 text-sm font-sans leading-relaxed">{f.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <button 
                onClick={onFinish}
                className="w-full md:w-auto px-12 py-5 bg-brand-neon text-black font-display uppercase tracking-widest rounded-full hover:scale-105 transition-transform shadow-[0_0_30px_rgba(204,255,0,0.4)] flex items-center justify-center gap-3"
              >
                Ir para o Site
                <ArrowRight />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={onFinish}
        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
      >
        <X size={24} />
      </button>
    </div>
  );
};
