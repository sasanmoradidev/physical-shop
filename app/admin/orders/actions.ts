// app/admin/orders/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/rbac-server";
import { OrderStatus } from "@prisma/client";

export async function updateOrderStatus(orderId: string, status: string) {
  await requirePermission("MANAGE_ORDERS");

  if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
    throw new Error("وضعیت سفارش نامعتبر است");
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: status as OrderStatus },
  });

  redirect("/admin/orders");
}