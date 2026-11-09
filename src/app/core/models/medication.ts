export interface Medication {
  id: number;
  name: string;
  description: string | null;
  presentation: string;
  /** Laravel devuelve los decimales como texto, por ejemplo "45.50". */
  price: string;
  created_at: string;
  updated_at: string;
}

export interface MedicationPayload {
  /** 3-100 caracteres */
  name: string;
  description?: string | null;
  /** máximo 50 caracteres */
  presentation: string;
  /** número de 0 a 999999.99 */
  price: number;
}
