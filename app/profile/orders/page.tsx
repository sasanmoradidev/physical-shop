import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

import Link from "next/link";

export default async function MyOrdersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const orders = await prisma.order.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">
        سفارش‌های من
      </h1>

      {orders.map((order) => (
        <div
          key={order.id}
          className="border p-4 rounded mb-4"
        >
          <Link
            href={`/profile/orders/${order.id}`}
            className="block border p-4 rounded mb-4"
          >
            <p>کد سفارش: {order.id}</p>

            <p>
              مبلغ:
              {" "}
              {order.totalPrice.toString()}
            </p>

            <p>
              وضعیت:
              {" "}
              {order.status}
            </p>
          </Link>
        </div>
      ))}
    </div>
  );
}