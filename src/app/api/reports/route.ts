import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { checkAndAwardBadges } from "@/lib/utils";
import { reportUserRateLimiter, reportIpSoftRateLimiter, reportIpHardRateLimiter, reportUserGlobalLimiter, reportIpGlobalLimiter } from "@/lib/rateLimiter";
import { generateMathCaptcha, validateMathCaptcha } from "@/lib/mathCaptcha";

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
  const { publicServiceId, constituencyId, serviceTimeMinutes, rating, comment, anonymous, captchaToken } = body;

  // Enforce global hard limit per user or IP (all services)
  try {
    if (session?.user?.id) {
      await reportUserGlobalLimiter.consume(session.user.id);
    } else {
      await reportIpGlobalLimiter.consume(ip);
    }
  } catch {
    return NextResponse.json({
      error: session?.user?.id
        ? "You have reached the maximum number of reports allowed per day. Please try again tomorrow."
        : "This network has reached the maximum number of reports allowed per day. Please try again tomorrow or log in for more access.",
      details: "Global report limit exceeded."
    }, { status: 429 });
  }

  // Enforce global hard limit per user or IP (all services)
  try {
    if (session?.user?.id) {
      await reportUserGlobalLimiter.consume(session.user.id);
    } else {
      await reportIpGlobalLimiter.consume(ip);
    }
  } catch {
    return NextResponse.json({
      error: session?.user?.id
        ? "You have reached the maximum number of reports allowed per day. Please try again tomorrow."
        : "This network has reached the maximum number of reports allowed per day. Please try again tomorrow or log in for more access.",
      details: "Global report limit exceeded."
    }, { status: 429 });
  }

  // Compose a unique key for per-service-per-user/IP per day
  const limiterKey = session?.user?.id
    ? `${session.user.id}:${publicServiceId}`
    : `${ip}:${publicServiceId}`;
  try {
    if (session?.user?.id) {
      await reportUserRateLimiter.consume(limiterKey);
    } else {
      // Anonymous: try soft limiter first
      try {
        await reportIpSoftRateLimiter.consume(limiterKey);
      } catch {
        // Soft limit exceeded, require captcha for further attempts
        if (!captchaToken) {
          // Generate and return a math captcha question
          const captcha = generateMathCaptcha(limiterKey);
          return NextResponse.json({
            error: "Captcha required for additional reports from this network today.",
            captchaRequired: true,
            captchaQuestion: captcha.question
          }, { status: 429 });
        }
        // Validate math captcha answer
        if (!validateMathCaptcha(limiterKey, captchaToken)) {
          return NextResponse.json({
            error: "Incorrect captcha answer. Please try again.",
            captchaRequired: true
          }, { status: 429 });
        }
        // If captcha is valid, allow up to hard limit
        await reportIpHardRateLimiter.consume(limiterKey);
      }
    }
  } catch (rateLimiterRes) {
    return NextResponse.json({
      error: session?.user?.id
        ? "You have already submitted a report for this service today. Please try again tomorrow."
        : "Too many reports for this service from this network today. Please try again tomorrow or log in for more access.",
      details: "Rate limit exceeded."
    }, { status: 429 });
  }

  if (!publicServiceId || !constituencyId || !serviceTimeMinutes || !rating) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1-5" }, { status: 400 });
  }

  const report = await prisma.report.create({
    data: {
      publicServiceId,
      constituencyId,
      serviceTimeMinutes: parseInt(serviceTimeMinutes),
      rating: parseInt(rating),
      comment: comment || null,
      userId: (!anonymous && session?.user?.id) ? session.user.id : null,
    },
  });

  // Award badges for logged-in users
  if (!anonymous && session?.user?.id) {
    await checkAndAwardBadges(session.user.id);
  }

  return NextResponse.json(report, { status: 201 });
}
