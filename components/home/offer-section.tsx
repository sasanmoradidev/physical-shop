"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { ProductCard } from "@/components/product/product-card";
import Link from "next/link";

export function OfferSection({ products }: any) {
  return (
    <div className="container mx-auto mt-10">

      {/* GRID */}
      <div className="grid md:grid-cols-3 gap-4 items-stretch">

        {/* LEFT */}
        <div className="relative overflow-hidden rounded-xl h-full min-h-[420px]">

          <Image
            src="/uploads/offer02.jpg"
            alt="offer"
            fill
            className="object-cover transition duration-500 hover:scale-105"
          />

          <div className="absolute inset-0 bg-black/40" />

          <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">

            <span className="bg-red-600 w-fit px-3 py-1 rounded-full text-sm">
              تا ۵۰٪ تخفیف
            </span>

            <h3 className="text-3xl font-bold mt-3">
              جشنواره تابستانه
            </h3>

            <p className="mt-2 text-sm text-gray-100">
              فقط تا پایان امروز فرصت داری.
            </p>

            <Link href="/products" className="mt-5 w-fit rounded-lg bg-white text-black px-5 py-2 font-semibold hover:bg-gray-200 transition">
              مشاهده محصولات
            </Link>

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
              spaceBetween={20}
              className="h-full"

              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
              }}
              breakpoints={{
                0: {
                  slidesPerView: 1.2,
                },
                640: {
                  slidesPerView: 2,
                },
                1024: {
                  slidesPerView: 3,
                },
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
                      stock: p.stock,
                      offerPrice: p.offerPrice ? Number(p.offerPrice) : null,
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