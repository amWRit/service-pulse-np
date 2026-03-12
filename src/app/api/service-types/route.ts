import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

function normalizeSlug(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}

export async function GET() {
  const [types, usage] = await Promise.all([
    prisma.serviceType.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.publicService.groupBy({
      by: ["type"],
      _count: { _all: true },
    }),
  ]);

  const usageByType = new Map(usage.map((item) => [item.type, item._count._all]));
  const typesWithCounts = types.map((type) => ({
    ...type,
    _count: { services: usageByType.get(type.slug) ?? 0 },
  }));

  return NextResponse.json(typesWithCounts);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const slug = normalizeSlug(body.slug ?? "");

  if (!slug || !body.name || !body.nameNp) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const serviceType = await prisma.serviceType.create({
    data: {
      slug,
      name: body.name,
      nameNp: body.nameNp,
      icon: body.icon || "🏢",
    },
  });

  return NextResponse.json(serviceType, { status: 201 });
}
