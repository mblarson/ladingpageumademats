
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Star, LucideIcon } from 'lucide-react';

interface MarqueeBannerProps {
  items: { text: string; icon?: LucideIcon }[];
  bgColor?: string;
  textColor?: string;
  rotate?: number;
  className?: string;
  zIndex?: number;
  position?: 'top' | 'bottom';
}

export const MarqueeBanner: React.FC<MarqueeBannerProps> = ({
  items,
  bgColor = "bg-brand-neon",
  textColor = "text-black",
  rotate = 0,
  className = "",
  zIndex = 50,
  position = "bottom"
}) => {
  const posClass = position === 'top' ? 'top-0 -translate-y-1/2' : 'bottom-0';

  return (
    <div className={`absolute ${posClass} left-0 right-0 pointer-events-none ${className}`} style={{ zIndex }}>
      <div 
        className={`${bgColor} py-1 md:py-1.5 border-y-2 border-black shadow-[0_10px_25px_rgba(0,0,0,0.3)] overflow-hidden`}
        style={rotate !== 0 ? { rotate: `${rotate}deg` } : undefined}
      >
        <motion.div 
          className={`flex whitespace-nowrap items-center font-display uppercase text-xs sm:text-sm md:text-base ${textColor} italic tracking-tight leading-none`}
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 22, ease: "linear" }}
          style={{ willChange: 'transform' }}
        >
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center shrink-0">
              {items.map((item, idx) => (
                <span key={idx} className="flex items-center gap-3 md:gap-5 mr-6 md:mr-8">
                  <span>{item.text}</span>
                  {item.icon ? <item.icon className="fill-current" size={16} /> : <Zap className="fill-current" size={16} />}
                </span>
              ))}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
