import { retry } from "@/plugins/retry";
import type { AlyvroAxiosInstance, ApiResponseMapDefault } from "@/types/api";
import type { ConfigEnvType, ConfigMiddlewareType } from "@/types/config";
import Encrypt from "@/utils/enc";
import axios, { type AxiosBasicCredentials } from "axios";
import jwt from "jsonwebtoken";
import { gunzipSync, gzipSync } from "zlib";

const { sign } = jwt;

export default function <M extends Record<string, any> = ApiResponseMapDefault>(
  base: string,
  auth?: AxiosBasicCredentials,
  env?: ConfigEnvType,
  config_middleware?: Partial<ConfigMiddlewareType>
): AlyvroAxiosInstance<M> {
  const api = axios.create({
    baseURL: base,
    auth,
  }) as AlyvroAxiosInstance<M>;

  api.interceptors.request.use((config) => {
    const { encryptSecureBlob } = Encrypt(env);
    const secret = (config as any).secret;

    config.headers[config_middleware?.headers?.apiKey ?? "x-alyvro-api-key"] =
      sign({ data: "alyvro-secret-api-service" }, env?.PRIVATE_KEY!, {
        expiresIn: "10min",
      });

    config.headers[
      config_middleware?.headers?.bodyType ?? "x-alyvro-body-type"
    ] = secret?.body ? "sec" : "none";

    config.headers[config_middleware?.headers?.status ?? "x-alyvro-status"] =
      (config as any).status ?? true;

    if ((config as any).plugins?.compressor && config?.data) {
      const str = JSON.stringify(config.data);
      config.data = gzipSync(str);
      config.headers["Content-Encoding"] = "gzip";
    }

    if (secret?.body && config?.data) {
      config.data = encryptSecureBlob(
        typeof config.data === "string"
          ? config.data
          : JSON.stringify(config.data)
      );
    }

    return config;
  });

  api.interceptors.response.use((res) => {
    let data = res.data;

    if (
      res.headers["content-encoding"] === "gzip" &&
      Buffer.isBuffer(res.data)
    ) {
      try {
        data = JSON.parse(gunzipSync(res.data).toString("utf-8"));
      } catch (error) {
        console.error("Failed to decompress response", error);
      }
    }

    const parsed = data;

    if ((res.config as any)?.plugins?.cache) {
      const key = res.config.url!;
      return {
        ...res,
        data: (res.config as any).plugins.cache.set(key, parsed),
      };
    }

    return { ...res, data: parsed };
  });

  retry(api);

  return api;
}
