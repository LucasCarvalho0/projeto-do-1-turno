-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Employees table
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Productions table
CREATE TABLE productions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vin TEXT UNIQUE NOT NULL,
  employee_id UUID REFERENCES employees(id),
  versao TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Settings table
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  meta INTEGER DEFAULT 90,
  turno_inicio TIME DEFAULT '06:00',
  turno_fim TIME DEFAULT '16:48',
  hora_extra TIME DEFAULT '19:00',
  last_reset TIMESTAMPTZ
);

-- Seed Initial Data
INSERT INTO employees (nome, ativo) VALUES 
('João Silva', true),
('Maria Santos', true),
('Carlos Oliveira', true),
('Ana Souza', true);

INSERT INTO settings (meta, turno_inicio, turno_fim, hora_extra) 
VALUES (90, '06:00', '16:48', '19:00');
