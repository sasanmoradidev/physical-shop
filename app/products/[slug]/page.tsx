import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { RelatedProductsSlider } from "@/components/product/related-products-slider";
import { serializeProduct } from "@/lib/mappers/product.mapper";
import Image from "next/image";

type Props = {
    params: Promise<{
        slug: string;
    }>;
};

export default async function ProductPage({
    params,
}: Props) {
    const { slug } = await params;

    const product = await prisma.product.findUnique({
        where: { slug },
        include: {
            category: true,
            images: {
                orderBy: { order: "asc" }, // 👈 اضافه کردن ترتیب لود تصاویر
            },
        },
    });

    if (!product) {
        notFound();
    }
    if (!product) notFound();

    const safeProduct = serializeProduct(product);
    const relatedProducts =
        await prisma.product.findMany({
            where: {
                categoryId:
                    product.categoryId,

                NOT: {
                    id: product.id,
                },
            },

            include: {
                images: true,
            },

            take: 8,
        });

    const safeRelated = relatedProducts.map(serializeProduct);

    return (
        <>
            <div className="container mx-auto py-10">

                <div className="grid lg:grid-cols-2 gap-10">
                    <div>

                        <div className="border rounded-2xl p-4 bg-white">

                            <Image
                                src={
                                    product.images?.[0]?.url ??
                                    "/placeholder.png"
                                }
                                alt={product.title}
                                width={700}
                                height={700}
                                className="
                                    w-full
                                    aspect-square
                                    object-contain
                                "
                            />

                        </div>

                        {product.images.length > 1 && (
                            <div className="flex gap-3 mt-4">

                                {product.images.map((image) => (
                                    <Image
                                        key={image.id}
                                        src={image.url}
                                        alt={product.title}
                                        width={80}
                                        height={80}
                                        className="
                                            border
                                            rounded-lg
                                            p-1
                                            cursor-pointer
                                        "
                                    />
                                ))}

                            </div>
                        )}

                    </div>

                    {/* Info */}

                    <div>

                        <p className="text-sm text-gray-500 mb-2">
                            {product.category.name}
                        </p>

                        <h1 className="text-3xl font-bold">
                            {product.title}
                        </h1>

                        <div className="mt-6">

                            <div className="text-4xl font-bold text-red-600">

                                {Number(
                                    product.price
                                ).toLocaleString()}

                                <span className="text-lg mr-2">
                                    تومان
                                </span>

                            </div>

                        </div>

                        <div className="mt-6">

                            {product.stock > 0 ? (
                                <span
                                    className="
                                    text-green-600
                                    font-medium
                                    "
                                >
                                    ✓ موجود در انبار
                                </span>
                            ) : (
                                <span
                                    className="
                                        text-red-600
                                        font-medium
                                    "
                                >
                                    ناموجود
                                </span>
                            )}

                        </div>

                        <div className="mt-8">

                            <AddToCartButton
                                id={safeProduct.id}
                                title={safeProduct.title}
                                price={safeProduct.price}
                                stock={safeProduct.stock}
                            />

                        </div>

                        <div
                            className="
                                mt-8
                                border-t
                                pt-6
                            "
                        >

                            <h2 className="font-bold mb-3">
                                توضیحات محصول
                            </h2>

                            <p className="leading-8 text-gray-700">
                                {product.description}
                            </p>

                        </div>

                    </div>

                </div>

            </div>
            {
                relatedProducts.length > 0 && (
                    <RelatedProductsSlider
                        relatedProducts={safeRelated}
                    />
                )}
        </>
    );
}