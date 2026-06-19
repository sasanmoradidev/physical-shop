"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Keyboard, Zoom } from "swiper/modules";
import Image from "next/image";
import { cn } from "@/lib/utils";

// ایمپورت استایل‌های بومی Swiper
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/zoom"; // استایل اختصاصی زوم دو انگشتی Swiper

// ایمپورت آیکون‌های ناوبری ظریف Lucide
import { ChevronLeft, ChevronRight, MapPinOff } from "lucide-react";

type ImageItem = {
  id: string;
  url: string;
};

type Props = {
  images: ImageItem[];
  productTitle?: string;
};

export function ProductGallery({ images, productTitle = "" }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [swiperInstance, setSwiperInstance] = useState<any>(null);

  if (!images || images.length === 0) {
    return (
      <div className="border border-zinc-100 rounded-2xl p-6 bg-white flex items-center justify-center max-h-[380px] aspect-square overflow-hidden shadow-sm">
        <Image
          src="/placeholder.png"
          alt=""
          width={300}
          height={300}
          className="object-contain"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in w-full">
      
      {/* ۱. اسلایدر اصلی تصاویر به همراه درگاه زوم تلسکوپی و ناوبری */}
      <div className="relative group border border-zinc-100 rounded-2xl bg-white overflow-hidden shadow-sm">
        <Swiper
          modules={[Pagination, Navigation, Keyboard, Zoom]}
          pagination={{ clickable: true, el: ".gallery-pagination" }}
          keyboard={{ enabled: true, onlyInViewport: true }} // ناوبری با کلیدهای چپ و راست کیبورد
          zoom={{ maxRatio: 3 }} // زوم دو انگشتی تا ۳ برابر اندازه تصویر
          onSwiper={setSwiperInstance}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          className="w-full max-h-[380px] aspect-square"
        >
          {images.map((img, i) => (
            <SwiperSlide key={img.id} zoom={true} className="flex items-center justify-center">
              {/* کلاس swiper-zoom-container برای فعالسازی زوم دو انگشتی Swiper الزامی است */}
              <div
                className="swiper-zoom-container w-full h-full flex items-center justify-center bg-white cursor-zoom-in"
                style={{ height: "380px" }}
              >
                <Image
                  src={img.url}
                  alt={productTitle}
                  fill
                  priority={i === 0}
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="object-contain p-6 pointer-events-auto"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* دایره‌های اندیکاتور پایین اسلایدر */}
        <div className="gallery-pagination absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 justify-center" />

        {/* آیکون ناوبری بعدی (سمت چپ در ساختار راست‌به‌چپ RTL) */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => swiperInstance?.slideNext()}
              disabled={activeIndex === images.length - 1}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-zinc-800 p-2 rounded-full border border-zinc-100 shadow-sm transition-all disabled:opacity-20 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100"
              aria-label="تصویر بعدی"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* آیکون ناوبری قبلی (سمت راست در ساختار راست‌به‌چپ RTL) */}
            <button
              type="button"
              onClick={() => swiperInstance?.slidePrev()}
              disabled={activeIndex === 0}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-zinc-800 p-2 rounded-full border border-zinc-100 shadow-sm transition-all disabled:opacity-20 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100"
              aria-label="تصویر قبلی"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* ۲. بندانگشتی‌های ناوبری سریع کشویی (بزرگ‌تر و ریسپانسیو ویژه موبایل) */}
      {images.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-2 w-full scrollbar-none scroll-smooth snap-x">
          {images.map((img, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={img.id}
                type="button"
                onClick={() => {
                  setActiveIndex(index);
                  if (swiperInstance) {
                    swiperInstance.slideTo(index); // هدایت اسلایدر به تصویر کلیک‌شده
                  }
                }}
                className={cn(
                  "h-16 w-16 md:h-14 md:w-14 relative border rounded-xl bg-white p-1 overflow-hidden transition-all duration-200 cursor-pointer flex items-center justify-center flex-shrink-0 snap-center",
                  isActive
                    ? "border-blue-600 ring-2 ring-blue-500/20 shadow-sm"
                    : "border-zinc-200 hover:border-zinc-400"
                )}
              >
                <Image
                  src={img.url}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-contain p-0.5"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}