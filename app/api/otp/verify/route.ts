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

    const otpRequest = await prisma.otpRequest.findUnique({
      where: { phone },
    });

    if (!otpRequest || otpRequest.code !== code) {
      return NextResponse.json({ error: "کد تایید وارد شده نامعتبر است." }, { status: 400 });
    }

    if (new Date() > otpRequest.expiresAt) {
      return NextResponse.json({ error: "کد تایید منقضی شده است. مجدداً اقدام کنید." }, { status: 400 });
    }

    await prisma.otpRequest.delete({
      where: { phone },
    });

    let user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      const randomPassword = await bcrypt.hash(crypto.randomUUID(), 10);
      user = await prisma.user.create({
        data: {
          name: `کاربر ${phone.slice(-4)}`,
          username: phone, 
          phone: phone,
          password: randomPassword,
          role: "USER",
        },
      });
    }

    const token = await createToken({
      userId: user.id,
      role: user.role,
    });

    const response = NextResponse.json({ success: true, role: user.role });

    // 👇 تشخیص اینکه آیا کاربر روی شبکه محلی است یا دامنه واقعی
    const host = req.headers.get("host") || "";
    const isLocalNetwork = host.includes("192.168") || host.includes("10.95") || host.includes("10.85") || host.includes("localhost") || host.includes("127.0.0.1");

    response.cookies.set("token", token, {
      httpOnly: true,
      // 👇 اگر روی سرور واقعی بودیم (HTTPS) ترو می‌شود، اگر روی شبکه محلی بودیم فالز می‌شود
      secure: process.env.NODE_ENV === "production" && !isLocalNetwork,
      sameSite: "lax", // 👈 این مورد هم برای گوشی‌ها به شدت توصیه می‌شود
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}