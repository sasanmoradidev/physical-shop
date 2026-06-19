"use client";

import { useCartStore } from "@/stores/cart-store";
import Link from "next/link";
import { useState, useEffect } from "react";

type Address = {
  id: string;
  title: string;
  city: string;
};

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState("");

  const items = useCartStore((state) => state.items);
 
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // هماهنگ با منطق ارسال در سبد خرید
  const shippingCost = subtotal > 500000 || subtotal === 0 ? 0 : 25000;
  const total = subtotal + shippingCost;

  const formatPrice = (price: number) => {
    return price.toLocaleString("fa-IR") + " تومان";
  };

  useEffect(() => {
    fetch("/api/addresses")
      .then((r) => r.json())
      .then((data) => {
        setAddresses(data);
        if (data.length > 0) {
          setAddressId(data[0].id);
        }
      });
  }, []);

  async function submitOrder() {
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
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert("خطا در ثبت سفارش");
        setLoading(false);
        return;
      }

      // بعد از ساخت order، برو پرداخت
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

  // وضعیت عدم وجود آدرس ثبت شده
  if (addresses.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <div className="bg-amber-50 p-6 rounded-full mb-6">
          <svg className="w-16 h-16 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-zinc-800 mb-2">آدرسی ثبت نشده است!</h1>
        <p className="text-zinc-500 mb-8 max-w-sm">
          برای نهایی کردن سفارش و محاسبه دقیق تحویل کالا، ابتدا نیاز است آدرس خود را ثبت کنید.
        </p>
        <Link
          href="/profile/addresses/new"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-xl transition-all duration-200 shadow-sm flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          افزودن آدرس جدید
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <h1 className="text-3xl font-extrabold text-zinc-900 mb-8 pb-4 border-b border-zinc-100">
        تسویه حساب
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* ستون راست: انتخاب آدرس */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-zinc-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              انتخاب آدرس ارسال
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
                      <span className="block font-semibold text-zinc-800 text-base">
                        {address.title}
                      </span>
                      <span className="block text-sm text-zinc-500 mt-1">
                        شهر: {address.city}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
            
            <div className="mt-4 text-left">
              <Link 
                href="/profile/addresses/new" 
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                <span>+ افزودن آدرس جدید</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ستون چپ: خلاصه فاکتور و پرداخت (Sticky) */}
        <div className="bg-zinc-50 border border-zinc-100 p-6 rounded-2xl lg:sticky lg:top-6 space-y-6">
          <h2 className="text-xl font-bold text-zinc-800 border-b border-zinc-200/60 pb-4">
            فاکتور نهایی
          </h2>

          {/* لیست آیتم‌های سبد به صورت خلاصه */}
          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm text-zinc-600">
                <span className="line-clamp-1 flex-1 pl-4">
                  {item.title} <span className="text-xs text-zinc-400">({item.quantity} عدد)</span>
                </span>
                <span className="font-medium text-zinc-800">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-zinc-200/60 pt-4 space-y-4 text-sm text-zinc-600">
            <div className="flex justify-between">
              <span>جمع اقلام سبد</span>
              <span className="font-semibold text-zinc-800">{formatPrice(subtotal)}</span>
            </div>

            <div className="flex justify-between">
              <span>هزینه ارسال</span>
              {shippingCost === 0 ? (
                <span className="text-emerald-600 font-medium">رایگان</span>
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
            disabled={loading}
            onClick={submitOrder}
            className={`w-full flex items-center justify-center text-white font-medium py-3.5 px-4 rounded-xl shadow-sm transition-all duration-200 ${
              loading 
                ? "bg-zinc-400 cursor-not-allowed" 
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                {/* اسپینر لودینگ */}
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                در حال انتقال به درگاه...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>پرداخت و ثبت نهایی سفارش</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}