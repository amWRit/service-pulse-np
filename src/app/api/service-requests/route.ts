import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requests = await (prisma as any).publicServiceRequest.findMany({
    include: {
      constituency: {
        select: {
          id: true,
          name: true,
          nameNp: true,
        },
      },
      approvedService: {
        select: {
          id: true,
          name: true,
          nameNp: true,
        },
      },
      reviewedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(requests);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, description, constituencyId } = body;

  if (!name || !constituencyId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const serviceRequest = await (prisma as any).publicServiceRequest.create({
    data: {
      name,
      description,
      constituencyId,
    },
  });

  return NextResponse.json(serviceRequest, { status: 201 });
}
