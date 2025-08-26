import crypto from "crypto";

const enable = (process.env.ENABLE_ENCRYPTION || "false").toLowerCase() === "true";

const keyHex = process.env.ENCRYPTION_KEY_HEX || "";
let key = null;
if (enable) {
  if (!/^[0-9a-fA-F]{64}$/.test(keyHex)) {
    throw new Error("ENCRYPTION_KEY_HEX must be 64 hex chars (256-bit) when ENABLE_ENCRYPTION=true");
  }
  key = Buffer.from(keyHex, "hex");
}

export function encrypt(text) {
  if (!enable) return { ciphertext: text, iv: null, tag: null, aad: null, enc: false };

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const aad = crypto.randomBytes(8);
  cipher.setAAD(aad);
  const ciphertext = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    ciphertext: Buffer.concat([aad, ciphertext]).toString("base64"),
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    aad: aad.toString("base64"),
    enc: true
  };
}

export function decrypt(payload) {
  const { ciphertext, iv, tag } = payload;
  if (!enable || !iv || !tag) return ciphertext; // stored as plain text
  const buf = Buffer.from(ciphertext, "base64");
  const aad = buf.subarray(0, 8);
  const data = buf.subarray(8);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64"));
  decipher.setAAD(aad);
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  const out = Buffer.concat([decipher.update(data), decipher.final()]);
  return out.toString("utf8");
}
