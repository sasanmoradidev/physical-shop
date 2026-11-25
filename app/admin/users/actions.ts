"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac-server";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { Prisma, Role } from "@prisma/client";

type ActionResult = {
  success: boolean;
  message?: string;
};

export async function createUser(formData: FormData): Promise<ActionResult | void> {
  await requirePermission("MANAGE_USERS");

  const name = String(formData.get("name") || "").trim();
  const username = String(formData.get("username") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const password = String(formData.get("password") || "");
  const role = formData.get("role") as Role;

  if (!Object.values(Role).includes(role)) {
    return { success: false, message: "نقش کاربری نامعتبر است." };
  }

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ username }, { phone }] },
  });

  if (existingUser) {
    return {
      success: false,
      message: "کاربری با این نام کاربری یا شماره موبایل از قبل وجود دارد.",
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { name, username, phone, password: hashedPassword, role },
  });

  redirect("/admin/users");
}

export async function updateUser(
  id: string,
  formData: FormData
): Promise<ActionResult | void> {
  const admin = await requirePermission("MANAGE_USERS");

  const name = String(formData.get("name") || "").trim();
  const username = String(formData.get("username") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const password = String(formData.get("password") || "");
  const role = formData.get("role") as Role;

  if (!Object.values(Role).includes(role)) {
    return { success: false, message: "نقش کاربری نامعتبر است." };
  }

  if (admin.id === id && role !== "ADMIN") {
    return {
      success: false,
      message: "شما مجاز به عزل نقش مدیریت خودتان نیستید.",
    };
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { phone }],
      NOT: { id },
    },
  });

  if (existingUser) {
    return {
      success: false,
      message: "این نام کاربری یا شماره موبایل توسط کاربر دیگری استفاده شده است.",
    };
  }

  const updateData: Prisma.UserUpdateInput = { name, username, phone, role };

  if (password.trim() !== "") {
    updateData.password = await bcrypt.hash(password, 10);
  }

  await prisma.user.update({ where: { id }, data: updateData });

  redirect("/admin/users");
}

export async function toggleUserRole(id: string): Promise<ActionResult> {
  const admin = await requirePermission("MANAGE_USERS");

  if (admin.id === id) {
    return {
      success: false,
      message: "شما نمی‌توانید نقش مدیریت خودتان را تغییر دهید.",
    };
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return { success: false, message: "کاربر یافت نشد." };
  }

  const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";

  await prisma.user.update({
    where: { id },
    data: { role: newRole },
  });

  revalidatePath("/admin/users");
  return {
    success: true,
    message:
      newRole === "ADMIN"
        ? "کاربر به مدیر سایت ارتقا یافت."
        : "دسترسی مدیریت از کاربر گرفته شد.",
  };
}

export async function deleteUser(id: string): Promise<ActionResult> {
  const admin = await requirePermission("MANAGE_USERS");

  if (admin.id === id) {
    return {
      success: false,
      message: "شما نمی‌توانید حساب کاربری خودتان را حذف کنید.",
    };
  }

  try {
    await prisma.user.delete({ where: { id } });
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message:
        "این کاربر دارای تاریخچه خرید فعال در سیستم است و امکان حذف آن وجود ندارد.",
    };
  }

  revalidatePath("/admin/users");
  return { success: true, message: "کاربر با موفقیت حذف شد." };
}