import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Clock, Calendar, Users, ArrowLeft, Lock } from 'lucide-react';
import { useAnalyticsDashboard } from '../hooks/useSiteAnalytics';

// Mapping for dynamic colors to ensure Tailwind does not purge them
const colorVariants: Record<string, { text: string, border: string, bg: string, via: string, groupHover: string }> = {
  'brand-neon': { 
    text: 'text-brand-neon', 
    border: 'hover:border-brand-neon', 
    bg: 'bg-brand-neon', 
    via: 'via-brand-neon',
    groupHover: 'group-hover:text-brand-neon' 
  },
  'brand-pink': { 
    text: 'text-brand-pink', 
    border: 'hover:border-brand-pink', 
    bg: 'bg-brand-pink', 
    via: 'via-brand-pink',
    groupHover: 'group-hover:text-brand-pink'
  },
  'brand-purple': { 
    text: 'text-brand-purple', 
    border: 'hover:border-brand-purple', 
    bg: 'bg-brand-purple', 
    via: 'via-brand-purple',
    groupHover: 'group-hover:text-brand-purple'
  },
  'white': { 
    text: 'text-white', 
    border: 'hover:border-white', 
    bg: 'bg-white', 
    via: 'via-white',
    groupHover: 'group-hover:text-white'
  },
};

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode; 
  color: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, loading }) => {
  // Fallback if color is not found in map
  const theme = colorVariants[color] || colorVariants['white'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 relative overflow-hidden group ${theme.border} transition-colors`}
    >
      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${theme.text}`}>
         {icon}
      </div>
      
      <div className="relative z-10">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${theme.bg} bg-opacity-20 ${theme.text}`}>
          {/* Safety check before cloning */}
          {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { size: 20 } as any) : icon}
        </div>
        
        <h3 className="text-white/50 text-xs font-sans font-bold uppercase tracking-widest mb-1">{title}</h3>
        
        {loading ? (
          <div className="h-10 w-24 bg-white/10 rounded animate-pulse" />
        ) : (
          <div className="text-4xl font-display text-white">{value}</div>
        )}
      </div>
      
      <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent ${theme.via} to-transparent opacity-50`} />
    </motion.div>
  );
};

interface AdminDashboardProps {
  onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const stats = useAnalyticsDashboard();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  // Simples verificação client-side para evitar curiosos
  // Em produção real, isso deveria validar via Supabase Auth com roles
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'umademats2026' || password === 'admin') {
      setIsAuthenticated(true);
    } else {
      alert('Senha incorreta');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
         <motion.div 
           initial={{ scale: 0.9, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-3xl p-8 text-center"
         >
            <div className="w-16 h-16 bg-brand-neon rounded-full flex items-center justify-center mx-auto mb-6">
               <Lock className="text-black" size={32} />
            </div>
            <h2 className="text-2xl font-display text-white mb-2">Área Restrita</h2>
            <p className="text-gray-400 text-sm mb-6">Digite a senha de administrador para acessar os dados.</p>
            
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
               <input 
                 type="password" 
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 placeholder="Senha"
                 className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-neon transition-colors"
               />
               <button type="submit" className="w-full bg-brand-neon text-black font-bold uppercase py-3 rounded-xl hover:bg-brand-neon/80 transition-colors">
                 Acessar
               </button>
            </form>
            
            <button onClick={onBack} className="mt-6 text-white/30 text-xs hover:text-white uppercase font-bold tracking-widest">
              Voltar ao Site
            </button>
         </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
           <div>
             <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white mb-4 transition-colors">
                <ArrowLeft size={16} /> Voltar
             </button>
             <h1 className="text-4xl md:text-5xl font-display uppercase text-white">
               Dashboard <span className="text-brand-neon">Admin</span>
             </h1>
             <p className="text-white/40 text-sm mt-1">Visão geral de acessos do portal.</p>
           </div>
           
           <div className="bg-[#1a1a1a] px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-white uppercase font-bold tracking-wider">Sistema Online</span>
           </div>
        </div>

        {/* Grid Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <StatCard 
             title="Últimas 24 Horas"
             value={stats.last24h}
             icon={<Clock />}
             color="brand-neon"
             loading={stats.loading}
           />
           
           <StatCard 
             title="Última Semana"
             value={stats.last7d}
             icon={<Calendar />}
             color="brand-pink"
             loading={stats.loading}
           />
           
           <StatCard 
             title="Último Mês"
             value={stats.last30d}
             icon={<Calendar />}
             color="brand-purple"
             loading={stats.loading}
           />
           
           <StatCard 
             title="Total Geral"
             value={stats.total}
             icon={<BarChart3 />}
             color="white"
             loading={stats.loading}
           />
        </div>

        {/* Chart Placeholder (Visual Only for now) */}
        <div className="mt-8 bg-[#1a1a1a] border border-white/10 rounded-3xl p-8">
           <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="text-brand-neon" size={24} />
              <h3 className="text-white font-display uppercase text-xl">Relatório de Tráfego</h3>
           </div>
           
           <div className="w-full h-64 flex items-end justify-between gap-2 opacity-50">
              {[...Array(20)].map((_, i) => (
                 <div 
                   key={i} 
                   className="flex-1 bg-white/10 hover:bg-brand-neon/50 transition-colors rounded-t-sm"
                   style={{ height: `${Math.random() * 80 + 20}%` }}
                 />
              ))}
           </div>
           <p className="text-center text-white/30 text-xs mt-4 uppercase tracking-widest">Visualização Gráfica Simulada</p>
        </div>

      </div>
    </div>
  );
};