"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Order = {
  id: string;
  status: string;
  totalPrice: number;
  address: {
    city: string;
    province: string;
    addressLine: string;
  };
  items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      title: string;
    };
  }[];
};

export default function OrderDetailPage() {
  const { id } = useParams();

  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((res) => res.json())
      .then((data) => setOrder(data));
  }, [id]);

  if (!order) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">
        سفارش #{order.id}
      </h1>

      <p>وضعیت: {order.status}</p>

      <p>
        آدرس: {order.address.city} -{" "}
        {order.address.province}
      </p>

      <p className="mb-4">
        {order.address.addressLine}
      </p>

      <div className="border p-4 rounded mb-4">
        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex justify-between"
          >
            <span>
              {item.product.title} × {item.quantity}
            </span>

            <span>
              {item.price * item.quantity}
            </span>
          </div>
        ))}
      </div>

      <p className="font-bold">
        مجموع: {order.totalPrice}
      </p>

      {order.status === "PENDING" && (
        <button
          className="mt-4 border px-4 py-2"
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
  );
}