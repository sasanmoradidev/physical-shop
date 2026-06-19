"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, MapPin, ClipboardList, LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useCurrentUser } from "@/hooks/use-current-user";

export function ProfileSidebar() {
  const pathname = usePathname();
  const { user } = useCurrentUser();

  async function handleLogout() {
    await fetch("/api/logout", {
      method: "POST",
    });
    window.location.href = "/";
  }

  const menuItems = [
    {
      title: "مشخصات کاربری",
      href: "/profile",
      icon: User,
    },
    {
      title: "آدرس‌های من",
      href: "/profile/addresses",
      icon: MapPin,
    },
    {
      title: "سفارش‌های من",
      href: "/profile/orders",
      icon: ClipboardList,
    },
  ];

  const userInitials = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <Card className="border-zinc-100 shadow-sm rounded-2xl overflow-hidden bg-white">
      <CardContent className="p-6 space-y-6">
        
        {/* اطلاعات بالای سایدبار (کاربر لاگین شده) */}
        <div className="flex items-center gap-3 pb-6 border-b border-zinc-100">
          <div className="h-12 w-12 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center text-lg font-bold shadow-inner flex-shrink-0">
            {userInitials}
          </div>
          <div className="space-y-0.5 truncate">
            <span className="font-bold text-zinc-800 text-sm block truncate">
              {user?.name || "کاربر مهمان"}
            </span>
            <span className="text-[10px] text-zinc-400 block truncate">
              {user?.email || ""}
            </span>
          </div>
        </div>

        {/* لینک‌های منو */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            // تشخیص دقیق دکمه فعال در فرانت‌اند
            const isActive =
              pathname === item.href ||
              (item.href !== "/profile" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-600 shadow-inner"
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
                }`}
              >
                <Icon size={16} className={isActive ? "text-blue-600" : "text-zinc-400"} />
                <span>{item.title}</span>
              </Link>
            );
          })}

          {/* دکمه خروج مستقیم از حساب */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-zinc-500 hover:bg-red-50 hover:text-red-600 transition-all text-right mt-2"
          >
            <LogOut size={16} className="text-zinc-400 group-hover:text-red-600" />
            <span>خروج از حساب</span>
          </button>
        </nav>

      </CardContent>
    </Card>
  );
}