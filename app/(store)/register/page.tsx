// app/(store)/register/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { UserPlus, User, Phone, Lock, AtSign, ArrowLeft, KeyRound } from "lucide-react";

function RegisterForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/profile";

  // استیت‌های فرم ثبت‌نام اولیه
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // استیت‌های مدیریت مرحله‌ی OTP
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otpCode, setOtpCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // مرحله ۱: ارسال اطلاعات اولیه و درخواست ارسال کد OTP برای شماره موبایل
  async function handleInitialRegister(e: React.FormEvent) {
    e.preventDefault();

    if (!/^09\d{9}$/.test(phone)) {
      setError("لطفاً شماره موبایل را به صورت ۱۱ رقمی با شروع 09 وارد کنید.");
      return;
    }

    if (password.length < 6) {
      setError("رمز عبور باید حداقل ۶ کاراکتر باشد.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // درخواست ارسال کد تایید به شماره موبایل کاربر جدید
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (res.ok) {
        setStep("otp"); // رفتن به مرحله دوم (وارد کردن کد تایید)
        toast.success("کد تایید به شماره موبایل شما ارسال شد.");
      } else {
        setError(data.error || "خطا در ارسال کد تایید.");
      }
    } catch {
      setError("خطایی در ارتباط با سرور رخ داده است.");
    } finally {
      setLoading(false);
    }
  }

  // مرحله ۲: تایید کد OTP و ساخت نهایی حساب کاربری در دیتابیس
  async function handleVerifyAndRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, phone, password, code: otpCode }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("حساب کاربری شما با موفقیت ایجاد شد!");
        window.location.href = callbackUrl;
      } else {
        setError(data.error || "کد تایید نامعتبر یا منقضی شده است.");
      }
    } catch {
      setError("خطایی در ارتباط با سرور رخ داده است.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-white border border-zinc-100 rounded-3xl shadow-sm p-6 sm:p-8 space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
          <UserPlus className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-950">
          {step === "form" ? "ایجاد حساب کاربری" : "تایید شماره موبایل"}
        </h1>
        <p className="text-xs text-zinc-400">
          {step === "form"
            ? "اطلاعات خود را وارد کنید تا کد تایید برایتان ارسال شود."
            : `کد تایید ۵ رقمی ارسال شده به شماره ${phone} را وارد کنید.`}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl">
          {error}
        </div>
      )}

      {step === "form" ? (
        /* فرم اطلاعات ثبت‌نام */
        <form onSubmit={handleInitialRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-600 mb-2">نام و نام خانوادگی</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: علی محمدی"
                required
                className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-xs font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-600 mb-2">نام کاربری (انگلیسی)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                <AtSign className="w-4 h-4" />
              </span>
              <input
                type="text"
                dir="ltr"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ali_mohammadi"
                required
                className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-xs font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-600 mb-2">شماره موبایل</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                <Phone className="w-4 h-4" />
              </span>
              <input
                type="tel"
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09123456789"
                required
                className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-xs font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-600 mb-2">رمز عبور</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="حداقل ۶ کاراکتر"
                required
                className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-xs font-semibold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs text-white shadow-sm transition-all flex items-center justify-center gap-2 mt-2 ${
              loading ? "bg-zinc-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "در حال ارسال کد تایید..." : "مرحله بعد و ارسال کد"}
          </button>
        </form>
      ) : (
        /* فرم ورود کد تایید OTP برای اتمام ثبت‌نام */
        <form onSubmit={handleVerifyAndRegister} className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-zinc-600">کد تایید پیامکی</label>
              <button
                type="button"
                onClick={() => setStep("form")}
                className="text-[10px] text-blue-600 hover:underline font-bold"
              >
                اصلاح اطلاعات ثبت‌نام
              </button>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                <KeyRound className="w-4 h-4" />
              </span>
              <input
                type="text"
                dir="ltr"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="12345"
                required
                className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-center tracking-widest text-sm font-extrabold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs text-white shadow-sm transition-all flex items-center justify-center gap-2 mt-2 ${
              loading ? "bg-zinc-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {loading ? "در حال بررسی و ایجاد حساب..." : "تایید کد و اتمام ثبت‌نام"}
          </button>
        </form>
      )}

      <div className="pt-4 border-t border-zinc-100 text-center text-xs text-zinc-500 flex items-center justify-center gap-1.5">
        <span>قبلاً ثبت‌نام کرده‌اید؟</span>
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="text-blue-600 hover:text-blue-700 font-bold inline-flex items-center gap-1"
        >
          <span>ورود به حساب</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={null}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}