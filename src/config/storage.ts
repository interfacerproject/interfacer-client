/**
 * Key storage abstraction.
 *
 * The SDK needs to persist cryptographic keys (EdDSA private key, public key,
 * seed, etc.) between sessions. By default it uses localStorage in browsers,
 * but apps can inject any storage (secure enclave, file, memory).
 */
export interface KeyStorage {
  getItem(key: string): string | null | undefined;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

/**
 * localStorage adapter (browser only).
 * Returns null if window is not available (SSR/server).
 */
export function createLocalStorageAdapter(): KeyStorage | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  return {
    getItem: (key: string) => window.localStorage.getItem(key),
    setItem: (key: string, value: string) => window.localStorage.setItem(key, value),
    removeItem: (key: string) => window.localStorage.removeItem(key),
    clear: () => window.localStorage.clear(),
  };
}

/**
 * In-memory adapter (for testing or non-browser environments).
 */
export function createMemoryStorage(): KeyStorage {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
  };
}
