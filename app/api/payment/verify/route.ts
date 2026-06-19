import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { Authority, Status } = await req.json();

    if (Status !== "OK") {
      return NextResponse.json({ error: "Payment failed" }, { status: 400 });
    }

    // پیدا کردن اطلاعات کامل فاکتور سفارش به همراه روش پرداخت آن
    const order = await prisma.order.findFirst({
      where: {
        authority: Authority,
      },
      include: {
        paymentMethod: true, // 👈 گرفتن رابطه روش پرداخت
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === "PAID") {
      return NextResponse.json({ ok: true, message: "Order already paid" });
    }

    // 👇 دریافت داینامیک مرچنت آی‌دی اختصاصی یا متغیر عمومی .env برای وریفای نهایی
    const activeMerchantId = order.paymentMethod?.merchantId || process.env.ZARINPAL_MERCHANT_ID;

    const response = await fetch(
      "https://sandbox.zarinpal.com/pg/v4/payment/verify.json",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          merchant_id: activeMerchantId, // 👈 وریفای با مرچنت داینامیک فعال
          authority: Authority,
          amount: Number(order.totalPrice),
        }),
      }
    );

    const data = await response.json();
    if (data.data.code === 100) {

      const orderWithItems = await prisma.order.findUnique({
        where: {
          id: order.id,
        },
        include: {
          items: true,
        },
      });

      if (!orderWithItems) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      await prisma.$transaction(async (tx) => {
        for (const item of orderWithItems.items) {
          const result = await tx.product.updateMany({
            where: {
              id: item.productId,
              stock: {
                gte: item.quantity,
              },
            },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });

          if (result.count === 0) {
            throw new Error("Insufficient stock");
          }
        }

        await tx.order.update({
          where: {
            id: order.id,
          },
          data: {
            status: "PAID",
            refId: String(data.data.ref_id),
            paidAt: new Date(),
          },
        });
      });

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Verification failed" }, { status: 400 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}