const order = await prisma.order.findUnique({
  where: { id: orderId },
});

if (!order) {
  return NextResponse.json(
    { error: "Order not found" },
    { status: 404 }
  );
}

const response = await fetch(
  "https://api.zarinpal.com/pg/v4/payment/request.json",
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

const data = await response.json();

if (data.data.code === 100) {
  // 👇 مهم‌ترین بخش
  await prisma.order.update({
    where: { id: orderId },
    data: {
      authority: data.data.authority,
    },
  });

  return NextResponse.json({
    url: `https://www.zarinpal.com/pg/StartPay/${data.data.authority}`,
  });
}