import { FormBuilder, Validators } from '@angular/forms';

import { fechaIso, fechaNoAnterior, hoyIso, textoRequerido } from '../core/forms/validators';

/**
 * Una fila de medicamento (una receta) con las reglas de tu PatientRequest:
 * medication_id obligatorio, dosage y frequency máx. 50, start_date obligatoria,
 * end_date opcional y no anterior a start_date.
 */
export function crearFilaReceta(fb: FormBuilder) {
  const fila = fb.nonNullable.group({
    medication_id: fb.control<number | null>(null, Validators.required),
    dosage: ['', [Validators.required, textoRequerido, Validators.maxLength(50)]],
    frequency: ['', [Validators.required, textoRequerido, Validators.maxLength(50)]],
    start_date: [hoyIso(), [Validators.required, fechaIso]],
    end_date: ['', [fechaIso, fechaNoAnterior('start_date')]],
  });
  // Al cambiar el inicio hay que volver a comprobar que el fin no sea anterior.
  fila.controls.start_date.valueChanges.subscribe(() => fila.controls.end_date.updateValueAndValidity());
  return fila;
}

/**
 * Formulario de pacientes con las reglas de tu PatientRequest:
 * doctor obligatorio, name 3-100, email válido (máx. 150, único), phone máx. 20,
 * birthdate YYYY-MM-DD, gender M/F/O, address opcional (máx. 255).
 * `medications` es la lista de recetas; solo se usa al crear.
 */
export function crearFormPaciente(fb: FormBuilder) {
  return fb.nonNullable.group({
    doctor_id: fb.control<number | null>(null, Validators.required),
    name: ['', [Validators.required, textoRequerido, Validators.minLength(3), Validators.maxLength(100)]],
    email: ['', [Validators.required, textoRequerido, Validators.email, Validators.maxLength(150)]],
    phone: ['', [Validators.required, textoRequerido, Validators.maxLength(20)]],
    birthdate: ['', [Validators.required, fechaIso]],
    gender: ['F', Validators.required],
    address: ['', Validators.maxLength(255)],
    medications: fb.array([] as ReturnType<typeof crearFilaReceta>[]),
  });
}
