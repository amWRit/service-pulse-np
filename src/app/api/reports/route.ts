import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { checkAndAwardBadges } from "@/lib/utils";

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
  const body = await req.json();

  const { publicServiceId, constituencyId, serviceTimeMinutes, rating, comment, anonymous } = body;

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
