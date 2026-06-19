import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/components/admin/order-status";
import Link from "next/link";
import { notFound } from "next/navigation";

// ایمپورت کامپوننت‌های شکیل پروژه (Shadcn UI)
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

// ایمپورت آیکون‌های مورد نظر از خانواده Lucide
import {
  ArrowRight,
  User,
  Mail,
  MapPin,
  Phone,
  FileText,
  ShoppingBag,
  Calendar,
  CheckCircle2,
} from "lucide-react";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OrderDetailPage({ params }: Props) {
  // ۱. رفع باگ ناهمگام بودن پارامترها در Next.js جدید
  const { id } = await params;

  // ۲. دریافت اطلاعات تفصیلی سفارش
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      address: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString("fa-IR");
  const orderTime = new Date(order.createdAt).toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 space-y-6 animate-fade-in">
      
      {/* هدر بالای صفحه به همراه دکمه بازگشت */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-100">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-700 shadow-sm">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">جزئیات سفارش</h1>
            <p className="text-xs text-zinc-400 mt-1">
              شناسه سفارش: <span className="font-mono text-[10px] font-bold bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200 uppercase">{order.id.slice(-8)}</span>
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" asChild className="w-fit rounded-xl border-zinc-200 text-zinc-700">
          <Link href="/admin/orders" className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4" />
            <span>بازگشت به سفارشات</span>
          </Link>
        </Button>
      </div>

      {/* شبکه چیدمان کارت‌ها (Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* بخش راست (2 ستون): لیست اقلام سفارش و فاکتور */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* کارت اقلام خریده شده */}
          <Card className="border-zinc-100 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardHeader className="border-b border-zinc-50 bg-zinc-50/20 pb-4">
              <div className="flex items-center gap-2 text-zinc-800">
                <ShoppingBag className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-base font-bold">اقلام خریداری شده</CardTitle>
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
                      <span className="font-extrabold text-sm text-zinc-900">
                        {Number(Number(item.price) * item.quantity).toLocaleString("fa-IR")}
                      </span>
                      <span className="text-[9px] text-zinc-400">تومان</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* فاکتور حساب نهایی سفارش */}
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
              <span className="font-extrabold text-zinc-800">مجموع دریافتی:</span>
              <div className="flex flex-col text-left">
                <span className="font-black text-xl text-zinc-950">
                  {Number(order.totalPrice).toLocaleString("fa-IR")}
                </span>
                <span className="text-[10px] text-zinc-400">تومان</span>
              </div>
            </div>
          </Card>

        </div>

        {/* بخش چپ (1 ستون): مشخصات خریدار، آدرس ارسال و تغییر وضعیت */}
        <div className="space-y-6">
          
          {/* کارت تغییر وضعیت سفارش */}
          <Card className="border-zinc-100 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardHeader className="border-b border-zinc-50 bg-zinc-50/20 pb-4">
              <div className="flex items-center gap-2 text-zinc-800">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-base font-bold">وضعیت سفارش</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                  ثبت‌یافته در:
                </span>
                <span className="font-bold text-zinc-800">{orderDate} - ساعت {orderTime}</span>
              </div>
              
              <div className="space-y-2 pt-4 border-t border-zinc-100">
                <label className="block text-[10px] font-bold text-zinc-400 mr-0.5">مدیریت وضعیت مرسوله</label>
                {/* کامپوننت تغییر وضعیت با ظاهر هماهنگ */}
                <div className="w-full">
                  <OrderStatus orderId={order.id} status={order.status} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* کارت مشخصات خریدار و آدرس تحویل */}
          <Card className="border-zinc-100 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardHeader className="border-b border-zinc-50 bg-zinc-50/20 pb-4">
              <div className="flex items-center gap-2 text-zinc-800">
                <MapPin className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-base font-bold">مشخصات ارسال</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5 text-xs">
              
              {/* اطلاعات خریدار و گیرنده */}
              <div className="space-y-3.5">
                <div className="flex items-start gap-2.5">
                  <User className="h-4 w-4 text-zinc-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-400 block">نام گیرنده مرسوله</span>
                    <span className="font-bold text-zinc-800 block text-sm">{order.address.fullName || order.user.name}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Mail className="h-4 w-4 text-zinc-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-400 block">نشانی ایمیل</span>
                    <span className="font-semibold text-zinc-700 block truncate">{order.user.email}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Phone className="h-4 w-4 text-zinc-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-400 block">شماره موبایل گیرنده</span>
                    <span className="font-semibold text-zinc-700 block" dir="ltr">{order.address.phone || "ثبت‌نشده"}</span>
                  </div>
                </div>
              </div>

              {/* اطلاعات موقعیت پستی */}
              <div className="pt-4 border-t border-zinc-100 space-y-3">
                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-400 block">استان و شهر مقصد</span>
                  <span className="font-bold text-zinc-800 block text-sm">
                    {order.address.province} - {order.address.city}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-400 block">کد پستی ده رقمی</span>
                  <span className="font-semibold text-zinc-700 block font-mono text-sm tracking-wide" dir="ltr">
                    {order.address.postalCode || "ثبت‌نشده"}
                  </span>
                </div>

                <div className="space-y-1 leading-relaxed">
                  <span className="text-[9px] text-zinc-400 block">نشانی دقیق پستی</span>
                  <span className="font-semibold text-zinc-600 block text-xs leading-5">
                    {order.address.addressLine}
                  </span>
                </div>
              </div>

            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  );
}