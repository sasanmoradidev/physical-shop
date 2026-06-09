"use client";

import { useCartStore } from "@/store/cart-store";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);

  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore(
    (state) => state.clearCart
  );

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
    if (items.length === 0) {
      alert("سبد خرید خالی است");
      return;
    }

    if (!addressId) {
      alert("آدرس انتخاب نشده");
      return;
    }

    // setLoading برای جلوگیری از ثبت چندباره سفارش
    setLoading(true);

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

    console.log("STATUS:", res.status);
    console.log("DATA:", data);

    if (res.ok) {
      clearCart();
      window.location.href =
        `/profile/orders/${data.id}`;
    } else {
      alert(JSON.stringify(data));
    }

    setLoading(false);
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