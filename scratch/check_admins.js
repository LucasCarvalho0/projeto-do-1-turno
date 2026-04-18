
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Função simples para carregar variáveis de ambiente do .env.local sem o módulo dotenv
function loadEnv() {
    const envPath = path.resolve('.env.local');
    if (!fs.existsSync(envPath)) return {};
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    const env = {};
    
    for (const line of envLines) {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            env[match[1].trim()] = match[2].trim();
        }
    }
    return env;
}

async function diagnose() {
    const env = loadEnv();
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        console.log("Variáveis de ambiente ausentes no .env.local.");
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log("Tentando ler dados da tabela 'admins'...");

    const { data, error } = await supabase
        .from('admins')
        .select('*');

    if (error) {
        console.error("Erro ao ler tabela:", error.message);
    } else {
        console.log("Usuários encontrados na tabela 'admins':");
        console.table(data.map(u => ({ matricula: u.matricula, senha: u.senha, nome: u.nome })));
    }
}

diagnose();
