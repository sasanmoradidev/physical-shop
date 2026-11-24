import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProductCard } from "@/theme/product/ProductCard";
import { ProductFilters } from "@/components/product/product-filters";
import { ProductPagination } from "@/components/product/product-pagination";
import { siteConfig } from "@/theme/config";
import { Metadata } from "next";

type Props = {
  searchParams: Promise<{
    page?: string;
    q?: string;
    category?: string;
    sort?: string;
  }>;
};

const PAGE_SIZE = 15;

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { category, q, page } = await searchParams;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const canonicalUrl = new URL(`${baseUrl}/products`);

  let title = siteConfig.name;
  const description = siteConfig.description;

  if (category) {
    canonicalUrl.searchParams.set("category", category);
    title = `خرید محصولات ${category.replace("-", " ")} | ${siteConfig.title}`;
  }
  if (q) {
    canonicalUrl.searchParams.set("q", q);
    title = `جستجوی ${q} | ${siteConfig.title}`;
  }
  if (page && page !== "1") {
    canonicalUrl.searchParams.set("page", page);
    title = `${title} - صفحه ${page}`;
  }

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl.toString() },
  };
}

export default async function ProductsPage({ searchParams }: Props) {
  const { page, q, category, sort } = await searchParams;
  const rawPage = Number(page);
  const currentPage = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  if (q && q.trim() !== "") {
    const exactSkuMatch = await prisma.product.findFirst({
      where: { sku: q.trim(), isActive: true },
      select: { slug: true },
    });

    if (exactSkuMatch) {
      redirect(`/products/${exactSkuMatch.slug}`);
    }
  }

  const where = {
    isActive: true,
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { sku: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(category
      ? {
          category: {
            OR: [{ slug: category }, { parent: { slug: category } }],
          },
        }
      : {}),
  };

  const totalProducts = await prisma.product.count({ where });
  const totalPages = Math.ceil(totalProducts / PAGE_SIZE);

  const orderBy =
    sort === "price_asc"
      ? { price: "asc" as const }
      : sort === "price_desc"
        ? { price: "desc" as const }
        : { createdAt: "desc" as const };

  const products = await prisma.product.findMany({
    where,
    include: {
      images: { orderBy: { order: "asc" } },
      category: true,
    },
    orderBy,
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="container mx-auto py-10 px-4 space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">محصولات</h1>

      <ProductFilters
        categories={categories}
        searchParams={{ q, category, sort }}
        actionUrl="/products"
      />

      {products.length === 0 ? (
        <div className="border border-dashed border-zinc-200 rounded-2xl p-12 text-center text-xs text-zinc-400">
          هیچ محصولی مطابق با فیلترهای انتخابی یافت نشد.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                title: product.title,
                slug: product.slug,
                price: Number(product.price),
                images: product.images,
                stock: product.stock,
                offerPrice: product.offerPrice ? Number(product.offerPrice) : null,
                offerStartsAt: product.offerStartsAt,
                offerEndsAt: product.offerEndsAt,
              }}
            />
          ))}
        </div>
      )}

      <ProductPagination
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl="/products"
        searchParams={{ q, category, sort }}
      />
    </div>
  );
}