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

/* =========================
   🟢 CREATE CATEGORY
========================= */

export async function createCategory(
  name: string,
  slug: string,
  parentId?: string
) {
  await checkAdmin();

  // کنترل یکتا بودن اسلاگ
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    throw new Error("این اسلاگ قبلاً ثبت شده است.");
  }

  await prisma.category.create({
    data: {
      name,
      slug,
      parentId: parentId || null,
    },
  });

  revalidatePath("/admin/categories");
}

/* =========================
   🟡 UPDATE CATEGORY
========================= */

export async function updateCategory(
  id: string,
  name: string,
  slug: string,
  parentId?: string
) {
  await checkAdmin();

  // جلوگیری از انتخاب خودِ دسته‌بندی به عنوان والد خودش
  if (parentId === id) {
    throw new Error("یک دسته‌بندی نمی‌تواند والد خودش باشد.");
  }

  const existing = await prisma.category.findFirst({
    where: {
      slug,
      NOT: { id },
    },
  });
  if (existing) {
    throw new Error("این اسلاگ توسط دسته‌بندی دیگری استفاده شده است.");
  }

  await prisma.category.update({
    where: { id },
    data: {
      name,
      slug,
      parentId: parentId || null,
    },
  });

  revalidatePath("/admin/categories");
}

/* =========================
   🔴 DELETE CATEGORY
========================= */

export async function deleteCategory(id: string) {
  await checkAdmin();

  try {
    await prisma.category.delete({
      where: { id },
    });
  } catch (error) {
    console.error(error);
    // اگر محصولی متصل به این دسته‌بندی باشد، دیتابیس خطا خواهد داد
    throw new Error("این دسته‌بندی دارای محصولات متصل است و قابل حذف نیست.");
  }

  revalidatePath("/admin/categories");
}