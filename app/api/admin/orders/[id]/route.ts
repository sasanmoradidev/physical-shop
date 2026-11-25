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

  const newStatus = body.status as OrderStatus;

  try {
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const existingOrder = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!existingOrder) {
        throw new Error("NOT_FOUND");
      }

      if (existingOrder.status === newStatus) {
        return existingOrder;
      }

      // اگر سفارش لغو شد -> موجودی اقلام به انبار برگردانده شود
      if (existingOrder.status !== "CANCELLED" && newStatus === "CANCELLED") {
        for (const item of existingOrder.items) {
          if (item.variantId) {
            await tx.productVariant.updateMany({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          }
          await tx.product.updateMany({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      // اگر سفارش لغوشده دوباره فعال شد -> بررسی و کسر مجدد موجودی از انبار
      if (existingOrder.status === "CANCELLED" && newStatus !== "CANCELLED") {
        for (const item of existingOrder.items) {
          if (item.variantId) {
            const vRes = await tx.productVariant.updateMany({
              where: { id: item.variantId, stock: { gte: item.quantity } },
              data: { stock: { decrement: item.quantity } },
            });
            if (vRes.count === 0) {
              throw new Error("موجودی انبار برای فعال‌سازی مجدد این سفارش کافی نیست.");
            }
          }
          const pRes = await tx.product.updateMany({
            where: { id: item.productId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
          if (pRes.count === 0) {
            throw new Error("موجودی انبار برای فعال‌سازی مجدد این سفارش کافی نیست.");
          }
        }
      }

      return await tx.order.update({
        where: { id },
        data: { status: newStatus },
      });
    });

    return NextResponse.json(updatedOrder);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 });
    }
    const message = error instanceof Error ? error.message : "خطا در تغییر وضعیت";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}