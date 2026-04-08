export type Employee = {
  id: string;
  nome: string;
  ativo: boolean;
  created_at?: string;
};

export type ProductionVersion = 'L3 Exclusive' | 'L2 Advanced';

export type Production = {
  id: string;
  vin: string;
  employee_id: string;
  versao: ProductionVersion;
  timestamp: string;
  employee?: Employee;
};

export type ShiftSettings = {
  meta: number;
  turno_inicio: string;
  turno_fim: string;
  hora_extra: string;
  last_reset?: string;
};

export type ShiftUser = {
  id: string;
  matricula: string;
  nome: string;
  tipo: 'admin' | 'user';
};
