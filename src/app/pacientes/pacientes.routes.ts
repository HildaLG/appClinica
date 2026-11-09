import { Routes } from '@angular/router';

export const PACIENTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./paciente-list.page').then((m) => m.PacienteListPage),
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./paciente-form.page').then((m) => m.PacienteFormPage),
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./paciente-form.page').then((m) => m.PacienteFormPage),
  },
];
