// app/api/otp/verify/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/auth";
import bcrypt from "bcrypt";
import crypto from "crypto";

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

    // ۴. حذف کد استفاده شده از دیتابیس
    await prisma.otpRequest.delete({
      where: { phone },
    });

    // ۵. بررسی وجود کاربر بر اساس شماره همراه
    let user = await prisma.user.findUnique({
      where: { phone },
    });

    // ۶. ثبت‌نام خودکار در صورت اولین ورود (با پر کردن فیلدهای اجباری username و password)
    if (!user) {
      const randomPassword = await bcrypt.hash(crypto.randomUUID(), 10);
      user = await prisma.user.create({
        data: {
          name: `کاربر ${phone.slice(-4)}`,
          username: phone, // قرار دادن شماره موبایل به عنوان نام کاربری یکتا
          phone: phone,
          password: randomPassword,
          role: "USER",
        },
      });
    }

    // ۷. ساخت توکن JWT
    const token = await createToken({
      userId: user.id,
      role: user.role,
    });

    const response = NextResponse.json({ success: true, role: user.role });

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