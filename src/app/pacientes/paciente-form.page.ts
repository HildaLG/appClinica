
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, trash } from 'ionicons/icons';
import { forkJoin, of } from 'rxjs';

import { ApiError } from '../core/api/api-error';
import { todasLasPaginas } from '../core/api/todas-las-paginas';
import { applyServerErrors } from '../core/forms/apply-server-errors';
import { Doctor } from '../core/models/doctor';
import { Medication } from '../core/models/medication';
import { MedicationPatient } from '../core/models/medication-patient';
import { Genero, MedicationAssignment, PatientPayload } from '../core/models/patient';
import { DoctorService } from '../core/services/doctor.service';
import { MedicationService } from '../core/services/medication.service';
import { PatientService } from '../core/services/patient.service';
import { FieldErrorComponent } from '../shared/field-error/field-error.component';
import { crearFilaReceta, crearFormPaciente } from './paciente-form';

/** Sirve para /pacientes/nuevo (sin id) y /pacientes/:id/editar (con id). */
@Component({
  selector: 'app-paciente-form',
  templateUrl: 'paciente-form.page.html',
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
    IonSelect,
    IonSelectOption,
    IonButton,
    IonIcon,
    IonLabel,
    IonSpinner,
  ],
})
export class PacienteFormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly pacientes = inject(PatientService);
  private readonly doctores = inject(DoctorService);
  private readonly medicamentos = inject(MedicationService);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastController);

  /** Parámetro de ruta :id (llega por withComponentInputBinding). */
  readonly id = input<string>();
  readonly esEdicion = computed(() => this.id() !== undefined);

  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly errorGeneral = signal<string | null>(null);

  /** Opciones de los selectores. */
  readonly doctoresOpciones = signal<Doctor[]>([]);
  readonly medicamentosOpciones = signal<Medication[]>([]);

  /** Recetas del paciente, solo para mostrarlas en edición (el servidor no las modifica). */
  readonly recetas = signal<MedicationPatient[]>([]);

  readonly form = crearFormPaciente(this.fb);

  constructor() {
    addIcons({ add, trash });
  }

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
      doctores: todasLasPaginas((p) => this.doctores.list(p)),
      // El catálogo de medicamentos solo hace falta al crear.
      medicamentos: numero === null ? todasLasPaginas((p) => this.medicamentos.list(p)) : of([] as Medication[]),
      paciente: numero === null ? of(null) : this.pacientes.get(numero),
    }).subscribe({
      next: ({ doctores, medicamentos, paciente }) => {
        this.doctoresOpciones.set(doctores);
        this.medicamentosOpciones.set(medicamentos);
        if (paciente) {
          // patchValue (no setValue): el grupo también tiene la lista `medications`.
          this.form.patchValue({
            doctor_id: paciente.doctor_id,
            name: paciente.name,
            email: paciente.email,
            phone: paciente.phone,
            birthdate: paciente.birthdate,
            gender: paciente.gender,
            address: paciente.address ?? '',
          });
          this.recetas.set(paciente.prescriptions ?? []);
        }
        this.cargando.set(false);
      },
      error: (e: ApiError) => this.alFallar(e),
    });
  }

  agregarMedicamento() {
    this.form.controls.medications.push(crearFilaReceta(this.fb));
  }

  quitarMedicamento(indice: number) {
    this.form.controls.medications.removeAt(indice);
  }

  /** Un medicamento no puede repetirse en la misma lista (tu API lo rechaza con `distinct`). */
  estaElegido(medicamentoId: number, indiceActual: number): boolean {
    return this.form.controls.medications.controls.some(
      (fila, i) => i !== indiceActual && fila.controls.medication_id.value === medicamentoId,
    );
  }

  guardar() {
    this.errorGeneral.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { doctor_id, name, email, phone, birthdate, gender, address, medications } = this.form.getRawValue();
    if (doctor_id === null) {
      return;
    }
    const direccion = address.trim();
    const payload: PatientPayload = {
      doctor_id,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      birthdate,
      gender: gender as Genero,
      address: direccion === '' ? null : direccion,
    };

    const id = this.id();
    // Los medicamentos solo se envían al crear; en edición el servidor no los acepta.
    if (id === undefined && medications.length > 0) {
      payload.medications = medications.map((m): MedicationAssignment => ({
        medication_id: m.medication_id as number,
        dosage: m.dosage.trim(),
        frequency: m.frequency.trim(),
        start_date: m.start_date,
        end_date: m.end_date === '' ? null : m.end_date,
      }));
    }

    const peticion = id === undefined ? this.pacientes.create(payload) : this.pacientes.update(Number(id), payload);

    this.guardando.set(true);
    peticion.subscribe({
      next: async () => {
        this.guardando.set(false);
        await this.avisarExito(id === undefined ? 'Paciente creado' : 'Paciente actualizado');
        await this.router.navigateByUrl('/pacientes');
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
      // Una clave como `medications.0.dosage` llega al control de esa fila de la lista.
      const sueltos = applyServerErrors(this.form, e.fieldErrors);
      this.errorGeneral.set(sueltos.length > 0 ? sueltos.join(' ') : null);
    } else {
      this.errorGeneral.set(e.message);
    }
  }

  private irANoEncontrado() {
    this.router.navigate(['/no-encontrado'], { queryParams: { volver: '/pacientes' }, replaceUrl: true });
  }

  private async avisarExito(message: string) {
    const toast = await this.toasts.create({ message, color: 'success', duration: 2500, position: 'bottom' });
    await toast.present();
  }
}
