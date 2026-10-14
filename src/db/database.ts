import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

const RELOAD_KEY = 'aerosyllabus-sqlite-reload';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = openDatabase().catch((error) => {
      databasePromise = null;
      throw error;
    });
  }
  return databasePromise;
}

async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  try {
    const db = await SQLite.openDatabaseAsync('aerosyllabus.db');
    await migrate(db);
    rememberSuccessfulOpen();
    releaseDatabaseOnPageHide(db);
    return db;
  } catch (error) {
    if (Platform.OS === 'web' && isBusyDatabaseError(error) && markReloadAttempt()) {
      window.location.reload();
      return new Promise(() => undefined);
    }
    if (isBusyDatabaseError(error)) {
      throw new Error(
        'La base local ya está abierta en otra ventana. Ciérrala y vuelve a cargar esta página.',
      );
    }
    throw error;
  }
}

function isBusyDatabaseError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('createSyncAccessHandle') || message.includes('Access Handle');
}

function markReloadAttempt(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    if (window.sessionStorage.getItem(RELOAD_KEY)) {
      window.sessionStorage.removeItem(RELOAD_KEY);
      return false;
    }
    window.sessionStorage.setItem(RELOAD_KEY, '1');
    return true;
  } catch {
    return false;
  }
}

function rememberSuccessfulOpen(): void {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return;
  }
  try {
    window.sessionStorage.removeItem(RELOAD_KEY);
  } catch {
    // La sesión privada puede bloquear sessionStorage. La base igual quedó abierta.
  }
}

function releaseDatabaseOnPageHide(db: SQLite.SQLiteDatabase): void {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return;
  }
  window.addEventListener(
    'pagehide',
    () => {
      void db.closeAsync();
    },
    { once: true },
  );
}

async function migrate(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS session_progress (
      user_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      status TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      sync_status TEXT NOT NULL,
      PRIMARY KEY (user_id, session_id)
    );

    CREATE TABLE IF NOT EXISTS reading_progress (
      user_id TEXT NOT NULL,
      resource_id TEXT NOT NULL,
      status TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      sync_status TEXT NOT NULL,
      PRIMARY KEY (user_id, resource_id)
    );

    CREATE TABLE IF NOT EXISTS evaluations (
      id TEXT PRIMARY KEY NOT NULL,
      trainee_id TEXT NOT NULL,
      instructor_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      maneuver TEXT NOT NULL,
      result TEXT NOT NULL,
      notes TEXT NOT NULL,
      reschedule INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      sync_status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS release_status (
      user_id TEXT PRIMARY KEY NOT NULL,
      status TEXT NOT NULL,
      updated_by TEXT,
      updated_at TEXT NOT NULL,
      sync_status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity TEXT NOT NULL,
      entity_key TEXT NOT NULL,
      created_at TEXT NOT NULL,
      status TEXT NOT NULL
    );
  `);

  const now = new Date().toISOString();
  for (const userId of ['usr-capitan', 'usr-copiloto']) {
    await db.runAsync(
      `INSERT OR IGNORE INTO release_status (user_id, status, updated_by, updated_at, sync_status)
       VALUES (?, 'en_adiestramiento', NULL, ?, 'sincronizado')`,
      userId,
      now,
    );
  }
}

export async function getMeta(db: SQLite.SQLiteDatabase, key: string): Promise<string | null> {
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM meta WHERE key = ?', key);
  return row?.value ?? null;
}

export async function setMeta(db: SQLite.SQLiteDatabase, key: string, value: string): Promise<void> {
  await db.runAsync(
    `INSERT INTO meta (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    key,
    value,
  );
}
