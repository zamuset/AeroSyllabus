import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { findUser, users } from '../data/catalog';
import { Connectivity, NewEvaluation, ReadingStatus, ReleaseState, SessionStatus, User } from '../data/types';
import { getDatabase, getMeta, setMeta } from '../db/database';
import {
  emptySnapshot,
  flushPending,
  loadSnapshot,
  saveEvaluation,
  saveReadingStatus,
  saveReleaseStatus,
  saveSessionStatus,
  Snapshot,
} from '../db/repository';

type AppContextValue = {
  ready: boolean;
  error: string | null;
  user: User | null;
  connectivity: Connectivity;
  snapshot: Snapshot;
  syncNote: string | null;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  setConnectivity: (value: Connectivity) => Promise<void>;
  setSessionStatus: (sessionId: string, status: SessionStatus) => Promise<void>;
  setReadingStatus: (resourceId: string, status: ReadingStatus) => Promise<void>;
  createEvaluation: (input: Omit<NewEvaluation, 'instructorId'>) => Promise<string | null>;
  setReleaseStatus: (userId: string, status: ReleaseState) => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [connectivity, setConnectivityState] = useState<Connectivity>('online');
  const [snapshot, setSnapshot] = useState<Snapshot>(emptySnapshot);
  const [syncNote, setSyncNote] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const db = await getDatabase();
    setSnapshot(await loadSnapshot(db));
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const db = await getDatabase();
        const authId = await getMeta(db, 'auth_user_id');
        const storedConnectivity = await getMeta(db, 'connectivity');
        if (!active) {
          return;
        }
        if (storedConnectivity === 'online' || storedConnectivity === 'offline') {
          setConnectivityState(storedConnectivity);
        }
        setUser(authId ? findUser(authId) ?? null : null);
        setSnapshot(await loadSnapshot(db));
        setReady(true);
      } catch (caught) {
        if (!active) {
          return;
        }
        const message = caught instanceof Error ? caught.message : 'No se pudo abrir la base local.';
        setError(message);
        setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const found = users.find(
      (account) => account.email.toLowerCase() === email.trim().toLowerCase() && account.password === password,
    );
    if (!found) {
      return 'Correo o contraseña incorrectos.';
    }
    const db = await getDatabase();
    await setMeta(db, 'auth_user_id', found.id);
    setUser(found);
    setSnapshot(await loadSnapshot(db));
    return null;
  }, []);

  const logout = useCallback(async () => {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM meta WHERE key = ?', 'auth_user_id');
    setUser(null);
    setSyncNote(null);
  }, []);

  const setConnectivity = useCallback(async (value: Connectivity) => {
    const db = await getDatabase();
    await setMeta(db, 'connectivity', value);
    if (value === 'online') {
      const sent = await flushPending(db);
      setSyncNote(
        sent > 0
          ? `Simulación: se marcaron ${sent} cambios como enviados.`
          : 'En línea. No había cambios pendientes.',
      );
    } else {
      setSyncNote('Sin conexión. Lo que registres queda guardado en este dispositivo.');
    }
    setConnectivityState(value);
    setSnapshot(await loadSnapshot(db));
  }, []);

  const setSessionStatus = useCallback(
    async (sessionId: string, status: SessionStatus) => {
      if (!user) {
        return;
      }
      const db = await getDatabase();
      await saveSessionStatus(db, user.id, sessionId, status, connectivity);
      await reload();
    },
    [connectivity, reload, user],
  );

  const setReadingStatus = useCallback(
    async (resourceId: string, status: ReadingStatus) => {
      if (!user) {
        return;
      }
      const db = await getDatabase();
      await saveReadingStatus(db, user.id, resourceId, status, connectivity);
      await reload();
    },
    [connectivity, reload, user],
  );

  const createEvaluation = useCallback(
    async (input: Omit<NewEvaluation, 'instructorId'>) => {
      if (!user || user.rol !== 'instructor') {
        return 'Solo el instructor registra evaluaciones.';
      }
      const db = await getDatabase();
      await saveEvaluation(db, { ...input, instructorId: user.id }, connectivity);
      await reload();
      return null;
    },
    [connectivity, reload, user],
  );

  const setReleaseStatus = useCallback(
    async (userId: string, status: ReleaseState) => {
      if (!user || user.rol !== 'instructor') {
        return;
      }
      const db = await getDatabase();
      await saveReleaseStatus(db, userId, status, user.id, connectivity);
      await reload();
    },
    [connectivity, reload, user],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      ready,
      error,
      user,
      connectivity,
      snapshot,
      syncNote,
      login,
      logout,
      setConnectivity,
      setSessionStatus,
      setReadingStatus,
      createEvaluation,
      setReleaseStatus,
    }),
    [
      ready,
      error,
      user,
      connectivity,
      snapshot,
      syncNote,
      login,
      logout,
      setConnectivity,
      setSessionStatus,
      setReadingStatus,
      createEvaluation,
      setReleaseStatus,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const value = useContext(AppContext);
  if (!value) {
    throw new Error('useApp debe usarse dentro de AppProvider.');
  }
  return value;
}
