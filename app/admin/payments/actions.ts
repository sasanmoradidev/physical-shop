"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac-server";
import { revalidatePath } from "next/cache";

type CardInfo = {
  cardNumber?: string;
  cardHolder?: string;
  bankName?: string;
};

export async function createPaymentMethod(
  name: string,
  code: string,
  description: string,
  isActive: boolean,
  merchantId?: string,
  cardInfo?: CardInfo
) {
  await requirePermission("MANAGE_PAYMENT");

  const upperCode = code.trim().toUpperCase();
  const existing = await prisma.paymentMethod.findUnique({ where: { code: upperCode } });
  if (existing) {
    return { success: false, message: "این کد کلیدی قبلاً ثبت شده است." };
  }

  await prisma.paymentMethod.create({
    data: {
      name: name.trim(),
      code: upperCode,
      description: description.trim(),
      isActive,
      merchantId: upperCode === "ONLINE" ? merchantId?.trim() || null : null,
      cardNumber: upperCode === "CARD" ? cardInfo?.cardNumber?.trim() || null : null,
      cardHolder: upperCode === "CARD" ? cardInfo?.cardHolder?.trim() || null : null,
      bankName: upperCode === "CARD" ? cardInfo?.bankName?.trim() || null : null,
    },
  });

  revalidatePath("/admin/payments");
  return { success: true, message: "روش پرداخت جدید با موفقیت ثبت شد." };
}

export async function updatePaymentMethod(
  id: string,
  name: string,
  code: string,
  description: string,
  isActive: boolean,
  merchantId?: string,
  cardInfo?: CardInfo
) {
  await requirePermission("MANAGE_PAYMENT");

  const upperCode = code.trim().toUpperCase();
  const existing = await prisma.paymentMethod.findFirst({
    where: { code: upperCode, NOT: { id } },
  });
  if (existing) {
    return {
      success: false,
      message: "این کد کلیدی توسط روش دیگری استفاده شده است.",
    };
  }

  await prisma.paymentMethod.update({
    where: { id },
    data: {
      name: name.trim(),
      code: upperCode,
      description: description.trim(),
      isActive,
      merchantId: upperCode === "ONLINE" ? merchantId?.trim() || null : null,
      cardNumber: upperCode === "CARD" ? cardInfo?.cardNumber?.trim() || null : null,
      cardHolder: upperCode === "CARD" ? cardInfo?.cardHolder?.trim() || null : null,
      bankName: upperCode === "CARD" ? cardInfo?.bankName?.trim() || null : null,
    },
  });

  revalidatePath("/admin/payments");
  return { success: true, message: "تغییرات با موفقیت ذخیره شد." };
}

export async function togglePaymentMethod(id: string, currentStatus: boolean) {
  await requirePermission("MANAGE_PAYMENT");

  await prisma.paymentMethod.update({
    where: { id },
    data: { isActive: !currentStatus },
  });

  revalidatePath("/admin/payments");
  return {
    success: true,
    message: !currentStatus ? "روش پرداخت فعال شد." : "روش پرداخت غیرفعال شد.",
  };
}

export async function deletePaymentMethod(id: string) {
  await requirePermission("MANAGE_PAYMENT");

  try {
    await prisma.paymentMethod.delete({ where: { id } });
  } catch {
    return {
      success: false,
      message: "این روش پرداخت در فاکتورهای قبلی ثبت شده و قابل حذف نیست.",
    };
  }

  revalidatePath("/admin/payments");
  return { success: true, message: "روش پرداخت با موفقیت حذف شد." };
}