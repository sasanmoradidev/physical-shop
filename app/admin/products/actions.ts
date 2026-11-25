"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import fs from "fs/promises";
import path from "path";
import { requirePermission } from "@/lib/rbac-server";
import { revalidatePath } from "next/cache";

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_SIZE = 5 * 1024 * 1024;

type VariantInput = {
  id?: string;
  name: string;
  sku?: string | null;
  price?: number | string | null;
  stock?: number | string;
};

type ActionResult = {
  success: boolean;
  message?: string;
};

async function saveImage(file: File) {
  const ext = MIME_TO_EXT[file.type];
  if (!ext) throw new Error("فرمت تصویر مجاز نیست (فقط JPG، PNG و WebP).");
  if (file.size > MAX_SIZE) throw new Error("حجم تصویر بیش از ۵ مگابایت است.");

  const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
  await fs.mkdir(uploadDir, { recursive: true });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const fileName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const filePath = path.join(uploadDir, fileName);

  await fs.writeFile(filePath, buffer);
  return `/uploads/products/${fileName}`;
}

async function deleteImageFile(url: string) {
  try {
    const filePath = path.join(process.cwd(), "public", url);
    await fs.unlink(filePath);
  } catch {
    console.error("Error deleting file:", url);
  }
}

function resolvePriceAndStock(formData: FormData, parsedVariants: VariantInput[]) {
  const basePriceRaw = formData.get("price");
  const basePrice =
    basePriceRaw !== null && String(basePriceRaw).trim() !== ""
      ? Number(basePriceRaw)
      : 0;

  let finalPrice = basePrice;
  let finalStock = Number(formData.get("stock"));

  if (parsedVariants.length > 0) {
    finalStock = parsedVariants.reduce(
      (sum, v) => sum + (Number(v.stock) || 0),
      0
    );

    const hasVariantWithoutCustomPrice = parsedVariants.some(
      (v) => !v.price || Number(v.price) <= 0
    );

    if (hasVariantWithoutCustomPrice) {
      // اگر حداقل یک تنوع قیمت مجزا نداشته باشد، باید قیمت پایه معتبر باشد تا قیمت آن تنوع حفظ شود
      if (Number.isNaN(basePrice) || basePrice <= 0) {
        throw new Error(
          "برای تنوع‌هایی که قیمت مجزا ندارند، وارد کردن قیمت پایه محصول الزامی است."
        );
      }
      finalPrice = basePrice;
    } else {
      const variantPrices = parsedVariants.map((v) => Number(v.price));
      finalPrice = Math.min(...variantPrices);
    }
  }

  if (Number.isNaN(finalPrice) || finalPrice <= 0) {
    throw new Error("قیمت محصول نامعتبر است. لطفاً قیمت معتبر وارد کنید.");
  }

  finalStock =
    Number.isNaN(finalStock) || finalStock < 0 ? 0 : Math.floor(finalStock);

  return { finalPrice, finalStock };
}

function formatPrismaError(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return "این اسلاگ یا کد محصول (SKU) قبلاً ثبت شده است.";
  }
  return error instanceof Error ? error.message : "خطایی در ثبت اطلاعات رخ داد.";
}

/* =========================
   🟢 CREATE PRODUCT
========================= */
export async function createProduct(formData: FormData): Promise<ActionResult | void> {
  await requirePermission("MANAGE_PRODUCTS");

  try {
    const title = String(formData.get("title") || "").trim();
    const slug = String(formData.get("slug") || "").trim();
    const description = String(formData.get("description") || "").trim();

    const skuRaw = formData.get("sku") as string;
    const sku = skuRaw && skuRaw.trim() !== "" ? skuRaw.trim() : null;

    const brandIdRaw = formData.get("brandId") as string;
    const brandId = brandIdRaw && brandIdRaw.trim() !== "" ? brandIdRaw : null;

    const categoryId = formData.get("categoryId") as string;
    if (!categoryId) {
      return { success: false, message: "انتخاب دسته‌بندی الزامی است." };
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
    const parsedVariants: VariantInput[] = variantsRaw ? JSON.parse(variantsRaw) : [];
    const { finalPrice, finalStock } = resolvePriceAndStock(formData, parsedVariants);

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
        variants: {
          create: parsedVariants.map((v) => ({
            name: v.name,
            sku: v.sku && String(v.sku).trim() !== "" ? String(v.sku).trim() : null,
            price: v.price && Number(v.price) > 0 ? Number(v.price) : null,
            stock: Number(v.stock) || 0,
          })),
        },
      },
    });

    await processOrderedImages(formData, product.id);
  } catch (error) {
    return { success: false, message: formatPrismaError(error) };
  }

  revalidatePath("/");
  revalidatePath("/products");
  redirect("/admin/products");
}

