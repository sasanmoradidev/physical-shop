import { prisma } from "@/lib/prisma";
import { requirePagePermission } from "@/lib/rbac-server";
import ProductForm from "@/components/admin/product-form";

export default async function NewProductPage() {
  await requirePagePermission("MANAGE_PRODUCTS");

  const [categories, brands] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="container max-w-5xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">ایجاد محصول جدید</h1>
      <ProductForm categories={categories} brands={brands} />
    </div>
  );
}