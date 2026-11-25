"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac-server";
import { revalidatePath } from "next/cache";

export async function createShippingMethod(
  name: string,
  price: number,
  estimatedTime: string,
  isActive: boolean
) {
  await requirePermission("MANAGE_SHIPPING");

  await prisma.shippingMethod.create({
    data: { name: name.trim(), price, estimatedTime: estimatedTime.trim(), isActive },
  });

  revalidatePath("/admin/shipping");
  return { success: true, message: "روش ارسال جدید با موفقیت ثبت شد." };
}

export async function updateShippingMethod(
  id: string,
  name: string,
  price: number,
  estimatedTime: string,
  isActive: boolean
) {
  await requirePermission("MANAGE_SHIPPING");

  await prisma.shippingMethod.update({
    where: { id },
    data: { name: name.trim(), price, estimatedTime: estimatedTime.trim(), isActive },
  });

  revalidatePath("/admin/shipping");
  return { success: true, message: "تغییرات با موفقیت ذخیره شد." };
}

export async function toggleShippingMethod(id: string, currentStatus: boolean) {
  await requirePermission("MANAGE_SHIPPING");

  await prisma.shippingMethod.update({
    where: { id },
    data: { isActive: !currentStatus },
  });

  revalidatePath("/admin/shipping");
  return {
    success: true,
    message: !currentStatus ? "روش ارسال فعال شد." : "روش ارسال غیرفعال شد.",
  };
}

export async function deleteShippingMethod(id: string) {
  await requirePermission("MANAGE_SHIPPING");

  try {
    await prisma.shippingMethod.delete({ where: { id } });
  } catch {
    return {
      success: false,
      message: "این روش ارسال در سفارشات قبلی ثبت شده و قابل حذف نیست.",
    };
  }

  revalidatePath("/admin/shipping");
  return { success: true, message: "روش ارسال با موفقیت حذف شد." };
}