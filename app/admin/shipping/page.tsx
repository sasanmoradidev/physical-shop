import { prisma } from "@/lib/prisma";
import { ShippingManager } from "@/components/admin/shipping-manager";
import { Truck } from "lucide-react";

export default async function AdminShippingPage() {
  const methods = await prisma.shippingMethod.findMany({
    orderBy: { createdAt: "desc" },
  });

  // 👇 تبدیل مقادیر اعشاری Decimal دیتابیس به عددهای استاندارد جاوااسکریپتی [2]
  const safeMethods = methods.map((m) => ({
    ...m,
    price: Number(m.price),
  }));

  return (
    <div className="container mx-auto py-8 px-4 space-y-8 animate-fade-in">
      
      {/* هدر بالای صفحه */}
      <div className="flex items-center gap-3.5 pb-6 border-b border-zinc-100">
        <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-700 shadow-sm">
          <Truck className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">روش‌های ارسال</h1>
          <p className="text-xs text-zinc-400 mt-1">مدیریت انواع شیوه ارسال سفارش، هزینه‌ها و زمان تحویل</p>
        </div>
      </div>

      {/* صدا زدن کامپوننت یکپارچه مدیریت شیوه‌های ارسال با ارسال safeMethods */}
      <ShippingManager initialMethods={safeMethods} />

    </div>
  );
}