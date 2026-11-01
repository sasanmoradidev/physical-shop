// app/admin/users/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac-server";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

/* =========================
   🟢 CREATE USER
========================= */

export async function createUser(formData: FormData) {
  await requirePermission("MANAGE_USERS");

  const name = formData.get("name") as string;
  const username = formData.get("username") as string;
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as Role;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { phone }],
    },
  });

  if (existingUser) {
    throw new Error("کاربری با این نام کاربری یا شماره موبایل از قبل وجود دارد.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      username,
      phone,
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
  const username = formData.get("username") as string;
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as Role;

  if (admin.id === id && role !== "ADMIN") {
    throw new Error("شما مجاز به عزل نقش مدیریت خودتان نیستید.");
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { phone }],
      NOT: { id },
    },
  });

  if (existingUser) {
    throw new Error("این نام کاربری یا شماره موبایل توسط کاربر دیگری استفاده شده است.");
  }

  const updateData: any = {
    name,
    username,
    phone,
    role,
  };

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
   🟡 TOGGLE USER ROLE
========================= */

export async function toggleUserRole(id: string) {
  const admin = await requirePermission("MANAGE_USERS");

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

  if (admin.id === id) {
    throw new Error("شما نمی‌توانید حساب کاربری خودتان را حذف کنید.");
  }

  try {
    await prisma.user.delete({
      where: { id },
    });
  } catch (error) {
    console.error(error);
    throw new Error("این کاربر دارای تاریخچه خرید فعال در سیستم است و امکان حذف آن وجود ندارد.");
  }

  revalidatePath("/admin/users");
}