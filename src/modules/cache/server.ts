type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

const serverCache = new Map<string, CacheEntry<any>>();

export const serverCacheModule = {
  get: <T>(key: string): T | undefined => serverCache.get(key)?.data,

  set: <T>(key: string, data: T): T => {
    const prev = serverCache.get(key)?.data;
    if (JSON.stringify(prev) === JSON.stringify(data)) {
      return prev;
    }
    serverCache.set(key, { data, timestamp: Date.now() });
    return data;
  },

  clear: (key?: string) => {
    if (key) serverCache.delete(key);
    else serverCache.clear();
  },
};
