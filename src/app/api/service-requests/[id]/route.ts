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
  const { action } = body;

  const existing = await (prisma as any).publicServiceRequest.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (existing.status !== "pending") {
    return NextResponse.json({ error: "Request already reviewed" }, { status: 409 });
  }

  if (action === "reject") {
    const rejected = await (prisma as any).publicServiceRequest.update({
      where: { id },
      data: {
        status: "rejected",
        reviewedByUserId: session.user.id,
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json(rejected);
  }

  if (action !== "approve") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const { name, nameNp, type, location, description, descriptionNp, imageUrl } = body;
  if (!name || !nameNp) {
    return NextResponse.json({ error: "Missing service details" }, { status: 400 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const service = await tx.publicService.create({
      data: {
        name,
        nameNp,
        type: (type as string) || "other",
        location,
        description,
        descriptionNp,
        imageUrl,
        constituencyId: existing.constituencyId,
      },
    });

    const approvedRequest = await (tx as any).publicServiceRequest.update({
      where: { id },
      data: {
        status: "approved",
        approvedServiceId: service.id,
        reviewedByUserId: session.user.id,
        reviewedAt: new Date(),
      },
    });

    return { service, approvedRequest };
  });

  return NextResponse.json(result);
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

  const existing = await (prisma as any).publicServiceRequest.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await (prisma as any).publicServiceRequest.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
