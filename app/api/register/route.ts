// app/api/register/route.ts
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { createToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, username, password, phone } = body;

    if (!name || !username || !password || !phone) {
      return NextResponse.json(
        { error: "تمامی فیلدها الزامی هستند." },
        { status: 400 }
      );
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: "این نام کاربری قبلاً ثبت شده است." },
        { status: 400 }
      );
    }

    const existingPhone = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingPhone) {
      return NextResponse.json(
        { error: "این شماره موبایل قبلاً در سیستم ثبت شده است." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        username,
        password: hashedPassword,
        phone,
      },
    });

    // ساخت توکن و لاگین خودکار پس از ثبت‌نام
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
    return NextResponse.json({ error: "خطای سرور در ثبت‌نام" }, { status: 500 });
  }
}