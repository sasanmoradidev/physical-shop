import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  // ۱. مدیریت صفحات پنل مدیریت (Admin Panel)
  if (pathname.startsWith("/admin")) {
    if (!token) {
      // هدایت کاربر به صفحه لاگین و ذخیره آدرس فعلی برای بازگشت هوشمند
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname + search);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const payload = await verifyToken(token);
      if (payload.role !== "ADMIN") {
        // کاربر لاگین شده است ولی ادمین نیست -> هدایت به صفحه عدم دسترسی یا صفحه اصلی
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    } catch {
      // توکن نامعتبر یا منقضی شده است -> هدایت به لاگین و پاک کردن توکن
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname + search);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("token"); // توکن معیوب را پاک می‌کنیم
      return response;
    }
  }

  // ۲. مدیریت صفحات کاربری معمولی (User Profile مانند ثبت آدرس جدید)
  if (pathname.startsWith("/profile")) {
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname + search);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // فقط بررسی می‌کنیم که توکن معتبر باشد (نقش کاربر فرقی نمی‌کند)
      await verifyToken(token);
    } catch {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname + search);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("token");
      return response;
    }
  }

  // ۳. مدیریت کاربران لاگین‌شده که قصد ورود مجدد به صفحه لاگین را دارند
  if (pathname === "/login") {
    if (token) {
      try {
        const payload = await verifyToken(token);
        // اگر ادمین بود به پنل ادمین و اگر مشتری بود به پروفایل خودش منتقل شود
        const destination = payload.role === "ADMIN" ? "/admin" : "/profile";
        return NextResponse.redirect(new URL(destination, req.url));
      } catch {
        // اگر توکن نامعتبر بود، اجازه می‌دهیم صفحه لاگین باز شود
      }
    }
  }

  return NextResponse.next();
}

// اضافه کردن مسیرهای کاربری و صفحه لاگین به مچرها
export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/profile/:path*",
    "/login",
  ],
};