import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AlertController,
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonFooter,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenuButton,
  IonSearchbar,
  IonSpinner,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, trash } from 'ionicons/icons';

import { ApiError } from '../core/api/api-error';
import { Pagination } from '../core/api/api.models';
import { Doctor } from '../core/models/doctor';
import { DoctorService } from '../core/services/doctor.service';

@Component({
  selector: 'app-doctor-list',
  templateUrl: 'doctor-list.page.html',
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
    IonFooter,
    IonSearchbar,
  ],
})
export class DoctorListPage {
  private readonly doctores = inject(DoctorService);
  private readonly alertas = inject(AlertController);
  private readonly toasts = inject(ToastController);

  readonly items = signal<Doctor[]>([]);
  readonly pagination = signal<Pagination | null>(null);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly busqueda = signal('');

  /** Filtra en pantalla, solo entre los registros de la página cargada. */
  readonly visibles = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    if (texto === '') {
      return this.items();
    }
    return this.items().filter(
      (d) => d.name.toLowerCase().includes(texto) || d.specialty.toLowerCase().includes(texto),
    );
  });

  private pagina = 1;

  constructor() {
    addIcons({ add, trash });
  }

  // Ionic conserva esta pantalla al navegar; recargamos cada vez que se vuelve a mostrar.
  ionViewWillEnter() {
    this.cargar(this.pagina);
  }

  cargar(pagina: number) {
    this.cargando.set(true);
    this.error.set(null);
    this.doctores.list(pagina).subscribe({
      next: (page) => {
        this.pagina = page.pagination.current_page;
        this.items.set(page.items);
        this.pagination.set(page.pagination);
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

  anterior() {
    this.cargar(this.pagina - 1);
  }

  siguiente() {
    this.cargar(this.pagina + 1);
  }

  inicial(nombre: string): string {
    // Se salta el "Dr." / "Dra." para que el avatar muestre la inicial del nombre.
    const limpio = nombre.replace(/^(dra?\.?\s+)/i, '').trim();
    return limpio.charAt(0).toUpperCase();
  }

  async confirmarBorrado(doctor: Doctor, evento: Event) {
    evento.preventDefault();
    evento.stopPropagation();
    const alerta = await this.alertas.create({
      header: 'Eliminar doctor',
      message: `¿Eliminar a "${doctor.name}"? Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => this.borrar(doctor) },
      ],
    });
    await alerta.present();
  }

  private borrar(doctor: Doctor) {
    this.doctores.remove(doctor.id).subscribe({
      next: () => {
        this.mostrarToast('Doctor eliminado', 'success');
        const sigueHabiendo = this.items().length > 1 || this.pagina === 1;
        this.cargar(sigueHabiendo ? this.pagina : this.pagina - 1);
      },
      error: (e: ApiError) => {
        // 409 (tiene pacientes asignados) y demás errores: se muestra el mensaje del servidor tal cual.
        this.mostrarToast(e.status === 404 ? 'El doctor ya no existe' : e.message, 'danger');
        this.cargar(this.pagina);
      },
    });
  }

  private async mostrarToast(message: string, color: 'success' | 'danger') {
    const position = color === 'danger' ? 'top' : 'bottom';
    const toast = await this.toasts.create({ message, color, duration: 4000, position });
    await toast.present();
  }
}
