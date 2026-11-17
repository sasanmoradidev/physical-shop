import Image from "next/image";
import Link from "next/link";

export function LightBanner() {
  return (
    <div className="container relative mx-auto px-4 mt-10">
      <Link href="#" className="block">
        {/* موبایل */}
        <Image
          src="/uploads/lightbanner02.webp"
          alt="Light Banner"
          width={768}
          height={300}
          sizes="calc(100vw - 2rem)"
          className="block md:hidden w-full h-auto rounded-md"
        />

        {/* دسکتاپ */}
        <Image
          src="/uploads/lightbanner01.jpg"
          alt="Light Banner"
          width={1600}
          height={274}
          sizes="1280px"
          className="hidden md:block w-full h-auto rounded-md"
        />
      </Link>
    </div>
  );
}