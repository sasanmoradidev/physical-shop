"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { ProductCard } from "@/components/product/product-card";

export function NewProducts({ products }: any) {
  return (
    <div className="container mx-auto mt-14 px-4">
      <h2 className="text-xl font-bold text-zinc-900 mb-6 tracking-tight mr-1">
        جدیدترین محصولات
      </h2>

      <Swiper
        spaceBetween={16}
        breakpoints={{
          0: { slidesPerView: 1.5, spaceBetween: 12 }, // تبلور حرکت لمسی با نمایش بخشی از اسلاید بعدی
          480: { slidesPerView: 2, spaceBetween: 16 },
          768: { slidesPerView: 3, spaceBetween: 16 },
          1024: { slidesPerView: 4, spaceBetween: 20 },
        }}
        className="select-none"
      >
        {products.map((p: any) => (
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
  );
}