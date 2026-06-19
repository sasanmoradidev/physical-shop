import { prisma } from "@/lib/prisma";
import { HeroSwiper } from "@/components/home/hero-swiper";
import { OfferSection } from "@/components/home/offer-section";
import { NewProducts } from "@/components/home/new-products";

export default async function HomePage() {
  const discountProducts = await prisma.product.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      images: {
        orderBy: { order: "asc" }, // 👈 اضافه کردن ترتیب لود تصاویر
      },
    },
  });

  const safeDiscountProducts = discountProducts.map((p) => ({
    ...p,
    price: p.price.toNumber(),
    images: p.images ?? [],
  }));

  const newProducts = await prisma.product.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      images: {
        orderBy: { order: "asc" }, // 👈 اضافه کردن ترتیب لود تصاویر
      },
    },
  });

  const safeNewProducts = newProducts.map((p) => ({
    ...p,
    price: p.price.toNumber(),
    images: p.images ?? [],
  }));

  return (
    <div>
      <HeroSwiper />

      <OfferSection products={safeDiscountProducts} />

      <NewProducts products={safeNewProducts} />
    </div>
  );
}