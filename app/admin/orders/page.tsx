import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: {
      createdAt: "desc",
    },

    include: {
      user: true,
      address: true,
    },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        سفارشات
      </h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
          >
            <Link
              href={`/admin/orders/${order.id}`}
              className="block border rounded p-4"
            >
            <p>
              مشتری: {order.user.name}
            </p>

            <p>
              ایمیل: {order.user.email}
            </p>

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

            <p>
              شهر:
              {" "}
              {order.address.city}
            </p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}