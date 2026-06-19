"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import {
  Menu,
  X,
  Search,
  ShoppingCart,
  User,
  ChevronDown,
  ChevronLeft,
  LogOut,
  LayoutDashboard,
  Grid,
} from "lucide-react";

import { useCartStore } from "@/stores/cart-store";
import { useCurrentUser } from "@/hooks/use-current-user";

type Category = {
  id: string;
  name: string;
  slug: string;
  subcategories?: Category[]; // مدل درختی برای زیردسته‌بندی‌ها
};

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [showMegaMenu, setShowMegaMenu] = useState(false);

  // استیت‌های مدیریت مگا منوی نردبانی
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeParentId, setActiveParentId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const { user } = useCurrentUser();

  const count = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  // واکشی درخت دسته‌بندی‌ها از دیتابیس
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
          if (data.length > 0) {
            setActiveParentId(data[0].id); // فعال‌سازی پیش‌فرض دسته‌بندی اول ریشه
          }
        }
      })
      .catch((err) => console.error(err));
  }, []);

  async function logout() {
    await fetch("/api/logout", {
      method: "POST",
    });
    window.location.href = "/";
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      window.location.href = `/products?q=${encodeURIComponent(searchQuery)}`;
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm select-none">
      
      {/* بنر تستی متحرک بالای هدر */}
      {/* بنر متحرک بالای هدر (نسخه واکنش‌گرا ویژه موبایل و دسکتاپ) */}
      <div className="w-full">
        {/* ۱. بنر مخصوص موبایل (در حالت عادی نمایش داده می‌شود و از سایز md به بالا مخفی می‌شود) */}
        <Image
          src="/uploads/topbanner2.gif"
          alt="تخفیف ویژه موبایل"
          width={768} // تنظیم عرض بهینه برای پهنای موبایل
          height={40}
          priority
          className="w-full h-auto object-cover max-h-[45px] block md:hidden"
        />

        {/* ۲. بنر مخصوص دسکتاپ (در حالت عادی مخفی است و از سایز md به بالا نمایش داده می‌شود) */}
        <Image
          src="/uploads/topbanner.gif"
          alt="تخفیف ویژه دسکتاپ"
          width={1920}
          height={40}
          priority
          className="w-full h-auto object-cover max-h-[45px] hidden md:block"
        />
      </div>

      {/* نوار اصلی هدر */}
      <div className="container mx-auto flex items-center justify-between gap-4 py-3.5 px-4 max-w-6xl">

        {/* دکمه منوی موبایل */}
        <button
          className="md:hidden p-1.5 bg-zinc-50 border rounded-xl"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* لوگو سایت */}
        <Link href="/" className="shrink-0 flex items-center">
          <Image
            src="/uploads/logo.png"
            alt="فروشگاه فیزیکی"
            width={160}
            height={50}
            priority
            className="h-11 w-auto object-contain"
          />
        </Link>

        {/* فیلد جستجوی فعال */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex flex-1 max-w-lg relative"
        >
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در بین تمامی کالاها..."
            className="w-full border rounded-xl pr-10 pl-4 py-2.5 bg-zinc-50/50 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
          />
        </form>

        {/* دکمه‌های سمت چپ */}
        <div className="flex items-center gap-4.5">

          {!user ? (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 py-2 bg-zinc-50 border hover:bg-zinc-100 rounded-xl transition text-xs font-semibold text-zinc-700"
            >
              <User size={16} className="text-zinc-500" />
              <span>ورود یا ثبت‌نام</span>
            </Link>
          ) : (
            <div className="hidden md:flex gap-4 items-center text-xs font-semibold text-zinc-500">
              <Link href="/profile" className="hover:text-blue-600 transition flex items-center gap-1">
                <User size={16} />
                <span>حساب من</span>
              </Link>

              {user.role === "ADMIN" && (
                <Link href="/admin" className="hover:text-blue-600 transition flex items-center gap-1">
                  <LayoutDashboard size={16} />
                  <span>پنل ادمین</span>
                </Link>
              )}

              <button onClick={logout} className="hover:text-red-600 transition flex items-center gap-1">
                <LogOut size={16} />
                <span>خروج</span>
              </button>
            </div>
          )}

          {/* سبد خرید */}
          <Link
            href="/cart"
            className="relative p-2.5 bg-zinc-50 hover:bg-zinc-100 border rounded-xl transition flex items-center justify-center text-zinc-700"
          >
            <ShoppingCart size={18} />
            {count > 0 && (
              <span className="absolute -top-1.5 -left-1.5 bg-red-500 text-white text-[10px] font-extrabold w-5 h-5 flex items-center justify-center rounded-full border border-white shadow-sm animate-pulse">
                {count.toLocaleString("fa-IR")}
              </span>
            )}
          </Link>

        </div>
      </div>

      {/* نوار ناوبری مگا منوی نردبانی یکپارچه (دسکتاپ) */}
      <nav className="hidden md:flex border-t bg-white select-none">
        <div className="container mx-auto flex items-center gap-7 py-2.5 px-4 text-xs font-bold text-zinc-500 max-w-6xl">

          {/* 👇 ۱. مگا منوی پویای دسته‌بندی‌ها به عنوان اولین آیتم منو */}
          <div
            onMouseEnter={() => setShowMegaMenu(true)}
            onMouseLeave={() => setShowMegaMenu(false)}
            className="relative py-1 cursor-pointer"
          >
            <span className="hover:text-zinc-900 transition flex items-center gap-1.5 text-zinc-800">
              <Grid size={15} className="text-zinc-400" />
              <span>دسته‌بندی کالاها</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 text-zinc-400 ${showMegaMenu ? "rotate-180" : ""
                  }`}
              />
            </span>

            {/* درگاه مگا منوی نردبانی پیشرفته (RTL) */}
            {showMegaMenu && categories.length > 0 && (
              <div className="absolute right-0 top-full pt-3 w-[720px] z-50 animate-fade-in">
                <div className="bg-white border border-zinc-150 shadow-xl rounded-2xl overflow-hidden grid grid-cols-4 items-stretch min-h-[300px]">

                  {/* ستون راست (سایدبار تیره اتمسفریک دسته‌بندی‌های والد) */}
                  <div className="col-span-1 bg-zinc-50/80 border-l border-zinc-150 flex flex-col p-2 space-y-1">
                    {categories.map((parent) => {
                      const isParentActive = parent.id === activeParentId;
                      return (
                        <div
                          key={parent.id}
                          onMouseEnter={() => setActiveParentId(parent.id)}
                          className={`px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between ${isParentActive
                              ? "bg-white text-blue-600 shadow-sm border border-zinc-100"
                              : "text-zinc-500 hover:bg-zinc-100/40 hover:text-zinc-900"
                            }`}
                        >
                          <span>{parent.name}</span>
                          <ChevronLeft size={12} className={isParentActive ? "text-blue-500 animate-pulse" : "text-zinc-300"} />
                        </div>
                      );
                    })}
                  </div>

                  {/* سه ستون چپ (نمایش زیردسته‌بندی‌های والدِ هاور شده) */}
                  <div className="col-span-3 p-6 grid grid-cols-2 content-start gap-4">
                    {categories
                      .find((c) => c.id === activeParentId)
                      ?.subcategories?.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/products?category=${sub.slug}`}
                          onClick={() => setShowMegaMenu(false)}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-zinc-50 hover:text-blue-600 transition"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                          <span className="text-xs font-semibold text-zinc-700">{sub.name}</span>
                        </Link>
                      ))}

                    {(!categories.find((c) => c.id === activeParentId)?.subcategories ||
                      categories.find((c) => c.id === activeParentId)?.subcategories?.length === 0) && (
                        <div className="col-span-2 text-center text-xs text-zinc-400 py-10">
                          زیردسته‌بندی برای این کالا تعریف نشده است.
                        </div>
                      )}
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* سایر منوها به ترتیب در کنار مگا منو */}
          <Link className="hover:text-zinc-900 transition py-1" href="/">
            خانه
          </Link>

          <Link className="hover:text-zinc-900 transition py-1" href="/products">
            همه محصولات
          </Link>

          <Link className="hover:text-zinc-900 transition py-1" href="/contactus">
            تماس با ما
          </Link>

        </div>
      </nav>

      {/* منوی ریسپانسیو موبایل */}
      {open && (
        <div className="md:hidden border-t bg-white p-4 flex flex-col gap-4 text-xs font-bold text-zinc-600 animate-fade-in">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی کالا..."
              className="w-full border rounded-xl pr-10 pl-4 py-2.5 bg-zinc-50/40 text-xs focus:bg-white outline-none"
            />
          </form>

          <Link href="/">خانه</Link>
          <Link href="/products">همه محصولات</Link>
          <Link href="/contactus">تماس با ما</Link>

          {categories.length > 0 && (
            <div className="border-t pt-3 space-y-2.5">
              <span className="text-[10px] text-zinc-400 block mr-1 font-semibold">دسته‌بندی‌های ریشه</span>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.slug}`}
                    className="p-2 bg-zinc-50 rounded-xl hover:bg-blue-50 hover:text-blue-600 text-center transition"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {user && (
            <div className="border-t pt-3 flex items-center justify-between">
              <Link href="/profile" className="text-blue-600">پنل کاربری من</Link>
              <button onClick={logout} className="text-red-500">خروج از حساب</button>
            </div>
          )}
        </div>
      )}

    </header>
  );
}