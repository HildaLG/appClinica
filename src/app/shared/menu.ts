export interface OpcionMenu {
  titulo: string;
  descripcion: string;
  url: string;
  icono: string;
}

/** Secciones de la aplicación: las usan el menú lateral y la pantalla de inicio. */
export const OPCIONES_MENU: OpcionMenu[] = [
  { titulo: 'Inicio', descripcion: 'Resumen de la clínica', url: '/home', icono: 'home-outline' },
  { titulo: 'Citas', descripcion: 'Agenda y seguimiento', url: '/citas', icono: 'calendar-outline' },
  { titulo: 'Pacientes', descripcion: 'Expedientes y medicamentos', url: '/pacientes', icono: 'people-outline' },
  { titulo: 'Doctores', descripcion: 'Equipo médico', url: '/doctores', icono: 'medkit-outline' },
  { titulo: 'Medicamentos', descripcion: 'Catálogo y precios', url: '/medicamentos', icono: 'medical-outline' },
  { titulo: 'Aseguradoras', descripcion: 'Convenios y cobertura', url: '/aseguradoras', icono: 'shield-checkmark-outline' },
];
