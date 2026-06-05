
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { ActionSection } from './components/ActionSection';
import { StoreSection } from './components/StoreSection';
import { JesusReinaBanner } from './components/JesusReinaBanner';
import { WelcomeExperience } from './components/WelcomeExperience';
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabaseClient';
import { X, LogIn, ShieldCheck, Zap, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { useSiteAnalytics } from './hooks/useSiteAnalytics';

// Lazy Load Secondary Pages
const BibleReadingPage = lazy(() => import('./components/BibleReadingPage').then(m => ({ default: m.BibleReadingPage })));
const LideraPortal = lazy(() => import('./components/LideraPortal').then(m => ({ default: m.LideraPortal })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const OrganizationPortal = lazy(() => import('./components/OrganizationPortal').then(m => ({ default: m.OrganizationPortal })));
const ShirtRequestPage = lazy(() => import('./components/ShirtRequestPage').then(m => ({ default: m.ShirtRequestPage })));
const TshirtOrderPage = lazy(() => import('./components/TshirtOrderPage').then(m => ({ default: m.TshirtOrderPage })));

const LoadingFallback = () => (
  <div className="flex bg-black min-h-screen w-full items-center justify-center">
    <div className="w-10 h-10 border-4 border-[#ccff00] border-t-transparent rounded-full animate-spin" />
  </div>
);

export type PageType = 'home' | 'bible' | 'admin' | 'lidera' | 'organization' | 'shirt_request' | 'tshirt_order' | 'sulamita' | 'gilmarfiuza' | 'missao';

export default function App() {
  useSiteAnalytics();

  const [tourUser, setTourUser] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState<PageType>(() => {
    if (typeof window !== 'undefined') {
      try {
        const path = window.location.pathname.replace(/\/$/, '');
        
        if (path === '/pedidoscamisetas') {
            window.location.href = 'https://projeto-camiseta.vercel.app/';
            return 'home';
        }

        if (path === '/missao' || path === '/missao/') return 'missao';
        if (path === '/pedircamiseta') return 'shirt_request';
        if (path === '/camisetas') return 'tshirt_order';
        if (path === '/admin') return 'admin';
        if (path === '/admin/organizacao' || path === '/admin/organizacao/') return 'organization';
        if (path === '/biblia') return 'bible';
        if (path === '/lideraumademats') return 'lidera';
        
        if (path === '/sulamita') {
          setTourUser('Sulamita');
          return 'home';
        }
        if (path === '/gilmarfiuza') {
          setTourUser('Pr. Gilmar Fiuza');
          return 'home';
        }
        
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
    // Disable automatic browser scroll restoration to prevent jumping
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

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
      lidera: '/lideraumademats',
      organization: '/admin/organizacao',
      shirt_request: '/pedircamiseta',
      tshirt_order: '/camisetas',
      sulamita: '/sulamita',
      gilmarfiuza: '/gilmarfiuza',
      missao: '/missao'
    };
    safePushState(paths[page]);
    setCurrentPage(page);
  };

  if (currentPage === 'missao') {
    return (
      <main className="w-full bg-[#0b0b1e] min-h-screen relative overflow-hidden flex flex-col justify-start">
        {/* Playful Float Floating Back Button overlay */}
        <div className="absolute top-4 left-4 z-[100] pointer-events-auto">
          <button 
            onClick={() => handleNavigate('home')} 
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border-2 border-black bg-white hover:bg-zinc-100 text-black font-semibold text-xs uppercase tracking-wider shadow-[4px_4px_0px_#000000] active:translate-y-0.5 active:shadow-[2px_2px_0px_#000000] transition-all"
          >
            <ArrowLeft size={14} strokeWidth={2.5} />
            <span>Portal</span>
          </button>
        </div>

        {/* The Game itself rendered in a clean iframe container */}
        <iframe 
          src="/missao/index.html" 
          className="w-full h-screen border-none"
          title="Missão Bíblica: 30 Segundos"
          referrerPolicy="no-referrer"
        />
      </main>
    );
  }

  if (currentPage === 'shirt_request') {
    return <Suspense fallback={<LoadingFallback />}><ShirtRequestPage onBack={() => handleNavigate('home')} /></Suspense>;
  }

  if (currentPage === 'tshirt_order') {
    return <Suspense fallback={<LoadingFallback />}><TshirtOrderPage onBack={() => handleNavigate('home')} /></Suspense>;
  }

  if (currentPage === 'admin') {
    return <Suspense fallback={<LoadingFallback />}><AdminDashboard onBack={() => handleNavigate('home')} onNavigateOrg={() => handleNavigate('organization')} /></Suspense>;
  }

  if (currentPage === 'organization') {
    return <Suspense fallback={<LoadingFallback />}><OrganizationPortal onBack={() => handleNavigate('admin')} /></Suspense>;
  }

  if (currentPage === 'bible') {
    return (
      <main className="w-full bg-brand-dark min-h-screen text-white relative">
          <Suspense fallback={<LoadingFallback />}><BibleReadingPage onBack={() => handleNavigate('home')} /></Suspense>
      </main>
    );
  }

  if (currentPage === 'lidera') {
    return (
      <main className="w-full bg-brand-dark min-h-screen text-white relative">
          <Suspense fallback={<LoadingFallback />}><LideraPortal onBack={() => handleNavigate('home')} /></Suspense>
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
      <StoreSection />
      <JesusReinaBanner />
      <ActionSection onNavigate={handleNavigate} />
      <AboutSection />
      
      <AnimatePresence>
        {tourUser && (
          <WelcomeExperience 
            name={tourUser} 
            onFinish={() => setTourUser(null)} 
          />
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
