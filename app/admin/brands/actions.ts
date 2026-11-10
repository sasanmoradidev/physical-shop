"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac-server";
import { revalidatePath } from "next/cache";

/* =========================
   INLINE CREATION (For Product Form)
========================= */
export async function createBrandInline(name: string) {
  await requirePermission("MANAGE_PRODUCTS");
  const slug = name.trim().toLowerCase().replace(/\s+/g, '-');
  let brand = await prisma.brand.findUnique({ where: { slug } });
  
  if (!brand) {
    brand = await prisma.brand.create({ data: { name, slug } });
  }
  return brand;
}

/* =========================
   🟢 CREATE BRAND
========================= */
export async function createBrand(name: string, slug: string) {
  await requirePermission("MANAGE_PRODUCTS");

  const existing = await prisma.brand.findUnique({ where: { slug } });
  if (existing) {
    throw new Error("این اسلاگ (Slug) قبلاً برای برند دیگری ثبت شده است.");
  }

  await prisma.brand.create({
    data: { name, slug },
  });

  revalidatePath("/admin/brands");
}

/* =========================
   🟡 UPDATE BRAND
========================= */
export async function updateBrand(id: string, name: string, slug: string) {
  await requirePermission("MANAGE_PRODUCTS");

  const existing = await prisma.brand.findFirst({
    where: {
      slug,
      NOT: { id },
    },
  });
  if (existing) {
    throw new Error("این اسلاگ (Slug) توسط برند دیگری استفاده شده است.");
  }

  await prisma.brand.update({
    where: { id },
    data: { name, slug },
  });

  revalidatePath("/admin/brands");
}

/* =========================
   🔴 DELETE BRAND
========================= */
export async function deleteBrand(id: string) {
  await requirePermission("MANAGE_PRODUCTS");

  try {
    await prisma.brand.delete({
      where: { id },
    });
  } catch (error) {
    console.error(error);
    throw new Error("این برند دارای محصولات متصل است و قابل حذف نیست. ابتدا محصولات آن را ویرایش کنید.");
  }

  revalidatePath("/admin/brands");
}