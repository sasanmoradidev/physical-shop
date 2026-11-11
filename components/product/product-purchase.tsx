"use client";

import { useState } from "react";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { TomanIcon } from "@/components/ui/toman-icon";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { hasActiveOffer, getFinalPrice, getDiscountPercent } from "@/lib/product-price";

export function ProductPurchase({ product }: { product: any }) {
  // اگر محصول تنوع دارد، اولین تنوع را به صورت پیش‌فرض انتخاب می‌کنیم
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants?.length > 0 ? product.variants[0] : null
  );

  // محاسبه قیمت پایه (اگر تنوع انتخاب شده قیمت اختصاصی دارد آن را می‌گیریم، وگرنه قیمت اصلی محصول)
  const basePrice = selectedVariant?.price ? Number(selectedVariant.price) : Number(product.price);
  
  // محاسبه موجودی فعال
  const activeStock = selectedVariant ? selectedVariant.stock : product.stock;

  // قالب‌بندی برای توابع تخفیف
  const priceProps = {
    price: basePrice,
    offerPrice: product.offerPrice ? Number(product.offerPrice) : null,
    offerStartsAt: product.offerStartsAt,
    offerEndsAt: product.offerEndsAt,
  };

  const hasDiscount = hasActiveOffer(priceProps);
  const finalPrice = getFinalPrice(priceProps);
  const discountPercent = getDiscountPercent(priceProps);

  return (
    <div className="space-y-6">
      
      {/* 🌟 بخش انتخاب تنوع‌ها */}
      {product.variants?.length > 0 && (
        <div className="space-y-3 pt-2">
          <span className="text-xs font-bold text-zinc-700">انتخاب تنوع:</span>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant: any) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  selectedVariant?.id === variant.id
                    ? "border-blue-500 bg-blue-50/50 text-blue-700 ring-1 ring-blue-500 shadow-sm"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                }`}
              >
                {variant.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* برچسب موجودی انبار */}
      <div className="pt-1">
        {activeStock > 0 ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 border border-green-100 rounded-lg text-[10px] font-bold">
            <CheckCircle2 className="h-3 w-3" />
            <span>موجود در انبار ({activeStock} عدد)</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 border border-red-100 rounded-lg text-[10px] font-bold animate-pulse">
            <AlertTriangle className="h-3 w-3" />
            <span>ناموجود</span>
          </span>
        )}
      </div>

      {/* کادر فاکتور داینامیک قیمت با محاسبات تخفیف */}
      <div className="bg-zinc-50 border border-zinc-100/60 p-4 rounded-2xl flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-400 font-semibold">قیمت کالا:</span>
          {hasDiscount && (
            <span className="bg-red-50 text-red-600 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold border border-red-100 animate-pulse">
              %{discountPercent} تخفیف ویژه
            </span>
          )}
        </div>

        <div className="flex flex-col items-end justify-end select-none pt-1">
          {hasDiscount && (
            <span className="text-xs text-zinc-400 line-through pl-1.5 h-4 block font-medium">
              {basePrice.toLocaleString("fa-IR")}
            </span>
          )}
          <div className="flex items-center gap-1 mt-1">
            <span className={`text-xl font-black tracking-tight ${hasDiscount ? 'text-red-600' : 'text-zinc-950'}`}>
              {finalPrice.toLocaleString("fa-IR")}
            </span>
            <TomanIcon className={`h-4.5 w-4.5 ${hasDiscount ? 'text-red-500' : 'text-zinc-400'}`} />
          </div>
        </div>
      </div>

      {/* دکمه خرید */}
      <div className="pt-2">
        <AddToCartButton
          id={product.id}
          title={selectedVariant ? `${product.title} (${selectedVariant.name})` : product.title}
          price={finalPrice}
          stock={activeStock}
          variantId={selectedVariant?.id} // 👈 پاس دادن ID تنوع به سبد خرید
        />
      </div>
    </div>
  );
}