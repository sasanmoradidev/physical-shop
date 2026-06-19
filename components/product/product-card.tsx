"use client";

import Image from "next/image";
import Link from "next/link";

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
      className="group block bg-white border rounded-2xl overflow-hidden hover:shadow-lg transition duration-300"
    >
      <div className="relative aspect-square bg-gray-50">
        {hasDiscount && (
          <div className="absolute top-2 right-2 z-10 bg-red-600 text-white text-xs px-2 py-1 rounded-lg">
            %{discountPercent}-
          </div>
        )}

        <Image
          src={image}
          alt={product.title}
          fill
          sizes="(max-width:768px) 50vw, 25vw"
          className="object-contain p-4 group-hover:scale-105 transition"
        />
      </div>

      <div className="p-4">
        <h3 className="text-sm font-medium line-clamp-2 min-h-[48px]">
          {product.title}
        </h3>

        <div className="mt-3 flex justify-between items-center">
          <span className={`text-xs ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
            {product.stock > 0 ? "موجود" : "ناموجود"}
          </span>
          <span className="text-xs">⭐ 4.8</span>
        </div>

        <div className="mt-4 text-left">
          {hasDiscount && (
            <div className="text-sm text-gray-400 line-through">
              {product.price.toLocaleString()}
            </div>
          )}

          <div className={`font-bold text-lg ${hasDiscount ? "text-red-600" : "text-gray-900"}`}>
            {finalPrice.toLocaleString()}
          </div>

          <div className="text-xs text-gray-500">تومان</div>
        </div>

        <button
          disabled={product.stock === 0}
          className={`mt-4 w-full rounded-xl py-2 transition ${
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