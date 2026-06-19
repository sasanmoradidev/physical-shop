"use client";

import { useCartStore } from "@/stores/cart-store";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Truck, ShieldCheck, ArrowRight, CreditCard, Plus } from "lucide-react";

type Address = {
  id: string;
  title: string;
  city: string;
};

type ShippingMethod = {
  id: string;
  name: string;
  price: number;
  estimatedTime: string;
};

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState("");

  // فیلدهای داینامیک روش ارسال
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [shippingMethodId, setShippingMethodId] = useState("");
  const [shippingCost, setShippingCost] = useState(0);

  const items = useCartStore((state) => state.items);
 
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const total = subtotal + shippingCost;

  const formatPrice = (price: number) => {
    return price.toLocaleString("fa-IR") + " تومان";
  };

  // واکشی هم‌زمان آدرس‌ها و روش‌های ارسال فعال
  useEffect(() => {
    // ۱. دریافت آدرس‌ها
    fetch("/api/addresses")
      .then((r) => r.json())
      .then((data) => {
        setAddresses(data);
        if (data.length > 0) {
          setAddressId(data[0].id);
        }
      });

    // ۲. دریافت روش‌های ارسال فعال ثبت شده ادمین
    fetch("/api/shipping-methods")
      .then((r) => r.json())
      .then((data) => {
        setShippingMethods(data);
        if (data.length > 0) {
          setShippingMethodId(data[0].id);
          setShippingCost(Number(data[0].price));
        }
      });
  }, []);

  // هندلر تغییر روش ارسال و آپدیت خودکار فاکتور مالی
  function handleShippingChange(methodId: string, price: number) {
    setShippingMethodId(methodId);
    setShippingCost(price);
  }

  async function submitOrder() {
    if (!addressId) {
      alert("لطفاً آدرس ارسال را انتخاب کنید.");
      return;
    }
    if (!shippingMethodId) {
      alert("لطفاً یک روش ارسال انتخاب کنید.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items,
          addressId,
          shippingMethodId, // 👈 ارسال شناسه ارسال به بک‌اند
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "خطا در ثبت سفارش");
        setLoading(false);
        return;
      }

      // ایجاد درگاه پرداخت
      const paymentRes = await fetch("/api/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: data.id,
        }),
      });

      const payment = await paymentRes.json();

      if (payment.url) {
        window.location.href = payment.url;
      } else {
        alert("خطا در ایجاد درگاه پرداخت");
      }
    } catch (error) {
      console.error(error);
      alert("خطایی رخ داده است.");
    } finally {
      setLoading(false);
    }
  }

  if (addresses.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <div className="bg-amber-50 p-6 rounded-full mb-6">
          <MapPin className="w-16 h-16 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-800 mb-2">آدرسی ثبت نشده است!</h1>
        <p className="text-zinc-500 mb-8 max-w-sm">
          برای نهایی کردن سفارش و محاسبه دقیق تحویل کالا، ابتدا نیاز است آدرس خود را ثبت کنید.
        </p>
        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-xl shadow-sm flex items-center gap-2 w-fit">
          <Link href="/profile/addresses/new?back=checkout">
            <Plus className="h-5 w-5" />
            <span>افزودن آدرس جدید</span>
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <h1 className="text-3xl font-extrabold text-zinc-900 mb-8 pb-4 border-b border-zinc-100">
        تسویه حساب
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* ستون راست: آدرس‌ها و شیوه‌های ارسال */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* بخش ۱: انتخاب آدرس */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-zinc-800 flex items-center gap-2 mr-1">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span>۱. انتخاب آدرس تحویل کالا</span>
            </h2>

            <div className="space-y-3">
              {addresses.map((address) => {
                const isSelected = addressId === address.id;
                return (
                  <label
                    key={address.id}
                    className={`flex items-start gap-4 p-5 border rounded-2xl cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/20 ring-1 ring-blue-600"
                        : "border-zinc-200 hover:border-zinc-300 bg-white"
                    }`}
                  >
                    <div className="pt-1">
                      <input
                        type="radio"
                        name="checkout-address"
                        checked={isSelected}
                        onChange={() => setAddressId(address.id)}
                        className="w-4 h-4 text-blue-600 border-zinc-300 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex-1">
                      <span className="block font-bold text-zinc-800 text-sm">
                        {address.title}
                      </span>
                      <span className="block text-xs text-zinc-400 mt-1.5 leading-relaxed">
                        شهر: {address.city}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
            
            <div className="text-left pt-1">
              <Link 
                href="/profile/addresses/new?back=checkout" 
                className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1.5 mr-1"
              >
                <span>+ افزودن آدرس جدید</span>
              </Link>
            </div>
          </div>

          {/* بخش ۲: انتخاب شیوه ارسال داینامیک */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-zinc-800 flex items-center gap-2 mr-1">
              <Truck className="w-5 h-5 text-blue-600" />
              <span>۲. انتخاب شیوه ارسال مرسوله</span>
            </h2>

            {shippingMethods.length === 0 ? (
              <div className="p-5 border border-dashed rounded-2xl text-xs text-zinc-400 text-center">
                در حال حاضر هیچ شیوه ارسالی تعریف نشده است.
              </div>
            ) : (
              <div className="space-y-3">
                {shippingMethods.map((method) => {
                  const isSelected = shippingMethodId === method.id;
                  const methodPrice = Number(method.price);
                  return (
                    <label
                      key={method.id}
                      className={`flex items-start gap-4 p-5 border rounded-2xl cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/20 ring-1 ring-blue-600"
                          : "border-zinc-200 hover:border-zinc-300 bg-white"
                      }`}
                    >
                      <div className="pt-1">
                        <input
                          type="radio"
                          name="checkout-shipping"
                          checked={isSelected}
                          onChange={() => handleShippingChange(method.id, methodPrice)}
                          className="w-4 h-4 text-blue-600 border-zinc-300 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex-1 flex justify-between items-center gap-4">
                        <div className="space-y-1">
                          <span className="block font-bold text-zinc-800 text-sm">
                            {method.name}
                          </span>
                          <span className="block text-[10px] text-zinc-400">
                            زمان تحویل تقریبی: {method.estimatedTime}
                          </span>
                        </div>
                        <span className="text-xs font-extrabold text-zinc-800">
                          {methodPrice === 0 ? "رایگان" : formatPrice(methodPrice)}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* ستون چپ: خلاصه فاکتور و پرداخت (Sticky) */}
        <div className="bg-zinc-50 border border-zinc-100 p-6 rounded-2xl lg:sticky lg:top-6 space-y-6">
          <h2 className="text-xl font-bold text-zinc-800 border-b border-zinc-200/60 pb-4">
            فاکتور نهایی
          </h2>

          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-xs text-zinc-600">
                <span className="line-clamp-1 flex-1 pl-4">
                  {item.title} <span className="text-[10px] text-zinc-400">({item.quantity} عدد)</span>
                </span>
                <span className="font-semibold text-zinc-800">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-zinc-200/60 pt-4 space-y-4 text-xs text-zinc-600">
            <div className="flex justify-between">
              <span>جمع اقلام سبد</span>
              <span className="font-semibold text-zinc-800">{formatPrice(subtotal)}</span>
            </div>

            <div className="flex justify-between">
              <span>هزینه ارسال</span>
              {shippingCost === 0 ? (
                <span className="text-emerald-600 font-bold">رایگان</span>
              ) : (
                <span className="font-semibold text-zinc-800">{formatPrice(shippingCost)}</span>
              )}
            </div>
          </div>

          <div className="border-t border-zinc-200/60 pt-4 flex justify-between items-center text-lg">
            <span className="font-bold text-zinc-800">قابل پرداخت:</span>
            <span className="font-extrabold text-zinc-950">{formatPrice(total)}</span>
          </div>

          <button
            disabled={loading || shippingMethods.length === 0}
            onClick={submitOrder}
            className={`w-full flex items-center justify-center text-white font-medium py-3.5 px-4 rounded-xl shadow-sm transition-all duration-200 ${
              loading || shippingMethods.length === 0
                ? "bg-zinc-400 cursor-not-allowed" 
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                در حال انتقال به درگاه...
              </span>
            ) : (
              <span className="flex items-center gap-2 text-xs font-bold">
                <span>پرداخت و ثبت نهایی سفارش</span>
                <CreditCard className="w-4 h-4" />
              </span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}