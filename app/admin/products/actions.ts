"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client"; // 👈 برای گرفتن ارورهای دیتابیس
import { redirect } from "next/navigation";
import fs from "fs/promises";
import path from "path";
import { requirePermission } from "@/lib/rbac-server";
import { revalidatePath } from "next/cache";

/* =========================
   📁 UPLOAD & FILE HELPERS
========================= */

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 مگابایت

async function saveImage(file: File) {
  if (!ALLOWED_TYPES.includes(file.type)) throw new Error("فرمت تصویر مجاز نیست");
  if (file.size > MAX_SIZE) throw new Error("حجم تصویر بیش از ۵ مگابایت است");

  const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
  await fs.mkdir(uploadDir, { recursive: true });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // تولید نام یکتا با اکستنشن مناسب
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const filePath = path.join(uploadDir, fileName);

  await fs.writeFile(filePath, buffer);

  return `/uploads/products/${fileName}`;
}

// 👈 تابع جدید: برای پاک کردن فیزیکی عکس از روی هارد
async function deleteImageFile(url: string) {
  try {
    const filePath = path.join(process.cwd(), "public", url);
    await fs.unlink(filePath);
  } catch (error) {
    // اگر فایل وجود نداشت خطایی نمی‌دهیم تا روند قطع نشود
    console.error("Error deleting file:", url);
  }
}

/* =========================
   🟢 CREATE PRODUCT
========================= */

export async function createProduct(formData: FormData) {
  await requirePermission("MANAGE_PRODUCTS");

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;

  const skuRaw = formData.get("sku") as string;
  const sku = skuRaw && skuRaw.trim() !== "" ? skuRaw.trim() : null;

  const brandIdRaw = formData.get("brandId") as string;
  const brandId = brandIdRaw && brandIdRaw.trim() !== "" ? brandIdRaw : null;

  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  const categoryId = formData.get("categoryId") as string;

  if (!categoryId) {
    throw new Error("Category is required");
  }

  const offerPriceValue = formData.get("offerPrice");
  const offerPrice =
    offerPriceValue && offerPriceValue !== "" ? Number(offerPriceValue) : null;

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

  const variantsRaw = formData.get("variants") as string;
  const parsedVariants = variantsRaw ? JSON.parse(variantsRaw) : [];

  // گرفتن قیمت و موجودی اولیه فرم
  let finalPrice = Number(formData.get("price"));
  let finalStock = Number(formData.get("stock"));

  //اگر محصول تنوع دارد، مقادیر فرم نادیده گرفته می‌شوند
  if (parsedVariants.length > 0) {
    // ۱. موجودی کل = جمع موجودی تمام تنوع‌ها
    finalStock = parsedVariants.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0);
    
    // ۲. قیمت پایه = ارزان‌ترین قیمت بین تنوع‌ها
    const variantPrices = parsedVariants
      .map((v: any) => Number(v.price))
      .filter((p: number) => p > 0);
      
    if (variantPrices.length > 0) {
      finalPrice = Math.min(...variantPrices);
    }
  }

  // ایجاد اولیه محصول بدون تصاویر
  const product = await prisma.product.create({
    data: {
      title,
      slug,
      sku,
      brandId,
      description,
      price: finalPrice,
      stock: finalStock,
      categoryId,
      isActive,
      offerPrice,
      offerStartsAt,
      offerEndsAt,
      // 👇 ذخیره همزمان تنوع‌ها در لحظه ساخت محصول
      variants: {
        create: parsedVariants.map((v: any) => ({
          name: v.name,
          sku: v.sku || null,
          price: v.price ? Number(v.price) : null,
          stock: Number(v.stock),
        })),
      },
    },
  });

  // ثبت و اعمال ترتیب تصاویر با تابع کمکی
  await processOrderedImages(formData, product.id);

  redirect("/admin/products");
}

/* =========================
   🟡 UPDATE PRODUCT
========================= */

