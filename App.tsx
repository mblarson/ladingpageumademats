
import React, { useState, useEffect } from 'react';
import { HeroSection } from './components/HeroSection';
import { EventSection } from './components/EventSection';
import { AboutSection } from './components/AboutSection';
import { ActionSection } from './components/ActionSection';
import { BibleReadingPage } from './components/BibleReadingPage';
import { AdminDashboard } from './components/AdminDashboard';
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabaseClient';
import { X, LogIn, ShieldCheck, Zap } from 'lucide-react';
import { useSiteAnalytics } from './hooks/useSiteAnalytics';

export default function App() {
  useSiteAnalytics();

  const [currentPage, setCurrentPage] = useState<'home' | 'bible' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const path = window.location.pathname.replace(/\/$/, '');
        if (path === '/pedidoscamisetas') {
            window.location.href = 'https://projeto-camiseta.vercel.app/';
            return 'home';
        }
        if (path === '/admin') return 'admin';
        if (path === '/biblia') return 'bible';
        const shouldReturnToBible = localStorage.getItem('return_to_bible');
        if (shouldReturnToBible) {
          localStorage.removeItem('return_to_bible'); 
          return 'bible';
        }
        const params = new URLSearchParams(window.location.search);
        if (params.get('page') === 'bible') return 'bible';
      } catch (e) {
        console.warn("Error reading initial route:", e);
      }
      return 'home';
    }
    return 'home';
  });
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const yPath = useTransform(scrollYProgress, [0, 1], ["0%", "92%"]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  useEffect(() => {
    if (currentPage !== 'bible') setShowLoginModal(false);
  }, [currentPage]);

  const handleBibleIntroComplete = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) setShowLoginModal(true);
  };

  const handleGoogleLogin = async () => {
    try {
      localStorage.setItem('return_to_bible', 'true');
      const redirectTo = window.location.origin + '/biblia';
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, queryParams: { access_type: 'offline', prompt: 'select_account' } },
      });
      if (error) console.error("Login error:", error);
    } catch (e) { console.error("Auth error:", e); }
  };

  const safePushState = (path: string) => {
    try { window.history.pushState({}, '', path); } catch (e) { console.warn("Navigation update skipped:", e); }
  };

  const navigateToAdmin = () => {
    safePushState('/admin');
    setCurrentPage('admin');
  };

  const LoginModalContent = () => (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLoginModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
        <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} className="relative bg-[#1a1a1a] border-[3px] border-brand-neon p-6 md:p-10 rounded-3xl w-full max-w-md shadow-[0_0_60px_rgba(204,255,0,0.2)] overflow-hidden flex flex-col items-center text-center">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-pink via-brand-purple to-brand-neon" />
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"><X size={24} /></button>
            <div className="w-20 h-20 bg-brand-neon rounded-full flex items-center justify-center mb-6 shadow-lg border-4 border-[#1a1a1a] outline outline-2 outline-white/20"><LogIn size={32} className="text-black ml-1" strokeWidth={3} /></div>
            <h2 className="text-4xl font-display italic uppercase text-white mb-2 leading-none">Login <span className="text-brand-neon">UMADEMATS</span></h2>
            <p className="text-gray-400 font-sans text-sm leading-relaxed mb-8 max-w-xs">Entre para salvar seu histórico de leitura e acompanhar seu progresso no Jubileu.</p>
            <div className="w-full flex flex-col gap-3">
                <button onClick={handleGoogleLogin} className="relative group w-full py-4 bg-white text-black font-bold uppercase tracking-wide rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-3 shadow-xl">
                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                    Entrar com Google
                </button>
                <button onClick={() => setShowLoginModal(false)} className="w-full py-3 text-white/40 hover:text-white font-sans text-xs font-bold uppercase tracking-widest transition-colors">Pular por enquanto</button>
            </div>
            <div className="mt-6 flex items-center gap-1.5 opacity-30"><ShieldCheck size={12} /><span className="text-[10px] uppercase font-bold tracking-wider">Ambiente Seguro</span></div>
        </motion.div>
    </div>
  );

  if (currentPage === 'admin') {
    return <AdminDashboard onBack={() => { safePushState('/'); setCurrentPage('home'); }} />;
  }

  if (currentPage === 'bible') {
    return (
      <main className="w-full bg-brand-dark min-h-screen text-white relative">
          <AnimatePresence>{showLoginModal && <LoginModalContent />}</AnimatePresence>
          <BibleReadingPage onBack={() => { safePushState('/'); setCurrentPage('home'); }} onIntroComplete={handleBibleIntroComplete} />
      </main>
    );
  }

  return (
    <main className="w-full relative bg-brand-dark min-h-screen text-white overflow-hidden">
      <motion.div className="fixed top-0 left-0 right-0 h-1.5 bg-brand-neon origin-left z-[100]" style={{ scaleX }} />
      <div className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 h-[50vh] w-[2px] bg-white/10 rounded-full z-[90] hidden md:block pointer-events-none">
          <motion.div style={{ top: yPath }} className="absolute -left-[11px] w-6 h-6 bg-brand-neon rounded-full border-2 border-black flex items-center justify-center shadow-[0_0_15px_rgba(204,255,0,0.6)]"><Zap size={12} className="fill-black text-black" /></motion.div>
      </div>
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      <HeroSection />
      <EventSection />
      <ActionSection onNavigateToBible={() => { safePushState('/biblia'); setCurrentPage('bible'); }} />
      <AboutSection />
      <footer className="py-12 bg-black text-center text-gray-500 font-sans uppercase tracking-widest text-xs border-t border-white/5 relative">
        <p>© 2026 UMADEMATS. Todos os direitos reservados.</p>
        <p className="mt-2">Desenvolvido para o Reino.</p>
        <button onClick={navigateToAdmin} className="absolute bottom-4 right-4 opacity-50 hover:opacity-100 transition-opacity text-white font-bold p-2 text-[10px]" title="Área Administrativa">
           UMADEMATS
        </button>
      </footer>
    </main>
  );
}
