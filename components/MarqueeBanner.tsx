
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
}

export const MarqueeBanner: React.FC<MarqueeBannerProps> = ({
  items,
  bgColor = "bg-brand-neon",
  textColor = "text-black",
  rotate = -1,
  className = "",
  zIndex = 50
}) => {
  return (
    <div className={`absolute bottom-0 left-0 right-0 pointer-events-none ${className}`} style={{ zIndex }}>
      <motion.div 
        className={`${bgColor} py-2 md:py-3 border-y-2 border-black shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden`}
        style={{ rotate: `${rotate}deg`, scale: 1.05 }}
        initial={{ scale: 0.8 }}
        whileInView={{ scale: 1.05 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <motion.div 
          className={`flex whitespace-nowrap items-center font-display uppercase text-lg md:text-2xl ${textColor} italic tracking-tighter`}
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          style={{ willChange: 'transform' }}
        >
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center">
              {items.map((item, idx) => (
                <span key={idx} className="flex items-center gap-6 md:gap-10 mr-10">
                  <span>{item.text}</span>
                  {item.icon ? <item.icon className="fill-current" size={24} /> : <Zap className="fill-current" size={24} />}
                </span>
              ))}
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};
