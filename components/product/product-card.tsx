"use client";

import Image from "next/image";
import Link from "next/link";

type ProductCardProps = {
  product: {
    id: string;
    title: string;
    slug: string;
    price: number;
    images?: {
      url: string;
    }[];
  };
};

export function ProductCard({
  product,
}: ProductCardProps) {
  const image =
    product.images?.[0]?.url ??
    "/placeholder.png";

  return (
    <Link
      href={`/products/${product.slug}`}
      className="
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
        <Image
          src={image}
          alt={product.title}
          fill
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
          <span className="text-xs text-gray-500">
            موجود
          </span>

          <span className="text-xs">
            ⭐ 4.8
          </span>
        </div>

        <div className="mt-4 text-left">
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

      </div>
    </Link>
  );
}