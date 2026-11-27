import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { hasPermission, Permission } from "@/lib/rbac";

const ADMIN_ROUTE_PERMISSIONS: { prefix: string; permission: Permission }[] = [
  { prefix: "/admin/products", permission: "MANAGE_PRODUCTS" },
  { prefix: "/admin/brands", permission: "MANAGE_PRODUCTS" },
  { prefix: "/admin/categories", permission: "MANAGE_CATEGORIES" },
  { prefix: "/admin/orders", permission: "MANAGE_ORDERS" },
  { prefix: "/api/admin/orders", permission: "MANAGE_ORDERS" },
  { prefix: "/admin/transactions", permission: "MANAGE_ORDERS" },
  { prefix: "/admin/shipping", permission: "MANAGE_SHIPPING" },
  { prefix: "/admin/payments", permission: "MANAGE_PAYMENT" },
  { prefix: "/admin/users", permission: "MANAGE_USERS" },
  { prefix: "/admin/settings", permission: "MANAGE_SETTINGS" },
  { prefix: "/admin/homepage", permission: "MANAGE_PRODUCTS" },
  { prefix: "/api/admin/homepage", permission: "MANAGE_PRODUCTS" },
];

function getRequiredAdminPermission(pathname: string): Permission {
  const matched = ADMIN_ROUTE_PERMISSIONS.find((rule) =>
    pathname.startsWith(rule.prefix)
  );
  return matched ? matched.permission : "VIEW_ADMIN_DASHBOARD";
}

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (!token) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname + search);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const payload = await verifyToken(token);
      const requiredPermission = getRequiredAdminPermission(pathname);

      if (
        !hasPermission(payload.role, "VIEW_ADMIN_DASHBOARD") ||
        !hasPermission(payload.role, requiredPermission)
      ) {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    } catch {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname + search);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("token");
      return response;
    }
  }

  if (pathname.startsWith("/profile") || pathname.startsWith("/checkout")) {
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

  if (pathname === "/login" && token) {
    try {
      const payload = await verifyToken(token);
      const destination = hasPermission(payload.role, "VIEW_ADMIN_DASHBOARD")
        ? "/admin"
        : "/profile";
      return NextResponse.redirect(new URL(destination, req.url));
    } catch {
      // توکن نامعتبر است، صفحه لاگین باز بماند
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/profile/:path*",
    "/checkout/:path*",
    "/login",
  ],
};