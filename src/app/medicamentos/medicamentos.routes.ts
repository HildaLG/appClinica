import { Routes } from '@angular/router';

export const MEDICAMENTOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./medicamento-list.page').then((m) => m.MedicamentoListPage),
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./medicamento-form.page').then((m) => m.MedicamentoFormPage),
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./medicamento-form.page').then((m) => m.MedicamentoFormPage),
  },
];
