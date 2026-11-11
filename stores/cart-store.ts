import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  variantId?: string; // 👈 شناسه تنوع
};

type CartStore = {
  items: CartItem[];

  addItem: (item: CartItem) => void;
  // 👇 ورودی دوم (variantId) به توابع اضافه شد
  removeItem: (id: string, variantId?: string) => void;
  increase: (id: string, variantId?: string) => void;
  decrease: (id: string, variantId?: string) => void;

  clearCart: () => void;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          // 👈 حالا هم ID محصول و هم ID تنوع چک می‌شود
          const existing = state.items.find(
            (i) => i.id === item.id && i.variantId === item.variantId
          );

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id && i.variantId === item.variantId
                  ? {
                      ...i,
                      quantity: i.quantity + 1,
                    }
                  : i
              ),
            };
          }

          return {
            items: [...state.items, item],
          };
        }),

      removeItem: (id, variantId) =>
        set((state) => ({
          items: state.items.filter(
            // 👈 فقط آیتمی حذف می‌شود که هم ID و هم variantId آن دقیقا مساوی باشد
            (i) => !(i.id === id && i.variantId === variantId)
          ),
        })),

      increase: (id, variantId) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id && i.variantId === variantId
              ? {
                  ...i,
                  quantity: i.quantity + 1,
                }
              : i
          ),
        })),

      decrease: (id, variantId) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.id === id && i.variantId === variantId
                ? {
                    ...i,
                    quantity: i.quantity - 1,
                  }
                : i
            )
            .filter((i) => i.quantity > 0),
        })),
        
      clearCart: () =>
        set({
          items: [],
        }),
    }),
    {
      name: "cart-storage",
    }
  )
);