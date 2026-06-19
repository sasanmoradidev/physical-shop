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

    // فیلدهای اعشاری قیمت (تبدیل از Decimal به Number) [2]
    price: Number(product.price),
    offerPrice: product.offerPrice ? Number(product.offerPrice) : null,

    // فیلدهای تاریخ تخفیف
    offerStartsAt: product.offerStartsAt,
    offerEndsAt: product.offerEndsAt,

    // تصاویر محصول به همراه فیلد ترتیب (Order)
    images: product.images.map((img) => ({
      id: img.id,
      url: img.url,
      order: img.order,
    })),
  };
}