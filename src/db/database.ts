import * as SQLite from 'expo-sqlite';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync('aerosyllabus.db')
      .then(async (db) => {
        await migrate(db);
        return db;
      })
      .catch((error) => {
        databasePromise = null;
        throw error;
      });
  }
  return databasePromise;
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
