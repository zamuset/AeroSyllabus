import { sessions } from './catalog';
import { Role, SessionProgress, SessionStatus, SyllabusSession } from './types';

export function sessionsFor(role: Role): SyllabusSession[] {
  if (role === 'instructor') {
    return sessions;
  }
  return sessions.filter((session) => session.audiencia === 'ambos' || session.audiencia === role);
}

export function statusOf(rows: SessionProgress[], userId: string, sessionId: string): SessionStatus {
  return rows.find((row) => row.userId === userId && row.sessionId === sessionId)?.status ?? 'pendiente';
}

export function completedCount(role: Role, rows: SessionProgress[], userId: string): { done: number; total: number } {
  const route = role === 'instructor' ? [] : sessionsFor(role);
  const done = route.filter((session) => statusOf(rows, userId, session.id) === 'completada').length;
  return { done, total: route.length };
}

export function nextSession(role: Role, rows: SessionProgress[], userId: string): SyllabusSession | undefined {
  if (role === 'instructor') {
    return undefined;
  }
  return sessionsFor(role).find((session) => statusOf(rows, userId, session.id) !== 'completada');
}
