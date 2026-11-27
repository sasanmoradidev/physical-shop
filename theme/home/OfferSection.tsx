"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { ProductCard } from "@/theme/product/ProductCard";
import type { OfferBannerConfig } from "./config";

export type HomeProduct = {
  id: string;
  title: string;
  slug: string;
  price: number;
  offerPrice?: number | null;
  offerStartsAt?: Date | null;
  offerEndsAt?: Date | null;
  stock: number;
  images?: { url: string }[];
};

export function OfferSection({
  products,
  banner,
}: {
  products: HomeProduct[];
  banner: OfferBannerConfig;
}) {
  return (
    <div className="container mx-auto px-4 mt-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <div className="relative overflow-hidden rounded-2xl h-[220px] md:h-auto md:min-h-[420px] shadow-sm bg-zinc-900">
          {banner.image && (
            <Image
              src={banner.image}
              alt={banner.title || "پیشنهاد ویژه"}
              fill
              className="object-cover transition duration-500 hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 text-white">
            {banner.badge && (
              <span className="bg-red-600 w-fit px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                {banner.badge}
              </span>
            )}
            {banner.title && (
              <h3 className="text-2xl md:text-3xl font-extrabold mt-3 tracking-tight">
                {banner.title}
              </h3>
            )}
            {banner.subtitle && (
              <p className="mt-2 text-xs text-gray-200 leading-relaxed max-w-xs">
                {banner.subtitle}
              </p>
            )}
            {banner.buttonText && (
              <Link
                href={banner.buttonLink || "/products"}
                className="mt-5 w-fit rounded-xl bg-white text-zinc-900 px-5 py-2 text-xs font-bold hover:bg-gray-100 transition shadow-sm"
              >
                {banner.buttonText}
              </Link>
            )}
          </div>
        </div>

        <div className="md:col-span-2 h-full flex flex-col justify-between">
          <h2 className="text-lg md:text-xl mb-4 text-red-500 font-extrabold flex items-center gap-2 mr-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>تخفیف‌های ویژه امروز</span>
          </h2>

          <div className="flex-1">
            <Swiper
              modules={[Autoplay]}
              spaceBetween={16}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              breakpoints={{
                0: { slidesPerView: 2, spaceBetween: 12 },
                480: { slidesPerView: 2, spaceBetween: 16 },
                1024: { slidesPerView: 3, spaceBetween: 20 },
              }}
              className="h-full select-none"
            >
              {products.map((p) => (
                <SwiperSlide key={p.id} className="py-1">
                  <ProductCard
                    product={{
                      id: p.id,
                      title: p.title,
                      slug: p.slug,
                      price: Number(p.price),
                      images: p.images,
                      stock: p.stock,
                      offerPrice: p.offerPrice,
                      offerStartsAt: p.offerStartsAt,
                      offerEndsAt: p.offerEndsAt,
                    }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </div>
  );
}