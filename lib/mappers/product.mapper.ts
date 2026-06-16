import { Product, ProductImage } from "@prisma/client";

type ProductWithImages = Product & {
  images: ProductImage[];
};

export function serializeProduct(
  product: ProductWithImages
) {
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    description: product.description,
    stock: product.stock,
    categoryId: product.categoryId,
    featured: product.featured,
    isActive: product.isActive,

    // 👇 مهم‌ترین قسمت
    price: Number(product.price),

    images: product.images.map((img) => ({
      id: img.id,
      url: img.url,
    })),
  };
}