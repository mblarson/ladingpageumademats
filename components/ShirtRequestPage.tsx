
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, CheckCircle2, Phone, User, Info, Instagram, Users } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface ShirtRequestPageProps {
  onBack: () => void;
}

export const ShirtRequestPage: React.FC<ShirtRequestPageProps> = ({ onBack }) => {
  const [formData, setFormData] = useState({
    nome_completo: '',
    telefone: '',
    origem: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    if (formatted.length <= 15) {
      setFormData({ ...formData, telefone: formatted });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome_completo || !formData.telefone || !formData.origem) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    const phoneDigits = formData.telefone.replace(/\D/g, '');
    if (phoneDigits.length < 11) {
      setError("Por favor, informe um WhatsApp válido com DDD.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('pedidos_camisetas')
        .insert([{
          nome_completo: formData.nome_completo,
          telefone: formData.telefone,
          origem: formData.origem,
          status: 'pendente'
        }]);

      if (insertError) throw insertError;
      setSubmitted(true);
    } catch (err: any) {
      console.error("Erro ao enviar pedido:", err);
      setError("Ocorreu um erro ao enviar sua solicitação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#1a1a1a] border-2 border-brand-neon p-10 rounded-[2.5rem] shadow-2xl max-w-md w-full relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-brand-neon" />
          <div className="w-20 h-20 bg-brand-neon/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-brand-neon">
            <CheckCircle2 className="text-brand-neon" size={40} />
          </div>
          <h2 className="text-3xl font-display uppercase text-white mb-4">Solicitação Enviada!</h2>
          <p className="text-white/60 font-sans leading-relaxed mb-8">
            Em breve nossa equipe entrará em contato para registrar seu pedido.
          </p>
          <button 
            onClick={onBack}
            className="w-full py-4 bg-brand-neon text-black font-bold uppercase rounded-xl hover:bg-brand-neon/80 transition-all active:scale-95 shadow-lg"
          >
            Voltar ao Início
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark text-white font-sans selection:bg-brand-neon selection:text-black">
      <div className="max-w-xl mx-auto px-6 py-12 md:py-20">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors uppercase font-bold text-xs tracking-widest mb-10 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Voltar
        </button>

        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-display uppercase leading-[0.85] tracking-tighter mb-4">
            Peça sua <br />
            <span className="text-brand-neon">Camiseta</span>
          </h1>
          <p className="text-white/40 uppercase font-bold text-xs tracking-[0.2em]">Jubileu de Ouro • Umademats 2026</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-white/30 tracking-widest ml-2 flex items-center gap-2">
              <User size={12} /> Nome Completo
            </label>
            <input 
              type="text" 
              required
              value={formData.nome_completo}
              onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
              placeholder="Seu nome aqui"
              className="w-full bg-[#1a1a1a] border-2 border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-neon transition-all placeholder:text-white/10"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-white/30 tracking-widest ml-2 flex items-center gap-2">
              <Phone size={12} /> Telefone (WhatsApp)
            </label>
            <input 
              type="text" 
              required
              value={formData.telefone}
              onChange={handlePhoneChange}
              placeholder="(00) 00000-0000"
              className="w-full bg-[#1a1a1a] border-2 border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-neon transition-all placeholder:text-white/10"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-white/30 tracking-widest ml-2 flex items-center gap-2">
              <Info size={12} /> Como ficou sabendo do nosso congresso?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'Amigos', icon: Users },
                { id: 'Instagram', icon: Instagram }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, origem: opt.id })}
                  className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all font-bold uppercase text-xs tracking-widest ${
                    formData.origem === opt.id 
                      ? 'bg-brand-neon border-brand-neon text-black' 
                      : 'bg-[#1a1a1a] border-white/5 text-white/40 hover:border-white/20'
                  }`}
                >
                  <opt.icon size={18} />
                  {opt.id}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-500 text-xs font-bold uppercase tracking-wide text-center"
            >
              {error}
            </motion.div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-brand-neon text-black font-bold uppercase rounded-2xl hover:bg-brand-neon/80 transition-all active:scale-95 shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <Send size={20} />
                Enviar Solicitação
              </>
            )}
          </button>
        </form>

        <div className="mt-20 pt-10 border-t border-white/5 text-center">
          <p className="text-[10px] text-white/20 uppercase font-bold tracking-[0.3em]">UMADEMATS • JUBILEU DE OURO</p>
        </div>
      </div>
    </div>
  );
};
