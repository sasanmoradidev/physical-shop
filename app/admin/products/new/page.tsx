import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/product-form";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany();

  return (
    <div className="container max-w-5xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">ایجاد محصول جدید</h1>
      <ProductForm categories={categories} />
    </div>
  );
}