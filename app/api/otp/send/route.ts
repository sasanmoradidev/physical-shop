import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOtpSms } from "@/lib/sms";

const OTP_TTL_MS = 3 * 60 * 1000;       // اعتبار کد: ۳ دقیقه
const RESEND_COOLDOWN_MS = 60 * 1000;   // فاصله مجاز بین دو ارسال: ۶۰ ثانیه

export async function POST(req: Request) {
  try {
    const { phone, purpose = "LOGIN" } = await req.json();

    if (!phone || !/^09\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: "شماره موبایل معتبر نیست. (مثال: 09123456789)" },
        { status: 400 }
      );
    }

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

    const existingOtp = await prisma.otpRequest.findUnique({
      where: { phone },
    });

    if (existingOtp) {
      const remainingMs = existingOtp.expiresAt.getTime() - Date.now();
      const cooldownThreshold = OTP_TTL_MS - RESEND_COOLDOWN_MS;

      if (remainingMs > cooldownThreshold) {
        const retryAfter = Math.ceil((remainingMs - cooldownThreshold) / 1000);
        return NextResponse.json(
          {
            error: `لطفاً ${retryAfter.toLocaleString("fa-IR")} ثانیه صبر کنید و دوباره درخواست دهید.`,
            retryAfter,
          },
          { status: 429 }
        );
      }
    }

    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    await prisma.otpRequest.upsert({
      where: { phone },
      update: { code, expiresAt, attempts: 0 },
      create: { phone, code, expiresAt, attempts: 0 },
    });

    const isSent = await sendOtpSms(phone, code);
    if (!isSent) {
      await prisma.otpRequest.delete({ where: { phone } }).catch(() => {});
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