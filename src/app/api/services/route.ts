import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const constituencyId = searchParams.get("constituencyId");

  const services = await prisma.publicService.findMany({
    where: constituencyId ? { constituencyId } : undefined,
    include: {
      constituency: { select: { name: true, nameNp: true } },
      _count: { select: { reports: true } },
    },
    orderBy: { name: "asc" },
  });

  // Attach aggregates
  const servicesWithStats = await Promise.all(
    services.map(async (svc) => {
      const agg = await prisma.report.aggregate({
        where: { publicServiceId: svc.id, isHidden: false },
        _avg: { rating: true, serviceTimeMinutes: true },
        _count: { id: true },
      });
      return { ...svc, avgRating: agg._avg.rating, avgTime: agg._avg.serviceTimeMinutes, reportCount: agg._count.id };
    })
  );

  return NextResponse.json(servicesWithStats);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, nameNp, type, location, description, descriptionNp, constituencyId, imageUrl } = body;

  if (!name || !nameNp || !constituencyId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const service = await prisma.publicService.create({
    data: {
      name,
      nameNp,
      type: (type as string) || "other",
      location,
      description,
      descriptionNp,
      imageUrl,
      constituencyId,
    },
  });

  return NextResponse.json(service, { status: 201 });
}
