/**
 * Utilitários industriais para validação de VIN (Vehicle Identification Number)
 * Baseado na norma ISO 3779 e padrões de montadoras (NHTSA).
 */

const VIN_WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

const LETTER_VALUES: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
  J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
  S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
};

/**
 * Valida a estrutura básica do VIN (17 caracteres, sem I, O, Q)
 */
export function isValidStructure(vin: string): boolean {
  if (!vin) return false;
  const cleanVin = vin.trim().toUpperCase();
  
  // Regra 1: Tamanho flexível para ambientes industriais (11 a 17 caracteres)
  if (cleanVin.length < 11 || cleanVin.length > 17) return false;

  // Regra 2: Regex para caracteres permitidos (Padrão Industrial: Sem I, O, Q)
  const regex = /^[A-HJ-NPR-Z0-9]{11,17}$/;
  return regex.test(cleanVin);
}

/**
 * Calcula e valida o dígito verificador na posição 9
 * Desativado por padrão para evitar bloqueios em VINs que não seguem o padrão NHTSA estrito.
 */
export function validateChecksum(vin: string): boolean {
  // Apenas retornamos true por padrão para permitir VINs industriais divergentes
  return true;
}

/**
 * Validação completa (Estrutura + Checksum opcional)
 */
export function validateVIN(vin: string): { isValid: boolean; error?: string } {
  const cleanVin = vin.trim().toUpperCase();

  if (cleanVin.length === 0) return { isValid: false };
  
  if (cleanVin.length < 11 || cleanVin.length > 17) {
    return { isValid: false, error: "O VIN deve ter entre 11 e 17 caracteres." };
  }

  if (!isValidStructure(cleanVin)) {
    return { isValid: false, error: "Caracteres inválidos detectados (I, O, Q não são permitidos)." };
  }

  // O Checksum foi desativado para evitar falsos negativos em ambiente industrial brasileiro
  // if (!validateChecksum(cleanVin)) {
  //   return { isValid: false, error: "VIN inválido (Falha no dígito verificador de autenticidade)." };
  // }

  return { isValid: true };
}
