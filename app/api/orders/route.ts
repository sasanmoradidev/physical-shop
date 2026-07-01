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

    // واکشی شیوه ارسال انتخابی خریدار
    const shippingMethod = await prisma.shippingMethod.findUnique({
      where: {
        id: body.shippingMethodId,
        isActive: true,
      },
    });

    if (!shippingMethod) {
      return NextResponse.json({ error: "روش ارسال انتخابی نامعتبر است" }, { status: 400 });
    }

    // واکشی شیوه پرداخت انتخابی خریدار
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

    // محاسبه قیمت کالاها با اعمال تخفیف‌های فعال
    const subtotal = items.reduce((sum: number, item: any) => {
      const product = products.find((p) => p.id === item.id);
      if (!product) {
        throw new Error(`Product ${item.id} not found`);
      }

      const finalProductPrice = getFinalPrice({
        price: Number(product.price),
        offerPrice: product.offerPrice ? Number(product.offerPrice) : null,
        offerStartsAt: product.offerStartsAt,
        offerEndsAt: product.offerEndsAt,
      });

      return sum + finalProductPrice * item.quantity;
    }, 0);

    // مجموع کل قابل پرداخت
    const totalPrice = subtotal + Number(shippingMethod.price);

    // اگر پرداخت در محل (COD) انتخاب شده باشد، وضعیت سفارش مستقیماً PROCESSING (در حال پردازش) می‌شود
    const initialStatus = paymentMethod.code === "COD" ? "PROCESSING" : "PENDING";

    // ۱. واکشی اطلاعات آدرس انتخابی مشتری
    const address = await prisma.address.findUnique({
      where: { id: body.addressId },
    });

    if (!address) {
      return NextResponse.json({ error: "آدرس معتبر یافت نشد" }, { status: 404 });
    }

    // ثبت فاکتور نهایی سفارش با ارتباطات روش ارسال و پرداخت
    const order = await prisma.order.create({
      data: {
        userId: payload.userId as string,
        totalPrice,
        addressId: body.addressId,

        // کپی داده‌ها به فیلدهای اسنپ‌شات
        shippingTitle: address.title,
        shippingFullName: address.fullName,
        shippingPhone: address.phone,
        shippingProvince: address.province,
        shippingCity: address.city,
        shippingAddressLine: address.addressLine,
        shippingPostalCode: address.postalCode,

        shippingMethodId: shippingMethod.id,
        shippingCost: shippingMethod.price,
        paymentMethodId: paymentMethod.id, // ثبت شناسه روش پرداخت انتخابی خریدار
        status: initialStatus as any, // تخصیص وضعیت اولیه بر اساس نوع پرداخت

        items: {
          create: items.map((item: any) => {
            const product = products.find((p) => p.id === item.id);
            if (!product) {
              throw new Error(`Product ${item.id} not found`);
            }

            const finalProductPrice = getFinalPrice({
              price: Number(product.price),
              offerPrice: product.offerPrice ? Number(product.offerPrice) : null,
              offerStartsAt: product.offerStartsAt,
              offerEndsAt: product.offerEndsAt,
            });

            return {
              productId: product.id,
              quantity: item.quantity,
              price: finalProductPrice,
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