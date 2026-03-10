import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const provinceId = searchParams.get("provinceId");

  const districts = await prisma.district.findMany({
    where: provinceId ? { provinceId } : undefined,
    include: {
      province: { select: { id: true, name: true } },
      _count: { select: { constituencies: true } },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(districts);
}

export async function POST(req: Request) {
  const body = await req.json();
  const district = await prisma.district.create({
    data: { name: body.name, nameNp: body.nameNp, provinceId: body.provinceId },
    include: { province: { select: { id: true, name: true } } },
  });
  return NextResponse.json(district);
}
