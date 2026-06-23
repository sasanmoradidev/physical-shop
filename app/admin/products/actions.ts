"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import fs from "fs/promises";
import path from "path";
import { getCurrentUser } from "@/lib/current-user";
import { requirePermission } from "@/lib/rbac"; // ایمپورت گارد جدید



/* =========================
   📁 UPLOAD HELPER
========================= */

async function saveImage(file: File) {
  const uploadDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    "products"
  );

  await fs.mkdir(uploadDir, { recursive: true });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const fileName = `${Date.now()}-${file.name}`;
  const filePath = path.join(uploadDir, fileName);

  await fs.writeFile(filePath, buffer);

  return `/uploads/products/${fileName}`;
}

/* =========================
   🟢 CREATE PRODUCT
========================= */

export async function createProduct(formData: FormData) {
  const user = await requirePermission("MANAGE_PRODUCTS");


  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;

  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  const categoryId = formData.get("categoryId") as string;
  if (!categoryId) {
    throw new Error("Category is required");
  }

  const offerPriceValue = formData.get("offerPrice");
  const offerPrice =
    offerPriceValue && offerPriceValue !== ""
      ? Number(offerPriceValue)
      : null;

  const offerStartsAtValue = formData.get("offerStartsAt");
  const offerEndsAtValue = formData.get("offerEndsAt");

  const offerStartsAt =
    offerStartsAtValue && offerStartsAtValue !== ""
      ? new Date(offerStartsAtValue as string)
      : null;

  const offerEndsAt =
    offerEndsAtValue && offerEndsAtValue !== ""
      ? new Date(offerEndsAtValue as string)
      : null;

  const isActive = formData.get("isActive") === "on";
  const offerEnabled = !!offerPrice;

  // ایجاد اولیه محصول بدون تصاویر
  const product = await prisma.product.create({
    data: {
      title,
      slug,
      description,
      price,
      stock,
      categoryId,
      isActive,
      offerEnabled,
      offerPrice,
      offerStartsAt,
      offerEndsAt,
    },
  });

  // ثبت و اعمال ترتیب تصاویر با تابع کمکی جدید
  await processOrderedImages(formData, product.id);

  redirect("/admin/products");
}

/* =========================
   🟡 UPDATE PRODUCT
========================= */

export async function updateProduct(
  id: string,
  formData: FormData
) {
  const user = await requirePermission("MANAGE_PRODUCTS");


  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;

  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));

  const offerPriceValue = formData.get("offerPrice");
  const offerPrice =
    offerPriceValue && offerPriceValue !== ""
      ? Number(offerPriceValue)
      : null;

  const offerStartsAtValue = formData.get("offerStartsAt");
  const offerEndsAtValue = formData.get("offerEndsAt");

  const offerStartsAt =
    offerStartsAtValue && offerStartsAtValue !== ""
      ? new Date(offerStartsAtValue as string)
      : null;

  const offerEndsAt =
    offerEndsAtValue && offerEndsAtValue !== ""
      ? new Date(offerEndsAtValue as string)
      : null;

  const isActive = formData.get("isActive") === "on";

  // بروزرسانی فیلدهای محصول
  await prisma.product.update({
    where: { id },
    data: {
      title,
      slug,
      description,
      price,
      stock,
      isActive,
      offerPrice,
      offerStartsAt,
      offerEndsAt,
    },
  });

  // پردازش و آپدیت ترتیب جدید تصاویر
  await processOrderedImages(formData, id);

  redirect("/admin/products");
}

/* =========================
   🔴 DELETE PRODUCT
========================= */

export async function deleteProduct(id: string) {
  const user = await requirePermission("MANAGE_PRODUCTS");


  await prisma.product.delete({
    where: { id },
  });

  redirect("/admin/products");
}

/* =========================
   📁 SORTED IMAGES HELPER
========================= */

async function processOrderedImages(formData: FormData, productId: string) {
  const imageOrderRaw = formData.get("imageOrder") as string;
  if (!imageOrderRaw) return;

  const imageOrder: string[] = JSON.parse(imageOrderRaw);

  // ۱. شناسایی تصاویری که باید در دیتابیس حفظ شوند
  const existingImageIdsToKeep = imageOrder.filter(
    (id) => !formData.has(`file_${id}`)
  );

  // حذف تصاویری که کاربر آن‌ها را از فرم کلاینت پاک کرده است
  await prisma.productImage.deleteMany({
    where: {
      productId,
      id: {
        notIn: existingImageIdsToKeep,
      },
    },
  });

  // ۲. پیمایش ترتیب جدید تصاویر و اعمال مقادیر عددی فیلد order
  for (let index = 0; index < imageOrder.length; index++) {
    const id = imageOrder[index];
    const file = formData.get(`file_${id}`) as File | null;

    if (file && file.size > 0) {
      // این یک تصویر جدید است؛ آن را ذخیره و ایجاد می‌کنیم
      const url = await saveImage(file);
      await prisma.productImage.create({
        data: {
          url,
          order: index, // ذخیره ایندکس آرایه به عنوان اولویت ترتیب
          productId,
        },
      });
    } else {
      // این یک تصویر قدیمی است؛ فقط فیلد order (ترتیب چیدمان جدید) آن را آپدیت می‌کنیم
      await prisma.productImage.updateMany({
        where: {
          productId,
          id,
        },
        data: {
          order: index,
        },
      });
    }
  }
}