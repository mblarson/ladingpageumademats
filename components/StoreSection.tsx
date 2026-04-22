
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

export const StoreSection: React.FC = () => {
  return (
    <section className="relative py-8 md:py-14 bg-[#2563eb] overflow-hidden border-b-4 border-black">
      
      {/* Starburst Pattern Background - Replicating Image in Code */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden scale-110">
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
          <defs>
            <filter id="jagged-star">
              <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="4" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="12" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
          
          {/* Base Background (Mid Blue) */}
          <rect width="100" height="100" fill="#1e40af" /> 
          
          {/* Layered Starburst Rings in Blue and Beige tones */}
          <circle cx="50" cy="50" r="50" fill="#3b82f6" filter="url(#jagged-star)" />
          <circle cx="50" cy="50" r="42" fill="#fff8be" filter="url(#jagged-star)" />
          <circle cx="50" cy="50" r="34" fill="#2563eb" filter="url(#jagged-star)" />
          <circle cx="50" cy="50" r="26" fill="#fff8be" filter="url(#jagged-star)" />
          <circle cx="50" cy="50" r="18" fill="#1d4ed8" filter="url(#jagged-star)" />
        </svg>
      </div>

      {/* HQ/Comic halftone pattern overlay - subtle */}
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none z-[1]" 
           style={{ 
             backgroundImage: 'radial-gradient(#000 1px, transparent 0)', 
             backgroundSize: '20px 20px' 
           }} 
      />

      <div className="max-w-6xl mx-auto px-4 mb-8 md:mb-12 relative z-10">
        <motion.div 
          initial={{ x: 100, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-start gap-1 text-left"
        >
          <div className="bg-indigo-900/90 px-5 py-2 border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] transform -rotate-1">
            <h2 className="text-4xl md:text-6xl font-fun font-black tracking-[0.1em] text-white">
              Loja Umademats
            </h2>
          </div>
        </motion.div>
      </div>

      <div className="relative flex w-full z-10" style={{ perspective: '1200px' }}>
        <motion.div 
          className="flex gap-8 md:gap-12 px-6"
          initial={{ x: 0 }}
          animate={{ x: "-50%" }}
          transition={{ 
            duration: 35, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        >
          {DUPLICATED_PRODUCTS.map((product, idx) => (
            <motion.div 
              key={`${product.id}-${idx}`}
              style={{ transformStyle: 'preserve-3d' }}
              initial={{ rotateY: 15, scale: 0.95 }}
              whileHover={{ rotateY: 0, scale: 1.05, z: 50 }}
              className="flex-shrink-0 w-36 md:w-56 aspect-[9/16] bg-gradient-to-br from-indigo-800 to-black rounded-[2rem] overflow-hidden border-2 border-white/10 group cursor-pointer shadow-[20px_20px_40px_rgba(0,0,0,0.6)] transition-all duration-500 ease-out"
            >
              <div className="relative w-full h-full">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                />
                
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 transform translate-z-20">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-pulse" />
                    <span className="text-xs md:text-sm font-fun font-bold uppercase tracking-widest text-[#ccff00] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] block">
                      {product.name}
                    </span>
                  </div>
                </div>

                {/* Shine effect on hover - keeping it very subtle and bright */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-30 bg-gradient-to-tr from-white/20 via-transparent to-transparent transition-opacity" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
