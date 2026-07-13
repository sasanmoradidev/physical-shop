import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "OTP_ENABLED" },
    });

    return NextResponse.json({
      enabled: setting ? setting.value === "true" : true, // اگر هنوز تنظیمی ثبت نشده بود، پیش‌فرض روشن باشد
    });
  } catch {
    return NextResponse.json({ enabled: true });
  }
}