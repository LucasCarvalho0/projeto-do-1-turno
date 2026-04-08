import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { startOfToday, addHours, isBefore, subDays } from 'date-fns'

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
      let query = supabase
        .from('productions')
        .select('*')
        .order('timestamp', { ascending: false })

      // If not allHistory, filter for current shift (since 01:00 AM)
      if (!options?.allHistory) {
        query = query.gte('timestamp', getShiftStart())
      }

      const { data, error } = await supabase
        .from('productions')
        .select('*, employees(nome)')
        .order('timestamp', { ascending: false })

      // Manual filtering if we want to be 100% sure about the shift logic in JS
      if (!error && data) {
        const filtered = options?.allHistory 
          ? data 
          : data.filter((p: Production) => p.timestamp >= getShiftStart())
        setData(filtered)
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
      .channel(`rt_prod_${Math.random().toString(36).substring(7)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'productions' }, fetchData)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchData, supabase])

  const addProduction = async (production: Omit<Production, 'id' | 'timestamp'>) => {
    const { error } = await supabase
      .from('productions')
      .insert([production])
    
    if (!error) fetchData()
    return { error }
  }

  return { data, loading, addProduction, refresh: fetchData }
}
