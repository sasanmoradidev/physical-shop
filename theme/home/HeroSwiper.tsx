"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import type { HeroSlide } from "./config";

import "swiper/css";
import "swiper/css/pagination";

export function HeroSwiper({ slides }: { slides: HeroSlide[] }) {
  const validSlides = slides.filter((s) => Boolean(s.image || s.mobileImage));
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
          const desktopSrc = slide.image || slide.mobileImage || "";
          const mobileSrc = slide.mobileImage || slide.image || "";
          const altText = slide.title || `اسلاید ${index + 1}`;

          const content = (
            <>
              {/* نمایش در موبایل: نسبت 800 در 1000 */}
              <div className="relative block md:hidden w-full aspect-[800/1000] overflow-hidden bg-neutral-100">
                <Image
                  src={mobileSrc}
                  alt={altText}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className="object-cover object-center"
                />
              </div>

              {/* نمایش در دسکتاپ: نسبت 1920 در 860 */}
              <div className="relative hidden md:block w-full aspect-[1920/860] overflow-hidden bg-neutral-100">
                <Image
                  src={desktopSrc}
                  alt={altText}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className="object-cover object-center"
                />
              </div>
            </>
          );

          const hasLink = Boolean(
            slide.link && slide.link.trim() !== "" && slide.link.trim() !== "#"
          );

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