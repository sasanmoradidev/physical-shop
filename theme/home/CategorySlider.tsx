"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight } from "lucide-react";

import "swiper/css";

export type HomeCategoryItem = {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount?: number;
};

export function CategorySlider({
  categories,
}: {
  categories: HomeCategoryItem[];
}) {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);

  if (categories.length === 0) return null;

  return (
    <section className="container mx-auto px-4 mt-10 select-none">
      {/* هدر سکشن + دکمه‌های ناوبری دسکتاپ */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-extrabold text-zinc-900 tracking-tight">
            خرید بر اساس دسته‌بندی
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="text-xs font-bold text-zinc-500 hover:text-brand transition inline-flex items-center gap-1"
          >
            <span>مشاهده همه</span>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Link>

          <div className="hidden md:flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => swiper?.slidePrev()}
              aria-label="قبلی"
              className="h-8 w-8 rounded-full border border-zinc-200 bg-white hover:border-zinc-900 text-zinc-700 flex items-center justify-center transition cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => swiper?.slideNext()}
              aria-label="بعدی"
              className="h-8 w-8 rounded-full border border-zinc-200 bg-white hover:border-zinc-900 text-zinc-700 flex items-center justify-center transition cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* اسلایدر دایره‌ای مدرن مخصوص پوشاک */}
      <Swiper
        onSwiper={setSwiper}
        spaceBetween={16}
        breakpoints={{
          0: { slidesPerView: 3.1, spaceBetween: 12 },
          480: { slidesPerView: 4.2, spaceBetween: 16 },
          768: { slidesPerView: 5.5, spaceBetween: 20 },
          1024: { slidesPerView: 7, spaceBetween: 22 },
          1280: { slidesPerView: 8, spaceBetween: 24 },
        }}
      >
        {categories.map((cat) => (
          <SwiperSlide key={cat.id} className="py-1">
            <Link
              href={`/products?category=${cat.slug}`}
              className="group flex flex-col items-center text-center gap-3"
            >
              {/* قاب دایره‌ای با رینگ ظریف و زوم نرم هنگام هاور */}
              <div className="w-full max-w-[132px] aspect-square rounded-full p-1.5 bg-white border border-zinc-200/80 shadow-2xs group-hover:border-brand/50 group-hover:shadow-md transition-all duration-300">
                <div className="relative w-full h-full rounded-full overflow-hidden bg-zinc-50">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 110px, 132px"
                    className="object-cover object-center group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>

              {/* عنوان و تعداد کالا */}
              <div className="space-y-0.5 px-1">
                <h3 className="text-xs sm:text-[13px] font-bold text-zinc-800 group-hover:text-brand transition line-clamp-1">
                  {cat.name}
                </h3>
                {cat.productCount && cat.productCount > 0 ? (
                  <span className="text-[10px] text-zinc-400 block">
                    {cat.productCount.toLocaleString("fa-IR")} کالا
                  </span>
                ) : null}
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}