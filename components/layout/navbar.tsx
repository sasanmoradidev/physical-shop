"use client";
import Link from "next/link";
import { useCartStore } from "@/store/cart-store";


export function Navbar() {
  const count = useCartStore(
    (state) =>
      state.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      )
  );
  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          Physical Shop
        </Link>

        <nav className="flex gap-6">
          <Link href="/">خانه</Link>
          <Link href="/products">محصولات</Link>
          <Link href="/cart">سبد خرید ({count})</Link>

        </nav>
      </div>
    </header>
  );
}