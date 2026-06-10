"use client";

import { useCartStore } from "@/stores/cart-store";
import Link from "next/link";
import { useState, useEffect } from "react";

async function handlePayment() {
  const res = await fetch("/api/payment/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      orderId: "ORDER_ID_HERE",
    }),
  });

  const data = await res.json();

  if (data.url) {
    window.location.href = data.url;
  }
}

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);

  const items = useCartStore((state) => state.items);
 
  const total = items.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );
  type Address = {
    id: string;
    title: string;
    city: string;
  };

  const [addresses, setAddresses] =
    useState<Address[]>([]);

  const [addressId, setAddressId] =
    useState("");

  async function submitOrder() {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items,
        addressId,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert("خطا در ثبت سفارش");
      return;
    }

    // 👉 بعد از ساخت order، برو پرداخت
    const paymentRes = await fetch("/api/payment/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId: data.id,
      }),
    });

    const payment = await paymentRes.json();

    if (payment.url) {
      window.location.href = payment.url;
    }
  }
  useEffect(() => {
    fetch("/api/addresses")
      .then((r) => r.json())
      .then((data) => {
        setAddresses(data);

        if (data.length > 0) {
          setAddressId(data[0].id);
        }
      });
  }, []);
  if (addresses.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-4">
          تسویه حساب
        </h1>

        <p className="mb-4">
          ابتدا یک آدرس ثبت کنید.
        </p>

        <Link
          href="/profile/addresses/new"
          className="border px-4 py-2"
        >
          افزودن آدرس
        </Link>
      </div>
    );
  }
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">
        تسویه حساب
      </h1>
      {addresses.map((address: any) => (
        <label
          key={address.id}
          className="block border p-3 mb-2"
        >
          <input
            type="radio"
            checked={
              addressId === address.id
            }
            onChange={() =>
              setAddressId(address.id)
            }
          />

          {" "}
          {address.title}
          {" - "}
          {address.city}
        </label>
      ))}
      <div className="grid md:grid-cols-2 gap-8">

        <div className="border rounded-xl p-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between mb-2"
            >
              <span>
                {item.title} × {item.quantity}
              </span>

              <span>
                {item.price * item.quantity}
              </span>
            </div>
          ))}

          <hr className="my-4" />

          <div className="font-bold mb-4">
            مجموع: {total}
          </div>

          <button
            disabled={loading}
            onClick={submitOrder}
            className="border px-4 py-2"
          >
            {loading
              ? "در حال ثبت..."
              : "ثبت سفارش"}
          </button>
        </div>
      </div>
    </div>
  );
}