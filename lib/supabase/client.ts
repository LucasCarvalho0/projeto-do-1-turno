import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

let supabase: any;

export const createClient = () => {
  if (!supabase) {
    supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)
  }
  return supabase
}
