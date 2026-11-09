import { Routes } from '@angular/router';

export const CITAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./cita-list.page').then((m) => m.CitaListPage),
  },
  {
    path: 'nueva',
    loadComponent: () => import('./cita-form.page').then((m) => m.CitaFormPage),
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./cita-form.page').then((m) => m.CitaFormPage),
  },
];
