import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // seconds

const digest = (s: string) => createHash("sha256").update(s).digest();
const sign = (payload: string, secret: string) =>
  createHmac("sha256", secret).update(payload).digest("base64url");

/** Equal-length digests keep the comparison constant time for any input (D-040). */
export function checkPassword(input: string) {
  const password = process.env.APP_PASSWORD;
  return !!password && timingSafeEqual(digest(input), digest(password));
}

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not set");
  return s;
}

export function signSession(now = Date.now()) {
  const expiry = String(now + SESSION_MAX_AGE * 1000);
  return `${expiry}.${sign(expiry, secret())}`;
}

export function verifySession(token: string | undefined, now = Date.now()) {
  const s = process.env.SESSION_SECRET;
  if (!token || !s) return false;
  const [expiry, signature = ""] = token.split(".");
  return (
    Number(expiry) > now &&
    timingSafeEqual(digest(signature), digest(sign(expiry, s)))
  );
}
