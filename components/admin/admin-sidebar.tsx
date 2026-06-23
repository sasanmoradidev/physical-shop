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
} from "lucide-react";

import { useCartStore } from "@/stores/cart-store";
import { useCurrentUser } from "@/hooks/use-current-user";
import { hasPermission, Permission } from "@/lib/rbac"; // 👈 ایمپورت هسته سطوح دسترسی

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const { user } = useCurrentUser();

  const count = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  async function logout() {
    await fetch("/api/logout", {
      method: "POST",
    });
    window.location.href = "/";
  }

  // تعریف منوهای مدیریت به همراه مجوز لازم برای هر منو
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
      permission: "MANAGE_PRODUCTS" as Permission,
    },
    {
      title: "سفارش‌ها",
      href: "/admin/orders",
      icon: ClipboardList,
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
      permission: "MANAGE_SHIPPING" as Permission,
    },
    {
      title: "کاربران",
      href: "/admin/users",
      icon: Users,
      permission: "MANAGE_USERS" as Permission,
    },
  ];

  const userInitials = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-24 left-4 z-50 p-2 bg-white rounded-xl shadow-md border text-gray-700"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 right-0 z-45 w-64 bg-white border-l flex flex-col justify-between p-6 transition-transform duration-300 lg:translate-x-0 lg:sticky lg:top-24 lg:h-[calc(100vh-140px)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="space-y-8">
          <div className="flex items-center gap-3 pb-6 border-b border-gray-100">
            <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-sm">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <h2 className="font-bold text-gray-800 text-sm">پنل مدیریت</h2>
              <p className="text-[10px] text-gray-400">سطوح دسترسی پویا</p>
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              // 👇 کنترل داینامیک: اگر کاربر مجوز این آیتم را نداشت، اصلاً آن را رندر نکن!
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-blue-50 text-blue-600 shadow-inner"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all border border-dashed border-gray-200 hover:border-red-200 mt-auto"
        >
          <ArrowLeft size={18} />
          <span>بازگشت به سایت</span>
        </Link>
      </aside>
    </>
  );
}