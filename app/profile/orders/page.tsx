"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Order = {
  id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch("/api/orders/my")
      .then((res) => res.json())
      .then((data) => setOrders(data));
  }, []);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">
        سفارش‌های من
      </h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border p-4 rounded"
          >
            <p>شناسه: {order.id}</p>
            <p>وضعیت: {order.status}</p>
            <p>مبلغ: {order.totalPrice}</p>

            <Link
              href={`/profile/orders/${order.id}`}
              className="text-blue-500"
            >
              مشاهده جزئیات
            </Link>

            {order.status === "PENDING" && (
              <button
                className="ml-4 border px-2 py-1"
                onClick={async () => {
                  const res = await fetch(
                    "/api/payment/create",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        orderId: order.id,
                      }),
                    }
                  );

                  const data = await res.json();

                  if (data.url) {
                    window.location.href = data.url;
                  }
                }}
              >
                پرداخت مجدد
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}