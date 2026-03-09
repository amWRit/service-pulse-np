import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const constituency = await prisma.constituency.findUnique({
    where: { id },
    include: {
      services: {
        include: {
          _count: { select: { reports: true } },
        },
      },
    },
  });

  if (!constituency) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(constituency);
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
  const { name, nameNp, imageUrl, description, province } = body;

  const constituency = await prisma.constituency.update({
    where: { id },
    data: { name, nameNp, imageUrl, description, province },
  });

  return NextResponse.json(constituency);
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
  await prisma.constituency.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