export async function updateProduct(id: string, formData: FormData) {
  await requirePermission("MANAGE_PRODUCTS");

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;

  const skuRaw = formData.get("sku") as string;
  const sku = skuRaw && skuRaw.trim() !== "" ? skuRaw.trim() : null;

  const brandIdRaw = formData.get("brandId") as string;
  const brandId = brandIdRaw && brandIdRaw.trim() !== "" ? brandIdRaw : null;

  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));

  const offerPriceValue = formData.get("offerPrice");
  const offerPrice =
    offerPriceValue && offerPriceValue !== "" ? Number(offerPriceValue) : null;

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

  const variantsRaw = formData.get("variants") as string;
  const parsedVariants = variantsRaw ? JSON.parse(variantsRaw) : [];
  // گرفتن قیمت و موجودی اولیه فرم
  let finalPrice = Number(formData.get("price"));
  let finalStock = Number(formData.get("stock"));

  // اگر محصول تنوع دارد، مقادیر فرم نادیده گرفته می‌شوند
  if (parsedVariants.length > 0) {
    // ۱. موجودی کل = جمع موجودی تمام تنوع‌ها
    finalStock = parsedVariants.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0);
    
    // ۲. قیمت پایه = ارزان‌ترین قیمت بین تنوع‌ها
    const variantPrices = parsedVariants
      .map((v: any) => Number(v.price))
      .filter((p: number) => p > 0);
      
    if (variantPrices.length > 0) {
      finalPrice = Math.min(...variantPrices);
    }
  }

  // بروزرسانی فیلدهای محصول
  await prisma.product.update({
    where: { id },
    data: {
      title,
      slug,
      sku,
      brandId,
      description,
      price: finalPrice,
      stock: finalStock,
      isActive,
      offerPrice,
      offerStartsAt,
      offerEndsAt,
      variants: {
        deleteMany: {}, // پاک کردن تنوع‌های قبلی
        create: parsedVariants.map((v: any) => ({
          name: v.name,
          sku: v.sku || null,
          price: v.price ? Number(v.price) : null,
          stock: Number(v.stock),
        })),
      },
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
  await requirePermission("MANAGE_PRODUCTS");

  try {
    // 👈 ابتدا لیست عکس‌های محصول را می‌گیریم تا بتوانیم فایل‌هایشان را پاک کنیم
    const images = await prisma.productImage.findMany({
      where: { productId: id },
      select: { url: true },
    });

    // 👈 حذف خود محصول از دیتابیس
    await prisma.product.delete({
      where: { id },
    });

    // 👈 حذف فیزیکی تمامی عکس‌های مربوط به این محصول
    await Promise.all(images.map((img) => deleteImageFile(img.url)));

  } catch (error) {
    // 👈 مدیریت خطای وابستگی (موجود در سبد خرید کاربران) برای نمایش توست
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return {
        success: false,
        message: "این محصول در سفارشات کاربران ثبت شده و قابل حذف نیست. لطفاً آن را غیرفعال کنید.",
      };
    }
    return {
      success: false,
      message: "خطایی غیرمنتظره در حذف محصول رخ داد.",
    };
  }

  // در صورت موفقیت، ریدایرکت می‌کنیم
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

  // 👈 یافتن عکس‌هایی که باید پاک شوند تا فایل فیزیکی‌شان هم پاک شود
  const imagesToDelete = await prisma.productImage.findMany({
    where: {
      productId,
      id: { notIn: existingImageIdsToKeep },
    },
    select: { url: true },
  });

  // حذف رکورد تصاویر قدیمی از دیتابیس
  await prisma.productImage.deleteMany({
    where: {
      productId,
      id: { notIn: existingImageIdsToKeep },
    },
  });

  // 👈 حذف فیزیکی تصاویر اضافی
  await Promise.all(imagesToDelete.map((img) => deleteImageFile(img.url)));

  // ۲. پیمایش ترتیب جدید تصاویر و اعمال مقادیر عددی فیلد order
  for (let index = 0; index < imageOrder.length; index++) {
    const id = imageOrder[index];
    const file = formData.get(`file_${id}`) as File | null;

    if (file && file.size > 0) {
      // تصویر جدید: ذخیره روی هارد و ساخت رکورد دیتابیس
      const url = await saveImage(file);
      await prisma.productImage.create({
        data: {
          url,
          order: index,
          productId,
        },
      });
    } else {
      // تصویر قدیمی: فقط آپدیت اولویت چیدمان
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

/* =========================
   👁️ TOGGLE PRODUCT STATUS
========================= */
export async function toggleProductStatus(id: string, newStatus: boolean) {
  await requirePermission("MANAGE_PRODUCTS");

  try {
    await prisma.product.update({
      where: { id },
      data: { isActive: newStatus },
    });

    // رفرش کردن دیتای صفحه مدیریت بدون رفرش کامل مرورگر
    revalidatePath("/admin/products");

    return {
      success: true,
      message: newStatus ? "محصول در فروشگاه فعال شد" : "محصول غیرفعال شد و دیگر به کاربران نمایش داده نمی‌شود"
    };
  } catch (error) {
    return {
      success: false,
      message: "خطایی در تغییر وضعیت محصول رخ داد.",
    };
  }
}