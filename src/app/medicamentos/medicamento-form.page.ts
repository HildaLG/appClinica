import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonSpinner,
  IonTextarea,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular';

import { ApiError } from '../core/api/api-error';
import { applyServerErrors } from '../core/forms/apply-server-errors';
import { MedicationPayload } from '../core/models/medication';
import { MedicationService } from '../core/services/medication.service';
import { FieldErrorComponent } from '../shared/field-error/field-error.component';
import { crearFormMedicamento } from './medicamento-form';

/** Sirve para /medicamentos/nuevo (sin id) y /medicamentos/:id/editar (con id). */
@Component({
  selector: 'app-medicamento-form',
  templateUrl: 'medicamento-form.page.html',
  imports: [
    ReactiveFormsModule,
    FieldErrorComponent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent,
    IonItem,
    IonInput,
    IonTextarea,
    IonButton,
    IonSpinner,
  ],
})
export class MedicamentoFormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly medicamentos = inject(MedicationService);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastController);

  /** Parámetro de ruta :id (llega por withComponentInputBinding). */
  readonly id = input<string>();
  readonly esEdicion = computed(() => this.id() !== undefined);

  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly errorGeneral = signal<string | null>(null);

  readonly form = crearFormMedicamento(this.fb);

  ngOnInit() {
    const id = this.id();
    if (id === undefined) {
      return;
    }
    const numero = Number(id);
    if (!Number.isInteger(numero) || numero < 1) {
      this.irANoEncontrado();
      return;
    }
    this.cargando.set(true);
    this.medicamentos.get(numero).subscribe({
      next: (m) => {
        this.form.setValue({
          name: m.name,
          description: m.description ?? '',
          presentation: m.presentation,
          price: String(m.price),
        });
        this.cargando.set(false);
      },
      error: (e: ApiError) => this.alFallar(e),
    });
  }

  guardar() {
    this.errorGeneral.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, description, presentation, price } = this.form.getRawValue();
    const texto = description.trim();
    const payload: MedicationPayload = {
      name: name.trim(),
      description: texto === '' ? null : texto,
      presentation: presentation.trim(),
      price: Number(price),
    };
    const id = this.id();
    const peticion =
      id === undefined ? this.medicamentos.create(payload) : this.medicamentos.update(Number(id), payload);

    this.guardando.set(true);
    peticion.subscribe({
      next: async () => {
        this.guardando.set(false);
        await this.avisarExito(id === undefined ? 'Medicamento creado' : 'Medicamento actualizado');
        await this.router.navigateByUrl('/medicamentos');
      },
      error: (e: ApiError) => {
        this.guardando.set(false);
        this.alFallar(e);
      },
    });
  }

  private alFallar(e: ApiError) {
    this.cargando.set(false);
    if (e.status === 404) {
      this.irANoEncontrado();
    } else if (e.status === 422 && e.fieldErrors) {
      const sueltos = applyServerErrors(this.form, e.fieldErrors);
      this.errorGeneral.set(sueltos.length > 0 ? sueltos.join(' ') : null);
    } else {
      this.errorGeneral.set(e.message);
    }
  }

  private irANoEncontrado() {
    this.router.navigate(['/no-encontrado'], { queryParams: { volver: '/medicamentos' }, replaceUrl: true });
  }

  private async avisarExito(message: string) {
    const toast = await this.toasts.create({ message, color: 'success', duration: 2500, position: 'bottom' });
    await toast.present();
  }
}
