import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/product-form";
import { serializeProduct } from "@/lib/mappers/product.mapper"; // 👈 ایمپورت مپر
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { order: "asc" }, // لود تصاویر بر اساس درگ اند دراپ
      },
    },
  });

  if (!product) {
    notFound();
  }

  // 👇 ساده‌سازی محصول با استفاده از مپری که ساختید [2]
  const safeProduct = serializeProduct(product);

  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="container max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">ویرایش محصول</h1>
      <ProductForm categories={categories} product={safeProduct} />
    </div>
  );
}