import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { checkAndAwardBadges } from "@/lib/utils";
import { reportIpHardRateLimiter, reportUserGlobalLimiter, reportIpGlobalLimiter } from "@/lib/rateLimiter";
import { validateChallengeToken } from "@/lib/challengeStore";

const EDIT_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const serviceId = searchParams.get("serviceId");
  const constituencyId = searchParams.get("constituencyId");

  const reports = await prisma.report.findMany({
    where: {
      isHidden: false,
      ...(serviceId ? { publicServiceId: serviceId } : {}),
      ...(constituencyId ? { constituencyId } : {}),
    },
    include: {
      publicService: { select: { name: true, nameNp: true, type: true } },
      user: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(reports);
}

export async function POST(req: Request) {
  const session = await auth();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const body = await req.json();
  const { publicServiceId, constituencyId, serviceTimeMinutes, rating, comment, anonymous, challengeToken } = body;

  if (!publicServiceId || !constituencyId || !serviceTimeMinutes || !rating) {
    return NextResponse.json({ error: "Missing required fields", errorCode: "report.errorMissingFields" }, { status: 400 });
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1-5", errorCode: "report.errorInvalidRating" }, { status: 400 });
  }

  // ── Logged-in, non-anonymous path ───────────────────────────────────────────────────
  // Enforced at the DB level via @@unique([userId, publicServiceId]).
  // If a report already exists, return it so the UI can offer an edit flow.
  if (session?.user?.id && !anonymous) {
    const existing = await prisma.report.findUnique({
      where: { userId_publicServiceId: { userId: session.user.id, publicServiceId } },
    });

    if (existing) {
      const msSinceLastEdit = Date.now() - existing.updatedAt.getTime();
      const canEdit = msSinceLastEdit >= EDIT_COOLDOWN_MS;
      const hoursLeft = canEdit ? 0 : Math.ceil((EDIT_COOLDOWN_MS - msSinceLastEdit) / (1000 * 60 * 60));
      return NextResponse.json({
        alreadyReported: true,
        canEdit,
        hoursLeft,
        existing: {
          id: existing.id,
          serviceTimeMinutes: existing.serviceTimeMinutes,
          rating: existing.rating,
          comment: existing.comment,
          updatedAt: existing.updatedAt,
        },
      }, { status: 409 });
    }

    // No existing report — enforce global daily cap then create
    try {
      await reportUserGlobalLimiter.consume(session.user.id);
    } catch {
      return NextResponse.json({
        error: "You have reached the maximum number of reports allowed per day. Please try again tomorrow.",
        errorCode: "report.errorGlobalLimitUser",
      }, { status: 429 });
    }

    const report = await prisma.report.create({
      data: {
        publicServiceId,
        constituencyId,
        serviceTimeMinutes: parseInt(serviceTimeMinutes),
        rating: parseInt(rating),
        comment: comment || null,
        userId: session.user.id,
      },
    });
    await checkAndAwardBadges(session.user.id);
    return NextResponse.json(report, { status: 201 });
  }

  // ── Anonymous path ──────────────────────────────────────────────────────────

  // Challenge token required for all anonymous submissions
  if (!challengeToken || !validateChallengeToken(challengeToken)) {
    return NextResponse.json({
      error: "Verification required before submitting a report.",
      errorCode: "challenge.required",
      challengeRequired: true,
    }, { status: 401 });
  }

  try {
    await reportIpGlobalLimiter.consume(ip);
  } catch {
    return NextResponse.json({
      error: "This network has reached the daily report limit. Please try again tomorrow or log in for more access.",
      errorCode: "report.errorGlobalLimitIp",
    }, { status: 429 });
  }

  const ipServiceKey = `${ip}:${publicServiceId}`;
  try {
    await reportIpHardRateLimiter.consume(ipServiceKey);
  } catch {
    return NextResponse.json({
      error: "Too many reports for this service from this network today. Please try again tomorrow or log in for more access.",
      errorCode: "report.errorServiceLimitIp",
    }, { status: 429 });
  }

  const report = await prisma.report.create({
    data: {
      publicServiceId,
      constituencyId,
      serviceTimeMinutes: parseInt(serviceTimeMinutes),
      rating: parseInt(rating),
      comment: comment || null,
      userId: null,
    },
  });
  return NextResponse.json(report, { status: 201 });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Login required to edit a report.", errorCode: "report.errorLoginRequired" }, { status: 401 });
  }

  const body = await req.json();
  const { publicServiceId, serviceTimeMinutes, rating, comment } = body;

  if (!publicServiceId || !serviceTimeMinutes || !rating) {
    return NextResponse.json({ error: "Missing required fields", errorCode: "report.errorMissingFields" }, { status: 400 });
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1-5", errorCode: "report.errorInvalidRating" }, { status: 400 });
  }

  const existing = await prisma.report.findUnique({
    where: { userId_publicServiceId: { userId: session.user.id, publicServiceId } },
  });
  if (!existing) {
    return NextResponse.json({ error: "No report found to update.", errorCode: "report.errorNotFound" }, { status: 404 });
  }

  const msSinceLastEdit = Date.now() - existing.updatedAt.getTime();
  if (msSinceLastEdit < EDIT_COOLDOWN_MS) {
    const hoursLeft = Math.ceil((EDIT_COOLDOWN_MS - msSinceLastEdit) / (1000 * 60 * 60));
    return NextResponse.json({
      error: `You can update this report again in ${hoursLeft} hour(s).`,
      errorCode: "report.errorEditCooldown",
      hoursLeft,
    }, { status: 429 });
  }

  const updated = await prisma.report.update({
    where: { id: existing.id },
    data: {
      serviceTimeMinutes: parseInt(serviceTimeMinutes),
      rating: parseInt(rating),
      comment: comment || null,
    },
  });
  return NextResponse.json({ ...updated, wasUpdated: true });
}
