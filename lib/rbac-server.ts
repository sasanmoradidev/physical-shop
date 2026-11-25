import "server-only";

import { getCurrentUser } from "@/lib/current-user";
import { hasPermission, Permission } from "./rbac";
import { redirect } from "next/navigation";

/**
 * گارد مرکزی ورود کاربر
 */
export async function requireAuth(redirectTo?: string) {
  const user = await getCurrentUser();

  if (!user) {
    const loginUrl = redirectTo
      ? `/login?callbackUrl=${encodeURIComponent(redirectTo)}`
      : "/login";

    redirect(loginUrl);
  }

  return user;
}

/**
 * گارد سطوح دسترسی برای Server Actions (خطا برمی‌گرداند)
 */
export async function requirePermission(permission: Permission) {
  const user = await requireAuth();

  if (!hasPermission(user.role, permission)) {
    throw new Error("شما مجوز کافی برای انجام این عملیات را ندارید.");
  }

  return user;
}

/**
 * گارد سطوح دسترسی برای Server Components (به صفحه عدم دسترسی هدایت می‌کند)
 */
export async function requirePagePermission(permission: Permission) {
  const user = await requireAuth();

  if (!hasPermission(user.role, permission)) {
    redirect("/unauthorized");
  }

  return user;
}