"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/stores/cart-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TomanIcon } from "@/components/ui/toman-icon";
import { Plus, Minus, Trash2, Truck, ArrowLeft, ShoppingBag, Package } from "lucide-react";

export default function CartPage() {
  const { items, increase, decrease, removeItem } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-xs text-zinc-400">
        در حال بارگذاری سبد خرید...
      </div>
    );
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const formatPrice = (price: number) => price.toLocaleString("fa-IR");

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center animate-fade-in max-w-md">
        <div className="bg-zinc-50 border border-zinc-100 p-6 rounded-full mb-6 text-zinc-400 shadow-inner">
          <ShoppingBag className="w-16 h-16" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-800 mb-2">سبد خرید شما خالی است!</h1>
        <p className="text-xs text-zinc-400 mb-8 leading-relaxed">
          در حال حاضر هیچ محصولی در سبد خرید شما وجود ندارد. می‌توانید برای مشاهده کالاها به فروشگاه بازگردید.
        </p>
        <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-8 py-3 rounded-xl shadow-sm">
          <Link href="/">بازگشت به فروشگاه</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl animate-fade-in">
      <h1 className="text-3xl font-extrabold text-zinc-900 mb-8 pb-4 border-b border-zinc-100 flex items-center gap-2">
        <span>سبد خرید</span>
        <span className="text-xs font-normal text-zinc-400 bg-zinc-100 px-2.5 py-1 rounded-lg">
          {items.reduce((acc, item) => acc + item.quantity, 0).toLocaleString("fa-IR")} کالا
        </span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card
              key={`${item.id}-${item.variantId || "base"}`}
              className="border-zinc-100 shadow-sm rounded-2xl overflow-hidden bg-white hover:shadow-md transition duration-200"
            >
              <CardContent className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="relative w-16 h-16 bg-zinc-50 border border-zinc-100 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 shadow-inner text-zinc-400">
                    {item.image ? (
                      <Image src={item.image} alt={item.title} fill sizes="64px" className="object-contain p-1.5" />
                    ) : (
                      <Package className="w-8 h-8 text-zinc-300" />
                    )}
                  </div>

                  <div className="space-y-1">
                    {item.slug ? (
                      <Link href={`/products/${item.slug}`} className="font-bold text-zinc-800 hover:text-blue-600 text-sm line-clamp-1 transition">
                        {item.title}
                      </Link>
                    ) : (
                      <h3 className="font-bold text-zinc-800 text-sm line-clamp-1">{item.title}</h3>
                    )}
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-zinc-500 font-bold">{formatPrice(item.price)}</span>
                      <TomanIcon className="h-3.5 w-3.5 text-zinc-400" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-zinc-50">
                  <div className="flex items-center border border-zinc-200 rounded-xl bg-zinc-50/50 p-1">
                    <Button variant="ghost" onClick={() => increase(item.id, item.variantId)} className="w-8 h-8 p-0 rounded-lg hover:bg-white text-zinc-500 hover:text-blue-600">
                      <Plus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center font-extrabold text-zinc-800 select-none text-xs">
                      {item.quantity.toLocaleString("fa-IR")}
                    </span>
                    <Button variant="ghost" onClick={() => decrease(item.id, item.variantId)} className="w-8 h-8 p-0 rounded-lg hover:bg-white text-zinc-500 hover:text-blue-600">
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    onClick={() => removeItem(item.id, item.variantId)}
                    className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl h-9 w-9"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-zinc-50 border border-zinc-100/80 p-6 rounded-2xl lg:sticky lg:top-24 space-y-6">
          <h2 className="text-lg font-bold text-zinc-800 border-b border-zinc-200/60 pb-4">خلاصه سبد خرید</h2>
          <div className="space-y-4 text-xs text-zinc-600">
            <div className="flex justify-between items-center">
              <span>مجموع قیمت کالاها</span>
              <div className="flex items-center gap-1 font-bold text-zinc-800">
                <span>{formatPrice(subtotal)}</span>
                <TomanIcon className="h-3.5 w-3.5 text-zinc-400" />
              </div>
            </div>
            <div className="bg-blue-50/40 border border-blue-100 p-4 rounded-xl flex gap-3 text-blue-800 leading-relaxed text-[11px] font-medium">
              <Truck className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p>هزینه ارسال سفارش در مرحله بعد (تسویه حساب) بر اساس آدرس و شیوه ارسال انتخابی محاسبه خواهد شد.</p>
            </div>
          </div>

          <div className="border-t border-zinc-200/60 pt-4 flex justify-between items-center text-sm">
            <span className="font-extrabold text-zinc-800">جمع فاکتور سبد:</span>
            <div className="flex items-baseline gap-1 text-left">
              <span className="font-black text-lg text-zinc-950">{formatPrice(subtotal)}</span>
              <TomanIcon className="h-3.5 w-3.5 text-zinc-400" />
            </div>
          </div>

          <Button asChild className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-11 rounded-xl shadow-sm gap-1.5">
            <Link href="/checkout">
              <span>ادامه خرید و ثبت سفارش</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}