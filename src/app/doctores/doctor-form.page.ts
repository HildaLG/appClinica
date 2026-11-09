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
import { DoctorPayload } from '../core/models/doctor';
import { DoctorService } from '../core/services/doctor.service';
import { FieldErrorComponent } from '../shared/field-error/field-error.component';
import { crearFormDoctor } from './doctor-form';

/** Sirve para /doctores/nuevo (sin id) y /doctores/:id/editar (con id). */
@Component({
  selector: 'app-doctor-form',
  templateUrl: 'doctor-form.page.html',
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
export class DoctorFormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly doctores = inject(DoctorService);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastController);

  /** Parámetro de ruta :id (llega por withComponentInputBinding). */
  readonly id = input<string>();
  readonly esEdicion = computed(() => this.id() !== undefined);

  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly errorGeneral = signal<string | null>(null);

  readonly form = crearFormDoctor(this.fb);

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
    this.doctores.get(numero).subscribe({
      next: (d) => {
        this.form.setValue({
          name: d.name,
          email: d.email,
          phone: d.phone,
          specialty: d.specialty,
          license_number: d.license_number,
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
    const { name, email, phone, specialty, license_number } = this.form.getRawValue();
    const payload: DoctorPayload = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      specialty: specialty.trim(),
      license_number: license_number.trim(),
    };
    const id = this.id();
    const peticion = id === undefined ? this.doctores.create(payload) : this.doctores.update(Number(id), payload);

    this.guardando.set(true);
    peticion.subscribe({
      next: async () => {
        this.guardando.set(false);
        await this.avisarExito(id === undefined ? 'Doctor creado' : 'Doctor actualizado');
        await this.router.navigateByUrl('/doctores');
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
    this.router.navigate(['/no-encontrado'], { queryParams: { volver: '/doctores' }, replaceUrl: true });
  }

  private async avisarExito(message: string) {
    const toast = await this.toasts.create({ message, color: 'success', duration: 2500, position: 'bottom' });
    await toast.present();
  }
}
