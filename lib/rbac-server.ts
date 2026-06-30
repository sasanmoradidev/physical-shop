import "server-only"; // تضمین امنیت کامل در عدم خروج کد از سرور

import { getCurrentUser } from "@/lib/current-user";
import { hasPermission, Permission } from "./rbac";

import { redirect } from 'next/navigation';


/**
 * گارد مرکزی ورود کاربر (مخصوص فرآیندهای خرید و صفحات کاربری)
 */
export async function requireAuth(redirectTo?: string) {
  const user = await getCurrentUser();

  if (!user) {
    // اگر آدرس برگشت وجود داشت، آن را به عنوان پارامتر می‌فرستیم
    const loginUrl = redirectTo
      ? `/login?callbackUrl=${encodeURIComponent(redirectTo)}`
      : '/login';

    redirect(loginUrl);
  }

  return user;
}

/**
 * گارد مرکزی سطوح دسترسی ادمین (مخصوص Server Actions)
 */
export async function requirePermission(permission: Permission) {
  const user = await requireAuth(); // ابتدا بررسی ورود

  if (!hasPermission(user.role, permission)) {
    throw new Error("شما مجوز کافی برای انجام این عملیات را ندارید.");
  }

  return user;
}