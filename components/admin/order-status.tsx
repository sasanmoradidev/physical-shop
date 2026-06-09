"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
      alert("خطا در تغییر وضعیت");
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
      <option value="PENDING">PENDING</option>
      <option value="PAID">PAID</option>
      <option value="PROCESSING">PROCESSING</option>
      <option value="SHIPPED">SHIPPED</option>
      <option value="DELIVERED">DELIVERED</option>
      <option value="CANCELLED">CANCELLED</option>
    </select>
  );
}