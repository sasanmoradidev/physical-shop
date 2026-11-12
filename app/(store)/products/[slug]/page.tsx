import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";

import { RelatedProductsSlider } from "@/components/product/related-products-slider";
import { serializeProduct } from "@/lib/mappers/product.mapper";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductPurchase } from "@/components/product/product-purchase"; // 👈 ایمپورت کامپوننت جدید
import { getFinalPrice } from "@/lib/product-price";
import { Tag, FileText } from "lucide-react";
import Script from "next/script";
import { ChevronLeft, Home } from "lucide-react";
import Link from "next/link";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

/* ==============================================
   🚀 GENERATE DYNAMIC METADATA
============================================== */
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { images: { orderBy: { order: "asc" } }, variants: true },
  });

  if (!product) return { title: "محصول یافت نشد | فروشگاه فیزیکی" };

  const finalPrice = getFinalPrice({
    price: Number(product.price),
    offerPrice: product.offerPrice ? Number(product.offerPrice) : null,
    offerStartsAt: product.offerStartsAt,
    offerEndsAt: product.offerEndsAt,
  });

  const imageUrl = product.images?.[0]?.url
    ? `${process.env.NEXT_PUBLIC_APP_URL}${product.images[0].url}`
    : `${process.env.NEXT_PUBLIC_APP_URL}/placeholder.png`;

  return {
    title: `${product.title} | فروشگاه فیزیکی`,
    description: product.description.slice(0, 150),
    openGraph: {
      title: product.title,
      description: `قیمت: ${finalPrice.toLocaleString("fa-IR")} تومان - ${product.description.slice(0, 100)}...`,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/products/${product.slug}`,
      images: [{ url: imageUrl, width: 500, height: 500, alt: product.title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: `قیمت: ${finalPrice.toLocaleString("fa-IR")} تومان`,
      images: [imageUrl],
    },
  };
}

/* ==============================================
   📦 PRODUCT DETAILS PAGE
============================================== */
export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { order: "asc" } },
      variants: true, // 👈 اطمینان از لود تنوع‌ها
    },
  });

  if (!product) notFound();

  const safeProduct = serializeProduct(product);

  const relatedProducts = await prisma.product.findMany({
    where: { categoryId: product.categoryId, NOT: { id: product.id } },
    include: {
      images: { orderBy: { order: "asc" } },
      variants: true,
    },
    take: 8,
  });

  const safeRelated = relatedProducts.map(serializeProduct);

  // محاسبه قیمت نهایی برای اسکیما (تبدیل تومان به ریال برای استاندارد جهانی موتورهای جستجو)
  const finalPriceToman = getFinalPrice({
    price: Number(product.price),
    offerPrice: product.offerPrice ? Number(product.offerPrice) : null,
    offerStartsAt: product.offerStartsAt,
    offerEndsAt: product.offerEndsAt,
  });
  const finalPriceIRR = finalPriceToman * 10;

  const imageUrl = product.images?.[0]?.url
    ? `${process.env.NEXT_PUBLIC_APP_URL}${product.images[0].url}`
    : `${process.env.NEXT_PUBLIC_APP_URL}/placeholder.png`;

  // 👇 ساخت اسکیمای محصول (Product JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.title,
    image: imageUrl,
    description: product.description,
    sku: product.sku || product.id,
    offers: {
      "@type": "Offer",
      url: `${process.env.NEXT_PUBLIC_APP_URL}/products/${product.slug}`,
      priceCurrency: "IRR",
      price: finalPriceIRR,
      priceValidUntil: product.offerEndsAt ? product.offerEndsAt.toISOString().split("T")[0] : undefined,
      itemCondition: "https://schema.org/NewCondition",
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  // 👇 ۲. اسکیمای جدید Breadcrumb (مسیر راهنما)
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "خانه",
        "item": `${process.env.NEXT_PUBLIC_APP_URL}`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "محصولات",
        "item": `${process.env.NEXT_PUBLIC_APP_URL}/products`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": product.category.name,
        "item": `${process.env.NEXT_PUBLIC_APP_URL}/products?category=${product.category.slug}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": product.title,
        "item": `${process.env.NEXT_PUBLIC_APP_URL}/products/${product.slug}`
      }
    ]
  };

  return (
    <>
      {/* 👇 تزریق اسکیمای محصول به صفحه */}
      <Script
        id={`product-schema-${product.id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 👇 تزریق اسکیمای Breadcrumb */}
      <Script
        id={`breadcrumb-schema-${product.id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="container mx-auto py-8 px-4 max-w-5xl animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">

          <ProductGallery images={product.images} productTitle={product.title} />

          <div className="space-y-6">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold border border-blue-100/50">
              <Tag className="h-3 w-3" />
              <span>{product.category.name}</span>
            </span>

            {/* نمایش BreadCrumb */}
            <nav className="flex items-center gap-1.5 text-[11px] text-zinc-500 mb-6 font-medium bg-zinc-50/50 w-fit px-3 py-1.5 rounded-xl border border-zinc-100">
              <Link href="/" className="hover:text-blue-600 transition flex items-center gap-1">
                <Home className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">خانه</span>
              </Link>

              <ChevronLeft className="w-3.5 h-3.5 text-zinc-300" />

              <Link href="/products" className="hover:text-blue-600 transition">
                محصولات
              </Link>

              <ChevronLeft className="w-3.5 h-3.5 text-zinc-300" />

              <Link href={`/products?category=${product.category.slug}`} className="hover:text-blue-600 transition truncate max-w-[80px] sm:max-w-none">
                {product.category.name}
              </Link>

              <ChevronLeft className="w-3.5 h-3.5 text-zinc-300" />

              <span className="text-zinc-800 font-bold truncate max-w-[120px] sm:max-w-[200px]">
                {product.title}
              </span>
            </nav>
            {/*End نمایش BreadCrumb */}

            <h1 className="text-xl md:text-2xl font-bold text-zinc-900 tracking-tight leading-8">
              {product.title}
            </h1>

            {/* 👇 فراخوانی کامپوننت کلاینتِ خرید و انتخاب تنوع */}
            <ProductPurchase product={safeProduct} />
          </div>
        </div>
      </div>

      <div className="container mx-auto border-t border-zinc-100 mt-5 space-y-2">
        <h2 className="text-md font-bold text-zinc-800 pt-5 flex items-center gap-1.5 mr-0.5">
          <FileText className="h-4 w-4 text-zinc-400" />
          <span>توضیحات محصول</span>
        </h2>
        <p className="leading-6 text-md text-zinc-500 font-medium leading-relaxed">
          {product.description}
        </p>
      </div>

      {relatedProducts.length > 0 && (
        <RelatedProductsSlider relatedProducts={safeRelated} />
      )}
    </>
  );
}