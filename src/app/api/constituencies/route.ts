import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const [constituencies, provinces] = await Promise.all([
    prisma.constituency.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { services: true, reports: true } },
        district: { include: { province: { select: { id: true, name: true, nameNp: true } } } },
      },
    }),
    prisma.province.findMany({ select: { name: true, nameNp: true } }),
  ]);

  const provinceByName = new Map(provinces.map((p) => [p.name, p.nameNp]));

  const data = constituencies.map((c) => {
    const provinceNp =
      c.district?.province?.nameNp ??
      (c.province ? provinceByName.get(c.province) ?? provinceByName.get(c.province.replace(/ Province$/, "")) ?? null : null);
    return { ...c, provinceNp };
  });

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, nameNp, imageUrl, description, districtId } = body;

  if (!name || !nameNp) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const constituency = await prisma.constituency.create({
    data: { name, nameNp, imageUrl, description, districtId: districtId || null },
  });

  return NextResponse.json(constituency, { status: 201 });
}
