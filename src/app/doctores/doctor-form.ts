import { FormBuilder, Validators } from '@angular/forms';

import { textoRequerido } from '../core/forms/validators';

/**
 * Formulario de doctores con las reglas de tu DoctorRequest:
 * name 3-100, email válido (máx. 150, único), phone máx. 20,
 * specialty 3-100, license_number máx. 50 (único).
 */
export function crearFormDoctor(fb: FormBuilder) {
  return fb.nonNullable.group({
    name: ['', [Validators.required, textoRequerido, Validators.minLength(3), Validators.maxLength(100)]],
    email: ['', [Validators.required, textoRequerido, Validators.email, Validators.maxLength(150)]],
    phone: ['', [Validators.required, textoRequerido, Validators.maxLength(20)]],
    specialty: ['', [Validators.required, textoRequerido, Validators.minLength(3), Validators.maxLength(100)]],
    license_number: ['', [Validators.required, textoRequerido, Validators.maxLength(50)]],
  });
}
