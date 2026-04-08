-- Add matricula to employees
ALTER TABLE employees ADD COLUMN IF NOT EXISTS matricula TEXT;

-- Create admins table for login
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  matricula TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL,
  nome TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed an admin for testing
INSERT INTO admins (matricula, senha, nome) 
VALUES ('116221', 'senha123', 'Maria Andrade')
ON CONFLICT (matricula) DO NOTHING;

-- Add sync_status to productions for reporting
ALTER TABLE productions ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'Sincronizado';
