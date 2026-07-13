import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOtpSms } from "@/lib/sms";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    // اعتبارسنجی فرمت شماره موبایل‌های ایران
    if (!phone || !/^09\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: "شماره موبایل معتبر نیست. (مثال: 09123456789)" },
        { status: 400 }
      );
    }

    // ۱. بررسی وضعیت فعال یا غیرفعال بودن ورود پیامکی
    const otpSetting = await prisma.systemSetting.findUnique({
      where: { key: "OTP_ENABLED" },
    });

    if (otpSetting && otpSetting.value === "false") {
      return NextResponse.json(
        { error: "ورود با رمز یکبار مصرف در حال حاضر توسط مدیریت غیرفعال شده است." },
        { status: 403 }
      );
    }

    // ۲. تولید کد ۵ رقمی و تعیین زمان انقضا برای ۳ دقیقه بعد
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

    // ۳. ثبت در جدول OtpRequest (اگر قبلاً کدی فرستاده شده بود، آن را آپدیت می‌کند)
    await prisma.otpRequest.upsert({
      where: { phone },
      update: { code, expiresAt },
      create: { phone, code, expiresAt },
    });

    // ۴. ارسال پیامک واقعی یا تست محلی
    const isSent = await sendOtpSms(phone, code);
    if (!isSent) {
      return NextResponse.json(
        { error: "خطا در ارسال پیامک. لطفاً دقایقی دیگر تلاش کنید." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, message: "کد تایید ارسال شد." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}