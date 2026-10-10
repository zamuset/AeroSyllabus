import { ImageKey, LibraryResource, Stage, SyllabusSession, User } from './types';

export const program = {
  nombre: 'Adiestramiento inicial',
  duracion: '3 meses de vuelos asesorados',
  nota: 'Los PDF de este demo son temarios de ejemplo. No son manuales operativos de una aeronave.',
};

export const users: User[] = [
  {
    id: 'usr-capitan',
    nombre: 'Andrés Molina',
    tratamiento: 'Cap.',
    rol: 'capitan',
    rolLabel: 'Capitán',
    email: 'capitan@aerosyllabus.dev',
    password: 'demo123',
  },
  {
    id: 'usr-copiloto',
    nombre: 'Laura Vidal',
    tratamiento: 'C.P.',
    rol: 'copiloto',
    rolLabel: 'Copiloto',
    email: 'copiloto@aerosyllabus.dev',
    password: 'demo123',
  },
  {
    id: 'usr-instructor',
    nombre: 'Helena Ruiz',
    tratamiento: 'Instr.',
    rol: 'instructor',
    rolLabel: 'Instructor',
    email: 'instructor@aerosyllabus.dev',
    password: 'demo123',
  },
];

export const stages: Stage[] = [
  {
    id: 'induccion',
    orden: 1,
    mes: 'Mes 1',
    titulo: 'Inducción teórica',
    resumen: 'Estudio previo del material asignado, antes de las sesiones de vuelo asesorado.',
    imageKey: 'syllabus/etapa-induccion.jpg' as ImageKey,
  },
  {
    id: 'vuelo',
    orden: 2,
    mes: 'Mes 2',
    titulo: 'Módulos de vuelo',
    resumen: 'Maniobras de la sesión asesorada y la lectura que corresponde a cada ruta.',
    imageKey: 'syllabus/etapa-vuelo.jpg' as ImageKey,
  },
  {
    id: 'debrief',
    orden: 3,
    mes: 'Mes 3',
    titulo: 'Debriefing y cierre',
    resumen: 'Observaciones después del vuelo y repaso de lo que no quedó dominado.',
    imageKey: 'syllabus/etapa-debrief.jpg' as ImageKey,
  },
  {
    id: 'assessment',
    orden: 4,
    mes: 'Mes 3',
    titulo: 'Assessment final',
    resumen: 'Validación para la liberación a línea. El instructor actualiza el estatus.',
    imageKey: 'syllabus/etapa-assessment.jpg' as ImageKey,
  },
];

export const sessions: SyllabusSession[] = [
  {
    id: 'ses-fuerzas',
    stageId: 'induccion',
    titulo: 'Fuerzas, equilibrio y limitaciones',
    resumen:
      'Lectura guiada del temario de ejemplo AA 210. En un programa real, aquí irían limitaciones de la aeronave y criterios previos al primer vuelo.',
    semana: 1,
    audiencia: 'ambos',
    tipo: 'lectura',
    recursoId: 'aa-210',
  },
  {
    id: 'ses-energia',
    stageId: 'induccion',
    titulo: 'Energía, sistemas y ciclos',
    resumen:
      'Lectura del temario de ejemplo AA 260. Sirve como estudio de sistemas y balances antes de la fase de maniobras.',
    semana: 3,
    audiencia: 'ambos',
    tipo: 'lectura',
    recursoId: 'aa-260',
  },
  {
    id: 'ses-baja',
    stageId: 'vuelo',
    titulo: 'Aerodinámica de baja velocidad',
    resumen:
      'Ruta del copiloto. Temario de ejemplo AA 302, asociado a la preparación de maniobras en baja velocidad.',
    semana: 5,
    audiencia: 'copiloto',
    tipo: 'lectura',
    recursoId: 'aa-302',
  },
  {
    id: 'ses-alta',
    stageId: 'vuelo',
    titulo: 'Alta velocidad y flujo compresible',
    resumen:
      'Ruta del capitán. Temario de ejemplo AA 301, asociado a criterios de alta velocidad antes del vuelo asesorado.',
    semana: 6,
    audiencia: 'capitan',
    tipo: 'lectura',
    recursoId: 'aa-301',
  },
  {
    id: 'ses-maniobras',
    stageId: 'vuelo',
    titulo: 'Vuelo asesorado',
    resumen:
      'Sesión de maniobras con el instructor. La bitácora y el resultado quedan en el dispositivo hasta que exista un servidor.',
    semana: 8,
    audiencia: 'ambos',
    tipo: 'vuelo',
    recursoIds: ['vid-inspeccion', 'vid-aproximacion', 'dia-cabina', 'dia-panel'],
    maniobras: [
      'Inspección pre-vuelo',
      'Rodaje y alineación',
      'Despegue normal',
      'Aproximación estabilizada',
      'Procedimiento de emergencia simulado',
    ],
  },
  {
    id: 'ses-debrief',
    stageId: 'debrief',
    titulo: 'Debriefing y cierre',
    resumen:
      'El instructor anota lo observado en la sesión. Si una maniobra no queda dominada, puede marcar repaso para el piloto.',
    semana: 10,
    audiencia: 'ambos',
    tipo: 'debrief',
    maniobras: ['Repaso de maniobras observadas', 'Criterios de la sesión', 'Acuerdos de refuerzo'],
  },
  {
    id: 'ses-trayectorias',
    stageId: 'debrief',
    titulo: 'Trayectorias y criterio operacional',
    resumen:
      'Lectura de ejemplo AA 310 en la ruta del capitán, como preparación del assessment final.',
    semana: 11,
    audiencia: 'capitan',
    tipo: 'lectura',
    recursoId: 'aa-310',
  },
  {
    id: 'ses-assessment',
    stageId: 'assessment',
    titulo: 'Assessment y liberación a línea',
    resumen:
      'Cierre del programa de tres meses. El estatus de liberación lo confirma el instructor y lo consulta el capitán.',
    semana: 12,
    audiencia: 'ambos',
    tipo: 'assessment',
    maniobras: ['Evaluación integral de la ruta', 'Decisión de liberación'],
  },
];

