import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OrderPage(
  { params }: Props
) {
  const user =
    await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  const order =
    await prisma.order.findFirst({
      where: {
        id,
        userId: user.id,
      },

      include: {
        address: true,

        items: {
          include: {
            product: true,
          },
        },
      },
    });

  if (!order) {
    return (
      <div className="container mx-auto py-10">
        سفارش پیدا نشد
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">
        جزئیات سفارش
      </h1>

      <div className="border rounded p-4 mb-6">
        <p>
          وضعیت:
          {" "}
          {order.status}
        </p>

        <p>
          مبلغ:
          {" "}
          {order.totalPrice.toString()}
        </p>
      </div>

      <div className="border rounded p-4 mb-6">
        <h2 className="font-bold mb-3">
          آدرس ارسال
        </h2>

        <p>
          {order.address.fullName}
        </p>

        <p>
          {order.address.phone}
        </p>

        <p>
          {order.address.province}
          {" - "}
          {order.address.city}
        </p>

        <p>
          {order.address.addressLine}
        </p>
      </div>

      <div className="border rounded p-4">
        <h2 className="font-bold mb-3">
          محصولات
        </h2>

        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex justify-between border-b py-2"
          >
            <span>
              {item.product.title}
            </span>

            <span>
              {item.quantity}
            </span>

            <span>
              {item.price.toString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}