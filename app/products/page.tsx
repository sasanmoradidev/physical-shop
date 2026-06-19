import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product/product-card";
import { ProductFilters } from "@/components/product/product-filters"; // 👈 ایمپورت کامپوننت فیلتر
import { ProductPagination } from "@/components/product/product-pagination"; // 👈 ایمپورت کامپوننت صفحه‌بندی

type Props = {
    searchParams: Promise<{
        page?: string;
        q?: string;
        category?: string;
        sort?: string;
    }>;
};

const PAGE_SIZE = 12;

export default async function ProductsPage({ searchParams }: Props) {
    const { page, q, category, sort } = await searchParams;
    const currentPage = Number(page || "1");

    const where = {
        isActive: true,
        ...(q ? { title: { contains: q, mode: "insensitive" as const } } : {}),
        ...(category ? { category: { slug: category } } : {}),
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
            images: {
                orderBy: { order: "asc" },
            },
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

            {/* کامپوننت فیلترها در سایت اصلی */}
            <ProductFilters
                categories={categories}
                searchParams={{ q, category, sort }}
                actionUrl="/products"
            />

            {/* لیست گرید محصولات */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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

            {/* کامپوننت صفحه‌بندی در سایت اصلی */}
            <ProductPagination
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl="/products"
                searchParams={{ q, category, sort }}
            />
        </div>
    );
}