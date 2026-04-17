
import React from 'react';
import { motion } from 'framer-motion';

interface SubtleWaveDividerProps {
  className?: string;
  color?: string;
  width?: string | number;
  height?: string | number;
  animate?: boolean;
}

/**
 * SubtleWaveDivider - A reusable visual divider inspired by the site's wave pattern.
 * Designed to be used as a stylized underline or subtle separator.
 */
export const SubtleWaveDivider: React.FC<SubtleWaveDividerProps> = ({ 
  className = "", 
  color = "#CCFF00", // Default to brand-neon
  width = "100%",
  height = "12px",
  animate = true
}) => {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      <svg 
        viewBox="0 0 1440 100" 
        className="w-full h-full" 
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          d="M0,70 Q180,30 360,70 T720,70 T1080,70 T1440,70"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={animate ? { pathLength: 0, opacity: 0 } : { pathLength: 1, opacity: 1 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
};
