"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac-server";

/* =========================
   🟢 CREATE ADDRESS
========================= */

export async function createAddress(
  formData: FormData
) {
  const user = await requireAuth();

  await prisma.address.create({
    data: {
      title:
        formData.get("title") as string,

      fullName:
        formData.get(
          "fullName"
        ) as string,

      phone:
        formData.get(
          "phone"
        ) as string,

      province:
        formData.get(
          "province"
        ) as string,

      city:
        formData.get(
          "city"
        ) as string,

      postalCode:
        formData.get(
          "postalCode"
        ) as string,

      addressLine:
        formData.get(
          "addressLine"
        ) as string,

      userId: user.id,
    },
  });

  redirect(
    "/profile/addresses"
  );
}

/* =========================
   🟡 UPDATE ADDRESS
========================= */

export async function updateAddress(id: string, formData: FormData) {
  const user = await requireAuth();

  // بررسی مالکیت آدرس برای جلوگیری از هک امنیتی
  const address = await prisma.address.findUnique({
    where: { id },
  });

  if (!address || address.userId !== user.id) {
    throw new Error("دسترسی غیرمجاز");
  }

  await prisma.address.update({
    where: { id },
    data: {
      title: formData.get("title") as string,
      fullName: formData.get("fullName") as string,
      phone: formData.get("phone") as string,
      province: formData.get("province") as string,
      city: formData.get("city") as string,
      postalCode: formData.get("postalCode") as string,
      addressLine: formData.get("addressLine") as string,
    },
  });

  redirect("/profile/addresses");
}

/* =========================
   🔴 DELETE ADDRESS
========================= */

export async function deleteAddress(id: string) {
  const user = await requireAuth();


  // بررسی مالکیت آدرس برای جلوگیری از حذف آدرس دیگران
  const address = await prisma.address.findUnique({
    where: { id },
  });

  if (!address || address.userId !== user.id) {
    throw new Error("دسترسی غیرمجاز");
  }

  try {
    await prisma.address.delete({
      where: { id },
    });
  } catch (error) {
    console.error(error);
    // اگر آدرس در سفارشی ثبت شده باشد، دیتابیس به دلیل روابط کلید خارجی اجازه حذف نمی‌دهد (یک رفتار ایمن استاندارد)
    throw new Error("این آدرس در سفارشات قبلی شما استفاده شده و قابل حذف نیست.");
  }

  redirect("/profile/addresses");
}