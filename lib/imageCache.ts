/**
 * Padrão UMADEMATS - Cache Robusto no Navegador via IndexedDB
 * 
 * Armazena strings Base64 de imagens no IndexedDB do navegador.
 * Evita downloads repetidos do Supabase a cada recarga da página,
 * permitindo carregamento em 1ms (instantâneo) a partir do cache local.
 * Possui fallback resiliente para sessionStorage e memória caso o IndexedDB
 * esteja desativado ou inacessível.
 */

const DB_NAME = 'umademats_cache_db';
const DB_VERSION = 1;
const STORE_NAME = 'media_cache';

// Fallback em memória caso IndexedDB falhe
const memoryFallback = new Map<string, string>();

let dbPromise: Promise<IDBDatabase | null> | null = null;

const getDB = (): Promise<IDBDatabase | null> => {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (err) => {
        console.warn('[Cache] Falha ao abrir IndexedDB, usando fallback:', err);
        resolve(null);
      };
    } catch (e) {
      console.warn('[Cache] Erro de inicialização do IndexedDB:', e);
      resolve(null);
    }
  });

  return dbPromise;
};

/**
 * Recupera imagem do cache (IndexedDB -> sessionStorage -> memória)
 */
export const getCachedImage = async (key: string): Promise<string | null> => {
  if (!key) return null;

  try {
    const db = await getDB();
    if (db) {
      return new Promise((resolve) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readonly');
          const store = tx.objectStore(STORE_NAME);
          const req = store.get(key);

          req.onsuccess = () => {
            if (req.result && req.result.data) {
              resolve(req.result.data);
            } else {
              resolve(null);
            }
          };

          req.onerror = () => {
            resolve(null);
          };
        } catch (e) {
          resolve(null);
        }
      });
    }
  } catch (e) {
    // Continuar para fallback
  }

  // Fallback 1: sessionStorage
  if (typeof window !== 'undefined') {
    try {
      const sessionVal = sessionStorage.getItem(`img_cache_${key}`);
      if (sessionVal) return sessionVal;
    } catch (e) {}
  }

  // Fallback 2: memória
  return memoryFallback.get(key) || null;
};

/**
 * Salva imagem no cache (IndexedDB + sessionStorage / memória)
 */
export const setCachedImage = async (key: string, dataUrl: string): Promise<void> => {
  if (!key || !dataUrl) return;

  // Armazena na memória imediatamente para acesso síncrono
  memoryFallback.set(key, dataUrl);

  try {
    const db = await getDB();
    if (db) {
      await new Promise<void>((resolve) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          store.put({ key, data: dataUrl, timestamp: Date.now() });

          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        } catch (e) {
          resolve();
        }
      });
      return;
    }
  } catch (e) {
    // Falha silenciosa
  }

  // Fallback sessionStorage se dataUrl for menor que 2MB
  if (typeof window !== 'undefined' && dataUrl.length < 2 * 1024 * 1024) {
    try {
      sessionStorage.setItem(`img_cache_${key}`, dataUrl);
    } catch (e) {}
  }
};

/**
 * Recupera múltiplas imagens do cache de uma só vez
 */
export const getMultipleCachedImages = async (keys: string[]): Promise<Record<string, string>> => {
  const result: Record<string, string> = {};
  if (!keys || keys.length === 0) return result;

  await Promise.all(
    keys.map(async (key) => {
      const cached = await getCachedImage(key);
      if (cached) {
        result[key] = cached;
      }
    })
  );

  return result;
};

/**
 * Salva múltiplas imagens no cache
 */
export const setMultipleCachedImages = async (entries: Record<string, string>): Promise<void> => {
  const keys = Object.keys(entries);
  if (keys.length === 0) return;

  await Promise.all(
    keys.map((key) => setCachedImage(key, entries[key]))
  );
};

/**
 * Remove item do cache
 */
export const removeCachedImage = async (key: string): Promise<void> => {
  memoryFallback.delete(key);

  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(`img_cache_${key}`);
    } catch (e) {}
  }

  try {
    const db = await getDB();
    if (db) {
      await new Promise<void>((resolve) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          store.delete(key);
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        } catch (e) {
          resolve();
        }
      });
    }
  } catch (e) {}
};
