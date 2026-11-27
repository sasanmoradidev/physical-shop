"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OrderBadge } from "@/components/admin/order-badge";
import { Calendar, CreditCard, ArrowUpRight, Inbox, Upload } from "lucide-react";

type Order = {
  id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  paymentMethod?: {
    code: string;
    name: string;
  } | null;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [repayingId, setRepayingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/orders/my")
      .then(async (res) => {
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      })
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  async function handleRepay(orderId: string) {
    setRepayingId(orderId);
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();

      if (res.ok && data.url) {
        window.location.assign(data.url);
      } else {
        toast.error(data.error || "خطا در ایجاد درگاه پرداخت");
      }
    } catch (error) {
      console.error(error);
      toast.error("خطایی در ارتباط با سرور رخ داده است.");
    } finally {
      setRepayingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-xs text-zinc-400 font-semibold">در حال دریافت تاریخچه سفارش‌ها...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-1 pb-4 border-b border-zinc-100">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">سفارش‌های من</h1>
        <p className="text-xs text-zinc-400">تاریخچه خریدها و پیگیری وضعیت ارسال مرسولات خود را در زیر مشاهده کنید.</p>
      </div>

      {orders.length === 0 ? (
        <Card className="border-dashed border-zinc-200 p-12 text-center bg-zinc-50/20">
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-zinc-50 rounded-full text-zinc-400 border border-zinc-100">
              <Inbox className="h-10 w-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-zinc-800">هیچ سفارشی ثبت نشده است</h3>
              <p className="text-xs text-zinc-400">شما هنوز هیچ خریدی در فروشگاه ثبت نکرده‌اید.</p>
            </div>
            <Button asChild size="sm" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
              <Link href="/products">
                <span>مشاهده محصولات</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const orderDate = new Date(order.createdAt).toLocaleDateString("fa-IR");
            const isPending = order.status === "PENDING";
            const isCardPayment = order.paymentMethod?.code === "CARD";
            const isRepaying = repayingId === order.id;

            return (
              <Card
                key={order.id}
                className="border-zinc-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition duration-200 bg-white"
              >
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200/80 tracking-tight">
                        شناسه: {order.id.slice(-8).toUpperCase()}
                      </span>

                      <span className="inline-flex items-center gap-1.5 text-[10px] text-zinc-400 font-semibold">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{orderDate}</span>
                      </span>
                    </div>

                    <div className="pt-0.5">
                      <OrderBadge status={order.status} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 pt-4 sm:pt-0 border-zinc-50">
                    <div className="flex flex-col text-right">
                      <span className="text-[9px] text-zinc-400">جمع مبالغ فاکتور</span>
                      <span className="font-extrabold text-base text-zinc-950 tracking-tight">
                        {Number(order.totalPrice).toLocaleString("fa-IR")}
                      </span>
                      <span className="text-[9px] text-zinc-400">تومان</span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isPending && isCardPayment && (
                        <Button
                          asChild
                          className="rounded-xl h-9 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-sm"
                        >
                          <Link href={`/payment/card/${order.id}`}>
                            <Upload className="h-3.5 w-3.5" />
                            <span>ثبت رسید پرداخت</span>
                          </Link>
                        </Button>
                      )}

                      {isPending && !isCardPayment && (
                        <Button
                          disabled={isRepaying}
                          onClick={() => handleRepay(order.id)}
                          className="rounded-xl h-9 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm"
                        >
                          <CreditCard className="h-4 w-4" />
                          <span>{isRepaying ? "اتصال..." : "پرداخت مجدد"}</span>
                        </Button>
                      )}

                      <Button variant="outline" size="sm" asChild className="rounded-xl border-zinc-200 h-9 px-4">
                        <Link href={`/profile/orders/${order.id}`} className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700">
                          <span>جزئیات</span>
                          <ArrowUpRight className="h-3.5 w-3.5 text-zinc-400" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}