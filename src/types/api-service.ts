import type { ConfigType } from "@/types/config";
import type { AlyvroAxiosInstance, ServiceSchema } from "./api";

export abstract class ApiServiceType {
  protected data: ConfigType;

  constructor(obj: ConfigType) {
    this.data = obj;
  }

  abstract get client(): {
    axios: {
      request: <S extends ServiceSchema = any>() => AlyvroAxiosInstance<S>;
    };
    fetch: {
      request: typeof import("@/client/fetcher").default;
    };
  };
}

export interface ApiServiceTypeConstructor {
  new (obj: ConfigType): ApiServiceType;
  plugins: {
    cache: {
      server: typeof import("@/plugins/cache/server").serverCachePlugin;
    };
  };
}
