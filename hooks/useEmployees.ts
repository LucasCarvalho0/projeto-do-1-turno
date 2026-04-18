import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Employee {
  id: string
  nome: string
  matricula: string | null
  ativo: boolean
}

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('nome')

      if (!error) setEmployees(data)
    } catch (err) {
      console.error("Error fetching employees:", err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchEmployees()

    const channel = supabase
      .channel(`employees-changes-${Math.random().toString(36).substring(2, 9)}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'employees' 
        }, 
        () => {
          fetchEmployees()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchEmployees, supabase])

  const addEmployee = async (employee: Omit<Employee, 'id'>) => {
    const { data, error } = await supabase
      .from('employees')
      .insert([employee])
      .select()
    
    if (error) {
      console.error("Erro ao adicionar funcionário:", error.message);
    } else {
      fetchEmployees();
    }
    return { data, error }
  }

  const updateEmployee = async (id: string, updates: Partial<Omit<Employee, 'id'>>) => {
    const { error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', id)
    
    if (!error) fetchEmployees()
    return { error }
  }

  const deleteEmployee = async (id: string) => {
    // Optimistic / Immediate UI update
    const previousEmployees = [...employees];
    setEmployees(prev => prev.filter(emp => emp.id !== id));

    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error("Error deleting employee:", error)
      setEmployees(previousEmployees); // Rollback if error
      return { error }
    }
    
    return { error: null }
  }

  return { 
    employees, 
    loading, 
    refresh: fetchEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee
  }
}
