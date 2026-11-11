import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { getFinalPrice } from "@/lib/product-price";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);

    if (!body.addressId) {
      return NextResponse.json({ error: "آدرس تحویل اجباری است" }, { status: 400 });
    }

    if (!body.shippingMethodId) {
      return NextResponse.json({ error: "انتخاب روش ارسال اجباری است" }, { status: 400 });
    }

    if (!body.paymentMethodId) {
      return NextResponse.json({ error: "انتخاب روش پرداخت اجباری است" }, { status: 400 });
    }

    const shippingMethod = await prisma.shippingMethod.findUnique({
      where: {
        id: body.shippingMethodId,
        isActive: true,
      },
    });

    if (!shippingMethod) {
      return NextResponse.json({ error: "روش ارسال انتخابی نامعتبر است" }, { status: 400 });
    }

    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: {
        id: body.paymentMethodId,
        isActive: true,
      },
    });

    if (!paymentMethod) {
      return NextResponse.json({ error: "روش پرداخت انتخابی نامعتبر است" }, { status: 400 });
    }

    const items = body.items;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "سبد خرید خالی است" }, { status: 400 });
    }

    const address = await prisma.address.findUnique({
      where: { id: body.addressId },
    });

    if (!address) {
      return NextResponse.json({ error: "آدرس معتبر یافت نشد" }, { status: 404 });
    }

    // 🚀 استفاده از تراکنش برای تضمین کسر موجودی و ثبت سفارش به صورت یکپارچه
    const order = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const orderItemsToCreate = [];

      for (const item of items) {
        // واکشی محصول به همراه تنوع‌هایش
        const product = await tx.product.findUnique({
          where: { id: item.id },
          include: { variants: true },
        });

        if (!product) {
          throw new Error(`محصول ${item.title} یافت نشد.`);
        }

        let itemPrice = Number(product.price);
        let stockToDeduct = product.stock;
        let selectedVariant = null;

        // اگر کالا تنوع داشت
        if (item.variantId) {
          selectedVariant = product.variants.find((v) => v.id === item.variantId);
          
          if (!selectedVariant) {
            throw new Error(`تنوع انتخاب شده برای کالا ${product.title} یافت نشد.`);
          }

          if (selectedVariant.stock < item.quantity) {
            throw new Error(`موجودی تنوع ${selectedVariant.name} کافی نیست.`);
          }

          itemPrice = selectedVariant.price ? Number(selectedVariant.price) : Number(product.price);
          stockToDeduct = selectedVariant.stock;
        } else {
          // اگر کالا ساده بود
          if (product.stock < item.quantity) {
            throw new Error(`موجودی کالا ${product.title} کافی نیست.`);
          }
        }

        // محاسبه قیمت نهایی آیتم با اعمال تخفیف احتمالی
        const finalProductPrice = getFinalPrice({
          price: itemPrice,
          offerPrice: product.offerPrice ? Number(product.offerPrice) : null,
          offerStartsAt: product.offerStartsAt,
          offerEndsAt: product.offerEndsAt,
        });

        subtotal += finalProductPrice * item.quantity;

        // آماده‌سازی دیتای ردیف فاکتور (OrderItem)
        orderItemsToCreate.push({
          productId: product.id,
          variantId: selectedVariant?.id || null, // ثبت شناسه تنوع در فاکتور
          quantity: item.quantity,
          price: finalProductPrice,
        });

        // 🎯 کسر موجودی
        if (selectedVariant) {
          // کسر از خودِ تنوع
          await tx.productVariant.update({
            where: { id: selectedVariant.id },
            data: { stock: { decrement: item.quantity } },
          });
          // کسر از سرجمع موجودی کالا
          await tx.product.update({
            where: { id: product.id },
            data: { stock: { decrement: item.quantity } },
          });
        } else {
          // کسر از موجودی محصول ساده
          await tx.product.update({
            where: { id: product.id },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      const totalPrice = subtotal + Number(shippingMethod.price);
      const initialStatus = paymentMethod.code === "COD" ? "PROCESSING" : "PENDING";

      // ثبت نهایی سفارش
      const newOrder = await tx.order.create({
        data: {
          userId: payload.userId as string,
          totalPrice,
          addressId: body.addressId,

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
          status: initialStatus as any,

          items: {
            create: orderItemsToCreate,
          },
        },
      });

      return newOrder;
    });

    return NextResponse.json(order);

  } catch (error: any) {
    console.error("Order Checkout Error:", error);
    // بازگرداندن خطای معنادار (مثل موجودی ناکافی) به فرانت‌اند
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 400 });
  }
}