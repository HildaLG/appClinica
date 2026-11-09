export interface Insurance {
  id: number;
  name: string;
  code: string;
  phone: string;
  coverage_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface InsurancePayload {
  /** 3-100 caracteres */
  name: string;
  /** máximo 50 caracteres, único */
  code: string;
  /** máximo 20 caracteres */
  phone: string;
  /** entero de 0 a 100; si no se envía, el servidor usa 0 */
  coverage_percentage?: number;
}
