import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const service = await prisma.publicService.findUnique({
    where: { id },
    include: {
      constituency: true,
      reports: {
        where: { isHidden: false },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { user: { select: { name: true } } },
      },
    },
  });

  if (!service) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const agg = await prisma.report.aggregate({
    where: { publicServiceId: id, isHidden: false },
    _avg: { rating: true, serviceTimeMinutes: true },
    _count: { id: true },
  });

  return NextResponse.json({
    ...service,
    avgRating: agg._avg.rating,
    avgTime: agg._avg.serviceTimeMinutes,
    reportCount: agg._count.id,
  });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const service = await prisma.publicService.update({
    where: { id },
    data: {
      name: body.name,
      nameNp: body.nameNp,
      type: (body.type as string) || "other",
      location: body.location,
      description: body.description,
      descriptionNp: body.descriptionNp,
      imageUrl: body.imageUrl,
    },
  });

  return NextResponse.json(service);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.publicService.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
