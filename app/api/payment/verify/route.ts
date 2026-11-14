import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { Authority, Status } = await req.json();

    if (!Authority || Status !== "OK") {
      return NextResponse.json({ error: "Payment failed" }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: { authority: Authority },
      include: { paymentMethod: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === "PAID") {
      return NextResponse.json({ ok: true, message: "Order already paid" });
    }

    if (order.status !== "PENDING") {
      return NextResponse.json({ error: "Order is not payable" }, { status: 400 });
    }

    const activeMerchantId =
      order.paymentMethod?.merchantId || process.env.ZARINPAL_MERCHANT_ID;

    const response = await fetch(
      "https://sandbox.zarinpal.com/pg/v4/payment/verify.json",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchant_id: activeMerchantId,
          authority: Authority,
          amount: Number(order.totalPrice), // ⚠️ اگر مرچنت روی ریال است، باید currency: "IRT" بدهید یا * 10 کنید
        }),
      }
    );

    const data = await response.json();
    const code = data?.data?.code;

    if (code === 100 || code === 101) {
      await prisma.order.updateMany({
        where: { id: order.id, status: "PENDING" },
        data: {
          status: "PAID",
          refId: String(data.data.ref_id || ""),
          paidAt: new Date(),
        },
      });

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Verification failed" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}