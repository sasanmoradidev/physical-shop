import { prisma } from "@/lib/prisma";
import Link from "next/link";

type Props = {
  searchParams: Promise<{
    status?: string;
  }>;
};

export default async function AdminOrdersPage({
  searchParams,
}: Props) {
  const { status } = await searchParams;

  const where = {
    ...(status
      ? { status: status as any }
      : {}),
  };

  const orders =
    await prisma.order.findMany({
      where,
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

      {/* فیلتر وضعیت */}
      <div className="flex gap-2 mb-6">
        <Link href="/admin/orders">
          همه
        </Link>
        <Link href="/admin/orders?status=PENDING">
          در انتظار
        </Link>
        <Link href="/admin/orders?status=PAID">
          پرداخت شده
        </Link>
        <Link href="/admin/orders?status=SHIPPED">
          ارسال شده
        </Link>
      </div>

      {/* لیست سفارش‌ها */}
      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
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
              مبلغ:{" "}
              {order.totalPrice.toString()}
            </p>

            <p>
              وضعیت: {order.status}
            </p>

            <p>
              شهر: {order.address.city}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}