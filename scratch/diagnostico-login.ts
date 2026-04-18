
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function checkLogin() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ ERRO: Variáveis de ambiente não encontradas no .env.local")
    return
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  console.log("--- TESTE DE LOGIN ---")
  console.log("Matrícula: 116203")
  console.log("URL:", supabaseUrl)
  
  const { data, error } = await supabase
    .from('admins')
    .select('*')
    .eq('matricula', '116203')
    .eq('senha', '116203')
    .single()

  if (error) {
    console.log("❌ Resultado: FALHA")
    console.log("Motivo:", error.message)
    
    // Tentar conferir se o usuário existe com qualquer senha
    const { data: userExists } = await supabase
      .from('admins')
      .select('nome, senha')
      .eq('matricula', '116203')
      .single()
    
    if (userExists) {
      console.log("ℹ️ O usuário existe, mas a senha no banco não é '116203'.")
      console.log("ℹ️ Senha atual no banco:", userExists.senha)
    } else {
      console.log("ℹ️ O usuário com matrícula '116203' NÃO existe na tabela 'admins'.")
    }
  } else {
    console.log("✅ Resultado: SUCESSO! Login autorizado para:", data.nome)
  }
}

checkLogin()
