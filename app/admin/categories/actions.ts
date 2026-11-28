"use server";

import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac-server";
import { revalidatePath } from "next/cache";

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // ۵ مگابایت

async function saveCategoryImage(file: File): Promise<string> {
  const ext = MIME_TO_EXT[file.type];
  if (!ext) {
    throw new Error("فرمت تصویر مجاز نیست (فقط JPG، PNG، WebP یا AVIF).");
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("حجم تصویر نباید بیشتر از ۵ مگابایت باشد.");
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "categories");
  await fs.mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
  await fs.writeFile(path.join(uploadDir, fileName), buffer);

  return `/uploads/categories/${fileName}`;
}

async function deleteCategoryImageFile(url: string | null | undefined) {
  if (!url || !url.startsWith("/uploads/categories/")) return;
  try {
    const fileName = path.basename(url);
    const filePath = path.join(process.cwd(), "public", "uploads", "categories", fileName);
    await fs.unlink(filePath);
  } catch {
    // فایل قبلاً حذف شده یا وجود ندارد
  }
}

export async function createCategory(formData: FormData) {
  await requirePermission("MANAGE_CATEGORIES");

  try {
    const name = String(formData.get("name") || "").trim();
    const slug = String(formData.get("slug") || "").trim();
    const parentIdRaw = String(formData.get("parentId") || "").trim();
    const showInHome = formData.get("showInHome") === "on";
    const imageFile = formData.get("imageFile") as File | null;

    if (!name || !slug) {
      return { success: false, message: "نام و اسلاگ دسته‌بندی الزامی هستند." };
    }

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return { success: false, message: "این اسلاگ قبلاً ثبت شده است." };
    }

    let imageUrl: string | null = null;
    if (imageFile && imageFile.size > 0) {
      imageUrl = await saveCategoryImage(imageFile);
    }

    await prisma.category.create({
      data: {
        name,
        slug,
        parentId: parentIdRaw || null,
        image: imageUrl,
        showInHome,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true, message: "دسته‌بندی جدید با موفقیت ثبت شد." };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "خطا در ثبت دسته‌بندی.",
    };
  }
}

export async function updateCategory(id: string, formData: FormData) {
  await requirePermission("MANAGE_CATEGORIES");

  try {
    const name = String(formData.get("name") || "").trim();
    const slug = String(formData.get("slug") || "").trim();
    const parentIdRaw = String(formData.get("parentId") || "").trim();
    const showInHome = formData.get("showInHome") === "on";
    const removeImage = formData.get("removeImage") === "true";
    const imageFile = formData.get("imageFile") as File | null;

    if (!name || !slug) {
      return { success: false, message: "نام و اسلاگ دسته‌بندی الزامی هستند." };
    }

    if (parentIdRaw === id) {
      return { success: false, message: "یک دسته‌بندی نمی‌تواند والد خودش باشد." };
    }

    const existing = await prisma.category.findFirst({
      where: { slug, NOT: { id } },
    });
    if (existing) {
      return {
        success: false,
        message: "این اسلاگ توسط دسته‌بندی دیگری استفاده شده است.",
      };
    }

    const current = await prisma.category.findUnique({ where: { id } });
    if (!current) {
      return { success: false, message: "دسته‌بندی یافت نشد." };
    }

    let nextImage = current.image;

    if (imageFile && imageFile.size > 0) {
      nextImage = await saveCategoryImage(imageFile);
      await deleteCategoryImageFile(current.image);
    } else if (removeImage) {
      await deleteCategoryImageFile(current.image);
      nextImage = null;
    }

    await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        parentId: parentIdRaw || null,
        image: nextImage,
        showInHome,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true, message: "تغییرات با موفقیت ذخیره شد." };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "خطا در ویرایش دسته‌بندی.",
    };
  }
}

export async function toggleCategoryShowInHome(id: string, currentValue: boolean) {
  await requirePermission("MANAGE_CATEGORIES");

  try {
    await prisma.category.update({
      where: { id },
      data: { showInHome: !currentValue },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/");
    return {
      success: true,
      message: !currentValue
        ? "دسته‌بندی در اسلایدر صفحه اصلی فعال شد."
        : "دسته‌بندی از اسلایدر صفحه اصلی برداشته شد.",
    };
  } catch {
    return { success: false, message: "خطا در تغییر وضعیت نمایش." };
  }
}

export async function deleteCategory(id: string) {
  await requirePermission("MANAGE_CATEGORIES");

  try {
    const current = await prisma.category.findUnique({
      where: { id },
      select: { image: true },
    });

    await prisma.category.delete({ where: { id } });
    await deleteCategoryImageFile(current?.image);
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "این دسته‌بندی دارای محصولات متصل است و قابل حذف نیست.",
    };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: true, message: "دسته‌بندی با موفقیت حذف شد." };
}