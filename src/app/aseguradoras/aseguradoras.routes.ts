import { Routes } from '@angular/router';

export const ASEGURADORAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./aseguradora-list.page').then((m) => m.AseguradoraListPage),
  },
  {
    path: 'nueva',
    loadComponent: () => import('./aseguradora-form.page').then((m) => m.AseguradoraFormPage),
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./aseguradora-form.page').then((m) => m.AseguradoraFormPage),
  },
];
