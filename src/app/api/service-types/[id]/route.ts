import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

function normalizeSlug(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
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
  const slug = normalizeSlug(body.slug ?? "");

  if (!slug || !body.name || !body.nameNp) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const serviceType = await prisma.serviceType.update({
    where: { id },
    data: {
      slug,
      name: body.name,
      nameNp: body.nameNp,
      icon: body.icon || "🏢",
    },
  });

  return NextResponse.json(serviceType);
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
  const existing = await prisma.serviceType.findUnique({
    where: { id },
    select: { slug: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Service type not found" }, { status: 404 });
  }

  const inUse = await prisma.publicService.count({ where: { type: existing.slug } });
  if (inUse > 0) {
    return NextResponse.json(
      { error: "Cannot delete service type that is used by existing services" },
      { status: 400 }
    );
  }

  await prisma.serviceType.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
