import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function GET() {
  const user = await getCurrentUser();

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