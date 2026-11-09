import { AbstractControl, FormGroup } from '@angular/forms';

import { ValidationErrors } from '../api/api.models';

/**
 * Marca cada control con el mensaje que mandó tu API en un 422.
 * Las claves de arreglos como `medications.0.dosage` se asignan al control `medications`.
 * Devuelve los mensajes de claves que no corresponden a ningún control.
 */
export function applyServerErrors(form: FormGroup, fieldErrors: ValidationErrors): string[] {
  const sinControl: string[] = [];
  const porControl = new Map<AbstractControl, string[]>();

  for (const [campo, mensajes] of Object.entries(fieldErrors)) {
    const control = form.get(campo) ?? form.get(campo.split('.')[0]);
    if (!control) {
      sinControl.push(...mensajes);
      continue;
    }
    const acumulados = porControl.get(control) ?? [];
    for (const mensaje of mensajes) {
      if (!acumulados.includes(mensaje)) {
        acumulados.push(mensaje);
      }
    }
    porControl.set(control, acumulados);
  }

  for (const [control, mensajes] of porControl) {
    control.setErrors({ server: mensajes.join(' ') });
    control.markAsTouched();
  }
  return sinControl;
}
