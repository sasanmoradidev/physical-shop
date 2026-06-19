import { prisma } from "@/lib/prisma";
import { PaymentManager } from "@/components/admin/payment-manager";
import { CreditCard } from "lucide-react";

export default async function AdminPaymentsPage() {
  const methods = await prisma.paymentMethod.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto py-8 px-4 space-y-8 animate-fade-in">
      
      {/* هدر صفحه */}
      <div className="flex items-center gap-3.5 pb-6 border-b border-zinc-100">
        <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-700 shadow-sm">
          <CreditCard className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">روش‌های پرداخت</h1>
          <p className="text-xs text-zinc-400 mt-1">مدیریت روش‌های پرداخت، تراکنش‌های آنلاین و شیوه‌های حضوری</p>
        </div>
      </div>

      {/* کامپوننت یکپارچه مدیریت روش‌های پرداخت */}
      <PaymentManager initialMethods={methods} />

    </div>
  );
}