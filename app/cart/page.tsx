"use client";
import Link from "next/link";
import { useCartStore } from "@/stores/cart-store";

export default function CartPage() {
    const {
        items,
        increase,
        decrease,
        removeItem,
    } = useCartStore();

    const total = items.reduce(
        (sum, item) =>
            sum + item.price * item.quantity,
        0
    );

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-8">
                سبد خرید
            </h1>

            {items.map((item) => (
                <div
                    key={item.id}
                    className="border rounded p-4 mb-4"
                >
                    <h3>{item.title}</h3>

                    <p>
                        {item.quantity} × {item.price}
                    </p>

                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={() =>
                                increase(item.id)
                            }
                        >
                            +
                        </button>

                        <button
                            onClick={() =>
                                decrease(item.id)
                            }
                        >
                            -
                        </button>

                        <button
                            onClick={() =>
                                removeItem(item.id)
                            }
                        >
                            حذف
                        </button>
                    </div>
                </div>
            ))}

            <h2 className="text-2xl font-bold mt-6">
                مجموع: ${total}
            </h2>
            <Link
                href="/checkout"
                className="border rounded px-4 py-2"
            >
                ادامه خرید
            </Link>
        </div>
    );
}