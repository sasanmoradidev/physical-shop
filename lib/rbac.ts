export type Permission =
  | "VIEW_ADMIN_DASHBOARD" // مشاهده داشبورد اصلی
  | "MANAGE_PRODUCTS"      // ایجاد، ویرایش و حذف محصولات و برندها
  | "MANAGE_CATEGORIES"    // مدیریت دسته‌بندی‌ها
  | "MANAGE_ORDERS"        // مشاهده و تغییر وضعیت سفارشات و تراکنش‌ها
  | "MANAGE_SHIPPING"      // مدیریت روش‌های ارسال
  | "MANAGE_PAYMENT"       // مدیریت روش‌های پرداخت
  | "MANAGE_USERS"         // مدیریت پرسنل و کاربران
  | "MANAGE_SETTINGS";     // مدیریت تنظیمات حساس فروشگاه

export const rolePermissions: Record<string, Permission[]> = {
  ADMIN: [
    "VIEW_ADMIN_DASHBOARD",
    "MANAGE_PRODUCTS",
    "MANAGE_CATEGORIES",
    "MANAGE_ORDERS",
    "MANAGE_SHIPPING",
    "MANAGE_PAYMENT",
    "MANAGE_USERS",
    "MANAGE_SETTINGS",
  ],
  SUPPORT: [
    "VIEW_ADMIN_DASHBOARD",
    "MANAGE_ORDERS",
  ],
  CONTENT_MANAGER: [
    "VIEW_ADMIN_DASHBOARD",
    "MANAGE_PRODUCTS",
    "MANAGE_CATEGORIES",
    "MANAGE_SHIPPING",
  ],
  USER: [],
};

export function hasPermission(role: string, permission: Permission): boolean {
  const permissions = rolePermissions[role];
  return permissions ? permissions.includes(permission) : false;
}