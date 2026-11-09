import type { Patient } from './patient';

export interface Doctor {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  license_number: string;
  /** Solo viene en el detalle (GET /doctor/{id}). */
  patients?: Patient[];
  created_at: string;
  updated_at: string;
}

/** Doctor tal como aparece anidado en un paciente. */
export type DoctorResumen = Omit<Doctor, 'patients'>;

export interface DoctorPayload {
  /** 3-100 caracteres */
  name: string;
  /** correo válido, máximo 150, único */
  email: string;
  /** máximo 20 caracteres */
  phone: string;
  /** 3-100 caracteres */
  specialty: string;
  /** máximo 50 caracteres, única */
  license_number: string;
}
