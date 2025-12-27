import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';

const STORAGE_KEY = 'umademats_bible_progress_v2';

export const useReadingProgress = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estado local que reflete a UI imediatamente
  const [completedItems, setCompletedItems] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      try {
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        console.error("🚨 [LocalStorage Parse Error]:", e);
        return [];
      }
    }
    return [];
  });

  // 1. Gerenciar Sessão do Usuário
  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        if (session) {
            fetchSupabaseProgress(session.user.id);
        } else {
            setLoading(false);
        }
      })
      .catch(err => {
        console.error("🚨 [Auth Session Error]:", err);
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchSupabaseProgress(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Buscar progresso do Banco (Se logado)
  const fetchSupabaseProgress = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_progress')
        .select('reading_item_id')
        .eq('user_id', userId);

      if (error) throw error;

      if (data) {
        // Mesclar com o local storage atual para não perder nada
        const dbItems = data.map(d => d.reading_item_id);
        const localItems = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const merged = Array.from(new Set([...dbItems, ...localItems]));
        
        setCompletedItems(merged);
        // Opcional: Salvar o merged de volta no localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      }
    } catch (error) {
      console.error('🚨 [Progress Fetch Error]:', error);
    } finally {
      setLoading(false);
    }
  };

  // 3. Alternar item (Salvar no Banco ou Local)
  // Agora aceita itemRef (ex: "Gênesis 1-3") para salvar de forma legível no banco
  const toggleItemCompletion = async (itemId: string, itemRef?: string) => {
    // A. Atualização Otimista (Visual instantâneo)
    let newItemList: string[] = [];
    setCompletedItems(prev => {
      const exists = prev.includes(itemId);
      newItemList = exists ? prev.filter(id => id !== itemId) : [...prev, itemId];
      return newItemList;
    });

    // B. Persistência Local
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newItemList));
    } catch (e) {
        console.error("🚨 [LocalStorage Save Error]:", e);
    }

    // C. Se logado, salvar no Supabase
    if (session) {
      const isAdding = newItemList.includes(itemId);
      try {
        if (isAdding) {
          // Salva o ID técnico E o texto legível
          const { error } = await supabase.from('user_progress').insert({
            user_id: session.user.id,
            reading_item_id: itemId,
            reading_ref: itemRef || null 
          });
          if (error) throw error;
        } else {
          const { error } = await supabase.from('user_progress').delete()
            .eq('user_id', session.user.id)
            .eq('reading_item_id', itemId);
          if (error) throw error;
        }
      } catch (error) {
        console.error("🚨 [Sync Error]:", error);
      }
    }
  };

  const resetProgress = async () => {
    setCompletedItems([]);
    localStorage.removeItem(STORAGE_KEY);
    
    if (session) {
      try {
        const { error } = await supabase.from('user_progress').delete().eq('user_id', session.user.id);
        if (error) throw error;
      } catch (e) {
         console.error("🚨 [Reset Error]:", e);
      }
    }
  };

  const isItemComplete = (id: string) => completedItems.includes(id);

  return {
    completedItems,
    toggleItemCompletion,
    resetProgress,
    isItemComplete,
    user: session?.user,
    loading
  };
};