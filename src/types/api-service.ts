import type { Request, Response, NextFunction } from "express";
import type { ConfigType } from "@/types/config";
import type { AlyvroAxiosInstance, ApiResponseMapDefault } from "./api";

export abstract class ApiServiceType {
  protected data: ConfigType;

  constructor(obj: ConfigType) {
    this.data = obj;
  }

  abstract get client(): {
    axios: {
      request: <
        M extends Record<string, any> = ApiResponseMapDefault
      >() => AlyvroAxiosInstance<M>;
    };
    fetch: {
      request: typeof import("@/client/fetcher").default;
    };
  };

  abstract get server(): {
    middleware: (
      req: Request,
      res: Response,
      next: NextFunction
    ) => Promise<void>;
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
