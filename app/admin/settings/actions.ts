"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath, updateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac-server";
import { getSiteConfig, SITE_CONFIG_KEY, SITE_CONFIG_TAG } from "@/lib/site-config";
import type { SiteConfig } from "@/theme/config";

const LOGO_MIME_TO_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};
const MAX_LOGO_SIZE = 2 * 1024 * 1024; // ۲ مگابایت

async function saveLogoFile(file: File): Promise<string> {
  const ext = LOGO_MIME_TO_EXT[file.type];
  if (!ext) {
    throw new Error("فرمت لوگو مجاز نیست (فقط PNG، JPG یا WebP).");
  }
  if (file.size > MAX_LOGO_SIZE) {
    throw new Error("حجم فایل لوگو نباید بیشتر از ۲ مگابایت باشد.");
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const fileName = `logo-${Date.now()}.${ext}`;
  const filePath = path.join(uploadDir, fileName);

  await fs.writeFile(filePath, buffer);
  return `/uploads/${fileName}`;
}

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

export async function updateSiteConfig(formData: FormData): Promise<{
  success: boolean;
  message: string;
  logo?: string;
}> {
  await requirePermission("MANAGE_SETTINGS");

  try {
    const current = await getSiteConfig();

    const name = String(formData.get("name") || "").trim();
    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();

    if (!name || !title) {
      return {
        success: false,
        message: "نام فروشگاه و عنوان سئو الزامی هستند.",
      };
    }

    const keywordsRaw = String(formData.get("keywords") || "");
    const keywords = keywordsRaw
      .split(/[،,]/)
      .map((k) => k.trim())
      .filter(Boolean);

    let logo = String(formData.get("logo") || current.logo).trim() || current.logo;
    const logoFile = formData.get("logoFile") as File | null;
    if (logoFile && logoFile.size > 0) {
      logo = await saveLogoFile(logoFile);
    }

    const latRaw = Number(formData.get("mapLat"));
    const lngRaw = Number(formData.get("mapLng"));

    const nextConfig: SiteConfig = {
      name,
      title,
      description,
      keywords,
      logo,
      phone: String(formData.get("phone") || "").trim(),
      phoneDisplay: String(formData.get("phoneDisplay") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      address: {
        street: String(formData.get("addressStreet") || "").trim(),
        city: String(formData.get("addressCity") || "").trim(),
        country: String(formData.get("addressCountry") || "IR").trim() || "IR",
        short: String(formData.get("addressShort") || "").trim(),
        full: String(formData.get("addressFull") || "").trim(),
        note: String(formData.get("addressNote") || "").trim(),
      },
      map: {
        lat: !Number.isNaN(latRaw) && latRaw !== 0 ? latRaw : current.map.lat,
        lng: !Number.isNaN(lngRaw) && lngRaw !== 0 ? lngRaw : current.map.lng,
      },
      navLinks: current.navLinks,
      socials: {
        website: String(formData.get("socialWebsite") || "#").trim() || "#",
        telegram: String(formData.get("socialTelegram") || "#").trim() || "#",
      },
      copyright: String(formData.get("copyright") || "").trim(),
    };

    await prisma.systemSetting.upsert({
      where: { key: SITE_CONFIG_KEY },
      update: { value: JSON.stringify(nextConfig) },
      create: { key: SITE_CONFIG_KEY, value: JSON.stringify(nextConfig) },
    });

    updateTag(SITE_CONFIG_TAG);
    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");

    return {
      success: true,
      message: "تنظیمات فروشگاه با موفقیت ذخیره شد.",
      logo,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "خطایی در ذخیره تنظیمات رخ داد.",
    };
  }
}