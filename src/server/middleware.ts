import { TelegramNetwork } from "@/network/telegram";
import { getConfigStorage } from "@/storage";
import type { ConfigSettingType } from "@/types/config";
import type { TelegramNetworkObjectType } from "@/types/telegram";
import Encrypt from "@/utils/enc";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

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

export default async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const config = getConfigStorage();

  if (!config) throw new Error("Config no install");

  const privateKey = process.env.PRIVATE_KET ?? config.env?.PRIVATE_KEY;

  if (!privateKey || typeof privateKey !== "string")
    throw new Error("Please set Private Key in env file or apiService config");

  try {
    const alyvroStatus = req.headers["x-alyvro-status"];

    if (!alyvroStatus) {
      if (config.setting?.telegram) {
        await sendTelegramMessage(
          {
            message: "no access to this api",
            method: req.method,
            originalUrl: req.originalUrl,
            status_code: "403",
          },
          config.logger
        );
      }

      res.status(403).json({
        message: "no access to this api",
        status: 403,
        powerd_by: "alyvro",
      });

      return;
    }

    const alyvroKey = req.headers["x-alyvro-api-key"];
    const alyvroBodyType = req.headers["x-alyvro-body-type"];

    if (!alyvroKey || typeof alyvroKey !== "string") {
      if (config.setting?.telegram) {
        await sendTelegramMessage(
          {
            message: "no access to this api",
            method: req.method,
            originalUrl: req.originalUrl,
            status_code: "403",
          },
          config.logger
        );
      }

      res.status(403).json({
        message: "no access to this api",
        status: 403,
        powerd_by: "alyvro",
      });
      return;
    }

    const { decryptSecureBlob } = Encrypt(config.env);

    verify(alyvroKey, privateKey);

    if (alyvroBodyType === "sec") {
      let decode = decryptSecureBlob(req.body);

      try {
        decode = JSON.parse(decode);
      } catch (error) {}

      req.body = decode;
    }

    return next();
  } catch (error) {
    if (config.setting?.telegram) {
      await sendTelegramMessage(
        {
          message: "no access to this api",
          method: req.method,
          originalUrl: req.originalUrl,
          status_code: "403",
        },
        config.logger
      );
    }

    res.status(403).json({
      message: "no access to this api",
      status: 403,
      powerd_by: "alyvro",
    });
    return;
  }
}
