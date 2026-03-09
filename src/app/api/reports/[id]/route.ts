import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const report = await prisma.report.update({
    where: { id },
    data: {
      isHidden: body.isHidden !== undefined ? body.isHidden : undefined,
      isModerated: body.isModerated !== undefined ? body.isModerated : undefined,
    },
  });

  return NextResponse.json(report);
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
  await prisma.report.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
