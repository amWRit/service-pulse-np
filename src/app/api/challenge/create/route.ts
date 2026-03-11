import { NextResponse } from "next/server";
import { createChallenge } from "@/lib/challengeStore";
import { challengeCreateLimiter } from "@/lib/rateLimiter";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  try {
    await challengeCreateLimiter.consume(ip);
  } catch {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment.", errorCode: "challenge.errorRateLimit" },
      { status: 429 }
    );
  }

  const { id, expiresAt } = createChallenge();

  // Build the view URL: the page the user opens to see their code
  const origin = req.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const viewUrl = `${origin}/verify-code?c=${id}`;

  return NextResponse.json({ challengeId: id, viewUrl, expiresAt });
}
