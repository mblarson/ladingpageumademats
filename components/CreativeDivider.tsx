
import React from 'react';
import { motion } from 'framer-motion';
import { Star, Zap, Sparkles } from 'lucide-react';

interface CreativeDividerProps {
  topColor?: string;
  bottomColor?: string;
  accentColor?: string;
}

export const CreativeDivider: React.FC<CreativeDividerProps> = ({
  topColor = "transparent",
  bottomColor = "#4F46E5",
  accentColor = "#CCFF00"
}) => {
  return (
    <div className="relative w-full h-24 md:h-40 overflow-visible z-30 pointer-events-none">
      {/* Layered Waves */}
      <div className="absolute inset-0 leading-none translate-y-[1px]">
        {/* Secondary Wave (Deeper/Accent) */}
        <svg className="absolute bottom-4 w-full h-full opacity-30" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path 
            d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            fill={accentColor} 
          />
        </svg>

        {/* Main Wave (Matches ActionSection BG) */}
        <svg className="w-full h-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path 
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,202.7C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            fill={bottomColor} 
          />
        </svg>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[10%] top-0 text-brand-neon opacity-40"
        >
          <Zap size={32} fill="currentColor" />
        </motion.div>

        <motion.div 
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, -15, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute right-[15%] top-4 text-brand-pink opacity-30"
        >
          <Star size={24} fill="currentColor" />
        </motion.div>

        <motion.div 
          animate={{ 
            y: [0, -25, 0],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute left-[45%] top-8 text-white"
        >
          <Sparkles size={20} />
        </motion.div>
      </div>
    </div>
  );
};
