// app/admin/orders/transactions/page.tsx یا app/admin/transactions/page.tsx
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac-server";
import { Card, CardContent } from "@/components/ui/card";
import { OrderBadge } from "@/components/admin/order-badge";
import { CreditCard, Calendar, User, CheckCircle2, XCircle } from "lucide-react";

export default async function AdminTransactionsPage() {
  await requirePermission("MANAGE_ORDERS");

  // واکشی سفارش‌هایی که دارای اطلاعات تراکنش یا پرداخت هستند
  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { status: "PAID" },
        { status: "PENDING" },
        { authority: { not: null } },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
      paymentMethod: true,
    },
  });

  return (
    <div className="container mx-auto py-8 px-4 space-y-8 animate-fade-in">
      {/* هدر صفحه */}
      <div className="flex items-center gap-3.5 pb-6 border-b border-zinc-100">
        <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-700 shadow-sm">
          <CreditCard className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">تاریخچه تراکنش‌های مالی</h1>
          <p className="text-xs text-zinc-400 mt-1">
            مدیریت و نظارت بر تراکنش‌های درگاه بانکی و کدهای پیگیری خریدها ({orders.length} تراکنش)
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card className="border-dashed border-zinc-200 p-12 text-center bg-zinc-50/20">
          <CardContent className="py-6 text-xs text-zinc-400">
            هنوز هیچ تراکنشی در سیستم ثبت نشده است.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const orderDate = new Date(order.createdAt).toLocaleDateString("fa-IR");
            const isPaid = order.status === "PAID";

            return (
              <Card
                key={order.id}
                className="border-zinc-100 shadow-sm rounded-2xl p-5 bg-white hover:shadow-md transition duration-200"
              >
                <CardContent className="p-0 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                  {/* اطلاعات کلی و مشتری */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200 tracking-tight font-mono">
                        سفارش: {order.id.slice(-8).toUpperCase()}
                      </span>

                      <span className="inline-flex items-center gap-1.5 text-[10px] text-zinc-400 font-semibold">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{orderDate}</span>
                      </span>

                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        {order.paymentMethod?.name || "درگاه آنلاین"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-zinc-500">
                      <div className="flex items-center gap-1.5">
                        <User className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                        <span className="font-semibold text-zinc-800">{order.user.name}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-zinc-400">کد رهگیری (RefID):</span>
                        <span className="font-mono font-bold text-zinc-700">
                          {order.refId || "ندارد (ثبت‌نشده)"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-zinc-400">Authority:</span>
                        <span className="font-mono text-xs text-zinc-600 truncate max-w-[150px]">
                          {order.authority || "ندارد"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* مبلغ و وضعیت پرداخت */}
                  <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 pt-4 lg:pt-0 border-zinc-50 flex-shrink-0">
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] text-zinc-400">مبلغ تراکنش</span>
                      <span className="font-extrabold text-base text-zinc-950 tracking-tight">
                        {Number(order.totalPrice).toLocaleString("fa-IR")}
                      </span>
                      <span className="text-[9px] text-zinc-400">تومان</span>
                    </div>

                    <div className="flex flex-col gap-1 items-end">
                      <span className="text-[10px] text-zinc-400 hidden lg:inline">وضعیت</span>
                      <OrderBadge status={order.status} />
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