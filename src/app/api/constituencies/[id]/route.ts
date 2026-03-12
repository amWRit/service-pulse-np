import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Prisma } from "@prisma/client";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const constituency = await prisma.constituency.findUnique({
    where: { id },
    include: {
      district: { include: { province: { select: { id: true, name: true, nameNp: true } } } },
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

  // Resolve Nepali province name: prefer district relation, fall back to name lookup
  let provinceNp: string | null = constituency.district?.province?.nameNp ?? null;
  if (!provinceNp && constituency.province) {
    const prov = await prisma.province.findFirst({
      where: { name: { contains: constituency.province } },
      select: { nameNp: true },
    });
    provinceNp = prov?.nameNp ?? null;
  }

  return NextResponse.json({ ...constituency, provinceNp });
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
  const { name, nameNp, imageUrl, description, districtId } = body;

  let province: string | null = null;
  if (districtId) {
    const district = await prisma.district.findUnique({
      where: { id: districtId },
      select: { province: { select: { name: true } } },
    });

    if (!district) {
      return NextResponse.json({ error: "Invalid district" }, { status: 400 });
    }

    province = district.province.name;
  }

  const constituency = await prisma.constituency.update({
    where: { id },
    data: {
      name,
      nameNp,
      imageUrl,
      description,
      districtId: districtId || null,
      province,
    },
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
  try {
    await prisma.$transaction(async (tx) => {
      await tx.report.deleteMany({ where: { constituencyId: id } });
      await tx.constituency.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return NextResponse.json(
        {
          error:
            "Unable to delete constituency because related records still exist.",
        },
        { status: 409 }
      );
    }

    throw error;
  }
}
