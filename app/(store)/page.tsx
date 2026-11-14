import { prisma } from "@/lib/prisma";
import { HeroSwiper } from "@/components/home/hero-swiper";
import { OfferSection } from "@/components/home/offer-section";
import { NewProducts } from "@/components/home/new-products";
import { FourColOffer } from "@/components/home/four-col-offer";
import { LightBanner } from "@/components/home/light-banner";

export default async function HomePage() {
  const now = new Date();

  const discountProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      offerPrice: { not: null },
      AND: [
        { OR: [{ offerStartsAt: null }, { offerStartsAt: { lte: now } }] },
        { OR: [{ offerEndsAt: null }, { offerEndsAt: { gte: now } }] },
      ],
    },
    take: 8,
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { order: "asc" } },
    },
  });

  const safeDiscountProducts = discountProducts
    .map((p) => ({
      ...p,
      price: p.price.toNumber(),
      offerPrice: p.offerPrice ? p.offerPrice.toNumber() : null,
      images: p.images ?? [],
    }))
    .filter((p) => p.offerPrice !== null && p.offerPrice < p.price);

  const newProducts = await prisma.product.findMany({
    where: { isActive: true },
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { order: "asc" } },
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
      addressCountry: "IR",
    },
  };

  return (
    <div className="space-y-10 pb-2">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <HeroSwiper />
      <FourColOffer />

      {safeDiscountProducts.length > 0 && (
        <OfferSection products={safeDiscountProducts} />
      )}

      <FourColOffer />
      <NewProducts products={safeNewProducts} />
      <LightBanner />
    </div>
  );
}