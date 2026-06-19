import { prisma } from "@/lib/prisma";
import Link from "next/link";

// ایمپورت کامپوننت‌های شکیل پروژه (Shadcn UI)
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { OrderBadge } from "@/components/admin/order-badge"; // 👈 ایمپورت کامپوننت رنگی وضعیت سفارشات

// ایمپورت آیکون‌های استاندارد Lucide
import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  Clock,
  ArrowUpRight,
  LayoutDashboard,
} from "lucide-react";

export default async function AdminPage() {
  const usersCount = await prisma.user.count();
  const productsCount = await prisma.product.count();
  const ordersCount = await prisma.order.count();

  const orders = await prisma.order.findMany({
    select: {
      totalPrice: true,
    },
  });

  const totalSales = orders.reduce(
    (sum, order) => sum + Number(order.totalPrice),
    0
  );

  const latestOrders = await prisma.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
    include: {
      user: true,
    },
  });

  // مدل آماری کارت‌ها
  const stats = [
    {
      title: "کل فروش",
      value: totalSales.toLocaleString("fa-IR") + " تومان",
      icon: TrendingUp,
      description: "مجموع درآمدهای درگاه بانکی",
      colorClass: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    {
      title: "سفارشات",
      value: ordersCount.toLocaleString("fa-IR") + " سفارش",
      icon: ShoppingCart,
      description: "کل تراکنش‌های ثبت‌شده",
      colorClass: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      title: "محصولات",
      value: productsCount.toLocaleString("fa-IR") + " کالا",
      icon: Package,
      description: "کالاهای موجود در انبار",
      colorClass: "bg-amber-50 text-amber-600 border-amber-100",
    },
    {
      title: "کاربران",
      value: usersCount.toLocaleString("fa-IR") + " کاربر",
      icon: Users,
      description: "مشتریان ثبت‌نام کرده در سایت",
      colorClass: "bg-indigo-50 text-indigo-600 border-indigo-100",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* هدر بالایی داشبورد */}
      <div className="flex items-center gap-3.5 pb-6 border-b border-zinc-100">
        <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-700 shadow-sm">
          <LayoutDashboard className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">داشبورد مدیریت</h1>
          <p className="text-xs text-zinc-400 mt-1">خلاصه‌ای از آخرین آمار و فعالیت‌های فروشگاه شما</p>
        </div>
      </div>

      {/* ۱. گرید شکیل کارت‌های آمار کلان فروشگاه */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="border-zinc-100 shadow-sm rounded-2xl hover:shadow-md transition duration-200">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-zinc-400 block">{stat.title}</span>
                  <span className="text-xl font-extrabold text-zinc-900 block tracking-tight">
                    {stat.value}
                  </span>
                  <span className="text-[10px] text-zinc-400 block">{stat.description}</span>
                </div>
                <div className={`p-3 rounded-2xl border shadow-sm ${stat.colorClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ۲. بخش آخرین سفارش‌ها */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-zinc-800">
          <Clock className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-bold">آخرین سفارش‌ها</h2>
        </div>

        {latestOrders.length === 0 ? (
          <Card className="border-dashed border-zinc-200 p-8 text-center bg-zinc-50/20">
            <CardContent className="py-4 text-xs text-zinc-400">
              هنوز هیچ سفارشی ثبت نشده است.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {latestOrders.map((order) => {
              // تاریخ شمسی سفارش (در صورت تمایل)
              const orderDate = new Date(order.createdAt).toLocaleDateString("fa-IR");

              return (
                <Card
                  key={order.id}
                  className="border-zinc-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition duration-200"
                >
                  <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    
                    {/* اطلاعات مشتری و وضعیت */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="space-y-1">
                        <p className="font-bold text-sm text-zinc-800">
                          مشتری: {order.user.name}
                        </p>
                        <p className="text-[10px] text-zinc-400">
                          ثبت‌شده در تاریخ: {orderDate}
                        </p>
                      </div>
                      
                      {/* برچسب رنگی وضعیت سفارش */}
                      <OrderBadge status={order.status} />
                    </div>

                    {/* مبلغ نهایی و دکمه جزئیات سفارش */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-4 sm:pt-0 border-zinc-50">
                      <div className="flex flex-col text-right">
                        <span className="font-extrabold text-base text-zinc-950">
                          {Number(order.totalPrice).toLocaleString("fa-IR")}
                        </span>
                        <span className="text-[9px] text-zinc-400">تومان</span>
                      </div>

                      {/* دکمه مشاهده جزئیات سفارش */}
                      <Button variant="outline" size="sm" asChild className="rounded-xl border-zinc-200 h-9 px-4">
                        <Link href={`/admin/orders/${order.id}`} className="flex items-center gap-1.5 text-xs font-semibold">
                          <span>جزئیات</span>
                          <ArrowUpRight className="h-3.5 w-3.5 text-zinc-400" />
                        </Link>
                      </Button>
                    </div>

                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}