import * as SQLite from 'expo-sqlite';

import {
  Connectivity,
  Evaluation,
  EvalResult,
  NewEvaluation,
  ReadingProgress,
  ReadingStatus,
  ReleaseRecord,
  ReleaseState,
  SessionProgress,
  SessionStatus,
  SyncStatus,
} from '../data/types';

export type Snapshot = {
  sessionProgress: SessionProgress[];
  readingProgress: ReadingProgress[];
  evaluations: Evaluation[];
  releases: ReleaseRecord[];
  pendingCount: number;
};

export const emptySnapshot: Snapshot = {
  sessionProgress: [],
  readingProgress: [],
  evaluations: [],
  releases: [],
  pendingCount: 0,
};

function syncFor(connectivity: Connectivity): SyncStatus {
  return connectivity === 'online' ? 'sincronizado' : 'pendiente';
}

async function enqueue(
  db: SQLite.SQLiteDatabase,
  entity: string,
  entityKey: string,
  createdAt: string,
  syncStatus: SyncStatus,
): Promise<void> {
  if (syncStatus !== 'pendiente') {
    return;
  }
  await db.runAsync(
    'INSERT INTO sync_queue (entity, entity_key, created_at, status) VALUES (?, ?, ?, ?)',
    entity,
    entityKey,
    createdAt,
    'pendiente',
  );
}

export async function loadSnapshot(db: SQLite.SQLiteDatabase): Promise<Snapshot> {
  const sessionRows = await db.getAllAsync<{
    user_id: string;
    session_id: string;
    status: SessionStatus;
    updated_at: string;
    sync_status: SyncStatus;
  }>('SELECT user_id, session_id, status, updated_at, sync_status FROM session_progress');

  const readingRows = await db.getAllAsync<{
    user_id: string;
    resource_id: string;
    status: ReadingStatus;
    updated_at: string;
    sync_status: SyncStatus;
  }>('SELECT user_id, resource_id, status, updated_at, sync_status FROM reading_progress');

  const evaluationRows = await db.getAllAsync<{
    id: string;
    trainee_id: string;
    instructor_id: string;
    session_id: string;
    maneuver: string;
    result: EvalResult;
    notes: string;
    reschedule: number;
    created_at: string;
    sync_status: SyncStatus;
  }>('SELECT * FROM evaluations ORDER BY created_at DESC');

  const releaseRows = await db.getAllAsync<{
    user_id: string;
    status: ReleaseState;
    updated_by: string | null;
    updated_at: string;
    sync_status: SyncStatus;
  }>('SELECT user_id, status, updated_by, updated_at, sync_status FROM release_status');

  const pending = await db.getFirstAsync<{ total: number }>(
    "SELECT COUNT(*) AS total FROM sync_queue WHERE status = 'pendiente'",
  );

  return {
    sessionProgress: sessionRows.map((row) => ({
      userId: row.user_id,
      sessionId: row.session_id,
      status: row.status,
      updatedAt: row.updated_at,
      syncStatus: row.sync_status,
    })),
    readingProgress: readingRows.map((row) => ({
      userId: row.user_id,
      resourceId: row.resource_id,
      status: row.status,
      updatedAt: row.updated_at,
      syncStatus: row.sync_status,
    })),
    evaluations: evaluationRows.map((row) => ({
      id: row.id,
      traineeId: row.trainee_id,
      instructorId: row.instructor_id,
      sessionId: row.session_id,
      maneuver: row.maneuver,
      result: row.result,
      notes: row.notes,
      reschedule: row.reschedule === 1,
      createdAt: row.created_at,
      syncStatus: row.sync_status,
    })),
    releases: releaseRows.map((row) => ({
      userId: row.user_id,
      status: row.status,
      updatedBy: row.updated_by,
      updatedAt: row.updated_at,
      syncStatus: row.sync_status,
    })),
    pendingCount: pending?.total ?? 0,
  };
}

