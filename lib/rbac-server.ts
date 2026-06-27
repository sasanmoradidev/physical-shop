import "server-only"; // تضمین امنیت کامل در عدم خروج کد از سرور

import { getCurrentUser } from "@/lib/current-user";
import { hasPermission, Permission } from "./rbac";

/**
 * گارد مرکزی ورود کاربر (مخصوص فرآیندهای خرید)
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error("لطفاً ابتدا وارد حساب کاربری خود شوید.");
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