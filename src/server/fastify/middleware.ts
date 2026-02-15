import { FastifyReply, FastifyRequest } from "fastify";
import { TelegramNetwork } from "@/network/telegram";
import { getConfigStorage } from "@/storage";
import Encrypt from "@/utils/enc";
import jwt from "jsonwebtoken";
import { gunzipSync, gzipSync } from "zlib";
import { ConfigType } from "main/types";
import { TelegramNetworkObjectType } from "@/types/telegram";

const { verify } = jwt;

const sendTelegramMessage = async (
  request_info: TelegramNetworkObjectType,
  logger?: boolean,
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
    logger,
  );

  return await response.sendMessage();
};

const sendErrorMessage = async (
  req: FastifyRequest,
  reply: FastifyReply,
  config: ConfigType,
) => {
  const powered_by = config.middleware?.powered_by ?? "alyvro/api-service";

  if (config.setting?.telegram) {
    await sendTelegramMessage(
      {
        message:
          config.middleware?.errors?.forbidden ?? "no access to this api",
        method: req.method,
        originalUrl: req.url,
        status_code: "403",
      },
      config.logger,
    );
  }

  reply.status(403).send({
    message: config.middleware?.errors?.forbidden ?? "no access to this api",
    status: 403,
    powered_by,
  });
};

export async function middleware(req: FastifyRequest, reply: FastifyReply) {
  const config = getConfigStorage();

  if (
    config?.middleware?.skip_routers?.length &&
    config.middleware.skip_routers.includes(req.routerPath)
  ) {
    return;
  }

  if (!config) throw new Error("Config no install");

  const privateKey = process.env.PRIVATE_KET ?? config.env?.PRIVATE_KEY;

  if (!privateKey || typeof privateKey !== "string")
    throw new Error("Please set Private Key in env file or apiService config");

  try {
    const alyvroStatus =
      req.headers[config.middleware?.headers?.status ?? "x-alyvro-status"];

    if (!alyvroStatus) {
      await sendErrorMessage(req, reply, config);
      return;
    }

    const alyvroKey =
      req.headers[config.middleware?.headers?.apiKey ?? "x-alyvro-api-key"];
    const alyvroBodyType =
      req.headers[config.middleware?.headers?.bodyType ?? "x-alyvro-body-type"];

    if (!alyvroKey || typeof alyvroKey !== "string") {
      await sendErrorMessage(req, reply, config);
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
      let decode = decryptSecureBlob(req.body as any);

      try {
        decode = JSON.parse(decode);
      } catch (error) {}

      req.body = decode;
    } else {
      req.body = bodyData;
    }

    const originalSend = reply.send.bind(reply);

    reply.send = function (payload: unknown) {
      if (req.headers["accept-encoding"]?.includes("gzip")) {
        try {
          let bufferData: Buffer;

          if (Buffer.isBuffer(payload)) {
            bufferData = payload;
          } else if (typeof payload === "string") {
            bufferData = Buffer.from(payload, "utf-8");
          } else {
            bufferData = Buffer.from(JSON.stringify(payload), "utf-8");
            reply.header("Content-Type", "application/json");
          }

          const compressed = gzipSync(bufferData);
          reply.header("Content-Encoding", "gzip");
          reply.removeHeader("Content-Length");

          return originalSend(compressed);
        } catch (error) {
          console.error("Failed to compress response:", error);
        }
      }
      return originalSend(payload);
    } as any;
  } catch {
    await sendErrorMessage(req, reply, config);
    return;
  }
}
