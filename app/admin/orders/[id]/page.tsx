import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/components/admin/order-status";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OrderDetailPage(
  { params }: Props
) {
  const { id } = await params;

  const order =
    await prisma.order.findUnique({
      where: { id },

      include: {
        user: true,
        address: true,

        items: {
          include: {
            product: true,
          },
        },
      },
    });

  if (!order) {
    return <div>یافت نشد</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        سفارش
      </h1>

      <p>مشتری: {order.user.name}</p>
      <p>ایمیل: {order.user.email}</p>

      <hr className="my-4" />

      <p>
        آدرس:
        {order.address.province}
        {" - "}
        {order.address.city}
      </p>

      <p>{order.address.addressLine}</p>
      
      <p>
        وضعیت:
        {" "}
        {order.status}
      </p>
      <OrderStatus
        orderId={order.id}
        status={order.status}
      />
      <hr className="my-4" />

      {order.items.map((item) => (
        <div
          key={item.id}
          className="flex justify-between border-b py-2"
        >
          <span>
            عنوان: {item.product.title}
          </span>

          <span>
            تعداد: {item.quantity}
          </span>

          <span>
            قیمت: {item.price.toString()}
          </span>
        </div>
      ))}
      <p>
        مجموع:
        {order.totalPrice.toString()}
      </p>
    </div>
  );
}