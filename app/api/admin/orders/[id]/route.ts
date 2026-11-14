// app/api/admin/orders/[id]/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { OrderStatus } from "@prisma/client";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await verifyToken(token);
    if (!hasPermission(payload.role, "MANAGE_ORDERS")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id } = await params;

  if (!Object.values(OrderStatus).includes(body.status)) {
    return NextResponse.json({ error: "وضعیت سفارش نامعتبر است" }, { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status: body.status as OrderStatus },
  });

  return NextResponse.json(order);
}