import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { startOfToday, addHours, isBefore, subDays } from 'date-fns'
import { validateVIN } from '@/utils/vin'

export interface Production {
  id: string
  vin: string
  employee_id: string
  versao: string
  timestamp: string
  sync_status?: string
}

export function useProduction(options?: { allHistory?: boolean }) {
  const [data, setData] = useState<Production[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const getShiftStart = () => {
    const now = new Date()
    const todayOneAM = addHours(startOfToday(), 1) // 01:00 AM today
    
    if (isBefore(now, todayOneAM)) {
      // Shift started yesterday at 01:00 AM
      return subDays(todayOneAM, 1).toISOString()
    }
    return todayOneAM.toISOString()
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      // Query unificada com join de funcionários
      let query = supabase
        .from('productions')
        .select('*, employees(nome)')
        .order('timestamp', { ascending: false })

      if (!options?.allHistory) {
        query = query.gte('timestamp', getShiftStart())
      }

      const { data, error } = await query

      if (!error && data) {
        setData(data)
      }
    } catch (err) {
      console.error("Error fetching production:", err)
    } finally {
      setLoading(false)
    }
  }, [supabase, options?.allHistory])

  useEffect(() => {
    fetchData()

    const channel = supabase
      .channel(`production-changes-${Math.random().toString(36).substring(2, 9)}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'productions' }, 
        (payload: any) => {
          console.log("Mudança detectada no Realtime:", payload);
          fetchData();
        }
      )
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          console.log("Inscrito no canal de mudanças da produção com sucesso.");
        } else if (status === 'CHANNEL_ERROR') {
          console.error("Erro ao se inscrever no canal de mudanças da produção.");
        }
      });

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchData, supabase])

  const addProduction = async (production: Omit<Production, 'id' | 'timestamp'>) => {
    console.log("Iniciando insert de produção:", production);
    
    const validation = validateVIN(production.vin);
    if (!validation.isValid) {
      console.warn("VIN Inválido:", production.vin);
      return { error: { message: validation.error || "VIN Inválido", code: 'VIN_INVALID' } };
    }

    // Removendo o timestamp manual para deixar o Supabase usar o DEFAULT now() do banco.
    // Isso garante consistência mesmo que o relógio do cliente esteja errado.
    const { error } = await supabase
      .from('productions')
      .insert([{
        vin: production.vin,
        employee_id: production.employee_id,
        versao: production.versao,
        sync_status: 'Sincronizado'
      }]);
    
    if (error) {
      console.error("Erro ao inserir produção no Supabase:", error);
      
      // Se for erro de duplicidade (unique constraint), buscar o registro existente
      if (error.code === '23505') {
        const { data: existingData } = await supabase
          .from('productions')
          .select('timestamp')
          .eq('vin', production.vin)
          .single();
        
        return { error, existingTimestamp: existingData?.timestamp };
      }
    } else {
      console.log("Produção inserida com sucesso!");
      fetchData(); // Força um refresh local imediato
    }
    
    return { error };
  }

  return { data, loading, addProduction, refresh: fetchData }
}
