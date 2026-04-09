import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSettings() {
  const [meta, setMeta] = useState(90)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('meta')
        .eq('id', 1)
        .single()

      if (!error && data) {
        setMeta(data.meta)
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
      .channel('settings-changes')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'settings',
          filter: 'id=eq.1' 
        }, 
        (payload: any) => {
          if (payload.new && typeof payload.new.meta === 'number') {
            setMeta(payload.new.meta)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchSettings, supabase])

  return { meta, loading, refresh: fetchSettings }
}
