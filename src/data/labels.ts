import {
  Audience,
  EvalResult,
  ReadingStatus,
  ReleaseState,
  ResourceKind,
  SessionStatus,
  SessionType,
  SyncStatus,
} from './types';

export const sessionStatusLabel: Record<SessionStatus, string> = {
  pendiente: 'Pendiente',
  en_progreso: 'En progreso',
  completada: 'Completada',
  repaso: 'Repaso asignado',
};

export const readingStatusLabel: Record<ReadingStatus, string> = {
  no_leido: 'Sin consultar',
  leido: 'Consultado',
};

export const evalResultLabel: Record<EvalResult, string> = {
  dominada: 'Dominada',
  a_reforzar: 'A reforzar',
  no_aprobada: 'No aprobada',
};

export const releaseLabel: Record<ReleaseState, string> = {
  en_adiestramiento: 'En adiestramiento',
  en_revision: 'En revisión',
  liberado: 'Liberado a línea',
};

export const syncLabel: Record<SyncStatus, string> = {
  pendiente: 'Pendiente de envío',
  sincronizado: 'Sincronizado',
};

export const audienceLabel: Record<Audience, string> = {
  ambos: 'Capitán y copiloto',
  capitan: 'Ruta de capitán',
  copiloto: 'Ruta de copiloto',
};

export const sessionTypeLabel: Record<SessionType, string> = {
  lectura: 'Lectura',
  vuelo: 'Vuelo asesorado',
  debrief: 'Debriefing',
  assessment: 'Assessment',
};

export const resourceKindLabel: Record<ResourceKind, string> = {
  pdf: 'Manual PDF',
  video: 'Video',
  diagrama: 'Diagrama',
};

export type PillTone = 'neutral' | 'info' | 'ok' | 'warn' | 'danger';

export function toneForSession(status: SessionStatus): PillTone {
  if (status === 'completada') return 'ok';
  if (status === 'en_progreso') return 'info';
  if (status === 'repaso') return 'warn';
  return 'neutral';
}

export function toneForResult(result: EvalResult): PillTone {
  if (result === 'dominada') return 'ok';
  if (result === 'a_reforzar') return 'warn';
  return 'danger';
}

export function toneForRelease(status: ReleaseState): PillTone {
  if (status === 'liberado') return 'ok';
  if (status === 'en_revision') return 'warn';
  return 'info';
}

export function toneForSync(status: SyncStatus): PillTone {
  return status === 'pendiente' ? 'warn' : 'ok';
}
