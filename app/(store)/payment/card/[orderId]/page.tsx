import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac-server";
import { ClearCart } from "@/components/cart/clear-cart";
import { CardPaymentForm } from "@/components/payment/card-payment-form";

type Props = {
  params: Promise<{ orderId: string }>;
};

export default async function CardPaymentPage({ params }: Props) {
  const { orderId } = await params;
  const user = await requireAuth(`/payment/card/${orderId}`);

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: user.id,
    },
    include: {
      paymentMethod: true,
    },
  });

  if (!order) {
    notFound();
  }

  if (order.status !== "PENDING" && order.status !== "AWAITING_VERIFICATION") {
    redirect(`/profile/orders/${order.id}`);
  }

  let cardMethod =
    order.paymentMethod?.code === "CARD" ? order.paymentMethod : null;

  if (!cardMethod) {
    cardMethod = await prisma.paymentMethod.findFirst({
      where: { code: "CARD", isActive: true },
    });
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <ClearCart />
      <CardPaymentForm
        order={{
          id: order.id,
          totalPrice: Number(order.totalPrice),
          status: order.status,
          receiptImage: order.receiptImage,
          receiptTrackingCode: order.receiptTrackingCode,
          receiptNote: order.receiptNote,
        }}
        cardInfo={
          cardMethod
            ? {
                name: cardMethod.name,
                cardNumber: cardMethod.cardNumber,
                cardHolder: cardMethod.cardHolder,
                bankName: cardMethod.bankName,
                description: cardMethod.description,
              }
            : null
        }
      />
    </div>
  );
}