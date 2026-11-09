import Image from "next/image";
import Link from "next/link";

export function LightBanner() {
  return (
    <div className="container relative mx-auto px-4 mt-10">
      <Link href="#">
        <picture>
          {/* موبایل */}
          <source
            media="(max-width: 767px)"
            srcSet="/uploads/Lightbanner02.webp"
            type="image/webp"
          />
          {/* دسکتاپ (پیش‌فرض) */}
          <Image
            src="/uploads/Lightbanner01.jpg"
            alt="Light Banner"
            width={1600}
            height={274}
            sizes="(max-width: 768px) calc(100vw - 2rem), 1280px"
            className="block w-full h-auto rounded-md"
          />
        </picture>
      </Link>
    </div>
  );
}