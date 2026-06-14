"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

export function HeroSwiper() {
  return (
    <div className="container mx-auto mt-4">

      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 3000 }}
        pagination={{ clickable: true }}
        loop
        className="rounded-2xl overflow-hidden"
      >
        <SwiperSlide>
          <div className="h-64 md:h-96 bg-red-200 flex items-center justify-center">
            بنر 1
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="h-64 md:h-96 bg-blue-200 flex items-center justify-center">
            بنر 2
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="h-64 md:h-96 bg-green-200 flex items-center justify-center">
            بنر 3
          </div>
        </SwiperSlide>

      </Swiper>
    </div>
  );
}