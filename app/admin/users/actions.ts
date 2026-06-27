"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac-server";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";

/* =========================
   🟢 CREATE USER
========================= */

export async function createUser(formData: FormData) {
  const admin = requirePermission("MANAGE_USERS");

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as "USER" | "ADMIN";

  // ۱. بررسی یکتا بودن نشانی ایمیل پیش از ثبت‌نام
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("کاربری با این نشانی ایمیل از قبل در سیستم وجود دارد.");
  }

  // ۲. هش کردن امن رمز عبور
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
  });

  redirect("/admin/users");
}

/* =========================
   🟡 UPDATE USER
========================= */

export async function updateUser(id: string, formData: FormData) {
  const admin = await requirePermission("MANAGE_USERS");

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as "USER" | "ADMIN";

  // ۳. اگر ادمین جاری می‌خواهد حساب خودش را تغییر دهد، نباید اجازه عزل خود را داشته باشد
  if (admin.id === id && role !== "ADMIN") {
    throw new Error("شما مجاز به عزل نقش مدیریت خودتان نیستید.");
  }

  // ۴. بررسی یکتا بودن ایمیل نسبت به سایر کاربران
  const existingUser = await prisma.user.findFirst({
    where: {
      email,
      NOT: { id },
    },
  });

  if (existingUser) {
    throw new Error("این نشانی ایمیل توسط کاربر دیگری استفاده شده است.");
  }

  const updateData: any = {
    name,
    email,
    role,
  };

  // ۵. اگر ادمین رمز عبور جدید وارد کرده بود، آن را هش و به‌روزرسانی می‌کنیم
  if (password && password.trim() !== "") {
    updateData.password = await bcrypt.hash(password, 10);
  }

  await prisma.user.update({
    where: { id },
    data: updateData,
  });

  redirect("/admin/users");
}

/* =========================
   🟡 TOGGLE USER ROLE (USER <-> ADMIN)
========================= */

export async function toggleUserRole(id: string) {
  const admin = await requirePermission("MANAGE_USERS");

  // ۱. بررسی اینکه ادمین نتواند نقش خودش را تغییر دهد
  if (admin.id === id) {
    throw new Error("شما نمی‌توانید نقش مدیریت خودتان را تغییر دهید.");
  }

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new Error("کاربر یافت نشد.");
  }

  const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";

  await prisma.user.update({
    where: { id },
    data: {
      role: newRole,
    },
  });

  revalidatePath("/admin/users");
}

/* =========================
   🔴 DELETE USER
========================= */

export async function deleteUser(id: string) {
  const admin = await requirePermission("MANAGE_USERS");

  // ۲. بررسی اینکه ادمین نتواند حساب کاربری خودش را حذف کند
  if (admin.id === id) {
    throw new Error("شما نمی‌توانید حساب کاربری خودتان را حذف کنید.");
  }

  try {
    await prisma.user.delete({
      where: { id },
    });
  } catch (error) {
    console.error(error);
    // ۳. به دلیل روابط کلید خارجی دیتابیس، کاربر دارای سفارش نباید حذف شود تا تاریخچه خرید حفظ شود
    throw new Error("این کاربر دارای تاریخچه خرید فعال در سیستم است و امکان حذف آن وجود ندارد.");
  }

  revalidatePath("/admin/users");
}