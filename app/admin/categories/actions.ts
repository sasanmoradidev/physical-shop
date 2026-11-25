"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac-server";
import { revalidatePath } from "next/cache";

export async function createCategory(
  name: string,
  slug: string,
  parentId?: string
) {
  await requirePermission("MANAGE_CATEGORIES");

  const cleanSlug = slug.trim();
  const existing = await prisma.category.findUnique({ where: { slug: cleanSlug } });
  if (existing) {
    return { success: false, message: "این اسلاگ قبلاً ثبت شده است." };
  }

  await prisma.category.create({
    data: {
      name: name.trim(),
      slug: cleanSlug,
      parentId: parentId || null,
    },
  });

  revalidatePath("/admin/categories");
  return { success: true, message: "دسته‌بندی جدید با موفقیت ثبت شد." };
}

export async function updateCategory(
  id: string,
  name: string,
  slug: string,
  parentId?: string
) {
  await requirePermission("MANAGE_CATEGORIES");

  if (parentId === id) {
    return { success: false, message: "یک دسته‌بندی نمی‌تواند والد خودش باشد." };
  }

  const cleanSlug = slug.trim();
  const existing = await prisma.category.findFirst({
    where: { slug: cleanSlug, NOT: { id } },
  });
  if (existing) {
    return {
      success: false,
      message: "این اسلاگ توسط دسته‌بندی دیگری استفاده شده است.",
    };
  }

  await prisma.category.update({
    where: { id },
    data: {
      name: name.trim(),
      slug: cleanSlug,
      parentId: parentId || null,
    },
  });

  revalidatePath("/admin/categories");
  return { success: true, message: "تغییرات با موفقیت ذخیره شد." };
}

export async function deleteCategory(id: string) {
  await requirePermission("MANAGE_CATEGORIES");

  try {
    await prisma.category.delete({ where: { id } });
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "این دسته‌بندی دارای محصولات متصل است و قابل حذف نیست.",
    };
  }

  revalidatePath("/admin/categories");
  return { success: true, message: "دسته‌بندی با موفقیت حذف شد." };
}