import api from "@/client/api";
import fetcher from "@/client/fetcher";
import { serverCache, serverCachePlugin } from "@/plugins/cache/server";
import middleware from "@/server/middleware";
import { setConfigStorage } from "@/storage";
import { ApiServiceType } from "@/types/api-service";
import type { ConfigType } from "@/types/config";

export class ApiService extends ApiServiceType {
  constructor(obj: ConfigType) {
    super(obj);

    const privateKey = obj.env?.PRIVATE_KEY ?? process.env.PRIVATE_KEY;
    const publicKey = obj.env?.PUBLIC_KEY ?? process.env.PUBLIC_KEY;

    if (!privateKey || !publicKey) {
      throw new Error(
        `Error to get ${
          privateKey ? "PRIVATE_KEY" : "PUBLIC_KEY"
        }\nplease set on .env config or in ApiService options`
      );
    }

    setConfigStorage({
      ...obj,
      env: {
        PRIVATE_KEY: privateKey,
        PUBLIC_KEY: publicKey,
      },
    });
  }

  public get client() {
    return {
      axios: {
        request: api(this.data.url, this.data.auth, this.data.env),
      },
      fetch: {
        request: fetcher,
      },
    };
  }

  public get server() {
    return {
      middleware,
    };
  }

  static get plugins() {
    return {
      cache: {
        server: serverCachePlugin,
      },
    };
  }

  static get storages() {
    return {
      server: {
        cache: serverCache,
      },
    };
  }
}
