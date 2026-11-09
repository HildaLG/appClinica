import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonApp,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonRouterOutlet,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  calendarOutline,
  homeOutline,
  medicalOutline,
  medkitOutline,
  peopleOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';

import { OPCIONES_MENU } from './shared/menu';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [
    RouterLink,
    RouterLinkActive,
    IonApp,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonMenu,
    IonMenuToggle,
    IonRouterOutlet,
    IonTitle,
    IonToolbar,
  ],
})
export class AppComponent {
  readonly opciones = OPCIONES_MENU;

  constructor() {
    addIcons({ homeOutline, calendarOutline, peopleOutline, medkitOutline, medicalOutline, shieldCheckmarkOutline });
  }
}
