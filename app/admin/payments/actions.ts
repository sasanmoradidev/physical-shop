"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac-server";
import { revalidatePath } from "next/cache";

export async function createPaymentMethod(
  name: string,
  code: string,
  description: string,
  isActive: boolean,
  merchantId?: string
) {
  const admin = await requirePermission("MANAGE_PAYMENT");

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
  const admin = await requirePermission("MANAGE_PAYMENT");

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
  const admin = await requirePermission("MANAGE_PAYMENT");

  await prisma.paymentMethod.update({
    where: { id },
    data: {
      isActive: !currentStatus,
    },
  });

  revalidatePath("/admin/payments");
}

export async function deletePaymentMethod(id: string) {
  const admin = await requirePermission("MANAGE_PAYMENT");

  try {
    await prisma.paymentMethod.delete({
      where: { id },
    });
  } catch (error) {
    throw new Error("این روش پرداخت در فاکتورهای قبلی ثبت شده و قابل حذف نیست.");
  }

  revalidatePath("/admin/payments");
}