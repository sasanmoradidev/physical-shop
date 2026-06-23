import { getCurrentUser } from "@/lib/current-user";

export type Permission =
  | "VIEW_ADMIN_DASHBOARD" // مشاهده داشبورد اصلی
  | "MANAGE_PRODUCTS"      // ایجاد، ویرایش و حذف محصولات و دسته‌بندی‌ها
  | "MANAGE_ORDERS"        // مشاهده و تغییر وضعیت سفارشات
  | "MANAGE_SHIPPING"      // مدیریت روش‌های ارسال و پرداخت
  | "MANAGE_USERS";        // مدیریت پرسنل و کاربران

// نگاشت نقش‌ها به مجوزهای مجاز
const rolePermissions: Record<string, Permission[]> = {
  ADMIN: [
    "VIEW_ADMIN_DASHBOARD",
    "MANAGE_PRODUCTS",
    "MANAGE_ORDERS",
    "MANAGE_SHIPPING",
    "MANAGE_USERS",
  ],
  SUPPORT: [
    "VIEW_ADMIN_DASHBOARD",
    "MANAGE_ORDERS",
  ],
  CONTENT_MANAGER: [
    "VIEW_ADMIN_DASHBOARD",
    "MANAGE_PRODUCTS",
    "MANAGE_SHIPPING",
  ],
  USER: [],
};

/**
 * بررسی اینکه آیا یک نقش خاص مجوز انجام عملیات مورد نظر را دارد یا خیر
 */
export function hasPermission(role: string, permission: Permission): boolean {
  const permissions = rolePermissions[role];
  return permissions ? permissions.includes(permission) : false;
}

/**
 * ۱. گارد مرکزی ورود کاربر (مخصوص کلاینت و فرآیندهای خرید)
 * اگر کاربر لاگین نباشد، خطا می‌دهد و در غیر این صورت کاربر را برمی‌گرداند
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error("لطفاً ابتدا وارد حساب کاربری خود شوید.");
  }

  return user;
}

/**
 * ۲. گارد مرکزی سطوح دسترسی ادمین (مخصوص پنل مدیریت و سرور اکشن‌ها)
 * بررسی می‌کند که آیا کاربر لاگین کرده و مجوز اختصاصی را دارد یا خیر
 */
export async function requirePermission(permission: Permission) {
  const user = await requireAuth(); // ابتدا بررسی لاگین بودن

  if (!hasPermission(user.role, permission)) {
    throw new Error("شما مجوز کافی برای انجام این عملیات را ندارید.");
  }

  return user; // بازگرداندن کاربر احراز هویت شده برای استفاده‌های بعدی در متدها
}