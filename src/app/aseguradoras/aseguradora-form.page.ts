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
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular';

import { ApiError } from '../core/api/api-error';
import { applyServerErrors } from '../core/forms/apply-server-errors';
import { InsurancePayload } from '../core/models/insurance';
import { InsuranceService } from '../core/services/insurance.service';
import { FieldErrorComponent } from '../shared/field-error/field-error.component';
import { crearFormAseguradora } from './aseguradora-form';

/** Sirve para /aseguradoras/nueva (sin id) y /aseguradoras/:id/editar (con id). */
@Component({
  selector: 'app-aseguradora-form',
  templateUrl: 'aseguradora-form.page.html',
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
    IonButton,
    IonSpinner,
  ],
})
export class AseguradoraFormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly aseguradoras = inject(InsuranceService);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastController);

  /** Parámetro de ruta :id (llega por withComponentInputBinding). */
  readonly id = input<string>();
  readonly esEdicion = computed(() => this.id() !== undefined);

  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly errorGeneral = signal<string | null>(null);

  readonly form = crearFormAseguradora(this.fb);

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
    this.aseguradoras.get(numero).subscribe({
      next: (a) => {
        this.form.setValue({
          name: a.name,
          code: a.code,
          phone: a.phone,
          coverage_percentage: a.coverage_percentage,
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
    const { name, code, phone, coverage_percentage } = this.form.getRawValue();
    const payload: InsurancePayload = {
      name: name.trim(),
      code: code.trim(),
      phone: phone.trim(),
      coverage_percentage: Number(coverage_percentage),
    };
    const id = this.id();
    const peticion =
      id === undefined ? this.aseguradoras.create(payload) : this.aseguradoras.update(Number(id), payload);

    this.guardando.set(true);
    peticion.subscribe({
      next: async () => {
        this.guardando.set(false);
        await this.avisarExito(id === undefined ? 'Aseguradora creada' : 'Aseguradora actualizada');
        await this.router.navigateByUrl('/aseguradoras');
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
    this.router.navigate(['/no-encontrado'], { queryParams: { volver: '/aseguradoras' }, replaceUrl: true });
  }

  private async avisarExito(message: string) {
    const toast = await this.toasts.create({ message, color: 'success', duration: 2500, position: 'bottom' });
    await toast.present();
  }
}
