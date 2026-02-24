
import React, { useState, useEffect } from 'react';
import { HeroSection } from './components/HeroSection';
import { EventSection } from './components/EventSection';
import { AboutSection } from './components/AboutSection';
import { ActionSection } from './components/ActionSection';
import { BibleReadingPage } from './components/BibleReadingPage';
import { LideraPortal } from './components/LideraPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { OrganizationPortal } from './components/OrganizationPortal';
import { ShirtRequestPage } from './components/ShirtRequestPage';
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabaseClient';
import { X, LogIn, ShieldCheck, Zap, Lock, ArrowRight } from 'lucide-react';
import { useSiteAnalytics } from './hooks/useSiteAnalytics';

export type PageType = 'home' | 'bible' | 'admin' | 'lidera' | 'organization' | 'shirt_request';

export default function App() {
  useSiteAnalytics();

  const [showBanner, setShowBanner] = useState(false);

  const [currentPage, setCurrentPage] = useState<PageType>(() => {
    if (typeof window !== 'undefined') {
      try {
        const path = window.location.pathname.replace(/\/$/, '');
        
        if (path === '/pedidoscamisetas') {
            window.location.href = 'https://projeto-camiseta.vercel.app/';
            return 'home';
        }

        if (path === '/pedircamiseta') return 'shirt_request';
        if (path === '/admin') return 'admin';
        if (path === '/admin/organizacao' || path === '/admin/organizacao/') return 'organization';
        if (path === '/biblia') return 'bible';
        if (path === '/lideraumademats') return 'lidera';
        
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

        const params = new URLSearchParams(window.location.search);
        if (params.get('page') === 'bible') return 'bible';
        if (params.get('page') === 'lidera') return 'lidera';
        if (params.get('page') === 'organization') return 'organization';

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

  useEffect(() => {
    // Mostrar banner apenas na home e uma vez por sessão
    if (currentPage === 'home') {
      const hasSeenBanner = sessionStorage.getItem('umademats_shirt_banner_seen');
      if (!hasSeenBanner) {
        const timer = setTimeout(() => {
          setShowBanner(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [currentPage]);

  const closeBanner = () => {
    setShowBanner(false);
    sessionStorage.setItem('umademats_shirt_banner_seen', 'true');
  };

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
      lidera: '/lideraumademats',
      organization: '/admin/organizacao',
      shirt_request: '/pedircamiseta'
    };
    safePushState(paths[page]);
    setCurrentPage(page);
  };

  if (currentPage === 'shirt_request') {
    return <ShirtRequestPage onBack={() => handleNavigate('home')} />;
  }

  if (currentPage === 'admin') {
    return <AdminDashboard onBack={() => handleNavigate('home')} onNavigateOrg={() => handleNavigate('organization')} />;
  }

  if (currentPage === 'organization') {
    return <OrganizationPortal onBack={() => handleNavigate('admin')} />;
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
      
      <AnimatePresence>
        {showBanner && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={closeBanner}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-[#1a1a1a] border-2 border-brand-neon p-8 rounded-[2.5rem] w-full max-w-md text-center shadow-[0_0_50px_rgba(204,255,0,0.2)] overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-brand-neon" />
              <button 
                onClick={closeBanner}
                className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
              
              <div className="w-16 h-16 bg-brand-neon/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-brand-neon/20">
                <Zap size={32} className="text-brand-neon" />
              </div>

              <p className="text-lg md:text-xl font-display uppercase text-white mb-8 leading-tight">
                Não é da IEADMS e quer pedir a camiseta do Jubileu de Ouro da Umademats? Clique aqui
              </p>

              <button 
                onClick={() => {
                  closeBanner();
                  handleNavigate('shirt_request');
                }}
                className="w-full py-4 bg-brand-neon text-black font-bold uppercase rounded-xl hover:bg-brand-neon/80 transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
              >
                Solicitar Camiseta
                <ArrowRight size={18} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
