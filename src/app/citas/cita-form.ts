import { FormBuilder, Validators } from '@angular/forms';

import { fechaHora, textoRequerido } from '../core/forms/validators';

/**
 * Formulario de citas con las reglas de tu AppointmentRequest:
 * paciente obligatorio, fecha y hora obligatorias, reason 3-255, status de la lista, notes opcional.
 */
export function crearFormCita(fb: FormBuilder) {
  return fb.nonNullable.group({
    patient_id: fb.control<number | null>(null, Validators.required),
    appointment_date: ['', [Validators.required, fechaHora]],
    reason: ['', [Validators.required, textoRequerido, Validators.minLength(3), Validators.maxLength(255)]],
    status: ['pending', Validators.required],
    notes: [''],
  });
}
