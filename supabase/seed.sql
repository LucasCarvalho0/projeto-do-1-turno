-- SQL para configuração do Banco de Dados no Supabase

-- 1. Tabela de Administradores
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    matricula TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    nome TEXT NOT NULL,
    tipo TEXT DEFAULT 'admin'
);

-- 2. Tabela de Funcionários (Operadores)
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    matricula TEXT UNIQUE,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Tabela de Produção (Registros de Bipagem)
CREATE TABLE IF NOT EXISTS public.productions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vin TEXT UNIQUE NOT NULL,
    employee_id UUID REFERENCES public.employees(id),
    versao TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Tabela de Configurações
CREATE TABLE IF NOT EXISTS public.settings (
    id SERIAL PRIMARY KEY,
    meta INTEGER DEFAULT 90,
    turno_inicio TIME DEFAULT '06:00',
    turno_fim TIME DEFAULT '16:48',
    hora_extra TIME DEFAULT '19:00'
);

-- Inserir configuração inicial
INSERT INTO public.settings (id, meta) VALUES (1, 90) ON CONFLICT (id) DO NOTHING;

-- Inserir usuário administrativo padrão (Checklist)
INSERT INTO public.admins (matricula, senha, nome, tipo) 
VALUES ('116203', '123', 'Anna Karolina', 'admin') 
ON CONFLICT (matricula) DO NOTHING;

-- Habilitar Realtime para a tabela de produções
ALTER PUBLICATION supabase_realtime ADD TABLE public.productions;
