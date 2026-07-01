import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

import { TomanIcon } from "@/components/ui/toman-icon";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { RelatedProductsSlider } from "@/components/product/related-products-slider";
import { serializeProduct } from "@/lib/mappers/product.mapper";
import { ProductGallery } from "@/components/product/product-gallery";

// ایمپورت توابع کمکی محاسبه قیمت و تخفیف‌ها
import {
  hasActiveOffer,
  getFinalPrice,
  getDiscountPercent,
} from "@/lib/product-price";

// ایمپورت آیکون‌های استاندارد Lucide
import { Tag, CheckCircle2, AlertTriangle, FileText } from "lucide-react";

type Props = {
    params: Promise<{
        slug: string;
    }>;
};

export default async function ProductPage({ params }: Props) {
    // ۱. رفع باگ ناهمگام بودن پارامترها در Next.js جدید
    const { slug } = await params;

    const product = await prisma.product.findUnique({
        where: { slug },
        include: {
            category: true,
            images: {
                orderBy: { order: "asc" }, // لود با چیدمان درگ اند دراپ
            },
        },
    });

    if (!product) {
        notFound();
    }

    const safeProduct = serializeProduct(product);

    // ۲. قالب‌بندی اطلاعات مالی برای پاس دادن به توابع کمکی
    const priceProps = {
      price: Number(product.price),
      offerPrice: product.offerPrice ? Number(product.offerPrice) : null,
      offerStartsAt: product.offerStartsAt,
      offerEndsAt: product.offerEndsAt,
    };

    const hasDiscount = hasActiveOffer(priceProps);
    const finalPrice = getFinalPrice(priceProps);
    const discountPercent = getDiscountPercent(priceProps);

    const relatedProducts = await prisma.product.findMany({
        where: {
            categoryId: product.categoryId,
            NOT: { id: product.id },
        },
        include: {
            images: {
                orderBy: { order: "asc" },
            },
        },
        take: 8,
    });

    const safeRelated = relatedProducts.map(serializeProduct);

    return (
        <>
            <div className="container mx-auto py-8 px-4 max-w-5xl animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
                    
                    {/* ستون راست (گالری تصاویر اسلایدر + زوم لمسی) */}
                    <ProductGallery images={product.images} productTitle={product.title} />

                    {/* ستون چپ (مشخصات، قیمت داینامیک و دکمه خرید) */}
                    <div className="space-y-6">
                        
                        {/* دسته‌بندی کالا */}
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold border border-blue-100/50">
                            <Tag className="h-3 w-3" />
                            <span>{product.category.name}</span>
                        </span>

                        <h1 className="text-xl md:text-2xl font-bold text-zinc-900 tracking-tight leading-8">
                            {product.title}
                        </h1>

                        {/* برچسب موجودی انبار */}
                        <div className="pt-1">
                            {product.stock > 0 ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 border border-green-100 rounded-lg text-[10px] font-bold">
                                    <CheckCircle2 className="h-3 w-3" />
                                    <span>موجود در انبار ({product.stock} عدد)</span>
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 border border-red-100 rounded-lg text-[10px] font-bold animate-pulse">
                                    <AlertTriangle className="h-3 w-3" />
                                    <span>ناموجود</span>
                                </span>
                            )}
                        </div>

                        {/* ۳. کادر فاکتور داینامیک قیمت با محاسبات تخفیف */}
                        <div className="bg-zinc-50 border border-zinc-100/60 p-4 rounded-2xl flex flex-col space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-zinc-400 font-semibold">قیمت کالا:</span>
                            
                            {/* نمایش برچسب تخفیف فقط در صورت وجود تخفیف فعال */}
                            {hasDiscount && (
                              <span className="bg-red-50 text-red-600 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold border border-red-100 animate-pulse">
                                %{discountPercent} تخفیف ویژه
                              </span>
                            )}
                          </div>

                          <div className="flex items-baseline justify-end gap-1.5 text-left items-center">
                            {/* نمایش قیمت خط خورده قدیمی فقط در صورت وجود تخفیف فعال */}
                            {hasDiscount && (
                              <span className="text-xs text-zinc-400 line-through pl-2">
                                {Number(product.price).toLocaleString("fa-IR")}
                              </span>
                            )}

                            <span className={`text-xl font-black tracking-tight ${hasDiscount ? 'text-red-600' : 'text-zinc-950'}`}>
                              {finalPrice.toLocaleString("fa-IR")}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-bold">
                                <TomanIcon className="h-4.5 w-4.5 text-zinc-400" />
                            </span>
                          </div>
                        </div>

                        {/* دکمه خرید */}
                        <div className="pt-2">
                            <AddToCartButton
                                id={safeProduct.id}
                                title={safeProduct.title}
                                price={finalPrice} // پاس دادن قیمت نهایی محاسبه‌شده به سبد خرید
                                stock={safeProduct.stock}
                            />
                        </div>

                        {/* بخش توضیحات محصول */}
                        <div className="border-t border-zinc-100 pt-5 space-y-2">
                            <h2 className="text-xs font-bold text-zinc-800 flex items-center gap-1.5 mr-0.5">
                                <FileText className="h-4 w-4 text-zinc-400" />
                                <span>توضیحات محصول</span>
                            </h2>
                            <p className="leading-6 text-xs text-zinc-500 font-medium leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                    </div>

                </div>
            </div>

            {/* اسلایدر محصولات مرتبط با همان مپر و چیدمان */}
            {relatedProducts.length > 0 && (
                <RelatedProductsSlider relatedProducts={safeRelated} />
            )}
        </>
    );
}