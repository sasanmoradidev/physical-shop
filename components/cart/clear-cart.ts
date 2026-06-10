// "use client";

// import { useEffect } from "react";

// export function ClearCart() {
//   useEffect(() => {
//     localStorage.removeItem("cart-storage");
//   }, []);

//   return null;
// }

"use client";

import { useEffect } from "react";
import { useCartStore } from "@/stores/cart-store";

export function ClearCart() {
  const clearCart =
    useCartStore(
      (state) => state.clearCart
    );

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return null;
}