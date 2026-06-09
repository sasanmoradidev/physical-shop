import Link from "next/link";
import { prisma } from "@/lib/prisma";

type Props = {
    searchParams: Promise<{
        page?: string;
        q?: string;
        category?: string;
        sort?: string;
    }>;
};

const PAGE_SIZE = 12;

export default async function ProductsPage({
    searchParams,
}: Props) {
    const {
        page,
        q,
        category,
        sort,
    } =
        await searchParams;

    const currentPage = Number(
        page || "1"
    );

    const where = {
        isActive: true,

        ...(q
            ? {
                title: {
                    contains: q,
                    mode: "insensitive" as const,
                },
            }
            : {}),

        ...(category
            ? {
                category: {
                    slug: category,
                },
            }
            : {}),
    };

    const totalProducts =
        await prisma.product.count({
            where,
        });

    const totalPages = Math.ceil(
        totalProducts / PAGE_SIZE
    );
    const orderBy =
        sort === "price_asc"
            ? { price: "asc" as const }
            : sort === "price_desc"
                ? { price: "desc" as const }
                : { createdAt: "desc" as const };
    const products =

        await prisma.product.findMany({
            where,

            include: {
                images: true,
                category: true,
            },

            orderBy,

            skip:
                (currentPage - 1) *
                PAGE_SIZE,

            take: PAGE_SIZE,
        });
    const categories =
        await prisma.category.findMany({
            orderBy: {
                name: "asc",
            },
        });
    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-8">
                محصولات
            </h1>

            <form
                action="/products"
                className="mb-8"
            >
                <input
                    type="text"
                    name="q"
                    defaultValue={q}
                    placeholder="جستجوی محصول..."
                    className="border rounded px-4 py-2 w-full"
                />
                <select
                    name="category"
                    defaultValue={category}
                    className="border rounded px-4 py-2 mt-3 w-full"
                >
                    <option value="">
                        همه دسته‌بندی‌ها
                    </option>

                    {categories.map((cat) => (
                        <option
                            key={cat.id}
                            value={cat.slug}
                        >
                            {cat.name}
                        </option>
                    ))}
                </select>
                <select
                    name="sort"
                    defaultValue={sort}
                    className="border rounded px-4 py-2 mt-3 w-full"
                >
                    <option value="newest">
                        جدیدترین
                    </option>

                    <option value="price_asc">
                        ارزان‌ترین
                    </option>

                    <option value="price_desc">
                        گران‌ترین
                    </option>
                </select>
                <button
                    type="submit"
                    className="border px-4 py-2 rounded mt-3"
                >
                    اعمال فیلتر
                </button>

            </form>


            <div className="grid md:grid-cols-4 gap-6">
                {products.map((product) => (
                    <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        className="border rounded-xl p-4"
                    >
                        {product.images[0] && (
                            <img
                                src={
                                    product.images[0].url
                                }
                                alt={product.title}
                                className="w-full h-48 object-cover rounded mb-3"
                            />
                        )}

                        <h2 className="font-bold">
                            {product.title}
                        </h2>

                        <p className="text-sm text-gray-500">
                            {
                                product.category.name
                            }
                        </p>

                        <p className="mt-3 font-bold">
                            $
                            {Number(
                                product.price
                            )}
                        </p>
                    </Link>
                ))}
            </div>

            <div className="flex justify-center gap-2 mt-10">
                {Array.from(
                    {
                        length: totalPages,
                    },
                    (_, i) => i + 1
                ).map((pageNumber) => (
                    <Link
                        key={pageNumber}
                        href={`/products?page=${pageNumber}&q=${q || ""}&category=${category || ""}&sort=${sort || "newest"}`}
                        className={`border px-4 py-2 rounded ${pageNumber ===
                                currentPage
                                ? "bg-black text-white"
                                : ""
                            }`}
                    >
                        {pageNumber}
                    </Link>
                ))}
            </div>
        </div>
    );
}