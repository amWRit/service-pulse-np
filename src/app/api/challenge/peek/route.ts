import { NextResponse } from "next/server";
import { peekChallenge } from "@/lib/challengeStore";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("c");

  if (!id) {
    return NextResponse.json({ error: "Missing challenge id" }, { status: 400 });
  }

  const result = peekChallenge(id);
  if (!result) {
    return NextResponse.json(
      { error: "Code not found, already used, or expired.", errorCode: "challenge.errorExpired" },
      { status: 404 }
    );
  }

  return NextResponse.json(result);
}