export async function saveSessionStatus(
  db: SQLite.SQLiteDatabase,
  userId: string,
  sessionId: string,
  status: SessionStatus,
  connectivity: Connectivity,
): Promise<void> {
  const now = new Date().toISOString();
  const syncStatus = syncFor(connectivity);
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO session_progress (user_id, session_id, status, updated_at, sync_status)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(user_id, session_id) DO UPDATE SET
         status = excluded.status,
         updated_at = excluded.updated_at,
         sync_status = excluded.sync_status`,
      userId,
      sessionId,
      status,
      now,
      syncStatus,
    );
    await enqueue(db, 'session', `${userId}:${sessionId}`, now, syncStatus);
  });
}

export async function saveReadingStatus(
  db: SQLite.SQLiteDatabase,
  userId: string,
  resourceId: string,
  status: ReadingStatus,
  connectivity: Connectivity,
): Promise<void> {
  const now = new Date().toISOString();
  const syncStatus = syncFor(connectivity);
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO reading_progress (user_id, resource_id, status, updated_at, sync_status)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(user_id, resource_id) DO UPDATE SET
         status = excluded.status,
         updated_at = excluded.updated_at,
         sync_status = excluded.sync_status`,
      userId,
      resourceId,
      status,
      now,
      syncStatus,
    );
    await enqueue(db, 'reading', `${userId}:${resourceId}`, now, syncStatus);
  });
}

export async function saveEvaluation(
  db: SQLite.SQLiteDatabase,
  input: NewEvaluation,
  connectivity: Connectivity,
): Promise<void> {
  const now = new Date().toISOString();
  const syncStatus = syncFor(connectivity);
  const id = `ev-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const sessionStatus: SessionStatus =
    input.reschedule || input.result === 'no_aprobada'
      ? 'repaso'
      : input.result === 'dominada'
        ? 'completada'
        : 'en_progreso';

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO evaluations (
         id, trainee_id, instructor_id, session_id, maneuver, result, notes, reschedule, created_at, sync_status
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      input.traineeId,
      input.instructorId,
      input.sessionId,
      input.maneuver.trim(),
      input.result,
      input.notes.trim(),
      input.reschedule ? 1 : 0,
      now,
      syncStatus,
    );
    await db.runAsync(
      `INSERT INTO session_progress (user_id, session_id, status, updated_at, sync_status)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(user_id, session_id) DO UPDATE SET
         status = excluded.status,
         updated_at = excluded.updated_at,
         sync_status = excluded.sync_status`,
      input.traineeId,
      input.sessionId,
      sessionStatus,
      now,
      syncStatus,
    );
    await enqueue(db, 'evaluation', id, now, syncStatus);
  });
}

export async function saveReleaseStatus(
  db: SQLite.SQLiteDatabase,
  userId: string,
  status: ReleaseState,
  updatedBy: string,
  connectivity: Connectivity,
): Promise<void> {
  const now = new Date().toISOString();
  const syncStatus = syncFor(connectivity);
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO release_status (user_id, status, updated_by, updated_at, sync_status)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         status = excluded.status,
         updated_by = excluded.updated_by,
         updated_at = excluded.updated_at,
         sync_status = excluded.sync_status`,
      userId,
      status,
      updatedBy,
      now,
      syncStatus,
    );
    await enqueue(db, 'release', userId, now, syncStatus);
  });
}

export async function flushPending(db: SQLite.SQLiteDatabase): Promise<number> {
  const pending = await db.getFirstAsync<{ total: number }>(
    "SELECT COUNT(*) AS total FROM sync_queue WHERE status = 'pendiente'",
  );
  await db.execAsync(`
    UPDATE session_progress SET sync_status = 'sincronizado' WHERE sync_status = 'pendiente';
    UPDATE reading_progress SET sync_status = 'sincronizado' WHERE sync_status = 'pendiente';
    UPDATE evaluations SET sync_status = 'sincronizado' WHERE sync_status = 'pendiente';
    UPDATE release_status SET sync_status = 'sincronizado' WHERE sync_status = 'pendiente';
    UPDATE sync_queue SET status = 'sincronizado' WHERE status = 'pendiente';
  `);
  return pending?.total ?? 0;
}
