import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const province = await prisma.province.update({
    where: { id },
    data: { name: body.name, nameNp: body.nameNp },
  });
  return NextResponse.json(province);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.province.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
