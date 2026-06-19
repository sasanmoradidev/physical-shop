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
          <div className="relative w-full h-[180px] sm:h-[280px] md:h-[400px] lg:h-[450px]">
            <Image
              src="/uploads/slide01.jpg"
              alt="Hero banner"
              fill
              priority
              className="object-cover"
            />
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="relative w-full h-[180px] sm:h-[280px] md:h-[400px] lg:h-[450px]">
            <Image
              src="/uploads/slide02.jpg"
              alt="Hero banner"
              fill
              className="object-cover"
            />
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="relative w-full h-[180px] sm:h-[280px] md:h-[400px] lg:h-[450px]">
            <Image
              src="/uploads/slide03.jpg"
              alt="Hero banner"
              fill
              className="object-cover"
            />
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
}