import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface AutomationLog {
  id: number;
  created_at: string;
  event_type: string;
  status: string;
  details: any;
}

const PING_INTERVAL_MS = 5 * 60 * 1000; // 5 Minutos

export const useKeepalive = () => {
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [lastRun, setLastRun] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  
  // Estados para automação
  const [autoPingEnabled, setAutoPingEnabled] = useState(true);
  const [timeToNextPing, setTimeToNextPing] = useState<number>(PING_INTERVAL_MS);
  
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('automation_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (data) {
        setLogs(data);
        if (data.length > 0) {
          setLastRun(data[0].created_at);
        }
      }
    } catch (error) {
      console.error('🚨 [Keepalive Fetch Error]:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const triggerKeepalive = useCallback(async (isAuto = false) => {
    if (isPinging) return; // Evita pings duplicados simultâneos
    
    setIsPinging(true);
    try {
      // 1. Insere um log para "acordar" o banco e registrar atividade
      const { error } = await supabase
        .from('automation_logs')
        .insert({
          event_type: isAuto ? 'keepalive_auto' : 'keepalive_manual',
          status: 'success',
          details: { 
            source: 'admin_dashboard', 
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        });

      if (error) throw error;

      // 2. Atualiza a lista local
      await fetchLogs();
      
      return true;
    } catch (error: any) {
      console.error('🚨 [Keepalive Trigger Error]:', error);
      
      // Tenta registrar o erro no banco se possível
      try {
          await supabase.from('automation_logs').insert({
              event_type: 'keepalive_error',
              status: 'error',
              details: { error: error.message }
          });
      } catch(e) { }
      
      return false;
    } finally {
      setIsPinging(false);
      // SEMPRE reseta o cronômetro no final para evitar loops infinitos se falhar
      setTimeToNextPing(PING_INTERVAL_MS);
    }
  }, [fetchLogs, isPinging]);

  // Carrega logs ao iniciar e assina mudanças em tempo real
  useEffect(() => {
    fetchLogs();
    
    const channel = supabase
      .channel('automation_logs_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'automation_logs',
        },
        (payload) => {
          const newLog = payload.new as AutomationLog;
          setLogs((prev) => {
              // Evita duplicatas se o fetchLogs e o realtime baterem juntos
              if (prev.some(l => l.id === newLog.id)) return prev;
              return [newLog, ...prev].slice(0, 50);
          });
          setLastRun(newLog.created_at);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLogs]);

  // Lógica 1: O Cronômetro (Apenas decrementa o tempo)
  useEffect(() => {
    if (!autoPingEnabled) return;

    const timer = setInterval(() => {
      setTimeToNextPing((prev) => {
        if (prev <= 0) return 0;
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoPingEnabled]);

  // Lógica 2: O Gatilho (Executa quando o tempo chega a zero)
  useEffect(() => {
    if (autoPingEnabled && timeToNextPing <= 0 && !isPinging) {
      triggerKeepalive(true);
    }
  }, [timeToNextPing, autoPingEnabled, triggerKeepalive, isPinging]);

  return {
    logs,
    lastRun,
    loading,
    isPinging,
    triggerKeepalive,
    refreshLogs: fetchLogs,
    autoPingEnabled,
    setAutoPingEnabled,
    timeToNextPing
  };
};