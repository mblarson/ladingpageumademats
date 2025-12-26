
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';

const STORAGE_KEY = 'uimademats_bible_progress_v2';

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
        return [];
      }
    }
    return [];
  });

  // 1. Gerenciar Sessão do Usuário
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchSupabaseProgress(session.user.id);
      else setLoading(false);
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
      console.error('Erro ao buscar progresso:', error);
    } finally {
      setLoading(false);
    }
  };

  // 3. Alternar item (Salvar no Banco ou Local)
  const toggleItemCompletion = async (itemId: string) => {
    // A. Atualização Otimista (Visual instantâneo)
    let newItemList: string[] = [];
    setCompletedItems(prev => {
      const exists = prev.includes(itemId);
      newItemList = exists ? prev.filter(id => id !== itemId) : [...prev, itemId];
      return newItemList;
    });

    // B. Persistência
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newItemList));

    // C. Se logado, salvar no Supabase
    if (session) {
      const isAdding = newItemList.includes(itemId);
      try {
        if (isAdding) {
          await supabase.from('user_progress').insert({
            user_id: session.user.id,
            reading_item_id: itemId
          });
        } else {
          await supabase.from('user_progress').delete()
            .eq('user_id', session.user.id)
            .eq('reading_item_id', itemId);
        }
      } catch (error) {
        console.error("Erro ao sincronizar com banco:", error);
        // Em caso de erro real, poderíamos reverter o estado, 
        // mas para UX simples mantemos o local como fallback.
      }
    }
  };

  const resetProgress = async () => {
    setCompletedItems([]);
    localStorage.removeItem(STORAGE_KEY);
    
    if (session) {
      await supabase.from('user_progress').delete().eq('user_id', session.user.id);
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
