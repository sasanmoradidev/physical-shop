import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function POST(
  req: Request
) {
  try {
    const body = await req.json();

    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        {
          error: "Order ID is required",
        },
        { status: 400 }
      );
    }

    const cookieStore =
      await cookies();

    const token =
      cookieStore.get("token")
        ?.value;

    if (!token) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const payload =
      await verifyToken(token);

    const order =
      await prisma.order.findFirst({
        where: {
          id: orderId,
          userId:
            payload.userId as string,
        },
      });

    if (!order) {
      return NextResponse.json(
        {
          error:
            "Order not found",
        },
        { status: 404 }
      );
    }

    // چک کردن اکسپایر شدن سفارش بعد از ده دقیقه
    const TEN_MINUTES = 10 * 60 * 1000;

    const now = new Date().getTime();

    if (!order.createdAt) {
      return NextResponse.json(
        { error: "Invalid order" },
        { status: 400 }
      );
    }

    const orderAge =
      now - new Date(order.createdAt).getTime();

    if (orderAge > TEN_MINUTES) {
      return NextResponse.json(
        {
          error: "Payment link expired",
        },
        { status: 400 }
      );
    }
    // چک کردن اکسپایر شدن سفارش بعد از ده دقیقه

    if (
      order.status !==
      "PENDING"
    ) {
      return NextResponse.json(
        {
          error:
            "Order is not payable",
        },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://sandbox.zarinpal.com/pg/v4/payment/request.json",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          merchant_id: process.env.ZARINPAL_MERCHANT_ID,
          amount: Number(order.totalPrice),
          callback_url: "http://localhost:3000/payment/callback",
          description: `Order ${order.id}`,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error("ZARINPAL ERROR:", errorText);

      return NextResponse.json(
        {
          error: "Payment request failed",
        },
        { status: 500 }
      );
    }

    const data = await response.json();

    console.log("ZARINPAL SUCCESS:", data);

    if (
      data.data.code !== 100
    ) {
      return NextResponse.json(
        {
          error:
            "Payment request failed",
          data,
        },
        { status: 400 }
      );
    }

    await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        authority:
          data.data.authority,
      },
    });

    // return NextResponse.json({
    //   url: `https://www.zarinpal.com/pg/StartPay/${data.data.authority}`,
    // });

    return NextResponse.json({
      url: `https://sandbox.zarinpal.com/pg/StartPay/${data.data.authority}`,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Server Error",
      },
      { status: 500 }
    );
  }
}