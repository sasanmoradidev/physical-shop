"use client";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";

type Props = {
  id: string;
  title: string;
  price: number;
};

export function AddToCartButton({
  id,
  title,
  price,
}: Props) {
  const addItem = useCartStore(
    (state) => state.addItem
  );

  return (
    <Button
      onClick={() =>
        addItem({
          id,
          title,
          price,
          quantity: 1,
        })
      }
    >
      افزودن به سبد خرید
    </Button>
  );
}