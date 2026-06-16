"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { ProductCard } from "@/components/product/product-card";

export function OfferSection({ products }: any) {
  return (
    <div className="container mx-auto mt-10">

      {/* GRID */}
      <div className="grid md:grid-cols-3 gap-4 items-stretch">

        {/* LEFT */}
        <div className="h-full flex flex-col">

          <h2 className="text-xl mb-4 font-bold">
            آفر ویژه
          </h2>

          <div className="relative flex-1 overflow-hidden rounded-xl">

            <Image
              src="/uploads/offer02.jpg"
              alt="offer"
              fill
              className="object-cover hover:scale-105 transition duration-300"
            />

          </div>

        </div>

        {/* RIGHT */}
        <div className="md:col-span-2 h-full flex flex-col">

          <h2 className="text-xl mb-4 text-red-500 font-bold">
            تخفیف ویژه امروز
          </h2>

          <div className="flex-1">

            <Swiper
              slidesPerView={3}
              spaceBetween={16}
              className="h-full"
              breakpoints={{
                768: { slidesPerView: 3 },
                0: { slidesPerView: 2 },
              }}
            >

              {products.map((p: any) => (
                <SwiperSlide key={p.id}>
                  <ProductCard
                    product={{
                      id: p.id,
                      title: p.title,
                      slug: p.slug,
                      price: Number(p.price),
                      images: p.images,
                      stock: p.stock, // 👈 fix typo (stck ❌)
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