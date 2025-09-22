import type { Request, Response, NextFunction } from "express";
import type { ConfigType } from "@/types/config";
import type { MiddlewareOptions } from "./middleware";

export abstract class ApiServiceType {
  protected data: ConfigType;

  constructor(obj: ConfigType) {
    this.data = obj;
  }

  abstract get client(): {
    axios: {
      request: ReturnType<typeof import("@/client/api").default>;
    };
    fetch: {
      request: typeof import("@/client/fetcher").default;
    };
  };

  abstract get server(): {
    middleware: (
      req: Request,
      res: Response,
      next: NextFunction,
      options?: Partial<MiddlewareOptions>
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
