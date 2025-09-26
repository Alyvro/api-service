import type { MiddlewareOptions } from "@/types/middleware";
import type { TelegramNetworkObjectType } from "@/types/telegram";
import type { NextFunction, Request, Response } from "express";

import { TelegramNetwork } from "@/network/telegram";
import { getConfigStorage } from "@/storage";
import Encrypt from "@/utils/enc";
import jwt from "jsonwebtoken";
import { gunzipSync, gzipSync } from "zlib";
import { ConfigType } from "main/types";

const { verify } = jwt;

const sendTelegramMessage = async (
  request_info: TelegramNetworkObjectType,
  logger?: boolean
) => {
  const token = process.env.TELEGRAM_TOKEN;
  const chat_id = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chat_id) {
    throw new Error("Token or Chat ID is missing in TelegramNetwork");
  }

  const response = new TelegramNetwork(
    token,
    chat_id,
    {
      ...request_info,
    },
    logger
  );

  return await response.sendMessage();
};

const sendErrorMessage = async (
  req: Request,
  res: Response,
  config: ConfigType
) => {
  const powerd_by = config.middleware?.powerd_by ?? "alyvro/api-service";

  if (config.setting?.telegram) {
    await sendTelegramMessage(
      {
        message:
          config.middleware?.errors?.forbidden ?? "no access to this api",
        method: req.method,
        originalUrl: req.originalUrl,
        status_code: "403",
      },
      config.logger
    );
  }

  res.status(403).json({
    message: config.middleware?.errors?.forbidden ?? "no access to this api",
    status: 403,
    powerd_by,
  });
};

export default async function middleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const config = getConfigStorage();

  if (
    config?.middleware?.skip_routers?.length &&
    config.middleware.skip_routers.includes(req.path)
  ) {
    return next();
  }

  if (!config) throw new Error("Config no install");

  const privateKey = process.env.PRIVATE_KET ?? config.env?.PRIVATE_KEY;

  if (!privateKey || typeof privateKey !== "string")
    throw new Error("Please set Private Key in env file or apiService config");

  try {
    const alyvroStatus =
      req.headers[config.middleware?.headers?.status ?? "x-alyvro-status"];

    if (!alyvroStatus) {
      sendErrorMessage(req, res, config);

      return;
    }

    const alyvroKey =
      req.headers[config.middleware?.headers?.apiKey ?? "x-alyvro-api-key"];
    const alyvroBodyType =
      req.headers[config.middleware?.headers?.bodyType ?? "x-alyvro-body-type"];

    if (!alyvroKey || typeof alyvroKey !== "string") {
      sendErrorMessage(req, res, config);
      return;
    }

    const { decryptSecureBlob } = Encrypt(config.env);

    verify(alyvroKey, privateKey);

    let bodyData = req.body;

    if (
      req.headers["content-encoding"] === "gzip" &&
      Buffer.isBuffer(bodyData)
    ) {
      try {
        bodyData = gunzipSync(bodyData).toString("utf-8");
      } catch (err) {
        console.error("Failed to decompress gzip body:", err);
      }
    }

    if (alyvroBodyType === "sec") {
      let decode = decryptSecureBlob(req.body);

      try {
        decode = JSON.parse(decode);
      } catch (error) {}

      req.body = decode;
    } else {
      req.body = bodyData;
    }

    const originalJson = res.json.bind(res);
    res.json = (data) => {
      if (req.headers["accept-encoding"]?.includes("gzip")) {
        try {
          const compressed = gzipSync(
            Buffer.from(JSON.stringify(data), "utf-8")
          );
          res.setHeader("Content-Encoding", "gzip");
          res.setHeader("Content-Type", "application/json");
          res.send(compressed);
          return res;
        } catch (error) {
          console.error("Failed to compress response:", error);
        }

        return originalJson();
      }
    };

    return next();
  } catch {
    sendErrorMessage(req, res, config);
    return;
  }
}
