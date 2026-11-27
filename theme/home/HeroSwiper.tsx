"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import type { HeroSlide } from "./config";

import "swiper/css";
import "swiper/css/pagination";

export function HeroSwiper({ slides }: { slides: HeroSlide[] }) {
  const validSlides = slides.filter((s) => Boolean(s.image));
  if (validSlides.length === 0) return null;

  return (
    <div className="w-full select-none">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={
          validSlides.length > 1
            ? { delay: 4000, disableOnInteraction: false }
            : false
        }
        pagination={validSlides.length > 1 ? { clickable: true } : false}
        loop={validSlides.length > 1}
        className="w-full"
      >
        {validSlides.map((slide, index) => {
          const content = (
            <div className="relative w-full h-[180px] sm:h-[280px] md:h-[400px] lg:h-[450px]">
              <Image
                src={slide.image}
                alt={slide.title || `اسلاید ${index + 1}`}
                fill
                priority={index === 0}
                className="object-cover"
              />
            </div>
          );

          const hasLink = Boolean(slide.link && slide.link.trim() !== "" && slide.link.trim() !== "#");

          return (
            <SwiperSlide key={slide.id}>
              {hasLink ? (
                <Link href={slide.link} className="block w-full">
                  {content}
                </Link>
              ) : (
                content
              )}
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}