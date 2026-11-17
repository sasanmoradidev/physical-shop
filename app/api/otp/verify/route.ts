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

    if (!otpRequest) {
      return NextResponse.json(
        { error: "کدی برای این شماره یافت نشد. لطفاً کد جدید دریافت کنید.", maxAttemptsReached: true },
        { status: 400 }
      );
    }

    if (new Date() > otpRequest.expiresAt) {
      await prisma.otpRequest.delete({ where: { phone } });
      return NextResponse.json(
        { error: "کد تایید منقضی شده است. مجدداً کد بگیرید.", maxAttemptsReached: true },
        { status: 400 }
      );
    }

    if (otpRequest.code !== code) {
      const nextAttempts = otpRequest.attempts + 1;

      if (nextAttempts >= 5) {
        await prisma.otpRequest.delete({ where: { phone } });
        return NextResponse.json(
          {
            error: "تعداد تلاش‌های ناموفق بیش از حد مجاز بود. لطفاً کد جدید دریافت کنید.",
            maxAttemptsReached: true,
          },
          { status: 400 }
        );
      }

      await prisma.otpRequest.update({
        where: { phone },
        data: { attempts: nextAttempts },
      });

      return NextResponse.json(
        {
          error: `کد تایید وارد شده نامعتبر است. (${(5 - nextAttempts).toLocaleString("fa-IR")} تلاش باقی‌مانده)`,
        },
        { status: 400 }
      );
    }

    await prisma.otpRequest.delete({ where: { phone } });

    let user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      const randomPassword = await bcrypt.hash(crypto.randomUUID(), 10);
      user = await prisma.user.create({
        data: {
          name: `کاربر ${phone.slice(-4)}`,
          username: phone,
          phone,
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

    const host = req.headers.get("host") || "";
    const isLocalNetwork =
      host.includes("192.168") ||
      host.includes("10.95") ||
      host.includes("10.85") ||
      host.includes("localhost") ||
      host.includes("127.0.0.1");

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" && !isLocalNetwork,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}