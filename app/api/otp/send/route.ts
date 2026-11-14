import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOtpSms } from "@/lib/sms";

export async function POST(req: Request) {
  try {
    const { phone, purpose = "LOGIN" } = await req.json();

    if (!phone || !/^09\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: "شماره موبایل معتبر نیست. (مثال: 09123456789)" },
        { status: 400 }
      );
    }

    // غیرفعال بودن OTP در تنظیمات، فقط برای تب «ورود با پیامک» اعمال شود نه «ثبت‌نام»
    if (purpose !== "REGISTER") {
      const otpSetting = await prisma.systemSetting.findUnique({
        where: { key: "OTP_ENABLED" },
      });

      if (otpSetting && otpSetting.value === "false") {
        return NextResponse.json(
          { error: "ورود با رمز یکبار مصرف در حال حاضر توسط مدیریت غیرفعال شده است." },
          { status: 403 }
        );
      }
    } else {
      const existingUser = await prisma.user.findUnique({
        where: { phone },
        select: { id: true },
      });
      if (existingUser) {
        return NextResponse.json(
          { error: "این شماره موبایل قبلاً ثبت‌نام شده است. لطفاً وارد شوید." },
          { status: 400 }
        );
      }
    }

    // محدودیت ارسال مجدد (حداقل ۶۰ ثانیه فاصله بین دو پیامک)
    const existingOtp = await prisma.otpRequest.findUnique({
      where: { phone },
    });
    if (existingOtp) {
      const remainingMs = existingOtp.expiresAt.getTime() - Date.now();
      // زمان انقضا ۳ دقیقه (۱۸۰ ثانیه) است؛ اگر بالای ۱۲۰ ثانیه مانده یعنی کمتر از ۶۰ ثانیه گذشته
      if (remainingMs > 2 * 60 * 1000) {
        return NextResponse.json(
          { error: "لطفاً ۱ دقیقه صبر کنید و سپس دوباره درخواست کد دهید." },
          { status: 429 }
        );
      }
    }

    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

    await prisma.otpRequest.upsert({
      where: { phone },
      update: { code, expiresAt },
      create: { phone, code, expiresAt },
    });

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