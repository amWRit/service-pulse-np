import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const services = await prisma.publicService.findMany({
    include: {
      constituency: { select: { name: true, nameNp: true } },
      _count: { select: { reports: true } },
    },
  });

  const withStats = await Promise.all(
    services.map(async (svc) => {
      const agg = await prisma.report.aggregate({
        where: { publicServiceId: svc.id, isHidden: false },
        _avg: { rating: true, serviceTimeMinutes: true },
        _count: { id: true },
      });
      return {
        ...svc,
        avgRating: agg._avg.rating ?? 0,
        avgTime: agg._avg.serviceTimeMinutes ?? 0,
        reportCount: agg._count.id,
      };
    })
  );

  // Filter only services with at least 1 report
  const filtered = withStats.filter((s) => s.reportCount > 0);

  return NextResponse.json({
    fastest: [...filtered].sort((a, b) => a.avgTime - b.avgTime).slice(0, 10),
    slowest: [...filtered].sort((a, b) => b.avgTime - a.avgTime).slice(0, 10),
    best: [...filtered].sort((a, b) => b.avgRating - a.avgRating).slice(0, 10),
    worst: [...filtered].sort((a, b) => a.avgRating - b.avgRating).slice(0, 10),
  });
}
