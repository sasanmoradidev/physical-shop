import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac-server";

export async function GET() {
  const user = await requireAuth();

  if (!user) {
    return NextResponse.json([]);
  }

  const addresses =
    await prisma.address.findMany({
      where: {
        userId: user.id,
      },
    });

  return NextResponse.json(
    addresses
  );
}