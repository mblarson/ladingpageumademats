
import React from 'react';
import { HeroSection } from './components/HeroSection';
import { EventSection } from './components/EventSection';
import { ActionSection } from './components/ActionSection';
import { motion, useScroll, useSpring } from 'framer-motion';

export default function App() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <main className="w-full relative bg-brand-dark min-h-screen text-white overflow-hidden">
      
      {/* Sticky Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-2 bg-brand-neon origin-left z-50"
        style={{ scaleX }}
      />

      <HeroSection />
      <EventSection />
      <ActionSection />

      <footer className="py-12 bg-black text-center text-gray-500 font-sans uppercase tracking-widest text-xs border-t border-white/5">
        <p>© 2026 UMADEMATS. Todos os direitos reservados.</p>
        <p className="mt-2">Desenvolvido para o Reino.</p>
      </footer>
    </main>
  );
}
