import api from "@/client/api";
import { serverCachePlugin } from "@/plugins/cache/server";
import middleware from "@/server/middleware";
import { setConfigStorage } from "@/storage";
import { ConfigType } from "@/types/config";

export class ApiService {
  private data: ConfigType;

  constructor(obj: ConfigType) {
    this.data = obj;
    setConfigStorage(obj);
  }

  public get client() {
    return {
      request: api(this.data.api_url, this.data.auth, this.data.env),
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
}
