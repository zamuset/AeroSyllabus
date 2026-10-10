export type Role = 'capitan' | 'copiloto' | 'instructor';

export type User = {
  id: string;
  nombre: string;
  tratamiento: string;
  rol: Role;
  rolLabel: string;
  email: string;
  password: string;
};

export type StageId = 'induccion' | 'vuelo' | 'debrief' | 'assessment';

export type SessionType = 'lectura' | 'vuelo' | 'debrief' | 'assessment';

export type Audience = 'capitan' | 'copiloto' | 'ambos';

export type SyllabusSession = {
  id: string;
  stageId: StageId;
  titulo: string;
  resumen: string;
  semana: number;
  audiencia: Audience;
  tipo: SessionType;
  recursoId?: string;
  recursoIds?: string[];
  maniobras?: string[];
};

export type Stage = {
  id: StageId;
  orden: number;
  mes: string;
  titulo: string;
  resumen: string;
  imageKey: ImageKey;
};

export type ResourceKind = 'pdf' | 'video' | 'diagrama';

export type LibraryResource = {
  id: string;
  kind: ResourceKind;
  codigo?: string;
  titulo: string;
  descripcion: string;
  archivo?: string;
  imageKey?: ImageKey;
};

export type ImageKey =
  | 'marca/logo.png'
  | 'login/cabina.jpg'
  | 'biblioteca/video-inspeccion-prevuelo.jpg'
  | 'biblioteca/video-aproximacion.jpg'
  | 'biblioteca/esquema-cabina.jpg'
  | 'biblioteca/panel-instrumentos.jpg'
  | 'syllabus/etapa-induccion.jpg'
  | 'syllabus/etapa-vuelo.jpg'
  | 'syllabus/etapa-debrief.jpg'
  | 'syllabus/etapa-assessment.jpg';

export type SyncStatus = 'pendiente' | 'sincronizado';
export type SessionStatus = 'pendiente' | 'en_progreso' | 'completada' | 'repaso';
export type ReadingStatus = 'no_leido' | 'leido';
export type EvalResult = 'dominada' | 'a_reforzar' | 'no_aprobada';
export type ReleaseState = 'en_adiestramiento' | 'en_revision' | 'liberado';
export type Connectivity = 'online' | 'offline';

export type SessionProgress = {
  userId: string;
  sessionId: string;
  status: SessionStatus;
  updatedAt: string;
  syncStatus: SyncStatus;
};

export type ReadingProgress = {
  userId: string;
  resourceId: string;
  status: ReadingStatus;
  updatedAt: string;
  syncStatus: SyncStatus;
};

export type Evaluation = {
  id: string;
  traineeId: string;
  instructorId: string;
  sessionId: string;
  maneuver: string;
  result: EvalResult;
  notes: string;
  reschedule: boolean;
  createdAt: string;
  syncStatus: SyncStatus;
};

export type ReleaseRecord = {
  userId: string;
  status: ReleaseState;
  updatedBy: string | null;
  updatedAt: string;
  syncStatus: SyncStatus;
};

export type NewEvaluation = {
  traineeId: string;
  instructorId: string;
  sessionId: string;
  maneuver: string;
  result: EvalResult;
  notes: string;
  reschedule: boolean;
};
