import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "نام کاربری و رمز عبور الزامی است." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json(
        { error: "نام کاربری یا رمز عبور اشتباه است." },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: "نام کاربری یا رمز عبور اشتباه است." },
        { status: 401 }
      );
    }

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
      role: user.role,
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
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}