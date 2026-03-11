/**
 * In-memory challenge store for QR/link-based spam friction.
 * Each challenge is a single-use 6-digit code with a 90-second TTL.
 * After the user verifies the code, a short-lived signed token is issued
 * and passed with the report submission.
 *
 * For multi-instance deployments swap to Redis with the same interface.
 */

import { randomUUID, createHmac, timingSafeEqual } from "crypto";

const CHALLENGE_TTL_MS = 90 * 1_000;    // 90 s to read the code
const TOKEN_TTL_MS    = 30 * 60 * 1_000; // 30 min to use the token after verify
const SECRET = process.env.CHALLENGE_SECRET ?? "challenge-secret-change-in-production";

interface ChallengeEntry {
  otp: string;
  expiresAt: number;
  verified: boolean;
}

const store = new Map<string, ChallengeEntry>();

// Prune expired entries every minute
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.expiresAt + 5_000 < now) store.delete(key);
    }
  }, 60_000);
}

/** Create a new challenge. Returns id and absolute expiry timestamp. */
export function createChallenge(): { id: string; expiresAt: number } {
  const id = randomUUID();
  const otp = String(Math.floor(100_000 + Math.random() * 900_000));
  const expiresAt = Date.now() + CHALLENGE_TTL_MS;
  store.set(id, { otp, expiresAt, verified: false });
  return { id, expiresAt };
}

/** Return the OTP for display on the verify-code page.
 *  Returns null if expired or already verified. */
export function peekChallenge(id: string): { otp: string; expiresIn: number } | null {
  const entry = store.get(id);
  if (!entry || entry.verified || Date.now() > entry.expiresAt) return null;
  return {
    otp: entry.otp,
    expiresIn: Math.max(0, Math.ceil((entry.expiresAt - Date.now()) / 1_000)),
  };
}

/** Verify a submitted code. Marks the challenge as used on success. */
export function verifyChallenge(
  id: string,
  code: string
): { valid: boolean; errorCode?: string; token?: string } {
  const entry = store.get(id);
  if (!entry) return { valid: false, errorCode: "challenge.errorNotFound" };
  if (Date.now() > entry.expiresAt) {
    store.delete(id);
    return { valid: false, errorCode: "challenge.errorExpired" };
  }
  if (entry.verified) return { valid: false, errorCode: "challenge.errorUsed" };

  const a = Buffer.from(entry.otp);
  const b = Buffer.from(code.trim());
  const match = a.length === b.length && timingSafeEqual(a, b);
  if (!match) return { valid: false, errorCode: "challenge.errorWrongCode" };

  entry.verified = true;
  return { valid: true, token: issueChallengeToken(id) };
}

// ── Signed challenge token ────────────────────────────────────────────────────

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("hex");
}

function issueChallengeToken(challengeId: string): string {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payload = `${challengeId}:${expiresAt}`;
  return Buffer.from(`${payload}:${sign(payload)}`).toString("base64url");
}

/** Returns true if the token is valid and not expired. */
export function validateChallengeToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const lastColon = decoded.lastIndexOf(":");
    const payload = decoded.slice(0, lastColon);
    const sig     = decoded.slice(lastColon + 1);
    const expected = sign(payload);
    if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      return false;
    }
    const expiresAt = parseInt(payload.slice(payload.indexOf(":") + 1), 10);
    return !isNaN(expiresAt) && Date.now() <= expiresAt;
  } catch {
    return false;
  }
}
