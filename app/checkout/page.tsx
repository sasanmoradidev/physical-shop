"use client";

import { useCartStore } from "@/store/cart-store";

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);

  const total = items.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">
        تسویه حساب
      </h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <input
            placeholder="نام و نام خانوادگی"
            className="border p-2 w-full mb-4"
          />

          <input
            placeholder="شماره موبایل"
            className="border p-2 w-full mb-4"
          />

          <textarea
            placeholder="آدرس"
            className="border p-2 w-full"
          />
        </div>

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

          <div className="font-bold">
            مجموع: {total}
          </div>
        </div>
      </div>
    </div>
  );
}