"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac-server";
import { revalidatePath } from "next/cache";

export async function createBrandInline(name: string) {
  await requirePermission("MANAGE_PRODUCTS");
  const slug = name.trim().toLowerCase().replace(/\s+/g, "-");
  let brand = await prisma.brand.findUnique({ where: { slug } });

  if (!brand) {
    brand = await prisma.brand.create({ data: { name: name.trim(), slug } });
  }
  return brand;
}

export async function createBrand(name: string, slug: string) {
  await requirePermission("MANAGE_PRODUCTS");

  const cleanSlug = slug.trim();
  const existing = await prisma.brand.findUnique({ where: { slug: cleanSlug } });
  if (existing) {
    return {
      success: false,
      message: "این اسلاگ (Slug) قبلاً برای برند دیگری ثبت شده است.",
    };
  }

  await prisma.brand.create({
    data: { name: name.trim(), slug: cleanSlug },
  });

  revalidatePath("/admin/brands");
  return { success: true, message: "برند جدید با موفقیت ثبت شد." };
}

export async function updateBrand(id: string, name: string, slug: string) {
  await requirePermission("MANAGE_PRODUCTS");

  const cleanSlug = slug.trim();
  const existing = await prisma.brand.findFirst({
    where: {
      slug: cleanSlug,
      NOT: { id },
    },
  });
  if (existing) {
    return {
      success: false,
      message: "این اسلاگ (Slug) توسط برند دیگری استفاده شده است.",
    };
  }

  await prisma.brand.update({
    where: { id },
    data: { name: name.trim(), slug: cleanSlug },
  });

  revalidatePath("/admin/brands");
  return { success: true, message: "تغییرات با موفقیت ذخیره شد." };
}

export async function deleteBrand(id: string) {
  await requirePermission("MANAGE_PRODUCTS");

  try {
    await prisma.brand.delete({ where: { id } });
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message:
        "این برند دارای محصولات متصل است و قابل حذف نیست. ابتدا محصولات آن را ویرایش کنید.",
    };
  }

  revalidatePath("/admin/brands");
  return { success: true, message: "برند با موفقیت حذف شد." };
}