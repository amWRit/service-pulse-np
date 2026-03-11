import { NextResponse } from "next/server";
import { verifyChallenge } from "@/lib/challengeStore";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { challengeId, code } = body;

  if (!challengeId || !code) {
    return NextResponse.json(
      { error: "challengeId and code are required.", errorCode: "challenge.errorMissingFields" },
      { status: 400 }
    );
  }

  const result = verifyChallenge(challengeId, String(code).trim());
  if (!result.valid) {
    return NextResponse.json(
      { error: "Invalid or expired code.", errorCode: result.errorCode },
      { status: 400 }
    );
  }

  return NextResponse.json({ verified: true, challengeToken: result.token });
}
