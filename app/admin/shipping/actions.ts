"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { revalidatePath } from "next/cache";

// بررسی دسترسی ادمین
async function checkAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("دسترسی غیرمجاز");
  }
}

/* =========================
   🟢 CREATE SHIPPING METHOD
========================= */

export async function createShippingMethod(
  name: string,
  price: number,
  estimatedTime: string,
  isActive: boolean
) {
  await checkAdmin();

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
  await checkAdmin();

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
  await checkAdmin();

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
  await checkAdmin();

  try {
    await prisma.shippingMethod.delete({
      where: { id },
    });
  } catch (error) {
    throw new Error("این روش ارسال در سفارشات قبلی ثبت شده و قابل حذف نیست.");
  }

  revalidatePath("/admin/shipping");
}