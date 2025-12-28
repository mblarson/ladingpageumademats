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
  
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    setIsPinging(true);
    try {
      // 1. Insere um log para "acordar" o banco e registrar atividade
      const { error } = await supabase
        .from('automation_logs')
        .insert({
          event_type: isAuto ? 'keepalive_auto' : 'keepalive_manual',
          status: 'success',
          details: { source: 'admin_dashboard', user_agent: navigator.userAgent }
        });

      if (error) throw error;

      // 2. Atualiza a lista
      await fetchLogs();
      
      // Se foi sucesso, reseta o timer
      setTimeToNextPing(PING_INTERVAL_MS);
      return true;
    } catch (error: any) {
      console.error('🚨 [Keepalive Trigger Error]:', error);
      
      await supabase.from('automation_logs').insert({
          event_type: 'keepalive_error',
          status: 'error',
          details: { error: error.message }
      });
      
      return false;
    } finally {
      setIsPinging(false);
    }
  }, [fetchLogs]);

  // Carrega logs ao iniciar
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
          setLogs((prev) => [newLog, ...prev]);
          setLastRun(newLog.created_at);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLogs]);

  // Lógica do Cronômetro e Auto Ping
  useEffect(() => {
    if (!autoPingEnabled) {
        if (timerRef.current) clearInterval(timerRef.current);
        return;
    }

    // Decrementa o contador a cada segundo
    timerRef.current = setInterval(() => {
        setTimeToNextPing((prev) => {
            if (prev <= 1000) {
                triggerKeepalive(true);
                return PING_INTERVAL_MS;
            }
            return prev - 1000;
        });
    }, 1000);

    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoPingEnabled, triggerKeepalive]);

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