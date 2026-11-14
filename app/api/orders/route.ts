import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { getFinalPrice } from "@/lib/product-price";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "لطفاً ابتدا وارد حساب کاربری شوید." }, { status: 401 });
    }

    let payload;
    try {
      payload = await verifyToken(token);
    } catch {
      return NextResponse.json({ error: "نشست کاربری نامعتبر است. مجدداً وارد شوید." }, { status: 401 });
    }

    const body = await req.json();

    if (!body.addressId) {
      return NextResponse.json({ error: "آدرس تحویل اجباری است" }, { status: 400 });
    }
    if (!body.shippingMethodId) {
      return NextResponse.json({ error: "انتخاب روش ارسال اجباری است" }, { status: 400 });
    }
    if (!body.paymentMethodId) {
      return NextResponse.json({ error: "انتخاب روش پرداخت اجباری است" }, { status: 400 });
    }

    const items = body.items;
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "سبد خرید خالی است" }, { status: 400 });
    }

    // اعتبارسنجی تعداد تمام اقلام قبل از شروع تراکنش
    for (const item of items) {
      if (
        !item?.id ||
        typeof item.quantity !== "number" ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return NextResponse.json({ error: "تعداد محصول نامعتبر است" }, { status: 400 });
      }
    }

    const shippingMethod = await prisma.shippingMethod.findFirst({
      where: { id: body.shippingMethodId, isActive: true },
    });
    if (!shippingMethod) {
      return NextResponse.json({ error: "روش ارسال انتخابی نامعتبر است" }, { status: 400 });
    }

    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: { id: body.paymentMethodId, isActive: true },
    });
    if (!paymentMethod) {
      return NextResponse.json({ error: "روش پرداخت انتخابی نامعتبر است" }, { status: 400 });
    }

    // بررسی وجود و مالکیت آدرس برای همین کاربر
    const address = await prisma.address.findFirst({
      where: {
        id: body.addressId,
        userId: payload.userId,
      },
    });
    if (!address) {
      return NextResponse.json({ error: "آدرس معتبر یافت نشد" }, { status: 404 });
    }

    const order = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const orderItemsToCreate = [];

      for (const item of items) {
        const product = await tx.product.findFirst({
          where: { id: item.id, isActive: true },
          include: { variants: true },
        });

        if (!product) {
          throw new Error(`محصول ${item.title || ""} یافت نشد یا غیرفعال است.`);
        }

        let itemPrice = Number(product.price);
        let selectedVariant = null;

        if (item.variantId) {
          selectedVariant = product.variants.find((v) => v.id === item.variantId);
          if (!selectedVariant) {
            throw new Error(`تنوع انتخاب شده برای کالا ${product.title} یافت نشد.`);
          }

          itemPrice = selectedVariant.price
            ? Number(selectedVariant.price)
            : Number(product.price);

          const variantUpdate = await tx.productVariant.updateMany({
            where: { id: selectedVariant.id, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
          if (variantUpdate.count === 0) {
            throw new Error(`موجودی تنوع ${selectedVariant.name} کافی نیست.`);
          }
        }

        const productUpdate = await tx.product.updateMany({
          where: { id: product.id, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (productUpdate.count === 0) {
          throw new Error(`موجودی کالا ${product.title} کافی نیست.`);
        }

        const finalProductPrice = getFinalPrice({
          price: itemPrice,
          offerPrice: product.offerPrice ? Number(product.offerPrice) : null,
          offerStartsAt: product.offerStartsAt,
          offerEndsAt: product.offerEndsAt,
        });

        subtotal += finalProductPrice * item.quantity;

        orderItemsToCreate.push({
          productId: product.id,
          variantId: selectedVariant?.id || null,
          quantity: item.quantity,
          price: finalProductPrice,
        });
      }

      const totalPrice = subtotal + Number(shippingMethod.price);
      const initialStatus = paymentMethod.code === "COD" ? "PROCESSING" : "PENDING";

      return await tx.order.create({
        data: {
          userId: payload.userId,
          totalPrice,
          addressId: address.id,

          shippingTitle: address.title,
          shippingFullName: address.fullName,
          shippingPhone: address.phone,
          shippingProvince: address.province,
          shippingCity: address.city,
          shippingAddressLine: address.addressLine,
          shippingPostalCode: address.postalCode,

          shippingMethodId: shippingMethod.id,
          shippingCost: shippingMethod.price,
          paymentMethodId: paymentMethod.id,
          status: initialStatus,

          items: {
            create: orderItemsToCreate,
          },
        },
      });
    });

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Order Checkout Error:", error);
    return NextResponse.json(
      { error: error.message || "Server Error" },
      { status: 400 }
    );
  }
}