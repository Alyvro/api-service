import type { ApiTypes, ConfigEnvType } from "@/types/config";
import Encrypt from "@/utils/enc";
import axios, { type AxiosBasicCredentials } from "axios";
import jwt from "jsonwebtoken";
import { gunzipSync, gzipSync } from "zlib";

const { sign } = jwt;

export default function (
  url: string,
  auth?: AxiosBasicCredentials,
  env?: ConfigEnvType,
  api_types?: ApiTypes[]
) {
  const api = axios.create({
    baseURL: url,
    auth,
  });

  api.interceptors.request.use((config) => {
    const { encryptSecureBlob } = Encrypt(env);
    const secret = config.secret;

    config.headers["x-alyvro-api-key"] = sign(
      { data: "alyvro-secret-api-service" },
      env?.PRIVATE_KEY!,
      { expiresIn: "10min" }
    );
    config.headers["x-alyvro-body-type"] = secret?.body ? "sec" : "none";
    config.headers["x-alyvro-status"] = config.status ?? true;

    if (config.plugins?.compressor && config?.data) {
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

    const findApi = api_types?.find((item) => item.url === res.config.baseURL);
    const parsed = findApi?.type.parse(data) ?? data;

    if (res.config?.plugins?.cache) {
      const key = res.config.url!;
      return { ...res, data: res.config.plugins.cache.set(key, parsed) };
    }

    return { ...res, data: parsed };
  });

  return api;
}
