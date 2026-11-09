import type { Patient } from './patient';

export type EstadoCita = 'pending' | 'completed' | 'cancelled';

export interface Appointment {
  id: number;
  patient_id: number;
  patient?: Patient;
  /** YYYY-MM-DD HH:mm:ss */
  appointment_date: string;
  reason: string;
  status: EstadoCita;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppointmentPayload {
  patient_id: number;
  /** YYYY-MM-DD HH:mm:ss */
  appointment_date: string;
  /** 3-255 caracteres */
  reason: string;
  /** si no se envía, el servidor usa 'pending' */
  status?: EstadoCita;
  notes?: string | null;
}
