import { AuthSession } from '../interfaces';

const DB_NAME = 'life_expense_auth';
const DB_VERSION = 1;
const STORE_NAME = 'auth';

type AuthStoreKey = 'username' | 'session';

interface AuthStoreRecord {
  key: AuthStoreKey;
  value: unknown;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error('Failed to open auth database'));
    });
  }

  return dbPromise;
}

async function getValue<T>(key: AuthStoreKey): Promise<T | null> {
  try {
    const db = await openDb();
    return await new Promise<T | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const request = tx.objectStore(STORE_NAME).get(key);

      request.onsuccess = () => {
        const record = request.result as AuthStoreRecord | undefined;
        resolve(record ? (record.value as T) : null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error(`Error reading auth store key "${key}":`, error);
    return null;
  }
}

async function setValue(key: AuthStoreKey, value: unknown): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({ key, value } satisfies AuthStoreRecord);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function removeValue(key: AuthStoreKey): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export const authStorageService = {
  getUsername(): Promise<string | null> {
    return getValue<string>('username');
  },

  setUsername(name: string): Promise<void> {
    return setValue('username', name);
  },

  getSession(): Promise<AuthSession | null> {
    return getValue<AuthSession>('session');
  },

  setSession(session: AuthSession): Promise<void> {
    return setValue('session', session);
  },

  removeSession(): Promise<void> {
    return removeValue('session');
  },

  async clearAll(): Promise<void> {
    try {
      const db = await openDb();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (error) {
      console.error('Error clearing auth store:', error);
    }
  },
};
