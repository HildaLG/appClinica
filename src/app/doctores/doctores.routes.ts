import { Routes } from '@angular/router';

export const DOCTORES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./doctor-list.page').then((m) => m.DoctorListPage),
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./doctor-form.page').then((m) => m.DoctorFormPage),
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./doctor-form.page').then((m) => m.DoctorFormPage),
  },
];
