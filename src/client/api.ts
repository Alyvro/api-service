import type { ConfigEnvType } from "@/types/config";
import Encrypt from "@/utils/enc";
import axios, { type AxiosBasicCredentials } from "axios";
import jwt from "jsonwebtoken";

const { sign } = jwt;

export default function (
  url: string,
  auth?: AxiosBasicCredentials,
  env?: ConfigEnvType
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
    config.headers["x-alyvro-status"] = config.status;

    if (secret?.body) {
      if (config?.data) {
        config.data = encryptSecureBlob(JSON.stringify(config.data));
      }
    }

    return config;
  });

  return api;
}
