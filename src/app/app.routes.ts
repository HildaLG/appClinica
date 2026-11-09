import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
 {
   path: 'citas',
   loadChildren: () => import('./citas/citas.routes').then((m) => m.CITAS_ROUTES),
  },
  {
   path: 'pacientes',
   loadChildren: () => import('./pacientes/pacientes.routes').then((m) => m.PACIENTES_ROUTES),
  },
  {
    path: 'doctores',
    loadChildren: () => import('./doctores/doctores.routes').then((m) => m.DOCTORES_ROUTES),
  },
  {
    path: 'medicamentos',
    loadChildren: () => import('./medicamentos/medicamentos.routes').then((m) => m.MEDICAMENTOS_ROUTES),
  },
  {
    path: 'aseguradoras',
    loadChildren: () => import('./aseguradoras/aseguradoras.routes').then((m) => m.ASEGURADORAS_ROUTES),
  },
  {
    path: 'no-encontrado',
    loadComponent: () => import('./shared/not-found.page').then((m) => m.NotFoundPage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '**',
    loadComponent: () => import('./shared/not-found.page').then((m) => m.NotFoundPage),
  },
  {
    path: 'medicamento-list',
    loadComponent: () => import('./medicamentos/medicamento-list.page').then( m => m.MedicamentoListPage)
  },
  {
    path: 'medicamento-form',
    loadComponent: () => import('./medicamentos/medicamento-form.page').then( m => m.MedicamentoFormPage)
  },
  {
    path: 'paciente-list',
    loadComponent: () => import('./pacientes/paciente-list.page').then( m => m.PacienteListPage)
  },
  {
    path: 'paciente-form',
    loadComponent: () => import('./pacientes/paciente-form.page').then( m => m.PacienteFormPage)
  },
  {
    path: 'cita-list',
    loadComponent: () => import('./citas/cita-list.page').then( m => m.CitaListPage)
  },
  {
    path: 'cita-form',
    loadComponent: () => import('./citas/cita-form.page').then( m => m.CitaFormPage)
  },
];
