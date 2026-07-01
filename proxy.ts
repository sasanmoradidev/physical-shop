// مسیر فایل جدید: src/proxy.ts یا proxy.ts در ریشه پروژه

import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// نام تابع از middleware به proxy تغییر یافته است
export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  // ۱. مدیریت صفحات پنل مدیریت (Admin Panel)
  if (pathname.startsWith("/admin")) {
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname + search);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const payload = await verifyToken(token);
      if (payload.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    } catch {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname + search);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("token");
      return response;
    }
  }

  // ۲. مدیریت صفحات کاربری معمولی (User Profile)
  if (pathname.startsWith("/profile")) {
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname + search);
      return NextResponse.redirect(loginUrl);
    }

    try {
      await verifyToken(token);
    } catch {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname + search);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("token");
      return response;
    }
  }

  // ۳. مدیریت کاربران لاگین‌شده در صفحه لاگین
  if (pathname === "/login") {
    if (token) {
      try {
        const payload = await verifyToken(token);
        const destination = payload.role === "ADMIN" ? "/admin" : "/profile";
        return NextResponse.redirect(new URL(destination, req.url));
      } catch {
        // در صورت عدم اعتبار توکن، کاری انجام نمی‌دهیم تا صفحه لاگین باز شود
      }
    }
  }

  return NextResponse.next();
}

// مچرها بدون هیچ تغییری کار می‌کنند
export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/profile/:path*",
    "/login",
  ],
};