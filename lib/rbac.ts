export type Permission =
  | "VIEW_ADMIN_DASHBOARD" // مشاهده داشبورد اصلی
  | "MANAGE_PRODUCTS"      // ایجاد، ویرایش و حذف محصولات و دسته‌بندی‌ها
  | "MANAGE_CATEGORIES"
  | "MANAGE_ORDERS"        // مشاهده و تغییر وضعیت سفارشات
  | "MANAGE_SHIPPING"      // مدیریت روش‌های ارسال و پرداخت
  | "MANAGE_PAYMENT"      // مدیریت روش‌های ارسال و پرداخت
  | "MANAGE_USERS";        // مدیریت پرسنل و کاربران

// نگاشت نقش‌ها به مجوزهای مجاز
export const rolePermissions: Record<string, Permission[]> = {
  ADMIN: [
    "VIEW_ADMIN_DASHBOARD",
    "MANAGE_PRODUCTS",
    "MANAGE_CATEGORIES",
    "MANAGE_ORDERS",
    "MANAGE_SHIPPING",
    "MANAGE_PAYMENT",
    "MANAGE_USERS",
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

/**
 * بررسی ساده دسترسی در سمت کلاینت (بدون هیچ ایمپورت سروری)
 */
export function hasPermission(role: string, permission: Permission): boolean {
  const permissions = rolePermissions[role];
  return permissions ? permissions.includes(permission) : false;
}