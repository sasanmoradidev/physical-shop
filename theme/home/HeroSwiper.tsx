"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import Image from "next/image";

import "swiper/css";
import "swiper/css/pagination";

export function HeroSwiper() {
  return (
    <div className="w-full select-none">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop
        className="w-full"
      >

        <SwiperSlide>
          <div className="relative w-full h-[75vh] md:h-auto md:aspect-[3061/1369]">
            {/* عکس مخصوص دسکتاپ (3061x1369) */}
            <Image
              src="/uploads/slide01.jpg"
              alt="Hero banner desktop"
              fill
              priority
              sizes="100vw"
              className="hidden md:block object-cover"
            />

            {/* عکس مخصوص موبایل (1376x3027) */}
            <Image
              src="/uploads/slide01-mobile.jpg" // آدرس عکس موبایل را اینجا بگذارید
              alt="Hero banner mobile"
              fill
              priority
              sizes="100vw"
              className="block md:hidden object-cover"
            />
          </div>
        </SwiperSlide>

      </Swiper>
    </div>
  );
}