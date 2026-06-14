import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { deleteProduct } from "./actions";
import Image from "next/image";

export default async function AdminProductsPage() {
    const products = await prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            category: true,
            images: true,
        },
    });

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-6">
                Products
            </h1>

            {products.map((product) => (
                <div
                    key={product.id}
                    className="border p-4 mb-4"
                >
                    <h3>{product.title}</h3>
                    <p>{product.category.name}</p>
                    <Image

                        src={product.images?.[0]?.url || "/placeholder.png"}
                        alt={product.title}
                        width={200}
                        height={200}
                    />
                    <Link
                        href={`/admin/products/${product.id}/edit`}
                    >
                        Edit
                    </Link>
                    <form
                        action={deleteProduct.bind(
                            null,
                            product.id
                        )}
                    >
                        <button type="submit">
                            Delete
                        </button>
                    </form>
                </div>
            ))}
            <Link href="/admin/products/new">
                New Product
            </Link>
        </div>
    );
}