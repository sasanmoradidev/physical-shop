"use client";

import { useCartStore } from "@/stores/cart-store";

type Props = {
  id: string;
  title: string;
  price: number;
  stock: number;
};

export function AddToCartButton({
  id,
  title,
  price,
  stock,
}: Props) {

  const addItem = useCartStore(
    (state) => state.addItem
  );

  function handleAdd() {
    addItem({
      id,
      title,
      price,
      quantity: 1,
    });
  }

  return (
    <button
      disabled={stock <= 0}
      onClick={handleAdd}
      className="
        w-full
        rounded-xl
        py-3
        font-medium
        transition
        disabled:bg-gray-300
        disabled:text-gray-500
        disabled:cursor-not-allowed
        bg-green-600
        text-white
        hover:bg-green-700
      "
    >
      {stock > 0
        ? "افزودن به سبد خرید"
        : "ناموجود"}
    </button>
  );
}