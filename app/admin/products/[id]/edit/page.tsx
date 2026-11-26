import { prisma } from "@/lib/prisma";
import { requirePagePermission } from "@/lib/rbac-server";
import ProductForm from "@/components/admin/product-form";
import { serializeProduct } from "@/lib/mappers/product.mapper";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProductPage({ params }: Props) {
  await requirePagePermission("MANAGE_PRODUCTS");
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: "asc" } },
      variants: true,
    },
  });

  if (!product) {
    notFound();
  }

  const safeProduct = serializeProduct(product);

  const [categories, brands] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="container max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">ویرایش محصول</h1>
      <ProductForm categories={categories} brands={brands} product={safeProduct} />
    </div>
  );
}