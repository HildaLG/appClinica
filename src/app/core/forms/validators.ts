import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Falla con `required` si el texto está vacío o solo tiene espacios (Laravel recorta los espacios). */
export function textoRequerido(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;
  return typeof valor === 'string' && valor.trim() === '' ? { required: true } : null;
}

/** Acepta solo fechas reales con formato YYYY-MM-DD (igual que `date_format:Y-m-d` de tu API). */
export function fechaIso(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;
  if (!valor) {
    return null; // lo cubre Validators.required
  }
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
  if (!m) {
    return { fechaIso: true };
  }
  const [anio, mes, dia] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const fecha = new Date(anio, mes - 1, dia);
  const esReal = fecha.getFullYear() === anio && fecha.getMonth() === mes - 1 && fecha.getDate() === dia;
  return esReal ? null : { fechaIso: true };
}

/**
 * La fecha del control no puede ser anterior a la de otro control del mismo grupo
 * (igual que `after_or_equal` de tu API: la misma fecha es válida).
 */
export function fechaNoAnterior(otroControl: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const mia = control.value;
    const otra = control.parent?.get(otroControl)?.value;
    const formato = /^\d{4}-\d{2}-\d{2}$/;
    if (!formato.test(mia ?? '') || !formato.test(otra ?? '')) {
      return null; // los formatos inválidos los reporta fechaIso
    }
    return mia < otra ? { fechaAnterior: true } : null;
  };
}

/** Solo números positivos con hasta 2 decimales (columna decimal(8,2) de tu tabla medications). */
export function precio(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;
  if (valor === null || valor === '' || valor === undefined) {
    return null; // lo cubre Validators.required
  }
  const numero = Number(valor);
  if (Number.isNaN(numero) || numero < 0 || numero > 999999.99) {
    return { precio: true };
  }
  return /^\d+(\.\d{1,2})?$/.test(String(valor)) ? null : { precio: true };
}

/** Fecha de hoy en hora local, como YYYY-MM-DD. Con `dias` se suma ese número de días. */
export function hoyIso(dias = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  const dos = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
}
/** Valida el valor de un campo datetime-local (YYYY-MM-DDTHH:mm). */
export function fechaHora(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;
  if (!valor) {
    return null; // lo cubre Validators.required
  }
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(valor);
  if (!m) {
    return { fechaHora: true };
  }
  const [anio, mes, dia, hora, min] = m.slice(1).map(Number);
  const f = new Date(anio, mes - 1, dia, hora, min);
  const esReal =
    f.getFullYear() === anio && f.getMonth() === mes - 1 && f.getDate() === dia && f.getHours() === hora;
  return esReal ? null : { fechaHora: true };
}

/** Del formato del navegador (2026-11-03T11:00) al de la API (2026-11-03 11:00:00). */
export function aFormatoApi(local: string): string {
  return `${local.replace('T', ' ')}:00`;
}

/** Del formato de la API (2026-11-03 11:00:00) al del navegador (2026-11-03T11:00). */
export function aFormatoLocal(api: string): string {
  return api.slice(0, 16).replace(' ', 'T');
}
