
import React, { useState, useEffect } from 'react';
import { HeroSection } from './components/HeroSection';
import { EventSection } from './components/EventSection';
import { AboutSection } from './components/AboutSection';
import { ActionSection } from './components/ActionSection';
import { BibleReadingPage } from './components/BibleReadingPage';
import { LideraPortal } from './components/LideraPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabaseClient';
import { X, LogIn, ShieldCheck, Zap, Lock } from 'lucide-react';
import { useSiteAnalytics } from './hooks/useSiteAnalytics';

export type PageType = 'home' | 'bible' | 'admin' | 'lidera';

export default function App() {
  useSiteAnalytics();

  const [currentPage, setCurrentPage] = useState<PageType>(() => {
    if (typeof window !== 'undefined') {
      try {
        const path = window.location.pathname.replace(/\/$/, '');
        
        // Redirecionamento legado de camisetas
        if (path === '/pedidoscamisetas') {
            window.location.href = 'https://projeto-camiseta.vercel.app/';
            return 'home';
        }

        // Verificação de rotas por URL
        if (path === '/admin') return 'admin';
        if (path === '/biblia') return 'bible';
        if (path === '/lideraumademats') return 'lidera';
        
        // Verificação de persistência após login Social (Google)
        const shouldReturnToBible = localStorage.getItem('return_to_bible');
        if (shouldReturnToBible) {
          localStorage.removeItem('return_to_bible'); 
          return 'bible';
        }

        const shouldReturnToLidera = localStorage.getItem('return_to_lidera');
        if (shouldReturnToLidera) {
          localStorage.removeItem('return_to_lidera');
          return 'lidera';
        }

        // Fallback por query params
        const params = new URLSearchParams(window.location.search);
        if (params.get('page') === 'bible') return 'bible';
        if (params.get('page') === 'lidera') return 'lidera';

      } catch (e) {
        console.warn("Error reading initial route:", e);
      }
      return 'home';
    }
    return 'home';
  });
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const yPath = useTransform(scrollYProgress, [0, 1], ["0%", "92%"]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const safePushState = (path: string) => {
    try { 
      window.history.pushState({}, '', path); 
    } catch (e) { 
      console.warn("Navigation pushState failed (safe to ignore in preview):", e); 
    }
  };

  const handleNavigate = (page: PageType) => {
    const paths: Record<PageType, string> = {
      home: '/',
      bible: '/biblia',
      admin: '/admin',
      lidera: '/lideraumademats'
    };
    safePushState(paths[page]);
    setCurrentPage(page);
  };

  if (currentPage === 'admin') {
    return <AdminDashboard onBack={() => handleNavigate('home')} />;
  }

  if (currentPage === 'bible') {
    return (
      <main className="w-full bg-brand-dark min-h-screen text-white relative">
          <BibleReadingPage onBack={() => handleNavigate('home')} />
      </main>
    );
  }

  if (currentPage === 'lidera') {
    return (
      <main className="w-full bg-brand-dark min-h-screen text-white relative">
          <LideraPortal onBack={() => handleNavigate('home')} />
      </main>
    );
  }

  return (
    <main className="w-full relative bg-brand-dark min-h-screen text-white overflow-hidden">
      <motion.div className="fixed top-0 left-0 right-0 h-1.5 bg-brand-neon origin-left z-[100]" style={{ scaleX }} />
      <div className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 h-[50vh] w-[2px] bg-white/10 rounded-full z-[90] hidden md:block pointer-events-none">
          <motion.div style={{ top: yPath }} className="absolute -left-[11px] w-6 h-6 bg-brand-neon rounded-full border-2 border-black flex items-center justify-center shadow-[0_0_15px_rgba(204,255,0,0.6)]"><Zap size={12} className="fill-black text-black" /></motion.div>
      </div>
      <HeroSection onNavigate={handleNavigate} />
      <EventSection />
      <ActionSection onNavigate={handleNavigate} />
      <AboutSection />
      <footer className="py-12 bg-black text-center text-gray-500 font-sans uppercase tracking-widest text-xs border-t border-white/5 relative">
        <p>© 2026 UMADEMATS. Todos os direitos reservados.</p>
        <p className="mt-2 text-[10px] opacity-30">Desenvolvido para o Reino.</p>
        <button onClick={() => handleNavigate('admin')} className="absolute bottom-4 right-4 opacity-50 hover:opacity-100 transition-opacity text-white font-bold p-2 text-[10px]" title="Área Administrativa">
           <Lock size={14} />
        </button>
      </footer>
    </main>
  );
}
