import { prisma } from "@/lib/prisma";
import { HeroSwiper } from "@/components/home/hero-swiper";
import { OfferSection } from "@/components/home/offer-section";
import { NewProducts } from "@/components/home/new-products";
import { FourColOffer } from "@/components/home/four-col-offer";
import { LightBanner } from "@/components/home/light-banner";

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

  return (
    <div className="space-y-10 pb-2">
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