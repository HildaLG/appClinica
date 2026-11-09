import { FormBuilder, Validators } from '@angular/forms';

import { precio, textoRequerido } from '../core/forms/validators';

/**
 * Formulario de medicamentos con las reglas de tu MedicationRequest:
 * name 3-100, description opcional, presentation máx. 50, price 0 a 999999.99.
 */
export function crearFormMedicamento(fb: FormBuilder) {
  return fb.nonNullable.group({
    name: ['', [Validators.required, textoRequerido, Validators.minLength(3), Validators.maxLength(100)]],
    description: [''],
    presentation: ['', [Validators.required, textoRequerido, Validators.maxLength(50)]],
    price: ['', [Validators.required, precio]],
  });
}
