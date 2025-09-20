export type ReturnFunction = {
  get: <T>(key: string) => T | undefined;
  set: <T>(key: string, data: T) => T;
  clear: (key?: string | undefined) => void;
};

export type CacheEntry<T> = {
  data: T;
  timestamp: number;
};
