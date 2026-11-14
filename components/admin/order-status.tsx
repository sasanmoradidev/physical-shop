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

    // 1. optimistic update
    setValue(newStatus);
    setLoading(true);

    try {
      const res = await fetch(
        `/api/admin/orders/${orderId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Request failed");
      }

      // sync با سرور (اختیاری ولی خوبه)
      router.refresh();
    } catch (err) {
      // rollback
      setValue(prev);
      toast.error("خطا در تغییر وضعیت");
    } finally {
      setLoading(false);
    }
  }

  return (
    <select
      value={value}
      onChange={(e) =>
        updateStatus(e.target.value)
      }
      disabled={loading}
      className="border p-2"
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