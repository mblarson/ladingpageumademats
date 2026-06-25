
import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export const JesusReinaBanner: React.FC = () => {
  return (
    <div className="relative w-full bg-[#ccff00] py-2 md:py-3 border-y-2 border-black overflow-hidden z-20">
      <motion.div 
        className="flex whitespace-nowrap items-center font-display uppercase text-lg md:text-2xl text-black italic tracking-tighter"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        style={{ willChange: "transform" }}
      >
        {[...Array(15)].map((_, i) => (
          <span key={i} className="flex items-center gap-6 md:gap-10 mr-10">
            <span>AQUI JESUS REINA</span>
            <Zap className="fill-black" size={24} />
          </span>
        ))}
      </motion.div>
      
      {/* Decorative dots - very subtle to match standardized look */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{ 
        backgroundImage: 'radial-gradient(#000 1px, transparent 0)', 
        backgroundSize: '12px 12px' 
      }} />
    </div>
  );
};
