"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac-server";
import { revalidatePath } from "next/cache";

export async function getOtpSetting(): Promise<boolean> {
  const setting = await prisma.systemSetting.findUnique({
    where: { key: "OTP_ENABLED" },
  });
  return setting ? setting.value === "true" : true;
}

export async function updateOtpSetting(enabled: boolean) {
  await requirePermission("MANAGE_SETTINGS");

  await prisma.systemSetting.upsert({
    where: { key: "OTP_ENABLED" },
    update: { value: String(enabled) },
    create: { key: "OTP_ENABLED", value: String(enabled) },
  });

  revalidatePath("/admin/settings");
}