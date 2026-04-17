
import React from 'react';
import { motion } from 'framer-motion';
import { Star, Zap, Circle, Square, Sparkles } from 'lucide-react';

interface DividerCreativeProps {
  variant?: 'bubbles' | 'geometric' | 'particles';
  color?: string;
  lineColor?: string;
  className?: string;
  opacity?: number;
}

/**
 * DividerCreative - A creative divider that uses a straight line as a base
 * and adds decorative elements on top.
 */
export const DividerCreative: React.FC<DividerCreativeProps> = ({
  variant = 'bubbles',
  color = 'text-brand-neon',
  lineColor = 'bg-brand-neon',
  className = "",
  opacity = 0.3
}) => {
  
  const renderDecorations = () => {
    switch (variant) {
      case 'bubbles':
        return (
          <div className="absolute inset-0 flex items-center justify-around px-10 md:px-20">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  y: [0, -10, 0],
                  scale: [1, 1.1, 1],
                  opacity: [0.4, 0.8, 0.4]
                }}
                transition={{ 
                  duration: 3 + i, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: i * 0.5
                }}
                className={`${color} opacity-60`}
              >
                <div 
                  className="rounded-full border-2 border-current" 
                  style={{ 
                    width: `${10 + (i * 4)}px`, 
                    height: `${10 + (i * 4)}px` 
                  }} 
                />
              </motion.div>
            ))}
          </div>
        );
      
      case 'geometric':
        return (
          <div className="absolute inset-0 flex items-center justify-center gap-8 md:gap-16">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  rotate: [0, 90, 180, 270, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 8, 
                  repeat: Infinity, 
                  ease: "linear",
                  delay: i * 1
                }}
                className={`${color} opacity-50`}
              >
                {i % 2 === 0 ? (
                  <Square size={16 + i * 2} className="stroke-[3px]" />
                ) : (
                  <div className="rotate-45">
                    <Square size={14 + i * 2} className="stroke-[3px]" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        );

      case 'particles':
        return (
          <div className="absolute inset-0 flex items-center justify-between px-4 md:px-32">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  y: [0, -15, 0],
                  x: [0, (i % 2 === 0 ? 10 : -10), 0],
                  opacity: [0.2, 0.6, 0.2]
                }}
                transition={{ 
                  duration: 4 + (i % 3), 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: i * 0.3
                }}
                className={`${color}`}
              >
                {i % 3 === 0 ? <Sparkles size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
              </motion.div>
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`relative w-full h-12 flex items-center justify-center overflow-visible pointer-events-none ${className}`}>
      {/* Base Line */}
      <div 
        className={`h-[2px] w-full ${lineColor} rounded-full absolute z-0`}
        style={{ opacity }}
      />
      
      {/* Decorative Elements */}
      <div className="relative w-full h-full z-10">
        {renderDecorations()}
      </div>
    </div>
  );
};
