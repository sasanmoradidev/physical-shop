"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { revalidatePath } from "next/cache";

async function checkAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("دسترسی غیرمجاز");
  }
}

export async function createPaymentMethod(
  name: string,
  code: string,
  description: string,
  isActive: boolean,
  merchantId?: string
) {
  await checkAdmin();

  // کنترل یکتا بودن کد شناسایی روش پرداخت
  const existing = await prisma.paymentMethod.findUnique({ where: { code } });
  if (existing) {
    throw new Error("این کد کلیدی قبلاً ثبت شده است.");
  }

  await prisma.paymentMethod.create({
    data: {
      name,
      code: code.toUpperCase(),
      description,
      isActive,
      merchantId: merchantId || null,
    },
  });

  revalidatePath("/admin/payments");
}

export async function updatePaymentMethod(
  id: string,
  name: string,
  code: string,
  description: string,
  isActive: boolean,
  merchantId?: string
) {
  await checkAdmin();

  const existing = await prisma.paymentMethod.findFirst({
    where: {
      code,
      NOT: { id },
    },
  });
  if (existing) {
    throw new Error("این کد کلیدی توسط روش دیگری استفاده شده است.");
  }

  await prisma.paymentMethod.update({
    where: { id },
    data: {
      name,
      code: code.toUpperCase(),
      description,
      isActive,
      merchantId: merchantId || null,
    },
  });

  revalidatePath("/admin/payments");
}

export async function togglePaymentMethod(id: string, currentStatus: boolean) {
  await checkAdmin();

  await prisma.paymentMethod.update({
    where: { id },
    data: {
      isActive: !currentStatus,
    },
  });

  revalidatePath("/admin/payments");
}

export async function deletePaymentMethod(id: string) {
  await checkAdmin();

  try {
    await prisma.paymentMethod.delete({
      where: { id },
    });
  } catch (error) {
    throw new Error("این روش پرداخت در فاکتورهای قبلی ثبت شده و قابل حذف نیست.");
  }

  revalidatePath("/admin/payments");
}