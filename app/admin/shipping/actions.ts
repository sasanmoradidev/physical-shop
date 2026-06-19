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

export async function createShippingMethod(formData: FormData) {
  await checkAdmin();

  const name = formData.get("name") as string;
  const price = Number(formData.get("price"));
  const estimatedTime = formData.get("estimatedTime") as string;
  const isActive = formData.get("isActive") === "on";

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