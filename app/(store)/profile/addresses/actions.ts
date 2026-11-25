"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac-server";

export async function createAddress(formData: FormData) {
  const user = await requireAuth();

  await prisma.address.create({
    data: {
      title: String(formData.get("title") || "").trim(),
      fullName: String(formData.get("fullName") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      province: String(formData.get("province") || "").trim(),
      city: String(formData.get("city") || "").trim(),
      postalCode: String(formData.get("postalCode") || "").trim(),
      addressLine: String(formData.get("addressLine") || "").trim(),
      userId: user.id,
    },
  });

  const back = formData.get("back") as string;
  redirect(back === "checkout" ? "/checkout" : "/profile/addresses");
}

export async function updateAddress(id: string, formData: FormData) {
  const user = await requireAuth();

  const address = await prisma.address.findUnique({ where: { id } });
  if (!address || address.userId !== user.id) {
    throw new Error("دسترسی غیرمجاز");
  }

  await prisma.address.update({
    where: { id },
    data: {
      title: String(formData.get("title") || "").trim(),
      fullName: String(formData.get("fullName") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      province: String(formData.get("province") || "").trim(),
      city: String(formData.get("city") || "").trim(),
      postalCode: String(formData.get("postalCode") || "").trim(),
      addressLine: String(formData.get("addressLine") || "").trim(),
    },
  });

  const back = formData.get("back") as string;
  redirect(back === "checkout" ? "/checkout" : "/profile/addresses");
}

export async function deleteAddress(id: string) {
  const user = await requireAuth();

  const address = await prisma.address.findUnique({ where: { id } });
  if (!address || address.userId !== user.id) {
    return { success: false, message: "دسترسی غیرمجاز" };
  }

  try {
    await prisma.address.delete({ where: { id } });
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "این آدرس در سفارشات قبلی شما استفاده شده و قابل حذف نیست.",
    };
  }

  revalidatePath("/profile/addresses");
  return { success: true, message: "آدرس با موفقیت حذف شد." };
}