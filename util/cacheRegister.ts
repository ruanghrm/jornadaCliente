// util/cacheRegister.ts

const DEFAULT_TTL = 10 * 60 * 1000; // 10 minutos

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export function getCache<T>(key: string, ttl = DEFAULT_TTL): T | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  try {
    const parsed: CacheEntry<T> = JSON.parse(raw);

    if (Date.now() - parsed.timestamp > ttl) {
      localStorage.removeItem(key);
      return null;
    }

    return parsed.data;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

export function setCache<T>(key: string, data: T) {
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
  };

  localStorage.setItem(key, JSON.stringify(entry));
}

export function clearCache(key: string) {
  localStorage.removeItem(key);
}
