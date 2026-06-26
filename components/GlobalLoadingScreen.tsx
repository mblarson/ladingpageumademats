import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface GlobalLoadingScreenProps {
  loading: boolean;
  theme: 'default' | 'copa';
  onComplete: () => void;
}

export const GlobalLoadingScreen: React.FC<GlobalLoadingScreenProps> = ({
  loading,
  onComplete,
}) => {
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  // Tempo mínimo de exibição: 1,5 segundos (1500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Quando o carregamento do banco estiver pronto e o tempo mínimo de 1.5s tiver passado, finaliza
  useEffect(() => {
    if (!loading && minTimeElapsed) {
      onComplete();
    }
  }, [loading, minTimeElapsed, onComplete]);

  return (
    <motion.div
      id="global-loading-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3, ease: 'easeInOut' } }}
      className="fixed inset-0 w-full h-full z-[9999] flex items-center justify-center bg-white select-none overflow-hidden"
    >
      {/* Estilos CSS fornecidos exatamente pelo usuário */}
      <style>{`
        .loader {
          display: inline-block;
          position: relative;
          width: 80px;
          height: 80px;
          animation: loader_513 2s linear infinite;
        }

        .shape {
          position: absolute;
          top: 0;
          left: 0;
          width: 80px;
          height: 80px;
          border-radius: 15px;
        }

        .shape {
          background-color: rgb(31, 1, 164);
          animation: rectangle_513 4s linear infinite;
          animation-delay: 2s;
        }

        @keyframes loader_513 {
          0% {
            transform: rotate(0deg);
          }

          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes rectangle_513 {
          0% {
            transform: scale(1, 1);
            border-radius: 15px;
          }

          25% {
            border-radius: 30px;
            box-shadow: 0px 0px 5px rgba(133, 133, 133, 0.523);
            background-color: rgb(13, 60, 189);
            transform: scale(0.9);
          }

          50% {
            border-radius: 20px;
            transform: scale(1.4);
            box-shadow: 2px 5px 50px rgba(90, 90, 90, 0.206);
          }
        }
      `}</style>

      {/* Estrutura HTML fornecida pelo usuário */}
      <div className="loader">
        <div className="shape"></div>
      </div>
    </motion.div>
  );
};
