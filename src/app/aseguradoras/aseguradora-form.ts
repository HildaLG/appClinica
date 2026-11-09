import { FormBuilder, Validators } from '@angular/forms';

import { textoRequerido } from '../core/forms/validators';

/**
 * Formulario de aseguradoras con las reglas de tu API:
 * name 3-100, code obligatorio (máx. 50, único), phone obligatorio (máx. 20),
 * coverage_percentage entero de 0 a 100.
 */
export function crearFormAseguradora(fb: FormBuilder) {
  return fb.nonNullable.group({
    name: ['', [Validators.required, textoRequerido, Validators.minLength(3), Validators.maxLength(100)]],
    code: ['', [Validators.required, textoRequerido, Validators.maxLength(50)]],
    phone: ['', [Validators.required, textoRequerido, Validators.maxLength(20)]],
    coverage_percentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
  });
}
