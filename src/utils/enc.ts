import { ConfigEnvType } from "@/types/config";
import crypto from "crypto";
import zlib from "zlib";

const Encrypt = (env?: ConfigEnvType) => {
  const MY_PRIV_KEY = process.env.PRIVATE_KEY ?? env?.PRIVATE_KEY;
  const THEIR_PUB_KEY = process.env.PUBLIC_KEY ?? env?.PUBLIC_KEY;

  if (!MY_PRIV_KEY || !THEIR_PUB_KEY)
    throw new Error(
      `Please set ${
        !MY_PRIV_KEY ? "PRIVATE_KEY" : "PUBLIC_KEY"
      } in env file or set in ApiService Config`
    );

  return {
    encryptSecureBlob: (message: string) => {
      const ecdh = crypto.createECDH("secp256k1");
      ecdh.setPrivateKey(Buffer.from(MY_PRIV_KEY!, "base64"));

      const sharedSecret = ecdh.computeSecret(
        Buffer.from(THEIR_PUB_KEY!, "base64")
      );
      const key = sharedSecret.slice(0, 32);

      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

      const encrypted = Buffer.concat([
        cipher.update(message, "utf8"),
        cipher.final(),
      ]);
      const tag = cipher.getAuthTag();

      const blob = {
        version: "1",
        iv: iv.toString("base64"),
        tag: tag.toString("base64"),
        encrypted: encrypted.toString("base64"),
        senderPublicKey: ecdh.getPublicKey().toString("base64"),
      };

      const json = JSON.stringify(blob);
      const gzipped = zlib.gzipSync(Buffer.from(json, "utf8"));

      return gzipped.toString("hex");
    },

    decryptSecureBlob: (blobHex: string) => {
      const gzippedBuffer = Buffer.from(blobHex, "hex");
      const jsonBuffer = zlib.gunzipSync(gzippedBuffer);
      const blob = JSON.parse(jsonBuffer.toString("utf8"));

      const ecdh = crypto.createECDH("secp256k1");
      ecdh.setPrivateKey(Buffer.from(MY_PRIV_KEY!, "base64"));

      const sharedSecret = ecdh.computeSecret(
        Buffer.from(THEIR_PUB_KEY || blob.senderPublicKey, "base64")
      );
      const key = sharedSecret.slice(0, 32);

      const decipher = crypto.createDecipheriv(
        "aes-256-gcm",
        key,
        Buffer.from(blob.iv, "base64")
      );
      decipher.setAuthTag(Buffer.from(blob.tag, "base64"));

      const decrypted = Buffer.concat([
        decipher.update(Buffer.from(blob.encrypted, "base64")),
        decipher.final(),
      ]);

      return decrypted.toString("utf8");
    },
  };
};

export default Encrypt;
