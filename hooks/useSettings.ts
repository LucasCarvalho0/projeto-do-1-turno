import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSettings() {
  const [meta, setMeta] = useState(90)
  const [turnoInicio, setTurnoInicio] = useState('06:00')
  const [turnoFim, setTurnoFim] = useState('16:48')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('meta, turno_inicio, turno_fim')
        .eq('id', 1)
        .single()

      if (!error && data) {
        setMeta(data.meta)
        setTurnoInicio(data.turno_inicio)
        setTurnoFim(data.turno_fim)
      }
    } catch (err) {
      console.error("Error fetching settings:", err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchSettings()

    const channel = supabase
      .channel(`settings-changes-${Math.random().toString(36).substring(2, 9)}`)
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'settings',
          filter: 'id=eq.1' 
        }, 
        (payload: any) => {
          if (payload.new) {
            if (typeof payload.new.meta === 'number') setMeta(payload.new.meta)
            if (payload.new.turno_inicio) setTurnoInicio(payload.new.turno_inicio)
            if (payload.new.turno_fim) setTurnoFim(payload.new.turno_fim)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchSettings, supabase])

  return { meta, turnoInicio, turnoFim, loading, refresh: fetchSettings }
}
