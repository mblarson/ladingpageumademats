
import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Star } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  image: string;
}

const PRODUCTS: Product[] = [
  { id: '1', name: 'Box Umademats', image: 'https://res.cloudinary.com/dcmi2z6xp/image/upload/v1776889500/BOX_fkmynv.webp' },
  { id: '2', name: 'Oversized Umademats', image: 'https://res.cloudinary.com/dcmi2z6xp/image/upload/v1776889248/OVERPRETA_hbq0em.webp' },
  { id: '3', name: 'Oversized Penteca', image: 'https://res.cloudinary.com/dcmi2z6xp/image/upload/v1776889461/OVERBRANCA_imivll.webp' },
  { id: '4', name: 'Bíblia Umademats', image: 'https://res.cloudinary.com/dcmi2z6xp/image/upload/v1776889370/B%C3%8DBLIA_tuafap.webp' },
  { id: '5', name: 'Copo Umademats', image: 'https://res.cloudinary.com/dcmi2z6xp/image/upload/v1776889578/COPO_d8lybl.webp' },
];

// Double the items to ensure seamless loop
const DUPLICATED_PRODUCTS = [...PRODUCTS, ...PRODUCTS];

interface StoreSectionProps {
  theme?: 'default' | 'copa';
}

export const StoreSection: React.FC<StoreSectionProps> = ({ theme = 'default' }) => {
  const isCopa = theme === 'copa';

  return (
    <section className={`relative py-8 md:py-14 lg:py-8 ${isCopa ? 'bg-[#009c3b]' : 'bg-[#2563eb]'} overflow-hidden border-b-4 border-black`}>
      
      {/* Starburst Pattern Background - Replicating Image in Code WITHOUT heavy SVG filters */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden scale-110">
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="w-full h-full opacity-60">
          {/* Base Background */}
          <rect width="100" height="100" fill={isCopa ? "#007a2e" : "#1e40af"} /> 
          
          {/* Layered Starburst Rings in Blue and Beige tones / Copa flag tones */}
          <circle cx="50" cy="50" r="50" fill={isCopa ? "#009c3b" : "#3b82f6"} />
          <circle cx="50" cy="50" r="42" fill={isCopa ? "#ffdf00" : "#fff8be"} />
          <circle cx="50" cy="50" r="34" fill={isCopa ? "#002776" : "#2563eb"} />
          <circle cx="50" cy="50" r="26" fill={isCopa ? "#ffdf00" : "#fff8be"} />
          <circle cx="50" cy="50" r="18" fill={isCopa ? "#001c54" : "#1d4ed8"} />
        </svg>
      </div>

      {/* HQ/Comic halftone pattern overlay - subtle */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none z-[1]" 
           style={{ 
             backgroundImage: 'radial-gradient(#000 1px, transparent 0)', 
             backgroundSize: '20px 20px',
             willChange: 'opacity'
           }} 
      />

      <div className="max-w-6xl mx-auto px-4 mb-8 md:mb-12 lg:mb-6 relative z-10">
        <div className="flex flex-col items-start gap-1 text-left">
          <div className={`${isCopa ? 'bg-[#002776]/95' : 'bg-indigo-900/90'} px-5 py-2 border-2 border-black transform -rotate-1 shadow-lg`}>
            <h2 className="text-4xl md:text-6xl lg:text-3xl font-fun font-black tracking-[0.1em] text-white">
              Loja Umademats
            </h2>
          </div>
        </div>
      </div>

      <div className="relative flex w-full z-10 py-4 lg:py-2 overflow-hidden">
        <motion.div 
          className="flex gap-8 md:gap-12 lg:gap-8 px-6"
          initial={{ x: 0 }}
          animate={{ x: [0, "-50%"] }}
          transition={{ 
            duration: 35, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          style={{ willChange: "transform" }}
        >
          {DUPLICATED_PRODUCTS.map((product, idx) => (
            <div 
              key={`${product.id}-${idx}`}
              className={`flex-shrink-0 w-36 md:w-56 lg:w-44 aspect-[9/16] relative ${isCopa ? 'bg-gradient-to-br from-[#002776] to-black hover:border-[#ffdf00]' : 'bg-gradient-to-br from-indigo-800 to-black'} rounded-[2rem] overflow-hidden border-2 border-white/10 group cursor-pointer shadow-xl transition-all duration-300 hover:scale-105`}
              style={{ willChange: "transform" }}
            >
              <div className="absolute inset-0 w-full h-full">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${isCopa ? 'bg-[#ffdf00]' : 'bg-[#ccff00]'} opacity-80`} />
                    <span className={`text-xs md:text-sm font-fun font-bold uppercase tracking-widest ${isCopa ? 'text-[#ffdf00]' : 'text-[#ccff00]'} block`} style={{ textShadow: "0px 1px 2px rgba(0,0,0,0.8)" }}>
                      {product.name}
                    </span>
                  </div>
                </div>

                {/* Shine effect on hover - keeping it very subtle and bright */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-tr from-white/20 via-transparent to-transparent transition-opacity" style={{ willChange: "opacity" }} />
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
