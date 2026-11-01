// app/(store)/login/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Lock, User, Phone, KeyRound, ArrowLeft } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/profile";

  // وضعیت فعال بودن OTP در تنظیمات سایت
  const [otpEnabled, setOtpEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState<"password" | "otp">("password");

  // استیت‌های ورود با نام کاربری و رمز عبور
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // استیت‌های ورود با پیامک (OTP)
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/settings/otp-status")
      .then((res) => res.json())
      .then((data) => {
        if (data?.enabled) {
          setOtpEnabled(true);
        }
      })
      .catch(() => {});
  }, []);

  // ۱. تابع ورود با نام کاربری و رمز عبور
  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        toast.success("خوش آمدید!");
        window.location.href = callbackUrl;
      } else {
        setError("نام کاربری یا رمز عبور وارد شده نادرست است.");
      }
    } catch {
      setError("خطایی در برقراری ارتباط با سرور رخ داده است.");
    } finally {
      setLoading(false);
    }
  }

  // ۲. تابع ارسال کد تایید پیامکی
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!/^09\d{9}$/.test(phone)) {
      setError("لطفاً یک شماره موبایل معتبر ۱۱ رقمی (با شروع 09) وارد کنید.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (res.ok) {
        setOtpSent(true);
        toast.success("کد تایید به شماره موبایل شما ارسال شد.");
      } else {
        setError(data.error || "خطا در ارسال پیامک کد تایید.");
      }
    } catch {
      setError("خطایی در ارتباط با سرور رخ داده است.");
    } finally {
      setLoading(false);
    }
  }

  // ۳. تابع تایید کد پیامکی و ورود
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otpCode }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("ورود با موفقیت انجام شد!");
        window.location.href = callbackUrl;
      } else {
        setError(data.error || "کد تایید نامعتبر است.");
      }
    } catch {
      setError("خطایی در ارتباط با سرور رخ داده است.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-white border border-zinc-100 rounded-3xl shadow-sm p-6 sm:p-8 space-y-6 animate-fade-in">
      {/* هدر بخش لاگین */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-950">ورود به حساب کاربری</h1>
        <p className="text-xs text-zinc-400">جهت دسترسی به پنل کاربری اطلاعات خود را وارد کنید.</p>
      </div>

      {/* تب‌های انتخاب روش ورود (فقط در صورت فعال بودن OTP نمایش داده می‌شود) */}
      {otpEnabled && (
        <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100/80 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab("password");
              setError("");
            }}
            className={`py-2.5 rounded-xl transition-all ${
              activeTab === "password"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            نام کاربری و رمز
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("otp");
              setError("");
            }}
            className={`py-2.5 rounded-xl transition-all ${
              activeTab === "otp"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            ورود با پیامک (OTP)
          </button>
        </div>
      )}

      {/* نمایش خطا */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl flex items-center gap-2">
          <span>{error}</span>
        </div>
      )}

      {/* حالت اول: فرم ورود با نام کاربری و رمز عبور */}
      {activeTab === "password" ? (
        <form onSubmit={handlePasswordLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-zinc-600 mb-2">نام کاربری</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                dir="ltr"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
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
                placeholder="******"
                required
                className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-xs font-semibold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs text-white shadow-sm transition-all flex items-center justify-center gap-2 ${
              loading ? "bg-zinc-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "در حال بررسی اطلاعات..." : "ورود به حساب کاربری"}
          </button>
        </form>
      ) : (
        /* حالت دوم: فرم ورود با رمز یکبار مصرف پیامکی */
        <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-zinc-600 mb-2">شماره موبایل</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                <Phone className="w-4 h-4" />
              </span>
              <input
                type="tel"
                dir="ltr"
                disabled={otpSent}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09123456789"
                required
                className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-xs font-semibold disabled:opacity-60"
              />
            </div>
          </div>

          {otpSent && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-zinc-600">کد تایید ۵ رقمی</label>
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtpCode("");
                  }}
                  className="text-[10px] text-blue-600 hover:underline font-bold"
                >
                  ویرایش شماره
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
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs text-white shadow-sm transition-all flex items-center justify-center gap-2 ${
              loading ? "bg-zinc-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading
              ? "لطفاً صبر کنید..."
              : otpSent
              ? "تایید کد و ورود"
              : "ارسال کد تایید"}
          </button>
        </form>
      )}

      {/* لینک رفتن به صفحه ثبت‌نام */}
      <div className="pt-4 border-t border-zinc-100 text-center text-xs text-zinc-500 flex items-center justify-center gap-1.5">
        <span>حساب کاربری ندارید؟</span>
        <Link
          href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="text-blue-600 hover:text-blue-700 font-bold inline-flex items-center gap-1"
        >
          <span>ثبت‌نام در فروشگاه</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Suspense
        fallback={
          <div className="w-full max-w-md bg-white border border-zinc-100 rounded-3xl shadow-sm p-8 flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin h-8 w-8 text-blue-600 rounded-full border-4 border-zinc-200 border-t-blue-600" />
            <p className="text-zinc-500 text-xs font-semibold">در حال بارگذاری فرم ورود...</p>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}