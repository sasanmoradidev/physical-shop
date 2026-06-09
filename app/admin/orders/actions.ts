"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function updateOrderStatus(
  orderId: string,
  status: string
) {
  await prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      status: status as any,
    },
  });

  redirect("/admin/orders");
}