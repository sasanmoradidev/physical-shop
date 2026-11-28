import { prisma } from "@/lib/prisma";
import { getSiteConfig } from "@/lib/site-config";
import { getHomeConfig } from "@/lib/home-config";
import { HeroSwiper } from "./HeroSwiper";
import { CategorySlider } from "./CategorySlider";
import { OfferSection } from "./OfferSection";
import { NewProducts } from "./NewProducts";
import { FourColOffer } from "./FourColOffer";
import { LightBanner } from "./LightBanner";

export default async function HomePage() {
  const now = new Date();

  const [siteConfig, homeConfig, homeCategories, discountProducts, newProducts] =
    await Promise.all([
      getSiteConfig(),
      getHomeConfig(),
      prisma.category.findMany({
        where: {
          showInHome: true,
          image: { not: null },
        },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          image: true,
          _count: {
            select: {
              products: { where: { isActive: true } },
            },
          },
        },
      }),
      prisma.product.findMany({
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
      }),
      prisma.product.findMany({
        where: { isActive: true },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          images: { orderBy: { order: "asc" } },
        },
      }),
    ]);

  const safeHomeCategories = homeCategories
    .filter((c): c is typeof c & { image: string } => Boolean(c.image))
    .map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      image: c.image,
      productCount: c._count.products,
    }));

  const safeDiscountProducts = discountProducts
    .map((p) => ({
      ...p,
      price: p.price.toNumber(),
      offerPrice: p.offerPrice ? p.offerPrice.toNumber() : null,
      images: p.images ?? [],
    }))
    .filter((p) => p.offerPrice !== null && p.offerPrice < p.price);

  const safeNewProducts = newProducts.map((p) => ({
    ...p,
    price: p.price.toNumber(),
    offerPrice: p.offerPrice ? p.offerPrice.toNumber() : null,
    images: p.images ?? [],
  }));

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: siteConfig.name,
    image: `${baseUrl}${siteConfig.logo}`,
    description: siteConfig.description,
    "@id": baseUrl,
    url: baseUrl,
    telephone: siteConfig.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.city,
      addressCountry: siteConfig.address.country,
    },
  };

  return (
    <div className="space-y-10 pb-2">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <HeroSwiper slides={homeConfig.heroSlides} />

      {safeHomeCategories.length > 0 && (
        <CategorySlider categories={safeHomeCategories} />
      )}

      {homeConfig.showFirstFourCol && (
        <FourColOffer items={homeConfig.firstFourCol} />
      )}

      {homeConfig.offerSection.enabled && safeDiscountProducts.length > 0 && (
        <OfferSection
          products={safeDiscountProducts}
          banner={homeConfig.offerSection}
        />
      )}

      {homeConfig.showSecondFourCol && (
        <FourColOffer items={homeConfig.secondFourCol} />
      )}

      {homeConfig.showNewProducts && safeNewProducts.length > 0 && (
        <NewProducts products={safeNewProducts} />
      )}

      <LightBanner banner={homeConfig.lightBanner} />
    </div>
  );
}