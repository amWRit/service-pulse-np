import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const provinces = await prisma.province.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { districts: true } } },
  });
  return NextResponse.json(provinces);
}

export async function POST(req: Request) {
  const body = await req.json();
  const province = await prisma.province.create({
    data: { name: body.name, nameNp: body.nameNp },
  });
  return NextResponse.json(province);
}
