import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const methods = await prisma.shippingMethod.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      price: "asc", // مرتب‌سازی از ارزان‌ترین به گران‌ترین
    },
  });

  return NextResponse.json(methods);
}