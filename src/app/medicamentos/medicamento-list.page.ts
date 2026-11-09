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
import { Medication } from '../core/models/medication';
import { MedicationService } from '../core/services/medication.service';

@Component({
  selector: 'app-medicamento-list',
  templateUrl: 'medicamento-list.page.html',
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
export class MedicamentoListPage {
  private readonly medicamentos = inject(MedicationService);
  private readonly alertas = inject(AlertController);
  private readonly toasts = inject(ToastController);

  readonly items = signal<Medication[]>([]);
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
      (m) => m.name.toLowerCase().includes(texto) || m.presentation.toLowerCase().includes(texto),
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
    this.medicamentos.list(pagina).subscribe({
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
    return nombre.trim().charAt(0).toUpperCase();
  }

  /** El precio llega como texto ("45.50"); se muestra con signo de pesos y dos decimales. */
  precio(valor: string): string {
    return `$${Number(valor).toFixed(2)}`;
  }

  async confirmarBorrado(medicamento: Medication, evento: Event) {
    evento.preventDefault();
    evento.stopPropagation();
    const alerta = await this.alertas.create({
      header: 'Eliminar medicamento',
      message: `¿Eliminar "${medicamento.name}"? Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => this.borrar(medicamento) },
      ],
    });
    await alerta.present();
  }

  private borrar(medicamento: Medication) {
    this.medicamentos.remove(medicamento.id).subscribe({
      next: () => {
        this.mostrarToast('Medicamento eliminado', 'success');
        const sigueHabiendo = this.items().length > 1 || this.pagina === 1;
        this.cargar(sigueHabiendo ? this.pagina : this.pagina - 1);
      },
      error: (e: ApiError) => {
        // 409 (está recetado a pacientes) y demás errores: se muestra el mensaje del servidor tal cual.
        this.mostrarToast(e.status === 404 ? 'El medicamento ya no existe' : e.message, 'danger');
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
