import type { Appointment } from './appointment';
import type { DoctorResumen } from './doctor';
import type { MedicationPatient } from './medication-patient';

export type Genero = 'M' | 'F' | 'O';

export interface Patient {
  id: number;
  doctor_id: number;
  doctor?: DoctorResumen;
  name: string;
  email: string;
  phone: string;
  /** YYYY-MM-DD */
  birthdate: string;
  gender: Genero;
  address: string | null;
  /** Recetas del paciente; solo vienen en el detalle y al crear. */
  prescriptions?: MedicationPatient[];
  /** Citas del paciente; solo vienen en el detalle y al crear. */
  appointments?: Appointment[];
  created_at: string;
  updated_at: string;
}

/** Un medicamento que se asigna al crear un paciente. */
export interface MedicationAssignment {
  medication_id: number;
  /** máximo 50 caracteres */
  dosage: string;
  /** máximo 50 caracteres */
  frequency: string;
  /** YYYY-MM-DD */
  start_date: string;
  /** YYYY-MM-DD, igual o posterior a start_date */
  end_date?: string | null;
}

export interface PatientPayload {
  doctor_id: number;
  /** 3-100 caracteres */
  name: string;
  /** correo válido, máximo 150, único */
  email: string;
  /** máximo 20 caracteres */
  phone: string;
  /** YYYY-MM-DD */
  birthdate: string;
  gender: Genero;
  /** máximo 255 caracteres */
  address?: string | null;
  /** Solo se acepta al crear. */
  medications?: MedicationAssignment[];
}

/** Edición: el servidor no modifica los medicamentos. */
export type PatientUpdatePayload = Omit<PatientPayload, 'medications'>;
