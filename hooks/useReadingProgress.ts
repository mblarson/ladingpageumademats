
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';

const STORAGE_KEY = 'umademats_bible_progress_v2';

export const useReadingProgress = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Inicia vazio para evitar flash de dados do usuário anterior
  const [completedItems, setCompletedItems] = useState<string[]>([]);

  // 1. Gerenciar Sessão do Usuário e Estado Inicial
  useEffect(() => {
    // Verifica sessão atual ao carregar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
          // Se tem usuário, busca do banco
          fetchSupabaseProgress(session.user.id);
      } else {
          // Se é visitante, carrega do cache local
          loadLocalProgress();
      }
    });

    // Escuta mudanças de login/logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      
      if (event === 'SIGNED_IN' && session) {
        fetchSupabaseProgress(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        // Ao sair, limpa o estado e o cache local
        setCompletedItems([]);
        localStorage.removeItem(STORAGE_KEY);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Carrega do LocalStorage (Apenas para visitantes)
  const loadLocalProgress = () => {
    if (typeof window !== 'undefined') {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                setCompletedItems(JSON.parse(saved));
            }
        } catch (e) {
            console.error("LocalStorage Error:", e);
        }
    }
    setLoading(false);
  };

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
        const dbItems = data.map(d => d.reading_item_id);
        setCompletedItems(dbItems);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dbItems));
      }
    } catch (error) {
      console.error('🚨 [Progress Fetch Error]:', error);
    } finally {
      setLoading(false);
    }
  };

  // 3. Alternar item (Salvar no Banco ou Local)
  const toggleItemCompletion = async (itemId: string, itemRef?: string) => {
    let newItemList: string[] = [];
    
    setCompletedItems(prev => {
      const exists = prev.includes(itemId);
      newItemList = exists ? prev.filter(id => id !== itemId) : [...prev, itemId];
      return newItemList;
    });

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newItemList));
    } catch (e) {
        console.error("🚨 [LocalStorage Save Error]:", e);
    }

    if (session) {
      const isAdding = newItemList.includes(itemId);
      try {
        if (isAdding) {
          // EXTRAÇÃO DO NOME DO GOOGLE:
          // O Google envia o nome completo dentro de 'full_name' nos metadados.
          const userName = session.user.user_metadata?.full_name || session.user.email || 'Usuário Desconhecido';
          
          const { error } = await supabase.from('user_progress').insert({
            user_id: session.user.id,
            user_name: userName, // É NECESSÁRIO CRIAR ESTA COLUNA NO SUPABASE (tipo text)
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
