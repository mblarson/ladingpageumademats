
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, CheckCircle2, Phone, User, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface TshirtOrderPageProps {
  onBack: () => void;
}

type SizeType = 'Infantil' | 'Baby Look' | 'Unissex';

interface OrderItem {
  color: 'TERRACOTA' | 'VERDE-OLIVA';
  type: SizeType;
  size: string;
  quantity: number;
}

const SIZES = {
  'Infantil': ['1', '2', '4', '6', '8', '10', '12', '14'],
  'Baby Look': ['PP', 'P', 'M', 'G', 'GG', 'XGG'],
  'Unissex': ['PP', 'P', 'M', 'G', 'GG', 'XGG']
};

export const TshirtOrderPage: React.FC<TshirtOrderPageProps> = ({ onBack }) => {
  const [step, setStep] = useState<'form' | 'summary'>('form');
  const [formData, setFormData] = useState({
    nome: '',
    telefone: ''
  });
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)} - ${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    if (formatted.length <= 17) {
      setFormData({ ...formData, telefone: formatted });
    }
  };

  const updateQuantity = (color: string, type: string, size: string, delta: number) => {
    const key = `${color}-${type}-${size}`;
    const current = quantities[key] || 0;
    const next = Math.max(0, current + delta);
    setQuantities({ ...quantities, [key]: next });
  };

  const getOrderItems = (): OrderItem[] => {
    const items: OrderItem[] = [];
    Object.entries(quantities).forEach(([key, qty]) => {
      const quantityValue = qty as number;
      if (quantityValue > 0) {
        const [color, type, size] = key.split('-');
        items.push({ 
          color: color as any, 
          type: type as any, 
          size, 
          quantity: quantityValue
        });
      }
    });
    return items;
  };

  const orderItems = getOrderItems();

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.telefone) {
      setError("Por favor, preencha nome e WhatsApp.");
      return;
    }
    if (orderItems.length === 0) {
      setError("Selecione pelo menos uma camiseta para continuar.");
      return;
    }
    setError(null);
    setStep('summary');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      const inserts = orderItems.map(item => ({
        nome_completo: formData.nome,
        telefone: formData.telefone,
        cor: item.color,
        tamanho: `${item.type} ${item.size}`,
        quantidade: item.quantity,
        status: 'pendente'
      }));

      const { error: insertError } = await supabase
        .from('pedidos_camisetas')
        .insert(inserts);

      if (insertError) throw insertError;
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error("Erro ao enviar pedido:", err);
      setError("Erro ao processar pedido. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const ColorSection = ({ color }: { color: 'TERRACOTA' | 'VERDE-OLIVA' }) => (
    <div className="space-y-8">
      <div className="relative">
        <h2 className="text-4xl md:text-5xl font-display uppercase leading-none mt-8 mb-2 text-white font-bold">
          {color}
        </h2>
        <div className={`h-1 w-16 rounded-full ${color === 'TERRACOTA' ? 'bg-orange-600' : 'bg-green-600'}`} />
      </div>
      
      {(Object.keys(SIZES) as SizeType[]).map(type => (
        <div key={`${color}-${type}`} className="space-y-4">
          <div className="flex items-center gap-4">
            <h3 className="text-[10px] font-bold uppercase text-white tracking-[0.2em] whitespace-nowrap">{type}</h3>
            <div className="h-px w-full bg-white/10" />
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {SIZES[type].map(size => {
              const key = `${color}-${type}-${size}`;
              const qty = quantities[key] || 0;
              return (
                <div key={key} className={`relative bg-[#0d0d0d] border rounded-2xl p-4 flex flex-col items-center justify-between gap-3 transition-all duration-300 ${qty > 0 ? 'border-brand-neon shadow-[0_0_15px_rgba(204,255,0,0.1)]' : 'border-white/5 hover:border-white/10'}`}>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${qty > 0 ? 'text-brand-neon' : 'text-white'}`}>{size}</span>
                  
                  <div className="flex items-center justify-between w-full gap-1">
                    <button 
                      type="button"
                      onClick={() => updateQuantity(color, type, size, -1)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center border border-white/10 hover:bg-white/5 active:scale-90 transition-all ${qty === 0 ? 'opacity-10 pointer-events-none' : ''}`}
                    >
                      <Minus size={12} />
                    </button>
                    <span className={`text-xl font-display ${qty > 0 ? 'text-white' : 'text-white/20'}`}>{qty}</span>
                    <button 
                      type="button"
                      onClick={() => updateQuantity(color, type, size, 1)}
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  if (submitted) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0a0a0a] border border-brand-neon/30 p-12 rounded-[3.5rem] shadow-2xl max-w-md w-full relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-neon/10 rounded-full blur-3xl" />
          <div className="w-24 h-24 bg-brand-neon rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_30px_rgba(204,255,0,0.3)]">
            <CheckCircle2 className="text-black" size={48} />
          </div>
          <h2 className="text-4xl font-display uppercase text-white mb-4 leading-none">Tudo Certo!</h2>
          <p className="text-white/50 font-sans text-sm mb-12 leading-relaxed uppercase tracking-wider">
            {formData.nome.split(' ')[0]}, seu pedido foi registrado com sucesso. Em breve entraremos em contato via WhatsApp.
          </p>
          <button onClick={onBack} className="w-full py-5 bg-brand-neon text-black font-black uppercase text-sm tracking-widest rounded-2xl hover:bg-brand-neon/90 transition-all active:scale-95 shadow-xl">
            Voltar ao Início
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-brand-neon selection:text-black">
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-24">
        <button onClick={onBack} className="inline-flex items-center gap-3 text-white/30 hover:text-brand-neon transition-colors uppercase font-black text-[10px] tracking-[0.4em] mb-16 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" />
          Voltar para Home
        </button>

        {step === 'form' ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <header className="mb-12 space-y-4">
              <p className="text-brand-neon font-black text-[10px] uppercase tracking-[0.5em] mb-2">Congresso UMADEMATS 2026</p>
              <h1 className="text-5xl md:text-7xl font-display uppercase leading-[0.9] tracking-tighter text-white">
                Preencha os <br />
                Dados Abaixo
              </h1>
              <p className="text-white/40 text-xs max-w-sm uppercase tracking-widest leading-relaxed">
                Escolha sua cor e tamanho favorito. O pedido será processado e confirmaremos os detalhes com você.
              </p>
            </header>

            <form onSubmit={handleConfirm} className="space-y-12">
              {/* Informações Pessoais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-bold text-white tracking-[0.2em] ml-2 block">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input 
                      type="text" 
                      required 
                      value={formData.nome} 
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })} 
                      placeholder="Identifique-se" 
                      className="w-full bg-[#0d0d0d] border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white focus:outline-none focus:border-brand-neon focus:bg-black transition-all text-sm" 
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-bold text-white tracking-[0.2em] ml-2 block">Seu WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input 
                      type="text" 
                      required 
                      value={formData.telefone} 
                      onChange={handlePhoneChange} 
                      placeholder="(00) 00000 - 0000" 
                      className="w-full bg-[#0d0d0d] border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white focus:outline-none focus:border-brand-neon focus:bg-black transition-all text-sm" 
                    />
                  </div>
                </div>
              </div>

              {/* Seções de Cores */}
              <div className="space-y-16">
                <ColorSection color="TERRACOTA" />
                <ColorSection color="VERDE-OLIVA" />
              </div>

              {/* Rodapé do Formulário */}
              <div className="sticky bottom-6 z-40 px-4">
                <div className="max-w-md mx-auto">
                  {error && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-[10px] font-black uppercase text-center tracking-widest backdrop-blur-md">
                      {error}
                    </motion.div>
                  )}
                  <button type="submit" className="w-full py-4 bg-brand-neon text-black font-black uppercase text-xs tracking-[0.2em] rounded-2xl hover:bg-brand-neon/90 transition-all active:scale-95 shadow-xl flex items-center justify-center gap-3 group">
                    Revisar Pedido
                    <ArrowLeft size={16} className="rotate-180 group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-xl mx-auto space-y-8">
            <header>
              <h1 className="text-3xl md:text-5xl font-display uppercase tracking-tighter">Resumo do <br/><span className="text-brand-neon">Pedido</span></h1>
            </header>
            
            <div className="bg-[#0d0d0d] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="p-6 md:p-8 space-y-8">
                <div className="flex flex-col gap-4 pb-8 border-b border-white/5">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-white tracking-[0.2em] mb-2">Informações de Contato</p>
                    <p className="text-2xl font-display text-white">{formData.nome}</p>
                    <p className="text-brand-neon font-mono text-xs mt-1">{formData.telefone}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] uppercase font-bold text-white tracking-[0.2em]">Itens Escolhidos</p>
                  <div className="space-y-2">
                    {orderItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
                        <div className="flex items-center gap-4">
                          <div className={`w-2 h-10 rounded-full ${item.color === 'TERRACOTA' ? 'bg-orange-600' : 'bg-green-600'}`} />
                          <div>
                            <p className="text-base font-display text-white uppercase">{item.color}</p>
                            <p className="text-[9px] text-white font-bold uppercase tracking-widest">{item.type} • {item.size}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-display text-brand-neon">x{item.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-between items-center">
                  <p className="text-[10px] uppercase font-bold text-white tracking-[0.2em]">Total de Itens</p>
                  <p className="text-3xl font-display text-white">
                    {orderItems.reduce((acc, curr) => acc + curr.quantity, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleFinalSubmit}
                disabled={loading}
                className="w-full py-5 bg-brand-neon text-black font-black uppercase text-sm tracking-[0.2em] rounded-2xl hover:bg-brand-neon/90 transition-all active:scale-95 shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <div className="w-5 h-5 border-4 border-black/20 border-t-black rounded-full animate-spin" /> : <><Send size={20} /> Enviar Pedido</>}
              </button>
              <button onClick={() => setStep('form')} className="py-3 text-white/30 uppercase font-black text-[9px] tracking-[0.4em] hover:text-white transition-colors">Alterar Pedido</button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

