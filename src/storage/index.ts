// storage.ts
import { ConfigType } from "@/types/config";

let _configStorage: ConfigType | null = null;

export function setConfigStorage(config: ConfigType) {
  _configStorage = config;
}

export function getConfigStorage(): ConfigType | null {
  return _configStorage;
}
