import type { AppData } from '../types';

/** What survives a reload: the data, the remote revision it is based on, and unsent changes. */
export interface CachedState {
  data: AppData;
  /** sha of data.json on GitHub this copy descends from; null when never synced. */
  sha: string | null;
  dirty: boolean;
  pendingMessages: string[];
}

const DB_NAME = 'ristoview';
const STORE = 'kv';
const STATE_KEY = 'state';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>) {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const req = fn(db.transaction(STORE, mode).objectStore(STORE));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

export async function readCache(): Promise<CachedState | null> {
  try {
    return (await withStore<CachedState | undefined>('readonly', (s) => s.get(STATE_KEY))) ?? null;
  } catch {
    return null;
  }
}

export async function writeCache(state: CachedState): Promise<void> {
  // $state proxies are not structured-cloneable; a JSON round trip gives a plain copy.
  const plain = JSON.parse(JSON.stringify(state)) as CachedState;
  await withStore('readwrite', (s) => s.put(plain, STATE_KEY));
}

export async function clearCache(): Promise<void> {
  await withStore('readwrite', (s) => s.delete(STATE_KEY));
}
