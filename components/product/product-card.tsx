"use client";

import Image from "next/image";
import Link from "next/link";

type ProductCardProps = {
  product: {
    id: string;
    title: string;
    slug: string;
    price: number;
    stock: number;
    images?: {
      url: string;
    }[];

    oldPrice?: number;
  };
};

export function ProductCard({
  product,
}: ProductCardProps) {
  const image =
    product.images?.[0]?.url ??
    "/placeholder.png";

  const hasDiscount =
    product.oldPrice &&
    product.oldPrice > product.price;

  const discountPercent =
    hasDiscount
      ? Math.round(
        ((product.oldPrice! -
          product.price) /
          product.oldPrice!) *
        100
      )
      : 0;
  return (
    <Link
      href={`/products/${product.slug}`}
      className="
        group
        block
        bg-white
        border
        rounded-2xl
        overflow-hidden
        hover:shadow-lg
        transition
        duration-300
      "
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-50">

        {hasDiscount && (
          <div
            className="
        absolute
        top-2
        right-2
        z-10
        bg-red-600
        text-white
        text-xs
        px-2
        py-1
        rounded-lg
      "
          >
            %{discountPercent}-
          </div>
        )}

        <Image
          src={image}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="
            object-contain
            p-4
            hover:scale-105
            transition
          "
        />
      </div>

      {/* Content */}
      <div className="p-4">

        <h3
          className="
            text-sm
            font-medium
            line-clamp-2
            min-h-[48px]
          "
        >
          {product.title}
        </h3>

        <div className="mt-3 flex justify-between items-center">
          <span
            className={`text-xs ${product.stock > 0
              ? "text-green-600"
              : "text-red-600"
              }`}
          >
            {product.stock > 0
              ? "موجود"
              : "ناموجود"}
          </span>

          <span className="text-xs">
            ⭐ 4.8
          </span>
        </div>

        <div className="mt-4 text-left">

          {hasDiscount && (
            <div className="text-sm text-gray-400 line-through">
              {product.oldPrice?.toLocaleString()}
            </div>
          )}

          <div
            className="
              font-bold
              text-lg
              text-red-600
            "
          >
            {product.price.toLocaleString()}
          </div>

          <div className="text-xs text-gray-500">
            تومان
          </div>

        </div>

        <button
          className="
            mt-4
            w-full
            rounded-xl
            bg-red-600
            text-white
            py-2
            opacity-0
            group-hover:opacity-100
            transition
          "
        >
          افزودن به سبد
        </button>
      </div>
    </Link>
  );
}