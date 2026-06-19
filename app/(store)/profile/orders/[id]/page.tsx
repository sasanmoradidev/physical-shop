"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

// ایمپورت کامپوننت‌های شکیل پروژه (Shadcn UI)
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderBadge } from "@/components/admin/order-badge"; // 👈 استفاده از کامپوننت وضعیت سفارشات

// ایمپورت آیکون‌های شکیل از خانواده Lucide
import {
  ArrowRight,
  ShoppingBag,
  MapPin,
  CreditCard,
  Calendar,
  User,
  Phone,
  Hash,
} from "lucide-react";

type Order = {
  id: string;
  status: string;
  totalPrice: number;
  createdAt?: string;
  address: {
    fullName?: string;
    phone?: string;
    city: string;
    province: string;
    addressLine: string;
    postalCode?: string;
  };
  items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      title: string;
    };
  }[];
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [repaying, setRepaying] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  // فرآیند پرداخت مجدد سفارش معلق
  async function handleRepay() {
    if (!order) return;
    setRepaying(true);
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order.id,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("خطا در ایجاد درگاه پرداخت");
      }
    } catch (error) {
      console.error(error);
      alert("خطایی رخ داده است.");
    } finally {
      setRepaying(false);
    }
  }

  // لودینگ اولیه صفحه جزئیات فاکتور
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-xs text-zinc-400 font-semibold">در حال دریافت و بارگذاری جزئیات فاکتور...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 text-xs text-zinc-400">
        سفارش مورد نظر در تاریخچه خریدهای شما یافت نشد.
      </div>
    );
  }

  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString("fa-IR") : "";

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* هدر بالای صفحه فاکتور خرید به همراه دکمه بازگشت */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-100">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">مشاهده جزئیات سفارش</h1>
          <p className="text-xs text-zinc-400">
            فاکتور نهایی و مشخصات ارسال مرسوله خود را پیگیری کنید.
          </p>
        </div>

        <Button variant="outline" size="sm" asChild className="w-fit rounded-xl border-zinc-200 text-zinc-700">
          <Link href="/profile/orders" className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4" />
            <span>بازگشت به سفارش‌ها</span>
          </Link>
        </Button>
      </div>

      {/* ساختار گرید دو ستونه فاکتور کاربری */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* ستون راست (عرض ۲ از ۳): اقلام خریداری‌شده و فاکتور مالی */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* کارت اقلام فاکتور */}
          <Card className="border-zinc-100 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardHeader className="border-b border-zinc-50 bg-zinc-50/20 pb-4">
              <div className="flex items-center gap-2 text-zinc-800">
                <ShoppingBag className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-sm font-bold">اقلام فاکتور</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-zinc-50">
              {order.items.map((item) => (
                <div key={item.id} className="p-5 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="font-bold text-sm text-zinc-800 block">
                      {item.product.title}
                    </span>
                    <span className="text-[10px] text-zinc-400 block">
                      قیمت واحد: {Number(item.price).toLocaleString("fa-IR")} تومان
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-6 flex-shrink-0 text-left">
                    <span className="text-[11px] text-zinc-500 font-semibold bg-zinc-50 border border-zinc-100 px-2.5 py-1 rounded-lg">
                      تعداد: {item.quantity.toLocaleString("fa-IR")}
                    </span>
                    <div className="flex flex-col text-left">
                      <span className="font-extrabold text-sm text-zinc-950">
                        {Number(Number(item.price) * item.quantity).toLocaleString("fa-IR")}
                      </span>
                      <span className="text-[9px] text-zinc-400">تومان</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* کارت جزئیات مالی سفارش */}
          <Card className="border-zinc-100 shadow-sm rounded-2xl p-6 bg-zinc-50/20 border">
            <div className="flex justify-between items-center text-zinc-600 text-sm">
              <span>جمع مبالغ اقلام سبد</span>
              <span className="font-semibold text-zinc-800">
                {Number(order.totalPrice).toLocaleString("fa-IR")} تومان
              </span>
            </div>
            <div className="flex justify-between items-center text-zinc-600 text-sm mt-3">
              <span>هزینه تحویل و ارسال</span>
              <span className="text-emerald-600 font-medium">رایگان</span>
            </div>
            <div className="border-t border-zinc-200/60 my-4" />
            <div className="flex justify-between items-center text-lg">
              <span className="font-extrabold text-zinc-800">قابل پرداخت:</span>
              <div className="flex flex-col text-left">
                <span className="font-black text-xl text-zinc-950">
                  {Number(order.totalPrice).toLocaleString("fa-IR")}
                </span>
                <span className="text-[10px] text-zinc-400">تومان</span>
              </div>
            </div>
          </Card>

        </div>

        {/* ستون چپ (عرض ۱ از ۳): اطلاعات ارسال، تاریخ و دکمه پرداخت */}
        <div className="space-y-6">
          
          {/* کارت وضعیت سفارش و درگاه پرداخت */}
          <Card className="border-zinc-100 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardHeader className="border-b border-zinc-50 bg-zinc-50/20 pb-4">
              <CardTitle className="text-sm font-bold text-zinc-800 flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-blue-600" />
                <span>وضعیت فاکتور</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>کد پیگیری سفارش:</span>
                <span className="font-mono text-zinc-800 font-bold uppercase">{order.id.slice(-8)}</span>
              </div>

              {orderDate && (
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>تاریخ ثبت سفارش:</span>
                  <span className="font-bold text-zinc-800">{orderDate}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>وضعیت تسویه فاکتور:</span>
                <OrderBadge status={order.status} />
              </div>

              {/* دکمه پرداخت مجدد اختصاصی (فقط برای وضعیت معلق PENDING) */}
              {order.status === "PENDING" && (
                <div className="pt-2 border-t border-zinc-100">
                  <Button
                    disabled={repaying}
                    onClick={handleRepay}
                    className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    {repaying ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>در حال انتقال...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" />
                        <span>پرداخت مجدد فاکتور</span>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* کارت مشخصات تحویل کالا */}
          <Card className="border-zinc-100 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardHeader className="border-b border-zinc-50 bg-zinc-50/20 pb-4">
              <div className="flex items-center gap-2 text-zinc-800">
                <MapPin className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-sm font-bold">آدرس تحویل سفارش</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs text-zinc-500">
              
              {/* اطلاعات تحویل‌گیرنده در صورت وجود */}
              {order.address.fullName && (
                <div className="flex items-start gap-2.5">
                  <User className="h-4 w-4 text-zinc-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-400 block">نام تحویل‌گیرنده</span>
                    <span className="font-bold text-zinc-800 block text-xs">{order.address.fullName}</span>
                  </div>
                </div>
              )}

              {/* شماره تماس گیرنده در صورت وجود */}
              {order.address.phone && (
                <div className="flex items-start gap-2.5">
                  <Phone className="h-4 w-4 text-zinc-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-400 block">شماره موبایل گیرنده</span>
                    <span className="font-semibold text-zinc-700 block" dir="ltr">{order.address.phone}</span>
                  </div>
                </div>
              )}

              {/* استان و شهر مقصد */}
              <div className="space-y-1 pt-2 border-t border-zinc-50">
                <span className="text-[9px] text-zinc-400 block">استان و شهر مقصد</span>
                <span className="font-bold text-zinc-800 block text-xs">
                  {order.address.province} - {order.address.city}
                </span>
              </div>

              {/* کد پستی در صورت وجود */}
              {order.address.postalCode && (
                <div className="flex items-start gap-2.5 pt-2">
                  <Hash className="h-4 w-4 text-zinc-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-400 block">کد پستی ده رقمی</span>
                    <span className="font-semibold text-zinc-700 block font-mono tracking-wider" dir="ltr">
                      {order.address.postalCode}
                    </span>
                  </div>
                </div>
              )}

              {/* نشانی دقیق پستی تحویل مرسوله */}
              <div className="pt-3 border-t border-zinc-50 text-zinc-600 font-medium leading-relaxed leading-5">
                {order.address.addressLine}
              </div>

            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  );
}