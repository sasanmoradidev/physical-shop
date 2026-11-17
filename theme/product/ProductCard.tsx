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
    offerPrice?: number | null;
    offerStartsAt?: Date | null;
    offerEndsAt?: Date | null;
    stock: number;
    images?: {
      url: string;
    }[];
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const image = product.images?.[0]?.url ?? "/placeholder.png";

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
      title={product.title}
      className="group block h-full"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all duration-300 hover:border-zinc-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
        <div className="relative flex aspect-square items-center justify-center p-4">
          <Image
            src={image}
            alt={product.title}
            fill
            sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
            className="object-contain p-4 mix-blend-multiply"
          />

          <div className="absolute right-0 top-3 rounded-l-full bg-brand px-3 py-1 text-[10px] font-bold text-brand-foreground shadow-sm">
            خرید قسطی
          </div>
        </div>

        <div className="flex flex-1 flex-col border-t border-zinc-100 p-3 pt-4">
          <h3 className="mb-4 line-clamp-2 min-h-[2.75rem] text-xs font-medium leading-[22px] text-zinc-700">
            {product.title}
          </h3>

          <div className="mt-auto flex items-end justify-between">
            {hasDiscount ? (
              <div className="flex h-5 items-center justify-center rounded-full bg-red-600 px-2 text-[11px] font-bold text-white tracking-widest">
                ٪{discountPercent}
              </div>
            ) : (
              <div className="h-5" />
            )}

            <div className="flex flex-col items-end">
              <span
                className={`text-[11px] line-through ${
                  hasDiscount ? "text-zinc-400" : "select-none text-transparent"
                }`}
              >
                {product.price.toLocaleString("fa-IR")}
              </span>

              <div className="mt-0.5 flex items-center gap-1">
                <span className="text-sm font-bold text-zinc-900">
                  {finalPrice.toLocaleString("fa-IR")}
                </span>
                <TomanIcon className="h-4 w-4 text-zinc-800" />
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}