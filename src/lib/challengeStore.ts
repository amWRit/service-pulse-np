/**
 * Stateless challenge store for QR/link-based spam friction.
 *
 * Instead of an in-memory Map (which breaks on serverless/Vercel where each
 * invocation may land on a different cold instance), the challengeId IS the
 * signed token: base64url(payload) + "." + HMAC-SHA256(base64url(payload)).
 *
 * Payload: { otp, expiresAt }
 *
 * Trade-off: a code can technically be verified more than once within the 90 s
 * window (no server-side blacklist), but rate-limiting and the short TTL keep
 * abuse negligible for this spam-friction use case.
 */

import { createHmac, timingSafeEqual } from "crypto";

const CHALLENGE_TTL_MS = 90 * 1_000;     // 90 s to read the code
const TOKEN_TTL_MS    = 30 * 60 * 1_000; // 30 min to submit after verify
const SECRET = process.env.CHALLENGE_SECRET ?? "challenge-secret-change-in-production";

// ── HMAC helpers ──────────────────────────────────────────────────────────────

function hmac(data: string): string {
  return createHmac("sha256", SECRET).update(data).digest("hex");
}

function signPayload(payloadB64: string): string {
  return `${payloadB64}.${hmac(payloadB64)}`;
}

function verifyAndDecode<T>(token: string): T | null {
  const dot = token.lastIndexOf(".");
  if (dot < 0) return null;
  const payloadB64 = token.slice(0, dot);
  const sig        = token.slice(dot + 1);
  const expected   = hmac(payloadB64);
  try {
    if (
      sig.length !== expected.length ||
      !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
    ) return null;
  } catch {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(payloadB64, "base64url").toString()) as T;
  } catch {
    return null;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

interface ChallengePayload {
  otp: string;
  expiresAt: number;
}

/** Create a new challenge. Returns signed challengeId and absolute expiry. */
export function createChallenge(): { id: string; expiresAt: number } {
  const otp       = String(Math.floor(100_000 + Math.random() * 900_000));
  const expiresAt = Date.now() + CHALLENGE_TTL_MS;
  const b64       = Buffer.from(JSON.stringify({ otp, expiresAt })).toString("base64url");
  return { id: signPayload(b64), expiresAt };
}

/** Return the OTP for display on the verify-code page.
 *  Returns null if the token is invalid or expired. */
export function peekChallenge(id: string): { otp: string; expiresIn: number } | null {
  const payload = verifyAndDecode<ChallengePayload>(id);
  if (!payload) return null;
  if (Date.now() > payload.expiresAt) return null;
  return {
    otp: payload.otp,
    expiresIn: Math.max(0, Math.ceil((payload.expiresAt - Date.now()) / 1_000)),
  };
}

/** Verify a submitted code. Returns a signed challenge token on success. */
export function verifyChallenge(
  id: string,
  code: string
): { valid: boolean; errorCode?: string; token?: string } {
  const payload = verifyAndDecode<ChallengePayload>(id);
  if (!payload) return { valid: false, errorCode: "challenge.errorNotFound" };
  if (Date.now() > payload.expiresAt) return { valid: false, errorCode: "challenge.errorExpired" };

  const a = Buffer.from(payload.otp);
  const b = Buffer.from(code.trim());
  const match = a.length === b.length && timingSafeEqual(a, b);
  if (!match) return { valid: false, errorCode: "challenge.errorWrongCode" };

  return { valid: true, token: issueChallengeToken(id) };
}

// ── Signed challenge token (issued after a successful verify) ─────────────────

function issueChallengeToken(challengeId: string): string {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  // Use a short stable ref (hmac of challengeId) rather than embedding the
  // full signed challengeId, keeping the token compact.
  const ref     = hmac(challengeId).slice(0, 16);
  const b64     = Buffer.from(JSON.stringify({ ref, expiresAt })).toString("base64url");
  return signPayload(b64);
}

/** Returns true if the challenge token is valid and not expired. */
export function validateChallengeToken(token: string): boolean {
  const payload = verifyAndDecode<{ ref: string; expiresAt: number }>(token);
  if (!payload) return false;
  return Date.now() <= payload.expiresAt;
}

