import { prisma } from "@/lib/prisma";
import { HeroSwiper } from "@/components/home/hero-swiper";
import { OfferSection } from "@/components/home/offer-section";
import { NewProducts } from "@/components/home/new-products";
import { FourColOffer } from "@/components/home/four-col-offer";
import { LightBanner } from "@/components/home/light-banner";
import Script from "next/script";

export default async function HomePage() {
  const discountProducts = await prisma.product.findMany({
    where: {
      isActive: true, // 👈 این خط باعث می‌شود دیتابیس کالای غیرفعال را برنگرداند
    },
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      images: {
        orderBy: { order: "asc" },
      },
    },
  });

  const safeDiscountProducts = discountProducts.map((p) => ({
    ...p,
    price: p.price.toNumber(),
    offerPrice: p.offerPrice ? p.offerPrice.toNumber() : null,
    images: p.images ?? [],
  }));

  const newProducts = await prisma.product.findMany({
    where: {
      isActive: true, // 👈 این خط باعث می‌شود دیتابیس کالای غیرفعال را برنگرداند
    },
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      images: {
        orderBy: { order: "asc" },
      },
    },
  });

  const safeNewProducts = newProducts.map((p) => ({
    ...p,
    price: p.price.toNumber(),
    offerPrice: p.offerPrice ? p.offerPrice.toNumber() : null,
    images: p.images ?? [],
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "فروشگاه فیزیکی",
    image: `${process.env.NEXT_PUBLIC_APP_URL}/uploads/logo.png`,
    description: "بهترین مقصد برای خرید مطمئن و سریع انواع محصولات با اصالت.",
    "@id": `${process.env.NEXT_PUBLIC_APP_URL}`,
    url: `${process.env.NEXT_PUBLIC_APP_URL}`,
    telephone: "02188888888",
    address: {
      "@type": "PostalAddress",
      streetAddress: "خیابان ولیعصر",
      addressLocality: "تهران",
      addressCountry: "IR"
    }
  };

  return (
    <div className="space-y-10 pb-2">
      
      {/* 👇 تزریق اسکیما به هدر صفحه به صورت نامرئی برای خزنده‌های گوگل */}
      <Script
        id="store-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* اسلایدر هیرو بنر */}
      <HeroSwiper />

      <FourColOffer />
      {/* اسلایدر شگفت‌انگیز */}
      <OfferSection products={safeDiscountProducts} />

      <FourColOffer />
      {/* اسلایدر کالاهای جدید */}
      <NewProducts products={safeNewProducts} />
      <LightBanner />
    </div>
  );
}