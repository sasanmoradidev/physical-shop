import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { Authority, Status } = await req.json();

  if (Status !== "OK") {
    return NextResponse.json(
      { error: "Payment failed" },
      { status: 400 }
    );
  }

  // پیدا کردن order
  const order = await prisma.order.findFirst({
    where: {
      authority: Authority,
    },
  });

  if (!order) {
    return NextResponse.json(
      { error: "Order not found" },
      { status: 404 }
    );
  }

  const response = await fetch(
    "https://api.zarinpal.com/pg/v4/payment/verify.json",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        merchant_id: process.env.ZARINPAL_MERCHANT_ID,
        authority: Authority,
        amount: Number(order.totalPrice),
      }),
    }
  );

  const data = await response.json();

  if (data.data.code === 100) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
      },
    });

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    { error: "Verification failed" },
    { status: 400 }
  );
}