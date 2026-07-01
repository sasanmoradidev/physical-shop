"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac-server";
import { revalidatePath } from "next/cache";

/**
 * دریافت وضعیت فعلی تنظیمات OTP از دیتابیس
 */
export async function getOtpSetting(): Promise<boolean> {
  const setting = await prisma.systemSetting.findUnique({
    where: { key: "OTP_ENABLED" },
  });
  // به صورت پیش‌فرض فعال در نظر گرفته می‌شود
  return setting ? setting.value === "true" : true;
}

/**
 * ذخیره وضعیت جدید تنظیمات OTP در دیتابیس
 */
export async function updateOtpSetting(enabled: boolean) {
  // تایید مجوز کاربر (فقط پرسنل مجاز به تنظیمات لجستیک و مالی دسترسی دارند)
  await requirePermission("MANAGE_SHIPPING");

  await prisma.systemSetting.upsert({
    where: { key: "OTP_ENABLED" },
    update: { value: String(enabled) },
    create: { key: "OTP_ENABLED", value: String(enabled) },
  });

  revalidatePath("/admin/settings");
}