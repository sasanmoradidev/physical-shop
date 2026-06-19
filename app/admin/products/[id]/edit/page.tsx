import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/product-form";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProductPage({ params }: Props) {
  // ۱. رفع باگ ناهمگام بودن پارامترها در Next.js جدید
  const { id } = await params;

  // ۲. دریافت اطلاعات محصول و تصاویر همراه آن
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: true,
    },
  });

  if (!product) {
    notFound();
  }

  // ۳. دریافت دسته‌بندی‌ها برای نمایش در فرم
  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="container max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">ویرایش محصول</h1>
      <ProductForm categories={categories} product={product} />
    </div>
  );
}