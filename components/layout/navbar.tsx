"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import {
  Menu,
  X,
  Search,
  ShoppingCart,
  User,
} from "lucide-react";

import { useCartStore } from "@/stores/cart-store";
import { useCurrentUser } from "@/hooks/use-current-user";

export function Navbar() {
  const [open, setOpen] = useState(false);

  const { user } = useCurrentUser();

  const count = useCartStore((state) =>
    state.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    )
  );

  async function logout() {
    await fetch("/api/logout", {
      method: "POST",
    });

    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      {/*Top Banner*/}
      <div>
        <Image
          src="/uploads/topbanner.gif"
          alt="Top Banner"
          width={1920}
          height={60}
          className="w-full"
        />
      </div>
      {/* TOP BAR */}
      <div className="container mx-auto flex items-center gap-4 py-3">

        {/* Mobile menu */}
        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>

        {/* Logo */}
        <Link href="/" className="shrink-0 flex items-center">
          <Image
            src="/uploads/logo.png"
            alt="logo"
            width={200}
            height={81}
            priority
            className="h-16 w-auto object-contain"
          />
        </Link>

        {/* Search (MAIN FEATURE) */}
        <div className="hidden md:flex flex-1 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />

          <input
            placeholder="جستجو در محصولات..."
            className="w-full border rounded-xl pr-10 pl-4 py-2 bg-gray-50 focus:bg-white"
          />
        </div>

        {/* Actions */}
        <div className="mr-auto flex items-center gap-4">

          {/* User */}
          {!user ? (
            <Link
              href="/login"
              className="flex items-center gap-1"
            >
              <User size={18} />
              <span className="hidden md:block">
                ورود
              </span>
            </Link>
          ) : (
            <div className="hidden md:flex gap-3 items-center">
              <Link href="/profile">
                پروفایل
              </Link>

              {user.role === "ADMIN" && (
                <Link href="/admin">
                  مدیریت
                </Link>
              )}

              <button onClick={logout}>
                خروج
              </button>
            </div>
          )}

          {/* Cart */}
          <Link
            href="/cart"
            className="relative flex items-center gap-1"
          >
            <ShoppingCart size={20} />

            {count > 0 && (
              <span className="absolute -top-2 -left-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* CATEGORY NAV (like Digikala) */}
      <nav className="hidden md:flex border-t bg-white">
        <div className="container mx-auto flex gap-6 py-3 text-sm">

          <Link className="hover:text-red-500" href="/">
            خانه
          </Link>

          <Link className="hover:text-red-500" href="/products">
            همه محصولات
          </Link>

          <Link className="hover:text-red-500" href="/categories">
            دسته‌بندی‌ها
          </Link>

          <Link className="hover:text-red-500" href="/profile/orders">
            سفارش‌ها
          </Link>

          <Link className="hover:text-red-500" href="/contactus">
            تماس با ما
          </Link>

        </div>
      </nav>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden border-t bg-white p-4 flex flex-col gap-3">

          <input
            placeholder="جستجو..."
            className="border rounded-xl px-3 py-2"
          />

          <Link href="/">خانه</Link>
          <Link href="/products">محصولات</Link>
          <Link href="/categories">دسته‌بندی‌ها</Link>

          {user && (
            <>
              <Link href="/profile">پروفایل</Link>
              <Link href="/profile/orders">سفارش‌ها</Link>
            </>
          )}

          {user?.role === "ADMIN" && (
            <Link href="/admin">مدیریت</Link>
          )}
        </div>
      )}

    </header>
  );
}