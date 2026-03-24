/**
 * Simple cache utility to manage localStorage with a naming convention.
 */
export const cacheService = {
  get<T>(key: string): T | null {
    const data = localStorage.getItem(`cache_${key}`);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch (e) {
      console.error(`Error parsing cache for key: ${key}`, e);
      return null;
    }
  },

  set<T>(key: string, data: T): void {
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(data));
    } catch (e) {
      console.error(`Error setting cache for key: ${key}`, e);
    }
  },

  remove(key: string): void {
    localStorage.removeItem(`cache_${key}`);
  },

  clearAll(): void {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('cache_')) {
        localStorage.removeItem(key);
      }
    });
  }
};
