import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/products/product-card";

export default async function HomePage() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
    },
  });

  return (
    <main className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">
        فروشگاه
      </h1>

      <div className="grid gap-6 md:grid-cols-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            title={product.title}
            description={product.description}
            category={product.category.name}
            price={Number(product.price)}
            slug={product.slug}
          />
        ))}
      </div>
    </main>
  );
}