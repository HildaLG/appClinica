import type { Medication } from './medication';

export interface MedicationPatient {
  id: number;
  patient_id: number;
  medication_id: number;
  medication?: Medication;
  dosage: string;
  frequency: string;
  /** YYYY-MM-DD */
  start_date: string;
  /** YYYY-MM-DD; null si el tratamiento no tiene fecha de fin */
  end_date: string | null;
}
