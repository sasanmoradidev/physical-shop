"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import Image from "next/image";

import "swiper/css";
import "swiper/css/pagination";

export function HeroSwiper() {
  return (
    <div className="w-full">

      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 3000 }}
        pagination={{ clickable: true }}
        loop
        className="w-full"
      >

        <SwiperSlide>
          <div className="relative w-full h-[250px] md:h-[420px]">

            <Image
              src="/uploads/slide01.jpg"
              alt="hero"
              fill
              priority
              className="object-cover"
            />

          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="relative w-full h-[250px] md:h-[420px]">

            <Image
              src="/uploads/slide02.jpg"
              alt="hero"
              fill
              className="object-cover"
            />

          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="relative w-full h-[250px] md:h-[420px]">

            <Image
              src="/uploads/slide03.jpg"
              alt="hero"
              fill
              className="object-cover"
            />

          </div>
        </SwiperSlide>

      </Swiper>

    </div>
  );
}