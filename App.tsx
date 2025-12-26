import React, { useState, useEffect } from 'react';
import { HeroSection } from './components/HeroSection';
import { EventSection } from './components/EventSection';
import { ActionSection } from './components/ActionSection';
import { BibleReadingPage } from './components/BibleReadingPage';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabaseClient';
import { X, LogIn, ShieldCheck } from 'lucide-react';

export default function App() {
  // Simple state-based router
  // Inicializa verificando a URL para manter a página após reload/login
  const [currentPage, setCurrentPage] = useState<'home' | 'bible'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('page') === 'bible' ? 'bible' : 'home';
    }
    return 'home';
  });
  
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Atualiza a URL quando a página muda (para permitir F5 e persistência)
  useEffect(() => {
    const url = new URL(window.location.href);
    if (currentPage === 'bible') {
      url.searchParams.set('page', 'bible');
    } else {
      url.searchParams.delete('page');
    }
    window.history.replaceState({}, '', url.toString());
  }, [currentPage]);

  // Check session only when entering the Bible page
  useEffect(() => {
    if (currentPage === 'bible') {
      const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // Delay reduced for faster entrance
          setTimeout(() => setShowLoginModal(true), 500);
        }
      };
      checkSession();
    }
  }, [currentPage]);

  const handleGoogleLogin = async () => {
    /* 
       IMPORTANTE: Certifique-se de adicionar a URL atual (window.location.origin) 
       na lista de "Redirect URLs" no painel do Supabase (Auth > URL Configuration).
    */
    // Adiciona ?page=bible para garantir que o usuário volte para a página da bíblia
    const redirectTo = `${window.location.origin}?page=bible`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo, // Usa a URL com o parametro de página
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account', // Forces account selection to ensure user context
        },
      },
    });
    if (error) console.error("Login error:", error);
  };

  return (
    <main className="w-full relative bg-brand-dark min-h-screen text-white overflow-hidden">
      
      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="relative bg-[#1a1a1a] border-[3px] border-brand-neon p-6 md:p-10 rounded-3xl w-full max-w-md shadow-[0_0_60px_rgba(204,255,0,0.2)] overflow-hidden flex flex-col items-center text-center"
            >
               {/* Decorative Gradient Line */}
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-pink via-brand-purple to-brand-neon" />
               
               <button 
                 onClick={() => setShowLoginModal(false)}
                 className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
               >
                 <X size={24} />
               </button>

               <div className="w-20 h-20 bg-brand-neon rounded-full flex items-center justify-center mb-6 shadow-lg border-4 border-[#1a1a1a] outline outline-2 outline-white/20">
                  <LogIn size={32} className="text-black ml-1" strokeWidth={3} />
               </div>

               <h2 className="text-4xl font-display uppercase text-white mb-2 leading-none">
                 Login <span className="text-brand-neon">UIMADEMATS</span>
               </h2>
               
               <p className="text-gray-400 font-sans text-sm leading-relaxed mb-8 max-w-xs">
                 Entre para salvar seu histórico de leitura e acompanhar seu progresso no Jubileu.
               </p>

               <div className="w-full flex flex-col gap-3">
                 <button 
                   onClick={handleGoogleLogin}
                   className="relative group w-full py-4 bg-white text-black font-bold uppercase tracking-wide rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-3 shadow-xl"
                 >
                    {/* Google Icon SVG */}
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Entrar com Google
                 </button>

                 <button 
                   onClick={() => setShowLoginModal(false)}
                   className="w-full py-3 text-white/40 hover:text-white font-sans text-xs font-bold uppercase tracking-widest transition-colors"
                 >
                   Pular por enquanto
                 </button>
               </div>

               <div className="mt-6 flex items-center gap-1.5 opacity-30">
                  <ShieldCheck size={12} />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Ambiente Seguro</span>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sticky Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-2 bg-brand-neon origin-left z-50"
        style={{ scaleX }}
      />

      {currentPage === 'bible' ? (
        <BibleReadingPage onBack={() => setCurrentPage('home')} />
      ) : (
        <>
          <HeroSection />
          <EventSection />
          <ActionSection onNavigateToBible={() => setCurrentPage('bible')} />

          <footer className="py-12 bg-black text-center text-gray-500 font-sans uppercase tracking-widest text-xs border-t border-white/5">
            <p>© 2026 UIMADEMATS. Todos os direitos reservados.</p>
            <p className="mt-2">Desenvolvido para o Reino.</p>
          </footer>
        </>
      )}
    </main>
  );
}