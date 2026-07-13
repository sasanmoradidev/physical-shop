import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/auth"; // متد ساخت توکن jose شما

export async function POST(req: Request) {
  try {
    const { phone, code } = await req.json();

    if (!phone || !code) {
      return NextResponse.json({ error: "اطلاعات ارسالی ناقص است." }, { status: 400 });
    }

    // ۱. واکشی درخواست تایید از دیتابیس
    const otpRequest = await prisma.otpRequest.findUnique({
      where: { phone },
    });

    // ۲. اعتبارسنجی کد ارسالی
    if (!otpRequest || otpRequest.code !== code) {
      return NextResponse.json({ error: "کد تایید وارد شده نامعتبر است." }, { status: 400 });
    }

    // ۳. بررسی انقضا
    if (new Date() > otpRequest.expiresAt) {
      return NextResponse.json({ error: "کد تایید منقضی شده است. مجدداً اقدام کنید." }, { status: 400 });
    }

    // ۴. حذف کد استفاده شده از دیتابیس (برای رعایت مسائل امنیتی و مصرف نشدن دوباره کد)
    await prisma.otpRequest.delete({
      where: { phone },
    });

    // ۵. بررسی وجود کاربر بر اساس شماره همراه
    let user = await prisma.user.findUnique({
      where: { phone },
    });

    // ۶. ثبت‌نام خودکار در صورت اولین ورود
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: `کاربر ${phone.slice(-4)}`, // به عنوان نام پیش‌فرض، ۴ رقم آخر شماره موبایل را ثبت می‌کنیم
          phone: phone,
          role: "USER",
          // فیلدهای ایمیل و پسورد برای کاربران OTP خالی (null) می‌مانند
        },
      });
    }

    // ۷. ساخت توکن JWT (دقیقاً مشابه منطق ورود با پسورد شما)
    const token = await createToken({
      userId: user.id,
      role: user.role,
    });

    const response = NextResponse.json({ success: true, role: user.role });

    // ذخیره توکن در کوکی مرورگر به عنوان HTTP-Only
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // ۷ روز
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}