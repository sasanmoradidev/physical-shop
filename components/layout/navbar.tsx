"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart-store";
import { useCurrentUser } from "@/hooks/use-current-user";

export function Navbar() {
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

  const { user } = useCurrentUser();
  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          Physical Shop
        </Link>

        <nav className="flex gap-6 items-center">
          <Link href="/">خانه</Link>

          <Link href="/products">
            محصولات
          </Link>

          <Link href="/cart">
            سبد خرید ({count})
          </Link>

          {!user && (
            <>
              <Link href="/login">
                ورود
              </Link>

              <Link href="/register">
                ثبت نام
              </Link>
            </>
          )}

          {user && (
            <>
              <Link href="/profile">
                پروفایل
              </Link>

              <Link href="/profile/orders">
                سفارش‌های من
              </Link>

              {user.role === "ADMIN" && (
                <>
                <Link href="/admin">
                  مدیریت
                </Link>
                <Link href="/admin/orders">
                سفارشات
                </Link>
                </>
              )}

              <button onClick={logout}>
                خروج
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}