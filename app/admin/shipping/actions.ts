"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac-server";
import { revalidatePath } from "next/cache";

/* =========================
   🟢 CREATE SHIPPING METHOD
========================= */

export async function createShippingMethod(
  name: string,
  price: number,
  estimatedTime: string,
  isActive: boolean
) {
  const user = await requirePermission("MANAGE_SHIPPING");

  await prisma.shippingMethod.create({
    data: {
      name,
      price,
      estimatedTime,
      isActive,
    },
  });

  revalidatePath("/admin/shipping");
}

/* =========================
   🟡 UPDATE SHIPPING METHOD
========================= */

export async function updateShippingMethod(
  id: string,
  name: string,
  price: number,
  estimatedTime: string,
  isActive: boolean
) {
  const user = await requirePermission("MANAGE_SHIPPING");

  await prisma.shippingMethod.update({
    where: { id },
    data: {
      name,
      price,
      estimatedTime,
      isActive,
    },
  });

  revalidatePath("/admin/shipping");
}

/* =========================
   🔵 TOGGLE SHIPPING METHOD STATUS
========================= */

export async function toggleShippingMethod(id: string, currentStatus: boolean) {
  const user = await requirePermission("MANAGE_SHIPPING");

  await prisma.shippingMethod.update({
    where: { id },
    data: {
      isActive: !currentStatus,
    },
  });

  revalidatePath("/admin/shipping");
}

/* =========================
   🔴 DELETE SHIPPING METHOD
========================= */

export async function deleteShippingMethod(id: string) {
  const user = await requirePermission("MANAGE_SHIPPING");

  try {
    await prisma.shippingMethod.delete({
      where: { id },
    });
  } catch (error) {
    throw new Error("این روش ارسال در سفارشات قبلی ثبت شده و قابل حذف نیست.");
  }

  revalidatePath("/admin/shipping");
}