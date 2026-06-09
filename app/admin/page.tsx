import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const usersCount =
    await prisma.user.count();

  const productsCount =
    await prisma.product.count();

  const ordersCount =
    await prisma.order.count();

  const orders =
    await prisma.order.findMany({
      select: {
        totalPrice: true,
      },
    });

  const totalSales =
    orders.reduce(
      (sum, order) =>
        sum +
        Number(order.totalPrice),
      0
    );
  const latestOrders =
    await prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        user: true,
      },
    });
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">
        داشبورد مدیریت
      </h1>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="border rounded p-4">
          <p>کاربران</p>
          <h2 className="text-3xl font-bold">
            {usersCount}
          </h2>
        </div>

        <div className="border rounded p-4">
          <p>محصولات</p>
          <h2 className="text-3xl font-bold">
            {productsCount}
          </h2>
        </div>

        <div className="border rounded p-4">
          <p>سفارشات</p>
          <h2 className="text-3xl font-bold">
            {ordersCount}
          </h2>
        </div>

        <div className="border rounded p-4">
          <p>فروش</p>
          <h2 className="text-3xl font-bold">
            ${totalSales}
          </h2>
        </div>

      </div>
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4">
          آخرین سفارش‌ها
        </h2>

        <div className="space-y-3">
          {latestOrders.map((order) => (
            <div
              key={order.id}
              className="border rounded p-4 flex justify-between"
            >
              <div>
                <p>
                  کاربر: {order.user.name}
                </p>
                <p className="text-sm text-gray-500">
                  وضعیت: {order.status}
                </p>
              </div>

              <div className="font-bold">
                ${Number(order.totalPrice)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}