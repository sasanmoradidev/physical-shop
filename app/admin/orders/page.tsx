import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { OrderBadge } from "@/components/admin/order-badge";

// ایمپورت کامپوننت‌های شکیل پروژه (Shadcn UI)
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// ایمپورت آیکون‌های مورد نظر از خانواده Lucide
import {
  ClipboardList,
  User,
  Mail,
  MapPin,
  Calendar,
  ArrowUpRight,
  Inbox,
} from "lucide-react";

type Props = {
  searchParams: Promise<{
    status?: string;
  }>;
};

export default async function AdminOrdersPage({
  searchParams,
}: Props) {
  // ۱. رفع باگ ناهمگام بودن پارامترها در Next.js جدید
  const { status } = await searchParams;

  const where = {
    ...(status
      ? { status: status as any }
      : {}),
  };

  const orders = await prisma.order.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
      address: true,
    },
  });

  // تعریف ساختار دکمه‌های فیلتر با وضعیت‌های فعال
  const filterButtons = [
    { label: "همه سفارش‌ها", status: undefined, href: "/admin/orders" },
    { label: "در انتظار پرداخت", status: "PENDING", href: "/admin/orders?status=PENDING" },
    { label: "پرداخت شده", status: "PAID", href: "/admin/orders?status=PAID" },
    { label: "ارسال شده", status: "SHIPPED", href: "/admin/orders?status=SHIPPED" },
  ];

  return (
    <div className="container mx-auto py-8 px-4 space-y-8 animate-fade-in">
      
      {/* هدر صفحه */}
      <div className="flex items-center gap-3.5 pb-6 border-b border-zinc-100">
        <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-700 shadow-sm">
          <ClipboardList className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">سفارشات</h1>
          <p className="text-xs text-zinc-400 mt-1">
            مدیریت تراکنش‌ها، پیگیری فاکتورها و وضعیت ارسال مرسولات مشتریان ({orders.length} سفارش)
          </p>
        </div>
      </div>

      {/* ۲. فیلترهای وضعیت به صورت دکمه‌های شکیل Shadcn */}
      <div className="flex flex-wrap gap-2 pb-2">
        {filterButtons.map((btn, i) => {
          const isActive = status === btn.status;
          return (
            <Button
              key={i}
              variant={isActive ? "default" : "outline"}
              size="sm"
              asChild
              className={`rounded-xl h-9 text-xs font-semibold transition ${
                isActive
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                  : "border-zinc-200 text-zinc-500 hover:bg-zinc-50"
              }`}
            >
              <Link href={btn.href}>{btn.label}</Link>
            </Button>
          );
        })}
      </div>

      {/* ۳. مدیریت نمایش سفارش‌ها یا حالت خالی */}
      {orders.length === 0 ? (
        <Card className="border-dashed border-zinc-200 p-12 text-center bg-zinc-50/20">
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-zinc-50 rounded-full text-zinc-400 border border-zinc-100">
              <Inbox className="h-10 w-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-zinc-800">هیچ سفارشی یافت نشد</h3>
              <p className="text-xs text-zinc-400">در حال حاضر سفارشی با وضعیت انتخاب‌شده در سیستم ثبت نشده است.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const orderDate = new Date(order.createdAt).toLocaleDateString("fa-IR");

            return (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="block group"
              >
                <Card className="border-zinc-100 shadow-sm rounded-2xl p-5 hover:shadow-md transition duration-200 bg-white">
                  <CardContent className="p-0 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                    
                    {/* جزئیات اصلی و مشخصات مشتری */}
                    <div className="space-y-3.5 flex-1">
                      
                      {/* سطر بالا: کد سفارش و تاریخ ثبت */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200/80 tracking-tight">
                          شناسه: {order.id.slice(-8).toUpperCase()}
                        </span>
                        
                        <span className="inline-flex items-center gap-1.5 text-[10px] text-zinc-400 font-semibold">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{orderDate}</span>
                        </span>
                      </div>

                      {/* سطر وسط: مشخصات هویتی و آدرس کاربر */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-zinc-500">
                        <div className="flex items-center gap-1.5">
                          <User className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                          <span className="font-semibold text-zinc-800">{order.user.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                          <span className="truncate">{order.user.email}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                          <span>شهر مقصد: {order.address.city}</span>
                        </div>
                      </div>

                    </div>

                    {/* بخش مبلغ سفارش، وضعیت و دکمه انتقال */}
                    <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 pt-4 lg:pt-0 border-zinc-50/60 flex-shrink-0">
                      
                      {/* مبلغ کل سفارش */}
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] text-zinc-400">مجموع دریافتی</span>
                        <span className="font-extrabold text-base text-zinc-950 tracking-tight">
                          {Number(order.totalPrice).toLocaleString("fa-IR")}
                        </span>
                        <span className="text-[9px] text-zinc-400">تومان</span>
                      </div>

                      {/* برچسب رنگی وضعیت پرداخت سفارش */}
                      <div className="flex flex-col gap-1 items-end">
                        <span className="text-[10px] text-zinc-400 hidden lg:inline">وضعیت پرداخت</span>
                        <OrderBadge status={order.status} />
                      </div>

                      {/* نشان‌گر انتقال (hover effect) */}
                      <div className="hidden sm:flex p-2 bg-zinc-50 rounded-xl border border-zinc-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition duration-200">
                        <ArrowUpRight className="h-4 w-4 text-zinc-400 group-hover:text-blue-600 transition" />
                      </div>

                    </div>

                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}