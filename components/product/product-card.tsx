"use client";

import Image from "next/image";
import Link from "next/link";

import { TomanIcon } from "@/components/ui/toman-icon";

import {
  getDiscountPercent,
  getFinalPrice,
  hasActiveOffer,
} from "@/lib/product-price";

type ProductCardProps = {
  product: {
    id: string;
    title: string;
    slug: string;

    price: number;
    offerPrice?: number | null;      // 👈 اختیاری با علامت سوال
    offerStartsAt?: Date | null;    // 👈 اختیاری با علامت سوال
    offerEndsAt?: Date | null;      // 👈 اختیاری با علامت سوال

    stock: number;

    images?: {
      url: string;
    }[];
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const image = product.images?.[0]?.url ?? "/placeholder.png";

  // ساخت یک شیء ایمن برای پاس دادن به توابع تخفیف (جلوگیری از مقدار undefined)
  const priceData = {
    price: product.price,
    offerPrice: product.offerPrice ?? null,
    offerStartsAt: product.offerStartsAt ?? null,
    offerEndsAt: product.offerEndsAt ?? null,
  };

  const hasDiscount = hasActiveOffer(priceData);
  const finalPrice = getFinalPrice(priceData);
  const discountPercent = getDiscountPercent(priceData);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block bg-white border border-zinc-100 rounded-2xl overflow-hidden hover:shadow-md hover:border-zinc-200 transition duration-300"
    >
      {/* بخش تصویر محصول با حفظ ابعاد مربعی */}
      <div className="relative aspect-square bg-zinc-50 border-b border-zinc-50/50">
        {hasDiscount && (
          <div className="absolute top-2.5 right-2.5 z-10 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
            %{discountPercent}-
          </div>
        )}

        <Image
          src={image}
          alt={product.title}
          fill
          sizes="(max-width:768px) 50vw, 25vw"
          className="object-contain p-4 group-hover:scale-105 transition duration-300"
        />
      </div>

      {/* بخش اطلاعات متنی و قیمتی محصول */}
      <div className="p-4 flex flex-col justify-between">
        <div className="space-y-2">
          {/* عنوان محصول با حداقل ارتفاع فشرده ۳۶ پیکسل */}
          <h3 className="text-xs font-bold text-zinc-800 line-clamp-2 min-h-[36px] leading-5">
            {product.title}
          </h3>

          {/* سطر وضعیت انبار */}
          <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-500">
            <span className={product.stock > 0 ? "text-green-600" : "text-red-600"}>
              {product.stock > 0 ? "✓ موجود" : "ناموجود"}
            </span>
            <span>⭐ ۴.۸</span>
          </div>
        </div>

        {/* بخش قیمت با ارتفاع کاملاً ثابت و هم‌تراز */}
        <div className="mt-4 flex flex-col items-end justify-end h-10 select-none">
          {/* قیمت قدیمی (در صورت عدم وجود تخفیف، جای خالی آن با ارتفاع حفظ می‌شود تا کارت‌ها هم‌تراز بمانند) */}
          <div className="h-4 text-[10px] font-semibold text-zinc-400 line-through">
            {hasDiscount ? product.price.toLocaleString("fa-IR") : ""}
          </div>

          {/* قیمت نهایی و نماد کالیگرافی تومان در یک سطر */}
          <div className="flex items-center gap-1 mt-0.5">
            <span className={`font-extrabold text-sm tracking-tight ${hasDiscount ? "text-red-600" : "text-zinc-900"}`}>
              {finalPrice.toLocaleString("fa-IR")}
            </span>
            <TomanIcon className="h-3.5 w-3.5 text-zinc-400" />
          </div>
        </div>

        {/* دکمه افزودن به سبد */}
        <button
          disabled={product.stock === 0}
          className={`mt-4 w-full rounded-xl py-2 text-xs font-bold transition ${
            product.stock > 0
              ? "bg-green-600 text-white opacity-0 group-hover:opacity-100"
              : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-100"
          }`}
        >
          {product.stock > 0 ? "افزودن به سبد" : "ناموجود"}
        </button>
      </div>
    </Link>
  );
}