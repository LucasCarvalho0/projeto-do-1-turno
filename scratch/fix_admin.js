
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function loadEnv() {
    const envPath = path.resolve('.env.local');
    if (!fs.existsSync(envPath)) return {};
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    const env = {};
    for (const line of envLines) {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) env[match[1].trim()] = match[2].trim();
    }
    return env;
}

async function fixAdmin() {
    const env = loadEnv();
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    console.log("Inserindo administrador Anna Karoline (116203)...");

    const { data, error } = await supabase
        .from('admins')
        .insert([
            { matricula: '116203', senha: '116203', nome: 'Anna Karoline' }
        ])
        .select();

    if (error) {
        console.error("Erro ao inserir:", error.message);
        if (error.message.includes("permission denied")) {
            console.log("Dica: Desative o RLS da tabela 'admins' no painel do Supabase temporariamente ou crie uma política que permita inserções.");
        }
    } else {
        console.log("✅ Administrador criado com sucesso!");
        console.table(data);
    }
}

fixAdmin();
