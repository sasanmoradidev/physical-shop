import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { getFinalPrice } from "@/lib/product-price"; // 👈 ایمپورت تابع محاسباتی قیمت نهایی

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

    // واکشی شیوه ارسال انتخابی خریدار از دیتابیس
    const shippingMethod = await prisma.shippingMethod.findUnique({
      where: {
        id: body.shippingMethodId,
        isActive: true,
      },
    });

    if (!shippingMethod) {
      return NextResponse.json({ error: "روش ارسال انتخابی نامعتبر است" }, { status: 400 });
    }

    const items = body.items;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "سبد خرید خالی است" }, { status: 400 });
    }

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: items.map((item: any) => item.id),
        },
      },
    });

    if (products.length !== items.length) {
      return NextResponse.json({ error: "برخی محصولات دیگر وجود ندارند" }, { status: 400 });
    }

    // کنترل موجودی انبار محصولات پیش از ثبت سفارش
    for (const item of items) {
      const product = products.find((p) => p.id === item.id);

      if (!product) {
        return NextResponse.json({ error: "محصول یافت نشد" }, { status: 400 });
      }

      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `${product.title} موجودی کافی ندارد` }, { status: 400 });
      }
    }

    // ۱. محاسبه مجموع فاکتور کالاها بر اساس قیمت داینامیک تخفیف‌دار
    const subtotal = items.reduce((sum: number, item: any) => {
      const product = products.find((p) => p.id === item.id);
      if (!product) {
        throw new Error(`Product ${item.id} not found`);
      }

      // محاسبه قیمت نهایی کالا در زمان خرید با بررسی تخفیف‌های فعال
      const finalProductPrice = getFinalPrice({
        price: Number(product.price),
        offerPrice: product.offerPrice ? Number(product.offerPrice) : null,
        offerStartsAt: product.offerStartsAt,
        offerEndsAt: product.offerEndsAt,
      });

      return sum + finalProductPrice * item.quantity;
    }, 0);

    // مجموع کل قابل پرداخت (جمع اقلام تخفیف‌دار + هزینه ارسال)
    const totalPrice = subtotal + Number(shippingMethod.price);

    // ۲. ثبت نهایی رکورد سفارش همراه با هزینه و شناسه ارسال
    const order = await prisma.order.create({
      data: {
        userId: payload.userId as string,
        totalPrice,
        addressId: body.addressId,
        shippingMethodId: shippingMethod.id, // ثبت آی‌دی روش ارسال
        shippingCost: shippingMethod.price, // ثبت هزینه ارسال تایید شده

        // ثبت اقلام فاکتور با قیمت تخفیف‌دار نهایی شده
        items: {
          create: items.map((item: any) => {
            const product = products.find((p) => p.id === item.id);
            if (!product) {
              throw new Error(`Product ${item.id} not found`);
            }

            // محاسبه قیمت تکی تخفیف‌دار برای ثبت در فاکتور نهایی اقلام (مهم برای پایداری داده‌های فروش)
            const finalProductPrice = getFinalPrice({
              price: Number(product.price),
              offerPrice: product.offerPrice ? Number(product.offerPrice) : null,
              offerStartsAt: product.offerStartsAt,
              offerEndsAt: product.offerEndsAt,
            });

            return {
              productId: product.id,
              quantity: item.quantity,
              price: finalProductPrice, // 👈 ثبت قیمت نهایی پرداخت‌شده به جای قیمت خام قدیمی
            };
          }),
        },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}