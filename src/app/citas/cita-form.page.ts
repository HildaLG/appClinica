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
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTextarea,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular';
import { forkJoin, of } from 'rxjs';

import { ApiError } from '../core/api/api-error';
import { todasLasPaginas } from '../core/api/todas-las-paginas';
import { applyServerErrors } from '../core/forms/apply-server-errors';
import { aFormatoApi, aFormatoLocal } from '../core/forms/validators';
import { AppointmentPayload, EstadoCita } from '../core/models/appointment';
import { Patient } from '../core/models/patient';
import { AppointmentService } from '../core/services/appointment.service';
import { PatientService } from '../core/services/patient.service';
import { FieldErrorComponent } from '../shared/field-error/field-error.component';
import { crearFormCita } from './cita-form';

/** Sirve para /citas/nueva (sin id) y /citas/:id/editar (con id). */
@Component({
  selector: 'app-cita-form',
  templateUrl: 'cita-form.page.html',
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
    IonSelect,
    IonSelectOption,
    IonButton,
    IonSpinner,
  ],
})
export class CitaFormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly citas = inject(AppointmentService);
  private readonly pacientes = inject(PatientService);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastController);

  /** Parámetro de ruta :id (llega por withComponentInputBinding). */
  readonly id = input<string>();
  readonly esEdicion = computed(() => this.id() !== undefined);

  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly errorGeneral = signal<string | null>(null);

  readonly pacientesOpciones = signal<Patient[]>([]);

  readonly form = crearFormCita(this.fb);

  ngOnInit() {
    const id = this.id();
    let numero: number | null = null;
    if (id !== undefined) {
      numero = Number(id);
      if (!Number.isInteger(numero) || numero < 1) {
        this.irANoEncontrado();
        return;
      }
    }

    this.cargando.set(true);
    forkJoin({
      pacientes: todasLasPaginas((p) => this.pacientes.list(p)),
      cita: numero === null ? of(null) : this.citas.get(numero),
    }).subscribe({
      next: ({ pacientes, cita }) => {
        this.pacientesOpciones.set(pacientes);
        if (cita) {
          this.form.setValue({
            patient_id: cita.patient_id,
            appointment_date: aFormatoLocal(cita.appointment_date),
            reason: cita.reason,
            status: cita.status,
            notes: cita.notes ?? '',
          });
        }
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
    const { patient_id, appointment_date, reason, status, notes } = this.form.getRawValue();
    if (patient_id === null) {
      return;
    }
    const texto = notes.trim();
    const payload: AppointmentPayload = {
      patient_id,
      appointment_date: aFormatoApi(appointment_date),
      reason: reason.trim(),
      status: status as EstadoCita,
      notes: texto === '' ? null : texto,
    };
    const id = this.id();
    const peticion = id === undefined ? this.citas.create(payload) : this.citas.update(Number(id), payload);

    this.guardando.set(true);
    peticion.subscribe({
      next: async () => {
        this.guardando.set(false);
        await this.avisarExito(id === undefined ? 'Cita creada' : 'Cita actualizada');
        await this.router.navigateByUrl('/citas');
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
    this.router.navigate(['/no-encontrado'], { queryParams: { volver: '/citas' }, replaceUrl: true });
  }

  private async avisarExito(message: string) {
    const toast = await this.toasts.create({ message, color: 'success', duration: 2500, position: 'bottom' });
    await toast.present();
  }
}
