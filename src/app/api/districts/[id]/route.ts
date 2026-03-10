import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const district = await prisma.district.update({
    where: { id },
    data: { name: body.name, nameNp: body.nameNp, provinceId: body.provinceId },
    include: { province: { select: { id: true, name: true } } },
  });
  return NextResponse.json(district);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.district.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
