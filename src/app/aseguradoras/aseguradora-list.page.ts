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
import { Insurance } from '../core/models/insurance';
import { InsuranceService } from '../core/services/insurance.service';

@Component({
  selector: 'app-aseguradora-list',
  templateUrl: 'aseguradora-list.page.html',
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
export class AseguradoraListPage {
  private readonly aseguradoras = inject(InsuranceService);
  private readonly alertas = inject(AlertController);
  private readonly toasts = inject(ToastController);

  readonly items = signal<Insurance[]>([]);
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
      (a) => a.name.toLowerCase().includes(texto) || a.code.toLowerCase().includes(texto),
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
    this.aseguradoras.list(pagina).subscribe({
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

  async confirmarBorrado(aseguradora: Insurance, evento: Event) {
    // El botón está dentro de un ion-item con routerLink: evitamos que también navegue a editar.
    evento.preventDefault();
    evento.stopPropagation();
    const alerta = await this.alertas.create({
      header: 'Eliminar aseguradora',
      message: `¿Eliminar "${aseguradora.name}"? Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => this.borrar(aseguradora) },
      ],
    });
    await alerta.present();
  }

  private borrar(aseguradora: Insurance) {
    this.aseguradoras.remove(aseguradora.id).subscribe({
      next: () => {
        this.mostrarToast('Aseguradora eliminada', 'success');
        // Si se vació la última página, regresamos una.
        const sigueHabiendo = this.items().length > 1 || this.pagina === 1;
        this.cargar(sigueHabiendo ? this.pagina : this.pagina - 1);
      },
      error: (e: ApiError) => {
        this.mostrarToast(e.status === 404 ? 'La aseguradora ya no existe' : e.message, 'danger');
        this.cargar(this.pagina);
      },
    });
  }

  private async mostrarToast(message: string, color: 'success' | 'danger') {
    // Los errores salen arriba para no tapar el botón flotante de alta.
    const position = color === 'danger' ? 'top' : 'bottom';
    const toast = await this.toasts.create({ message, color, duration: 4000, position });
    await toast.present();
  }
}