export const resources: LibraryResource[] = [
  {
    id: 'aa-210',
    kind: 'pdf',
    codigo: 'AA 210',
    titulo: 'Engineering Statics',
    descripcion: 'Temario de ejemplo asignado a la inducción. Cubre fuerzas, equilibrio y diagramas de cuerpo libre.',
    archivo: 'AA_210.pdf',
  },
  {
    id: 'aa-260',
    kind: 'pdf',
    codigo: 'AA 260',
    titulo: 'Thermodynamics',
    descripcion: 'Temario de ejemplo sobre energía, ciclos y balances. Se usa como lectura previa de sistemas.',
    archivo: 'AA_260.pdf',
  },
  {
    id: 'aa-302',
    kind: 'pdf',
    codigo: 'AA 302',
    titulo: 'Incompressible Aerodynamics',
    descripcion: 'Temario de ejemplo de la ruta del copiloto, asociado a aerodinámica de baja velocidad.',
    archivo: 'AA_302.pdf',
  },
  {
    id: 'aa-301',
    kind: 'pdf',
    codigo: 'AA 301',
    titulo: 'Compressible Aerodynamics',
    descripcion: 'Temario de ejemplo de la ruta del capitán, asociado a alta velocidad.',
    archivo: 'AA_301.pdf',
  },
  {
    id: 'aa-310',
    kind: 'pdf',
    codigo: 'AA 310',
    titulo: 'Orbital and Space Flight Mechanics',
    descripcion: 'Temario de ejemplo para la lectura de trayectorias previa al assessment del capitán.',
    archivo: 'AA_310.pdf',
  },
  {
    id: 'vid-inspeccion',
    kind: 'video',
    titulo: 'Inspección pre-vuelo',
    descripcion: 'Espacio reservado para el video de la inspección. El archivo todavía no está cargado.',
    imageKey: 'biblioteca/video-inspeccion-prevuelo.jpg',
  },
  {
    id: 'vid-aproximacion',
    kind: 'video',
    titulo: 'Aproximación estabilizada',
    descripcion: 'Espacio reservado para la demostración de la aproximación. El archivo todavía no está cargado.',
    imageKey: 'biblioteca/video-aproximacion.jpg',
  },
  {
    id: 'dia-cabina',
    kind: 'diagrama',
    titulo: 'Esquema de cabina',
    descripcion: 'Espacio reservado para el esquema de cabina, paneles y referencias de la sesión.',
    imageKey: 'biblioteca/esquema-cabina.jpg',
  },
  {
    id: 'dia-panel',
    kind: 'diagrama',
    titulo: 'Panel de instrumentos',
    descripcion: 'Espacio reservado para fotos o diagramas del panel de instrumentos.',
    imageKey: 'biblioteca/panel-instrumentos.jpg',
  },
];

export const trainees = users.filter((user) => user.rol !== 'instructor');

export function findUser(id: string): User | undefined {
  return users.find((user) => user.id === id);
}

export function findStage(id: string): Stage | undefined {
  return stages.find((stage) => stage.id === id);
}

export function findSession(id: string): SyllabusSession | undefined {
  return sessions.find((session) => session.id === id);
}

export function findResource(id: string): LibraryResource | undefined {
  return resources.find((resource) => resource.id === id);
}
