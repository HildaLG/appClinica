import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AlertController,
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenuButton,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, checkmarkCircleOutline, closeCircleOutline, trash } from 'ionicons/icons';

import { ApiError } from '../core/api/api-error';
import { todasLasPaginas } from '../core/api/todas-las-paginas';
import { Appointment, EstadoCita } from '../core/models/appointment';
import { AppointmentService } from '../core/services/appointment.service';

const ETIQUETAS: Record<EstadoCita, string> = {
  pending: 'Pendiente',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

@Component({
  selector: 'app-cita-list',
  templateUrl: 'cita-list.page.html',
  imports: [
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonList,
    IonMenuButton,
    IonItem,
    IonLabel,
    IonFab,
    IonFabButton,
    IonSpinner,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
  ],
})
export class CitaListPage {
  private readonly citasApi = inject(AppointmentService);
  private readonly alertas = inject(AlertController);
  private readonly toasts = inject(ToastController);

  readonly items = signal<Appointment[]>([]);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly busqueda = signal('');
  readonly pestana = signal<EstadoCita>('pending');

  /** Cuántas citas hay en cada estado, para mostrarlo en las pestañas. */
  readonly conteo = computed(() => {
    const total: Record<EstadoCita, number> = { pending: 0, completed: 0, cancelled: 0 };
    for (const c of this.items()) {
      total[c.status] += 1;
    }
    return total;
  });

  /** Citas de la pestaña activa, filtradas por el texto del buscador (paciente o motivo). */
  readonly visibles = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    return this.items()
      .filter((c) => c.status === this.pestana())
      .filter(
        (c) =>
          texto === '' ||
          c.reason.toLowerCase().includes(texto) ||
          (c.patient?.name ?? '').toLowerCase().includes(texto),
      );
  });

  constructor() {
    addIcons({ add, trash, checkmarkCircleOutline, closeCircleOutline });
  }

  // Ionic conserva esta pantalla al navegar; recargamos cada vez que se vuelve a mostrar.
  ionViewWillEnter() {
    this.cargar();
  }

  /** Las pestañas necesitan todas las citas, así que se leen todas las páginas. */
  cargar() {
    this.cargando.set(true);
    this.error.set(null);
    todasLasPaginas((p) => this.citasApi.list(p)).subscribe({
      next: (citas) => {
        this.items.set(citas);
        this.cargando.set(false);
      },
      error: (e: ApiError) => {
        this.error.set(e.message);
        this.cargando.set(false);
      },
    });
  }

  buscar(evento: Event) {
    const valor = (evento as CustomEvent).detail?.value ?? '';
    this.busqueda.set(String(valor));
  }

  cambiarPestana(evento: Event) {
    const valor = (evento as CustomEvent).detail?.value as EstadoCita | undefined;
    if (valor) {
      this.pestana.set(valor);
    }
  }

  etiqueta(estado: EstadoCita): string {
    return ETIQUETAS[estado];
  }

  /** "2026-10-30 10:30:00" -> "30/10/2026 10:30" */
  fecha(valor: string): string {
    const [dia, hora] = valor.split(' ');
    const [anio, mes, d] = dia.split('-');
    return `${d}/${mes}/${anio} ${hora.slice(0, 5)}`;
  }

  /** Marca una cita como completada o cancelada con un PATCH que solo manda `status`. */
  async cambiarEstado(cita: Appointment, estado: EstadoCita, evento: Event) {
    evento.preventDefault();
    evento.stopPropagation();
    this.citasApi.update(cita.id, { status: estado }).subscribe({
      next: () => {
        this.mostrarToast(`Cita marcada como ${ETIQUETAS[estado].toLowerCase()}`, 'success');
        this.cargar();
      },
      error: (e: ApiError) => {
        this.mostrarToast(e.status === 404 ? 'La cita ya no existe' : e.message, 'danger');
        this.cargar();
      },
    });
  }

  async confirmarBorrado(cita: Appointment, evento: Event) {
    evento.preventDefault();
    evento.stopPropagation();
    const alerta = await this.alertas.create({
      header: 'Eliminar cita',
      message: `¿Eliminar la cita de ${cita.patient?.name ?? 'este paciente'}? Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => this.borrar(cita) },
      ],
    });
    await alerta.present();
  }

  private borrar(cita: Appointment) {
    this.citasApi.remove(cita.id).subscribe({
      next: () => {
        this.mostrarToast('Cita eliminada', 'success');
        this.cargar();
      },
      error: (e: ApiError) => {
        this.mostrarToast(e.status === 404 ? 'La cita ya no existe' : e.message, 'danger');
        this.cargar();
      },
    });
  }

  private async mostrarToast(message: string, color: 'success' | 'danger') {
    const position = color === 'danger' ? 'top' : 'bottom';
    const toast = await this.toasts.create({ message, color, duration: 4000, position });
    await toast.present();
  }
}
