import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allBadges = await prisma.badge.findMany();
  const userBadges = await prisma.userBadge.findMany({
    where: { userId: session.user.id },
    include: { badge: true },
  });

  const earnedIds = new Set(userBadges.map((ub) => ub.badgeId));

  return NextResponse.json({
    all: allBadges,
    earned: userBadges,
    earnedIds: Array.from(earnedIds),
  });
}
