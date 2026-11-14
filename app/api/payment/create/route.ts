import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload;
    try {
      payload = await verifyToken(token);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: payload.userId,
      },
      include: {
        paymentMethod: true,
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "PENDING") {
      return NextResponse.json({ error: "Order is not payable" }, { status: 400 });
    }

    const TEN_MINUTES = 10 * 60 * 1000;
    const orderAge = Date.now() - new Date(order.createdAt).getTime();

    if (orderAge > TEN_MINUTES) {
      // لغو سفارش منقضی‌شده و بازگرداندن موجودی به انبار (به صورت Idempotent)
      await prisma.$transaction(async (tx) => {
        const cancelled = await tx.order.updateMany({
          where: { id: order.id, status: "PENDING" },
          data: { status: "CANCELLED" },
        });

        if (cancelled.count > 0) {
          for (const item of order.items) {
            if (item.variantId) {
              await tx.productVariant.update({
                where: { id: item.variantId },
                data: { stock: { increment: item.quantity } },
              });
            }
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
      });

      return NextResponse.json(
        { error: "مهلت پرداخت این سفارش به پایان رسیده و سفارش لغو شد." },
        { status: 400 }
      );
    }

    const activeMerchantId =
      order.paymentMethod?.merchantId || process.env.ZARINPAL_MERCHANT_ID;

    const response = await fetch(
      "https://sandbox.zarinpal.com/pg/v4/payment/request.json",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchant_id: activeMerchantId,
          amount: Number(order.totalPrice), // ⚠️ چک شود واحد پول درگاه تومان/ریال است
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`,
          description: `Order ${order.id}`,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ZARINPAL ERROR:", errorText);
      return NextResponse.json({ error: "Payment request failed" }, { status: 500 });
    }

    const data = await response.json();
    if (data?.data?.code !== 100) {
      return NextResponse.json({ error: "Payment request failed", data }, { status: 400 });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { authority: data.data.authority },
    });

    return NextResponse.json({
      url: `https://sandbox.zarinpal.com/pg/StartPay/${data.data.authority}`,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}