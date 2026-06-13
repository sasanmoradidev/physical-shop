import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
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
            images: true,
        },
    });

    if (!product) {
        notFound();
    }

    return (
        <div className="container mx-auto py-10">
            <Image
                className="w-full max-w-md rounded-lg d-block m-auto"
                src={product.images?.[0]?.url || "/placeholder.png"}
                alt={product.title}
                width={200}
                height={200}
            />
            <h1 className="text-3xl font-bold">
                {product.title}
            </h1>

            <p className="mt-2 text-muted-foreground">
                {product.category.name}
            </p>

            <p className="mt-6">
                {product.description}
            </p>

            <p className="mt-6 text-2xl font-bold">
                ${Number(product.price)}
            </p>

            <p className="mt-3">
                موجودی: {product.stock}
            </p>
            <AddToCartButton
                id={product.id}
                title={product.title}
                price={Number(product.price)}
            />
        </div>
    );
}