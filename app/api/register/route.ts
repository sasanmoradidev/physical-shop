// app/api/register/route.ts
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { createToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, username, password, phone, code } = body;

    if (!name || !username || !password || !phone || !code) {
      return NextResponse.json(
        { error: "تمامی فیلدها و کد تایید الزامی هستند." },
        { status: 400 }
      );
    }

    // ۱. بررسی صحت کد OTP در جدول OtpRequest
    const otpRequest = await prisma.otpRequest.findUnique({
      where: { phone },
    });

    if (!otpRequest || otpRequest.code !== code) {
      return NextResponse.json(
        { error: "کد تایید وارد شده نامعتبر است." },
        { status: 400 }
      );
    }

    if (new Date() > otpRequest.expiresAt) {
      return NextResponse.json(
        { error: "کد تایید منقضی شده است. مجدداً اقدام کنید." },
        { status: 400 }
      );
    }

    // ۲. حذف کد استفاده شده
    await prisma.otpRequest.delete({
      where: { phone },
    });

    // ۳. بررسی تکراری نبودن نام کاربری یا موبایل
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { phone }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "این نام کاربری یا شماره موبایل قبلاً ثبت شده است." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ۴. ساخت نهایی کاربر در دیتابیس
    const user = await prisma.user.create({
      data: {
        name,
        username,
        password: hashedPassword,
        phone,
      },
    });

    // ۵. ساخت توکن و لاگین خودکار
    const token = await createToken({
      userId: user.id,
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, username: user.username, role: user.role },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "خطای سرور در فرآیند ثبت‌نام" }, { status: 500 });
  }
}