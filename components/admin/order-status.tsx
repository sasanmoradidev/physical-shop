"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function OrderStatus({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [loading, setLoading] = useState(false);

  async function updateStatus(newStatus: string) {
    const prev = value;

    setValue(newStatus);
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "خطا در تغییر وضعیت");
      }

      toast.success("وضعیت سفارش با موفقیت به‌روزرسانی شد.");
      router.refresh();
    } catch (err: unknown) {
      setValue(prev);
      toast.error(err instanceof Error ? err.message : "خطا در تغییر وضعیت");
    } finally {
      setLoading(false);
    }
  }

  return (
    <select
      value={value}
      onChange={(e) => updateStatus(e.target.value)}
      disabled={loading}
      className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-xs font-semibold bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition disabled:opacity-50"
    >
      <option value="PENDING">در انتظار پرداخت</option>
      <option value="PAID">پرداخت شده</option>
      <option value="PROCESSING">در حال پردازش</option>
      <option value="SHIPPED">ارسال شده</option>
      <option value="DELIVERED">تحویل شده</option>
      <option value="CANCELLED">لغو شده</option>
    </select>
  );
}