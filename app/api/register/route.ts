import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { createToken } from "@/lib/auth";

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

    const otpRequest = await prisma.otpRequest.findUnique({
      where: { phone },
    });

    if (!otpRequest) {
      return NextResponse.json(
        { error: "کد تاییدی یافت نشد. لطفاً دوباره کد بگیرید.", maxAttemptsReached: true },
        { status: 400 }
      );
    }

    if (new Date() > otpRequest.expiresAt) {
      await prisma.otpRequest.delete({ where: { phone } });
      return NextResponse.json(
        { error: "کد تایید منقضی شده است. مجدداً اقدام کنید.", maxAttemptsReached: true },
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

    await prisma.otpRequest.delete({ where: { phone } });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        username,
        password: hashedPassword,
        phone,
      },
    });

    const token = await createToken({
      userId: user.id,
      role: user.role,
    });

    const host = req.headers.get("host") || "";
    const isLocalNetwork =
      host.includes("192.168") ||
      host.includes("10.95") ||
      host.includes("10.85") ||
      host.includes("localhost") ||
      host.includes("127.0.0.1");

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, username: user.username, role: user.role },
    });

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
    return NextResponse.json({ error: "خطای سرور در فرآیند ثبت‌نام" }, { status: 500 });
  }
}