import { ApiError } from "@/error/api-error";
import { getConfigStorage } from "@/storage";
import type { RequestInitType } from "@/types/fetch";
import jwt from "jsonwebtoken";

const { sign } = jwt;

export default async function fetcher<T = unknown>(
  input: string,
  init?: RequestInitType | undefined
) {
  const config = getConfigStorage();

  if (!config) throw new Error("please set config");

  const { url, auth, env } = config;

  // const secret = init?.secret;

  const buildHeaders = (): Headers => {
    const headers = new Headers(init?.headers);

    headers.set(
      config.middleware?.headers?.apiKey ?? "x-alyvro-api-key",
      sign({ data: "alyvro-secret-api-service" }, env?.PRIVATE_KEY!, {
        expiresIn: "10min",
      })
    );
    headers.set(
      config.middleware?.headers?.bodyType ?? "x-alyvro-body-type",
      "none"
    );
    headers.set(
      config.middleware?.headers?.status ?? "x-alyvro-status",
      String(init?.status ?? true)
    );

    if (auth?.username && auth?.password) {
      headers.set(
        "Authorization",
        "Basic " +
          Buffer.from(`${auth.username}:${auth.password}`).toString("base64")
      );
    }

    if (init?.method === "POST") {
      headers.set("Content-Type", "application/json");
    }

    return headers;
  };

  const finalInit: RequestInitType = {
    ...init,
    headers: buildHeaders(),
  };

  const finalUrl = url.concat(input);

  // if (init?.plugins?.compressor && init?.body) {
  //   const str =
  //     typeof init.body === "string" ? init.body : JSON.stringify(init.body);
  //   const compressed = gzipSync(str);

  //   finalInit.body = new Uint8Array(compressed);
  //   (finalInit.headers as Record<string, string>)["Content-Encoding"] = "gzip";
  // }

  if (init?.response_return) {
    const res = await fetch(finalUrl, finalInit);

    if (!init.response_return_status_check && !res.ok) {
      const data = await res.json();

      throw new ApiError(res.status, res.statusText, data, init);
    }

    if (
      init.response_return_status_check &&
      init.response_return_status_check !== res.status
    ) {
      const data = await res.json();

      throw new ApiError(res.status, res.statusText, data, init);
    }

    return (await res.json()) as T;
  }

  return fetch(finalUrl, finalInit);
}
