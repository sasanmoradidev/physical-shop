"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import fs from "fs/promises";
import path from "path";
import { getCurrentUser } from "@/lib/current-user";


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
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("دسترسی غیرمجاز");
  }

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

  const images = formData.getAll("images") as File[];

  const imageRecords: { url: string }[] = [];

  for (const file of images) {
    if (!file || file.size === 0) continue;

    const url = await saveImage(file);

    imageRecords.push({ url });
  }

  await prisma.product.create({
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

      images: {
        create:
          imageRecords.length > 0
            ? imageRecords
            : undefined,
      },
    },
  });

  redirect("/admin/products");
}
/* =========================
   🟡 UPDATE PRODUCT
========================= */

export async function updateProduct(
  id: string,
  formData: FormData
) {
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

  // ۱. مدیریت تصاویر نگه‌داشته شده (حذف موارد پاک‌شده توسط کاربر)
  const keptImageIdsRaw = formData.get("keptImageIds") as string;
  const keptImageIds: string[] = keptImageIdsRaw ? JSON.parse(keptImageIdsRaw) : [];

  // حذف تصاویری که کاربر در کلاینت دکمه ضربدر آن‌ها را زده است
  await prisma.productImage.deleteMany({
    where: {
      productId: id,
      id: {
        notIn: keptImageIds,
      },
    },
  });

  // ۲. ذخیره تصاویر جدید آپلود شده
  const newImages = formData.getAll("images") as File[];
  const newImageRecords: { url: string }[] = [];

  for (const file of newImages) {
    if (!file || file.size === 0) continue;

    const url = await saveImage(file);
    newImageRecords.push({ url });
  }

  // ۳. آپدیت اطلاعات محصول و ثبت تصاویر جدید
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
      images: {
        create:
          newImageRecords.length > 0
            ? newImageRecords
            : undefined,
      },
    },
  });

  redirect("/admin/products");
}

/* =========================
   🔴 DELETE PRODUCT
========================= */

export async function deleteProduct(id: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("دسترسی غیرمجاز");
  }

  await prisma.product.delete({
    where: { id },
  });

  redirect("/admin/products");
}