
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, Edit2, Copy, GripVertical, Eye, EyeOff, Save, X, 
  Monitor, Smartphone, AlertCircle, Info, ChevronRight, Layout, Menu
} from 'lucide-react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { supabase } from '../lib/supabaseClient';
import { HeroSlide } from '../types';
import { getDirectDriveUrl } from '../lib/heroUtils';

interface HeroCMSProps {
  heroDimensions: { width: number; height: number };
}

interface SortableSlideCardProps {
  slide: HeroSlide;
  onEdit: (slide: HeroSlide) => void;
  onDelete: (id: string) => void;
  onDuplicate: (slide: HeroSlide) => void;
  onToggleActive: (id: string, currentStatus: boolean) => void;
}

const SortableSlideCard: React.FC<SortableSlideCardProps> = ({ 
  slide, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onToggleActive 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 group transition-all ${isDragging ? 'opacity-50 scale-95' : 'hover:border-brand-neon/30 hover:bg-[#222]'}`}
    >
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-white/20 hover:text-brand-neon transition-colors">
          <GripVertical size={20} />
        </div>

        <div className="w-20 h-14 bg-black rounded-lg overflow-hidden border border-white/5 shrink-0 flex items-center justify-center">
          {slide.image_desktop_url ? (
            <img src={getDirectDriveUrl(slide.image_desktop_url)} alt="" className="w-full h-full object-cover" />
          ) : (
            <Layout size={16} className="text-white/20" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-white truncate uppercase tracking-tight">{slide.title || 'Sem Título'}</h4>
          <p className="text-[10px] text-white/40 truncate uppercase tracking-widest">{slide.subtitle || 'Sem Subtítulo'}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
        <button 
          onClick={() => onToggleActive(slide.id, slide.is_active)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${slide.is_active ? 'bg-brand-neon/10 text-brand-neon' : 'bg-white/5 text-white/20 hover:text-white'}`}
          title={slide.is_active ? 'Ativo' : 'Inativo'}
        >
          {slide.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
        <button onClick={() => onEdit(slide)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
          <Edit2 size={16} />
        </button>
        <button onClick={() => onDuplicate(slide)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
          <Copy size={16} />
        </button>
        <button onClick={() => onDelete(slide.id)} className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-colors">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export const HeroCMS: React.FC<HeroCMSProps> = ({ heroDimensions }) => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [showExternalPreview, setShowExternalPreview] = useState(false);
  const [previewSnapshot, setPreviewSnapshot] = useState<HeroSlide | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchSlides = async () => {
    const { data } = await supabase
      .from('hero_slides')
      .select('*')
      .order('order', { ascending: true });
    if (data) setSlides(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSlides((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newArray = arrayMove(items, oldIndex, newIndex);
        
        // Update order in DB
        const updates = newArray.map((slide: HeroSlide, idx: number) => ({
          id: slide.id,
          order: idx
        }));
        
        // We do it asynchronously
        Promise.all(updates.map(u => 
          supabase.from('hero_slides').update({ order: u.order }).eq('id', u.id)
        )).catch(err => console.error("Erro ao reordenar:", err));

        return newArray;
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Deseja realmente excluir este slide?")) {
      await supabase.from('hero_slides').delete().eq('id', id);
      fetchSlides();
    }
  };

  const handleDuplicate = async (slide: HeroSlide) => {
    const { id, created_at, updated_at, ...rest } = slide;
    const { data } = await supabase
      .from('hero_slides')
      .insert([{ ...rest, title: `${rest.title} (Cópia)`, order: slides.length }])
      .select();
    if (data) fetchSlides();
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    await supabase.from('hero_slides').update({ is_active: !currentStatus }).eq('id', id);
    fetchSlides();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide) return;
    setIsSaving(true);

    try {
      if (editingSlide.id.startsWith('new_')) {
        const { id, ...rest } = editingSlide;
        await supabase.from('hero_slides').insert([{ ...rest, order: slides.length }]);
      } else {
        await supabase.from('hero_slides').update(editingSlide).eq('id', editingSlide.id);
      }
      setEditingSlide(null);
      fetchSlides();
    } catch (err) {
      console.error("Erro ao salvar:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNew = () => {
    setEditingSlide({
      id: `new_${Date.now()}`,
      title: '',
      subtitle: '',
      link: '',
      image_desktop_url: '',
      image_mobile_url: '',
      use_mobile_image: false,
      order: slides.length,
      is_active: true
    });
  };

  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
  };

  const detectRatio = (w: number, h: number) => {
    if (w === 0 || h === 0) return "Desconhecida";
    const common = gcd(Math.round(w), Math.round(h));
    const rw = Math.round(w / common);
    const rh = Math.round(h / common);
    return `${rw}:${rh}`;
  };

  const idealDesktop = {
    width: Math.max(1920, Math.round(heroDimensions.width)),
    height: Math.max(720, Math.round(heroDimensions.height))
  };

  const idealMobile = {
    width: 1080,
    height: Math.round(1080 * (heroDimensions.height / heroDimensions.width))
  };

  return (
    <div className="space-y-12">
      {/* Header Info CMS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-[10px] uppercase font-bold text-white/30 tracking-[0.3em] mb-2">Monitor de Renderização</h3>
              <p className="text-2xl font-display uppercase text-white">Seção HERO</p>
            </div>
            <div className="bg-brand-neon p-3 rounded-2xl text-black">
              <Monitor size={24} />
            </div>
          </div>
          
          <div className="space-y-4">
             <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-brand-neon">
                  <Layout size={14} />
                  <span className="text-[10px] font-black uppercase tracking-wider">Dimensões Reais</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] text-white/30 uppercase font-bold tracking-widest mb-1">Largura</p>
                    <p className="text-xl font-mono text-white">{Math.round(heroDimensions.width)}px</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-white/30 uppercase font-bold tracking-widest mb-1">Altura</p>
                    <p className="text-xl font-mono text-white">{Math.round(heroDimensions.height)}px</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-white/5">
                   <p className="text-[9px] text-white/30 uppercase font-bold tracking-widest mb-1">Proporção Detectada</p>
                   <p className="text-xl font-mono text-brand-neon">{detectRatio(heroDimensions.width, heroDimensions.height)}</p>
                </div>
             </div>

             <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex gap-4">
                <Info size={20} className="text-blue-500 shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white uppercase tracking-tight leading-none pt-1">Dimensões Ideais</p>
                  <p className="text-[10px] text-white/50 leading-relaxed uppercase">
                    Desktop: <span className="text-white">{idealDesktop.width}x{idealDesktop.height}px</span><br/>
                    Mobile: <span className="text-white">{idealMobile.width}x{idealMobile.height}px</span>
                  </p>
                </div>
             </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden flex flex-col">
           <h3 className="text-[10px] uppercase font-bold text-white/30 tracking-[0.3em] mb-2">Dica Profissional</h3>
           <div className="flex-1 flex flex-col justify-center gap-4">
              <div className="p-5 bg-orange-500/10 border border-orange-500/20 rounded-2xl space-y-3">
                 <div className="flex items-center gap-2 text-orange-500">
                    <AlertCircle size={20} />
                    <span className="text-sm font-black uppercase tracking-widest">Área Segura</span>
                 </div>
                 <p className="text-xs text-white/60 leading-relaxed uppercase">
                    Mantenha textos e logotipos centralizados. Evite as bordas extremas para garantir visualização perfeita em todos os dispositivos.
                 </p>
              </div>
           </div>
           <button onClick={handleCreateNew} className="w-full bg-brand-neon text-black font-black uppercase py-4 rounded-xl flex items-center justify-center gap-2 text-xs tracking-[0.2em] shadow-xl hover:bg-brand-neon/90 transition-all active:scale-95">
              <Plus size={18} /> Novo Slide
           </button>
        </div>
      </div>

      {/* Slide List */}
      <div className="bg-[#0f0f0f] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em]">Meus Slides</h3>
            <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] text-white/50 font-bold">{slides.length}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setPreviewMode('desktop')} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${previewMode === 'desktop' ? 'bg-brand-neon text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>
              <Monitor size={18} />
            </button>
            <button onClick={() => setPreviewMode('mobile')} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${previewMode === 'mobile' ? 'bg-brand-neon text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>
              <Smartphone size={18} />
            </button>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={slides.map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {slides.map(slide => (
                  <SortableSlideCard 
                    key={slide.id} 
                    slide={slide} 
                    onEdit={setEditingSlide}
                    onDelete={handleDelete}
                    onDuplicate={handleDuplicate}
                    onToggleActive={handleToggleActive}
                  />
                ))}
                {slides.length === 0 && !loading && (
                   <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                      <Layout size={40} className="mx-auto text-white/10 mb-4" />
                      <p className="text-white/20 uppercase font-bold tracking-widest text-xs">Nenhum slide cadastrado</p>
                   </div>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* Slide Editor Modal */}
      <AnimatePresence>
        {editingSlide && (
          // ... (existing modal code)
          <div className="fixed inset-0 z-[1000] flex items-center justify-center md:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingSlide(null)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div 
              initial={{ y: 50, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: 50, opacity: 0 }} 
              className="relative bg-[#0d0d0d] border md:border-white/10 w-full md:max-w-2xl h-full md:h-auto md:max-h-[90vh] md:rounded-[2.5rem] overflow-hidden flex flex-col"
            >
              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-start mb-8 pt-4 md:pt-0">
                   <h2 className="text-2xl font-display uppercase text-white leading-tight">Configurar <br/><span className="text-brand-neon">Slide</span></h2>
                   <button onClick={() => setEditingSlide(null)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"><X size={20} /></button>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest ml-2 block">Título Principal</label>
                      <input 
                        type="text" 
                        value={editingSlide.title} 
                        onChange={(e) => setEditingSlide({...editingSlide, title: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-brand-neon transition-all"
                        placeholder="Ex: FOTOS DO CONGRESSO"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest ml-2 block">Subtítulo / Botão</label>
                      <input 
                        type="text" 
                        value={editingSlide.subtitle} 
                        onChange={(e) => setEditingSlide({...editingSlide, subtitle: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-brand-neon transition-all"
                        placeholder="Ex: CLIQUE AQUI"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest ml-2 block">Link (URL completa)</label>
                      <input 
                        type="url" 
                        value={editingSlide.link} 
                        onChange={(e) => setEditingSlide({...editingSlide, link: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-brand-neon transition-all"
                        placeholder="https://google.com/..."
                      />
                   </div>

                   <div className="pt-4 border-t border-white/5 space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest ml-2 block">URL Imagem Desktop (Google Drive)</label>
                        <input 
                          type="text" 
                          required
                          value={editingSlide.image_desktop_url} 
                          onChange={(e) => setEditingSlide({...editingSlide, image_desktop_url: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-brand-neon transition-all"
                          placeholder="https://..."
                        />
                      </div>

                      <div className="flex items-center gap-3 px-2">
                        <button 
                          type="button"
                          onClick={() => setEditingSlide({...editingSlide, use_mobile_image: !editingSlide.use_mobile_image})}
                          className={`w-10 h-5 rounded-full relative transition-colors ${editingSlide.use_mobile_image ? 'bg-brand-neon' : 'bg-white/10'}`}
                        >
                          <motion.div animate={{ x: editingSlide.use_mobile_image ? 20 : 0 }} className="w-5 h-5 bg-white rounded-full shadow-lg" />
                        </button>
                        <span className="text-[10px] uppercase font-black text-white/60 tracking-widest">Usar imagem mobile específica</span>
                      </div>

                      {editingSlide.use_mobile_image && (
                         <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest ml-2 block">URL Imagem Mobile</label>
                            <input 
                              type="text" 
                              value={editingSlide.image_mobile_url} 
                              onChange={(e) => setEditingSlide({...editingSlide, image_mobile_url: e.target.value})}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-brand-neon transition-all"
                              placeholder="https://..."
                            />
                         </div>
                      )}
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button 
                        type="button"
                        onClick={() => {
                          setPreviewSnapshot(editingSlide);
                          setShowExternalPreview(true);
                        }}
                        className="w-full bg-white/10 text-white font-black uppercase py-5 rounded-2xl hover:bg-white/20 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"
                      >
                         <Eye size={20} /> Mostrar Prévia
                      </button>
                      <button 
                        disabled={isSaving}
                        type="submit" 
                        className="w-full bg-brand-neon text-black font-black uppercase py-5 rounded-2xl hover:bg-brand-neon/80 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50"
                      >
                         {isSaving ? <Save className="animate-spin" /> : <Save size={20} />}
                         Salvar Slide
                      </button>
                   </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hero Preview Modal (Standalone) */}
      <AnimatePresence>
        {showExternalPreview && previewSnapshot && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center md:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowExternalPreview(false)} className="absolute inset-0 bg-black/95 backdrop-blur-xl" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              className="relative w-full md:max-w-6xl h-full md:h-[90vh] flex flex-col items-center justify-center gap-4 md:gap-6"
            >
              {/* Header Controls */}
              <div className="w-full flex flex-col md:flex-row items-center justify-between px-6 py-4 bg-[#111] md:rounded-3xl border-b md:border border-white/10 shrink-0 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-brand-neon p-2 rounded-xl text-black">
                      <Eye size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase text-white tracking-widest leading-none">Prévia Real</h3>
                      <p className="text-[10px] text-white/40 uppercase tracking-tight">Simulação de renderização final</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-black/50 p-1 rounded-2xl border border-white/5">
                    <button onClick={() => setPreviewMode('desktop')} className={`px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${previewMode === 'desktop' ? 'bg-brand-neon text-black' : 'text-white/40 hover:text-white'}`}>
                        <Monitor size={14} /> Desktop
                    </button>
                    <button onClick={() => setPreviewMode('mobile')} className={`px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${previewMode === 'mobile' ? 'bg-brand-neon text-black' : 'text-white/40 hover:text-white'}`}>
                        <Smartphone size={14} /> Mobile
                    </button>
                  </div>

                  <button onClick={() => setShowExternalPreview(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                    <X size={20} />
                  </button>
              </div>

              {/* Real Content Preview */}
              <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
                   <div className={`relative bg-black shadow-[0_0_100px_rgba(204,255,0,0.1)] transition-all duration-500 overflow-hidden border border-white/10 ${previewMode === 'desktop' ? 'w-full h-full' : 'w-[360px] h-full mx-auto rounded-[3rem] border-8 border-[#222]'}`}>
                      
                      {/* SITE MOCK: MARQUEE */}
                      <div className="absolute top-0 left-0 right-0 z-[100] -rotate-1 scale-110 border-b-2 border-black py-2 bg-brand-neon shadow-xl overflow-hidden">
                         <div className="flex whitespace-nowrap font-fun text-xs text-black uppercase tracking-wide">
                            {[...Array(20)].map((_, i) => (
                              <span key={i} className="mx-4 flex items-center gap-2">CONGRESSO UMADEMATS 2026 •</span>
                            ))}
                         </div>
                      </div>

                      {/* SITE MOCK: NAV */}
                      <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[80%] z-[110]">
                         <div className="w-full bg-brand-neon rounded-full px-4 py-2 flex items-center justify-between border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                            <span className="font-display italic text-sm text-black tracking-tight uppercase">UMADEMATS</span>
                            <Menu className="text-black w-4 h-4" />
                         </div>
                      </div>

                      {/* HERO CONTENT */}
                      <div className="absolute inset-0 z-0">
                         {previewSnapshot.image_desktop_url ? (
                            <img 
                              src={getDirectDriveUrl((previewMode === 'mobile' && previewSnapshot.use_mobile_image && previewSnapshot.image_mobile_url) ? previewSnapshot.image_mobile_url : previewSnapshot.image_desktop_url)} 
                              className="w-full h-full object-cover" 
                              alt="" 
                            />
                         ) : (
                            <div className="w-full h-full bg-[#0d0d0d] flex items-center justify-center">
                               <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:2rem_2rem]" />
                            </div>
                         )}
                         <div className="absolute inset-0 bg-transparent" />
                      </div>

                      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8 text-center">
                         <div className="max-w-4xl space-y-6 flex flex-col items-center">
                            <motion.h4 
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              className={`font-display italic uppercase text-white leading-[0.9] drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] ${previewMode === 'desktop' ? 'text-[5vw]' : 'text-[10vw]'}`}
                            >
                                {previewSnapshot.title || 'Seu Título Aqui'}
                            </motion.h4>
                            
                            {previewSnapshot.subtitle && (
                              <motion.div 
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className={`bg-brand-neon border-[3px] md:border-4 border-black rotate-[2deg] shadow-[6px_6px_0px_rgba(0,0,0,1)] md:shadow-[10px_10px_0px_rgba(0,0,0,1)] ${previewMode === 'desktop' ? 'px-10 py-5' : 'px-6 py-3'}`}
                              >
                                  <span className={`font-fun text-black uppercase leading-none block ${previewMode === 'desktop' ? 'text-[2.5vw]' : 'text-[5.5vw]'}`}>
                                    {previewSnapshot.subtitle}
                                  </span>
                              </motion.div>
                            )}
                         </div>
                      </div>

                      {/* Safe Area Markers In Preview */}
                      <div className="absolute inset-x-8 inset-y-20 border border-brand-neon/20 border-dashed pointer-events-none rounded-3xl" />
                   </div>
              </div>

              {/* Proportion Info Footer */}
              <div className="text-[10px] font-black uppercase text-white/30 tracking-[0.3em] flex items-center gap-6">
                 <div className="flex items-center gap-2">
                    <AlertCircle size={12} className="text-brand-neon" />
                    <span>Área segura respeitada</span>
                 </div>
                 <div className="h-4 w-px bg-white/10" />
                 <span>Proporção {previewMode === 'desktop' ? 'Full Width' : '9:16 Simulado'}</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
