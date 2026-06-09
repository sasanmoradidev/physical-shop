import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const body = await req.json();
  const { id } = await params;

  const order = await prisma.order.update({
    where: {
      id,
    },
    data: {
      status: body.status,
    },
  });

  return NextResponse.json(order);
}