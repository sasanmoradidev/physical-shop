"use server";

import { revalidatePath, updateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac-server";
import { HOME_CONFIG_KEY, HOME_CONFIG_TAG } from "@/lib/home-config";
import type { HomeConfig } from "@/theme/home/config";

export async function saveHomeConfig(config: HomeConfig): Promise<{
  success: boolean;
  message: string;
}> {
  await requirePermission("MANAGE_PRODUCTS");

  try {
    await prisma.systemSetting.upsert({
      where: { key: HOME_CONFIG_KEY },
      update: { value: JSON.stringify(config) },
      create: { key: HOME_CONFIG_KEY, value: JSON.stringify(config) },
    });

    updateTag(HOME_CONFIG_TAG);
    revalidatePath("/");
    revalidatePath("/admin/homepage");

    return {
      success: true,
      message: "چیدمان و بنرهای صفحه اصلی با موفقیت ذخیره شد.",
    };
  } catch (error) {
    console.error("Save home config error:", error);
    return {
      success: false,
      message: "خطایی در ذخیره تنظیمات صفحه اصلی رخ داد.",
    };
  }
}