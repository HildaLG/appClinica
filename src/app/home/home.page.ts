import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenuButton,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  calendarOutline,
  medicalOutline,
  medkitOutline,
  peopleOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';
import { forkJoin } from 'rxjs';

import { ApiError } from '../core/api/api-error';
import { todasLasPaginas } from '../core/api/todas-las-paginas';
import { AppointmentService } from '../core/services/appointment.service';
import { DoctorService } from '../core/services/doctor.service';
import { PatientService } from '../core/services/patient.service';
import { OPCIONES_MENU } from '../shared/menu';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  imports: [
    RouterLink,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonMenuButton,
    IonTitle,
    IonToolbar,
  ],
})
export class HomePage {
  private readonly doctores = inject(DoctorService);
  private readonly pacientes = inject(PatientService);
  private readonly citas = inject(AppointmentService);

  /** Las secciones del menú, menos "Inicio". */
  readonly secciones = OPCIONES_MENU.filter((o) => o.url !== '/home');

  readonly totalDoctores = signal<number | null>(null);
  readonly totalPacientes = signal<number | null>(null);
  readonly citasPendientes = signal<number | null>(null);
  readonly error = signal<string | null>(null);

  constructor() {
    addIcons({ calendarOutline, peopleOutline, medkitOutline, medicalOutline, shieldCheckmarkOutline });
  }

  // Ionic conserva esta pantalla al navegar; recargamos los números cada vez que se vuelve a mostrar.
  ionViewWillEnter() {
    this.cargar();
  }

  cargar() {
    this.error.set(null);
    forkJoin({
      doctores: this.doctores.list(1),
      pacientes: this.pacientes.list(1),
      citas: todasLasPaginas((p) => this.citas.list(p)),
    }).subscribe({
      next: ({ doctores, pacientes, citas }) => {
        this.totalDoctores.set(doctores.pagination.total);
        this.totalPacientes.set(pacientes.pagination.total);
        this.citasPendientes.set(citas.filter((c) => c.status === 'pending').length);
      },
      error: (e: ApiError) => this.error.set(e.message),
    });
  }

  saludo(): string {
    const hora = new Date().getHours();
    if (hora < 12) return 'Buenos días';
    if (hora < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }
}
