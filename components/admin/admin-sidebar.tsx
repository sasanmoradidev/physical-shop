"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  ArrowLeft,
  Menu,
  X,
  Truck,
  Users,
  CreditCard,
  FolderTree,
  Settings,
  Tag,
} from "lucide-react";

import { useCurrentUser } from "@/hooks/use-current-user";
import { hasPermission, Permission } from "@/lib/rbac";

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useCurrentUser();

  const menuItems = [
    {
      title: "داشبورد",
      href: "/admin",
      icon: LayoutDashboard,
      permission: "VIEW_ADMIN_DASHBOARD" as Permission,
    },
    {
      title: "محصولات",
      href: "/admin/products",
      icon: ShoppingBag,
      permission: "MANAGE_PRODUCTS" as Permission,
    },
    {
      title: "دسته‌بندی‌ها",
      href: "/admin/categories",
      icon: FolderTree,
      permission: "MANAGE_CATEGORIES" as Permission,
    },
    {
      title: "برندها",
      href: "/admin/brands",
      icon: Tag,
      permission: "MANAGE_PRODUCTS" as Permission,
    },
    {
      title: "سفارش‌ها",
      href: "/admin/orders",
      icon: ClipboardList,
      permission: "MANAGE_ORDERS" as Permission,
    },
    {
      title: "تراکنش‌های مالی",
      href: "/admin/transactions",
      icon: CreditCard,
      permission: "MANAGE_ORDERS" as Permission,
    },
    {
      title: "روش‌های ارسال",
      href: "/admin/shipping",
      icon: Truck,
      permission: "MANAGE_SHIPPING" as Permission,
    },
    {
      title: "روش‌های پرداخت",
      href: "/admin/payments",
      icon: CreditCard,
      permission: "MANAGE_PAYMENT" as Permission,
    },
    {
      title: "کاربران",
      href: "/admin/users",
      icon: Users,
      permission: "MANAGE_USERS" as Permission,
    },
    {
      title: "تنظیمات فروشگاه",
      href: "/admin/settings",
      icon: Settings,
      permission: "MANAGE_SETTINGS" as Permission,
    },
  ];

  return (
    <>
      {/* دکمه باز و بسته کردن منو در موبایل */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "بستن منو" : "باز کردن منو"}
        className="lg:hidden fixed top-4 left-4 z-[60] p-2.5 bg-white rounded-xl shadow-md border border-gray-200 text-gray-700"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* پس‌زمینه تیره در موبایل */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
        />
      )}

      <aside
        className={`fixed inset-y-0 right-0 z-50 w-64 bg-white border-l border-gray-100 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:sticky lg:top-0 lg:self-start lg:h-screen lg:shrink-0 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* هدر ثابت بالای سایدبار */}
        <div className="flex items-center gap-3 p-6 pb-5 border-b border-gray-100 shrink-0">
          <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-sm">
            <LayoutDashboard size={20} />
          </div>
          <div>
            <h2 className="font-bold text-gray-800 text-sm">پنل مدیریت</h2>
            <p className="text-[10px] text-gray-400">سطوح دسترسی پویا</p>
          </div>
        </div>

        {/* لیست منوها با قابلیت اسکرول مستقل در دسکتاپ و موبایل */}
        <nav className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-1">
          {menuItems.map((item) => {
            if (user && !hasPermission(user.role, item.permission)) {
              return null;
            }

            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-600 shadow-inner"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon size={18} className="shrink-0" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* دکمه ثابت پایین سایدبار */}
        <div className="p-4 border-t border-gray-100 shrink-0">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all border border-dashed border-gray-200 hover:border-red-200"
          >
            <ArrowLeft size={18} className="shrink-0" />
            <span>بازگشت به سایت</span>
          </Link>
        </div>
      </aside>
    </>
  );
}