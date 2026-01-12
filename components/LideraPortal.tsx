
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lock, ArrowRight, FileText, ChevronRight, X, GraduationCap, Download, Zap, Star, Image as ImageIcon, MapPin, Building2, ChevronDown, CheckCircle2, User, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface Orientation {
  id: string;
  title: string;
  subtitle: string;
  comment: string;
  cover_url?: string;
  materials: { name: string; link: string }[];
}

interface UserProfile {
  tipo_localidade: 'capital' | 'interior';
  setor?: string;
  congregacao?: string;
  cidade?: string;
}

const SECTORS = ["A", "B", "C1", "C2", "D", "E", "F", "G", "H", "I", "J", "M", "N"];

export const LideraPortal: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');
  
  // Auth & Onboarding States
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [onboardingStep, setOnboardingStep] = useState<1 | 2>(1);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  // Onboarding Form State
  const [tempLocalidade, setTempLocalidade] = useState<'capital' | 'interior' | null>(null);
  const [formSetor, setFormSetor] = useState('');
  const [formCongregacao, setFormCongregacao] = useState('');
  const [formCidade, setFormCidade] = useState('');

  const [orientations, setOrientations] = useState<Orientation[]>([]);
  const [selectedOrientation, setSelectedOrientation] = useState<Orientation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    fetchOrientations();
  }, []);

  const checkUser = async () => {
    setIsCheckingProfile(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      setUser(session.user);
      // Verificar se já tem perfil na tabela lidera_logins
      const { data: profileData, error } = await supabase
        .from('lidera_logins')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
        setIsAuthenticated(true);
      } else {
        // Não tem perfil, precisa do onboarding
        setIsAuthenticated(false);
      }
    }
    setIsCheckingProfile(false);
  };

  const fetchOrientations = async () => {
    setLoading(true);
    try {
      const { data: orientationsData, error: orientationsError } = await supabase
        .from('lidera_orientations')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (orientationsError) throw orientationsError;

      const orientationsWithMaterials = await Promise.all(
        (orientationsData || []).map(async (ori) => {
          const { data: materialsData } = await supabase
            .from('lidera_materials')
            .select('name, link')
            .eq('orientation_id', ori.id);
          return { ...ori, materials: materialsData || [] };
        })
      );

      setOrientations(orientationsWithMaterials);
    } catch (e) {
      console.error("Erro ao buscar orientações:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    localStorage.setItem('return_to_lidera', 'true');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + window.location.pathname
      }
    });
    if (error) alert("Erro ao conectar com Google: " + error.message);
  };

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'lideranca@umademats') {
      setIsAuthenticated(true);
      setShowLogin(false);
    } else {
      alert("Senha incorreta!");
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSavingProfile(true);
    try {
      const newProfile = {
        user_id: user.id,
        user_name: user.user_metadata.full_name,
        email: user.email,
        tipo_localidade: tempLocalidade,
        setor: tempLocalidade === 'capital' ? formSetor : null,
        congregacao: tempLocalidade === 'capital' ? formCongregacao : null,
        cidade: tempLocalidade === 'interior' ? formCidade : null
      };

      const { error } = await supabase.from('lidera_logins').insert(newProfile);
      if (error) throw error;

      setProfile(newProfile as any);
      setIsAuthenticated(true);
    } catch (e: any) {
      alert("Erro ao salvar perfil: " + e.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setIsAuthenticated(false);
    window.location.reload();
  };

  // 1. TELA DE IDENTIFICAÇÃO (GOOGLE OU SENHA)
  if (!isAuthenticated && !user && !showLogin && !isCheckingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 via-slate-950 to-black flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-400/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        <motion.div 
          initial={{ y: 30, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          className="relative z-10 flex flex-col items-center"
        >
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 bg-brand-neon rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(204,255,0,0.3)]"
          >
            <GraduationCap size={48} className="text-black" />
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-display uppercase text-white leading-none mb-4 tracking-tighter">
            LIDERA <br /> <span className="text-brand-neon">UMADEMATS</span>
          </h1>
          
          <p className="text-white/60 font-sans text-sm md:text-lg max-w-md uppercase tracking-[0.2em] mb-10 font-black">
            Portal exclusivo da liderança.
          </p>
          
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <button 
              onClick={handleGoogleLogin}
              className="w-full py-5 bg-white text-black font-bold uppercase rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Login com Google
            </button>
            
            <button 
              onClick={() => setShowLogin(true)} 
              className="text-white/50 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2 mt-4"
            >
              Login umademats
            </button>
            
            <button 
              onClick={onBack} 
              className="text-white/20 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2 mt-2"
            >
              <ArrowLeft size={14} /> Voltar
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // 2. TELA DE ONBOARDING (APENAS PRIMEIRO ACESSO GOOGLE)
  if (user && !profile && !isCheckingProfile) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative">
        <div className="max-w-md w-full">
          <AnimatePresence mode="wait">
            {onboardingStep === 1 ? (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center">
                   <div className="w-16 h-16 bg-brand-neon/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-neon/20">
                      <MapPin className="text-brand-neon" size={32} />
                   </div>
                   <h2 className="text-3xl font-display uppercase text-white mb-2">Primeiro Acesso</h2>
                   <p className="text-white/50 text-xs uppercase tracking-widest">Onde você exerce sua liderança?</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <button 
                    onClick={() => { setTempLocalidade('capital'); setOnboardingStep(2); }}
                    className="p-8 bg-[#1a1a1a] border-2 border-white/5 rounded-3xl hover:border-brand-neon group transition-all text-left flex items-center justify-between"
                  >
                     <div>
                        <h3 className="text-2xl font-display uppercase text-white group-hover:text-brand-neon transition-colors">Capital</h3>
                        <p className="text-white/30 text-xs uppercase">Campo Grande - MS</p>
                     </div>
                     <Building2 className="text-white/10 group-hover:text-brand-neon transition-colors" size={40} />
                  </button>

                  <button 
                    onClick={() => { setTempLocalidade('interior'); setOnboardingStep(2); }}
                    className="p-8 bg-[#1a1a1a] border-2 border-white/5 rounded-3xl hover:border-brand-pink group transition-all text-left flex items-center justify-between"
                  >
                     <div>
                        <h3 className="text-2xl font-display uppercase text-white group-hover:text-brand-pink transition-colors">Interior</h3>
                        <p className="text-white/30 text-xs uppercase">Cidades do Interior</p>
                     </div>
                     <MapPin className="text-white/10 group-hover:text-brand-pink transition-colors" size={40} />
                  </button>
                </div>
                
                <button onClick={handleLogout} className="w-full text-center text-white/20 text-[10px] uppercase font-bold tracking-widest mt-8">Sair</button>
              </motion.div>
            ) : (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <button onClick={() => setOnboardingStep(1)} className="text-white/30 text-xs font-bold uppercase flex items-center gap-2 mb-4">
                   <ArrowLeft size={14} /> Voltar
                </button>

                <h2 className="text-4xl font-display uppercase text-white">Mais detalhes</h2>
                
                {tempLocalidade === 'capital' ? (
                  <div className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-white/50 text-[10px] uppercase font-bold tracking-widest ml-2">Setor</label>
                        <select 
                          value={formSetor}
                          onChange={(e) => setFormSetor(e.target.value)}
                          className="w-full bg-[#1a1a1a] border-2 border-white/5 rounded-2xl p-4 text-white font-bold outline-none focus:border-brand-neon"
                        >
                           <option value="">Selecione o Setor</option>
                           {SECTORS.map(s => <option key={s} value={s}>Setor {s}</option>)}
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-white/50 text-[10px] uppercase font-bold tracking-widest ml-2">Congregação</label>
                        <input 
                          type="text"
                          value={formCongregacao}
                          onChange={(e) => setFormCongregacao(e.target.value)}
                          placeholder="Ex: Amambai, Central..."
                          className="w-full bg-[#1a1a1a] border-2 border-white/5 rounded-2xl p-4 text-white outline-none focus:border-brand-neon"
                        />
                     </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-white/50 text-[10px] uppercase font-bold tracking-widest ml-2">Cidade</label>
                    <input 
                      type="text"
                      value={formCidade}
                      onChange={(e) => setFormCidade(e.target.value)}
                      placeholder="Nome da sua cidade"
                      className="w-full bg-[#1a1a1a] border-2 border-white/5 rounded-2xl p-4 text-white outline-none focus:border-brand-pink"
                    />
                  </div>
                )}

                <button 
                  disabled={isSavingProfile || (tempLocalidade === 'capital' ? (!formSetor || !formCongregacao) : !formCidade)}
                  onClick={handleSaveProfile}
                  className="w-full py-5 bg-brand-neon text-black font-bold uppercase rounded-2xl shadow-xl flex items-center justify-center gap-2 disabled:opacity-20"
                >
                  {isSavingProfile ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
                  Concluir Registro
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // 3. LOGIN COM SENHA (LEGADO)
  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-950 via-black to-black flex flex-col items-center justify-center p-6 relative">
         <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#1a1a1a] border-4 border-brand-neon p-8 md:p-12 rounded-[2.5rem] w-full max-w-md shadow-2xl relative">
            <button onClick={() => setShowLogin(false)} className="absolute top-6 right-6 text-white/30 hover:text-white"><X size={24} /></button>
            <div className="w-16 h-16 bg-brand-neon rounded-2xl flex items-center justify-center mb-6 mx-auto"><Lock size={32} className="text-black" /></div>
            <h2 className="text-2xl font-display text-white text-center uppercase mb-8">Login Liderança</h2>
            <form onSubmit={handlePasswordLogin} className="flex flex-col gap-4">
              <input 
                type="text" 
                autoFocus
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Senha de líder"
                className="w-full bg-black border-2 border-white/10 rounded-xl px-5 py-4 text-white font-bold text-center focus:border-brand-neon outline-none transition-colors"
              />
              <button type="submit" className="w-full bg-brand-neon text-black font-bold uppercase py-4 rounded-xl shadow-lg mt-4 active:scale-95 transition-transform">Validar</button>
            </form>
         </motion.div>
      </div>
    );
  }

  // 4. CONTEÚDO AUTORIZADO
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-black to-black text-white flex flex-col">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
           <div className="flex items-center gap-4">
              <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ArrowLeft size={24} /></button>
              <h1 className="font-display text-xl md:text-2xl uppercase tracking-tighter">LIDERA <span className="text-brand-neon">UMADEMATS</span></h1>
           </div>
           
           <div className="flex items-center gap-4">
              {user && (
                <div className="hidden md:flex flex-col items-end mr-4">
                    <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest">{profile?.tipo_localidade === 'capital' ? `Setor ${profile?.setor} • ${profile?.congregacao}` : profile?.cidade}</span>
                    <span className="text-xs font-bold text-brand-neon">{user.user_metadata.full_name}</span>
                </div>
              )}
              {user && (
                <button onClick={handleLogout} className="p-2 text-white/30 hover:text-red-400 transition-colors" title="Sair">
                   <X size={20} />
                </button>
              )}
           </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-20"><Zap className="animate-spin mb-4" /> <span className="uppercase font-bold tracking-widest">Sincronizando...</span></div>
        ) : orientations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 relative z-10">
            {orientations.map((ori, idx) => (
              <motion.button 
                key={ori.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedOrientation(ori)}
                className="bg-[#151515] border-2 border-white/5 rounded-2xl overflow-hidden group hover:border-brand-neon transition-all relative flex flex-col text-left h-full shadow-2xl"
              >
                <div className="w-full aspect-video bg-black relative">
                   {ori.cover_url ? (
                     <img src={ori.cover_url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt={ori.title} />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-white/5 opacity-40">
                       <ImageIcon size={48} />
                     </div>
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                   <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="text-lg md:text-xl font-display uppercase leading-tight text-white mb-1 drop-shadow-lg line-clamp-2">{ori.title}</h3>
                      <p className="text-brand-neon text-[8px] md:text-[9px] font-sans font-bold uppercase tracking-widest opacity-80">{ori.subtitle}</p>
                   </div>
                </div>
                <div className="p-3 flex items-center justify-between border-t border-white/5 bg-white/5">
                   <span className="text-[9px] uppercase font-bold text-white/30 tracking-widest">Acessar material</span>
                   <ChevronRight size={14} className="text-brand-neon" />
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-white/20 uppercase font-bold tracking-widest border-2 border-dashed border-white/5 rounded-3xl">Nenhuma orientação disponível.</div>
        )}
      </main>

      <AnimatePresence>
        {selectedOrientation && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedOrientation(null)} className="absolute inset-0 bg-black/95 backdrop-blur-md" />
             <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="relative bg-[#151515] w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] border border-white/10 flex flex-col overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-[#1a1a1a]">
                   <div>
                      <h2 className="text-3xl font-display uppercase text-white mb-1 leading-tight">{selectedOrientation.title}</h2>
                      <p className="text-brand-neon font-sans text-xs font-bold uppercase tracking-widest">{selectedOrientation.subtitle}</p>
                   </div>
                   <button onClick={() => setSelectedOrientation(null)} className="p-2 text-white/30 hover:text-white transition-colors"><X size={28} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10">
                   {selectedOrientation.materials.length > 0 && (
                     <div className="space-y-4">
                        <h4 className="text-white/30 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">
                           <Download size={14} /> Materiais Disponíveis
                        </h4>
                        <div className="flex flex-col gap-2">
                           {selectedOrientation.materials.map((mat, idx) => (
                             <a key={idx} href={mat.link} target="_blank" rel="noopener noreferrer" className="bg-[#202020] border border-white/5 hover:border-brand-neon p-4 rounded-xl flex items-center justify-between group transition-all">
                                <span className="font-bold text-white uppercase text-sm">{mat.name}</span>
                                <Download size={16} className="text-white/30 group-hover:text-brand-neon transition-colors" />
                             </a>
                           ))}
                        </div>
                     </div>
                   )}

                   <div className="space-y-4">
                      <h4 className="text-white/30 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">
                         <FileText size={14} /> Conteúdo
                      </h4>
                      <p className="text-white/80 font-sans text-lg leading-relaxed whitespace-pre-wrap">
                        {selectedOrientation.comment}
                      </p>
                   </div>
                </div>

                <div className="p-6 border-t border-white/5 flex justify-center bg-[#1a1a1a]">
                   <button onClick={() => setSelectedOrientation(null)} className="px-10 py-3 bg-white/5 hover:bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-all">Fechar</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