/* =========================
   🟡 UPDATE PRODUCT
========================= */
export async function updateProduct(
  id: string,
  formData: FormData
): Promise<ActionResult | void> {
  await requirePermission("MANAGE_PRODUCTS");

  let slug = "";

  try {
    const title = String(formData.get("title") || "").trim();
    slug = String(formData.get("slug") || "").trim();
    const description = String(formData.get("description") || "").trim();

    const skuRaw = formData.get("sku") as string;
    const sku = skuRaw && skuRaw.trim() !== "" ? skuRaw.trim() : null;

    const brandIdRaw = formData.get("brandId") as string;
    const brandId = brandIdRaw && brandIdRaw.trim() !== "" ? brandIdRaw : null;

    const categoryId = formData.get("categoryId") as string;
    if (!categoryId) {
      return { success: false, message: "انتخاب دسته‌بندی الزامی است." };
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
    const parsedVariants: VariantInput[] = variantsRaw ? JSON.parse(variantsRaw) : [];
    const { finalPrice, finalStock } = resolvePriceAndStock(formData, parsedVariants);

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          title,
          slug,
          sku,
          brandId,
          categoryId,
          description,
          price: finalPrice,
          stock: finalStock,
          isActive,
          offerPrice,
          offerStartsAt,
          offerEndsAt,
        },
      });

      const existingVariants = await tx.productVariant.findMany({
        where: { productId: id },
        select: { id: true },
      });
      const existingIds = new Set(existingVariants.map((v) => v.id));

      const toUpdate = parsedVariants.filter(
        (v): v is VariantInput & { id: string } =>
          Boolean(v.id && existingIds.has(v.id))
      );
      const toCreate = parsedVariants.filter(
        (v) => !v.id || !existingIds.has(v.id)
      );
      const keptIds = new Set(toUpdate.map((v) => v.id));
      const idsToDelete = existingVariants
        .filter((v) => !keptIds.has(v.id))
        .map((v) => v.id);

      if (idsToDelete.length > 0) {
        await tx.productVariant.deleteMany({
          where: { id: { in: idsToDelete } },
        });
      }

      for (const v of toUpdate) {
        await tx.productVariant.update({
          where: { id: v.id },
          data: {
            name: v.name,
            sku: v.sku && String(v.sku).trim() !== "" ? String(v.sku).trim() : null,
            price: v.price && Number(v.price) > 0 ? Number(v.price) : null,
            stock: Number(v.stock) || 0,
          },
        });
      }

      if (toCreate.length > 0) {
        await tx.productVariant.createMany({
          data: toCreate.map((v) => ({
            productId: id,
            name: v.name,
            sku: v.sku && String(v.sku).trim() !== "" ? String(v.sku).trim() : null,
            price: v.price && Number(v.price) > 0 ? Number(v.price) : null,
            stock: Number(v.stock) || 0,
          })),
        });
      }
    });

    await processOrderedImages(formData, id);
  } catch (error) {
    return { success: false, message: formatPrismaError(error) };
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath(`/products/${slug}`);
  redirect("/admin/products");
}

/* =========================
   🔴 DELETE PRODUCT
========================= */
export async function deleteProduct(id: string) {
  await requirePermission("MANAGE_PRODUCTS");

  try {
    const images = await prisma.productImage.findMany({
      where: { productId: id },
      select: { url: true },
    });

    await prisma.product.delete({ where: { id } });
    await Promise.all(images.map((img) => deleteImageFile(img.url)));
  } catch (error) {
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

  revalidatePath("/");
  revalidatePath("/products");
  redirect("/admin/products");
}

/* =========================
   📁 SORTED IMAGES HELPER
========================= */
async function processOrderedImages(formData: FormData, productId: string) {
  const imageOrderRaw = formData.get("imageOrder") as string;
  if (!imageOrderRaw) return;

  const imageOrder: string[] = JSON.parse(imageOrderRaw);
  const existingImageIdsToKeep = imageOrder.filter(
    (id) => !formData.has(`file_${id}`)
  );

  const imagesToDelete = await prisma.productImage.findMany({
    where: {
      productId,
      id: { notIn: existingImageIdsToKeep },
    },
    select: { url: true },
  });

  await prisma.productImage.deleteMany({
    where: {
      productId,
      id: { notIn: existingImageIdsToKeep },
    },
  });

  await Promise.all(imagesToDelete.map((img) => deleteImageFile(img.url)));

  for (let index = 0; index < imageOrder.length; index++) {
    const id = imageOrder[index];
    const file = formData.get(`file_${id}`) as File | null;

    if (file && file.size > 0) {
      const url = await saveImage(file);
      await prisma.productImage.create({
        data: { url, order: index, productId },
      });
    } else {
      await prisma.productImage.updateMany({
        where: { productId, id },
        data: { order: index },
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

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");

    return {
      success: true,
      message: newStatus
        ? "محصول در فروشگاه فعال شد"
        : "محصول غیرفعال شد و دیگر به کاربران نمایش داده نمی‌شود",
    };
  } catch {
    return {
      success: false,
      message: "خطایی در تغییر وضعیت محصول رخ داد.",
    };
  }
}