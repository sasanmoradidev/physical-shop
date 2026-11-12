"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  // استیت‌های تب و تنظیمات
  const [loginMode, setLoginMode] = useState<"PASSWORD" | "OTP">("PASSWORD");
  const [otpEnabled, setOtpEnabled] = useState(true);

  // استیت‌های ورود با رمز عبور
  const [username, setUsername] = useState("admin@test.com");
  const [password, setPassword] = useState("123456");
  
  // استیت‌های ورود با پیامک
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpStep, setOtpStep] = useState<"SEND" | "VERIFY">("SEND");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // بررسی فعال بودن لاگین پیامکی از تنظیمات سایت
  useEffect(() => {
    fetch("/api/settings/otp-status")
      .then((res) => res.json())
      .then((data) => {
        setOtpEnabled(data.enabled);
      })
      .catch(() => setOtpEnabled(true));
  }, []);

  // هندلر ورود با رمز عبور
  async function handlePasswordLogin() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        window.location.href = callbackUrl;
      } else {
        setError("نام کاربری یا رمز عبور اشتباه است.");
      }
    } catch (err) {
      setError("خطا در ارتباط با سرور.");
    } finally {
      setLoading(false);
    }
  }

  // هندلر مرحله اول: ارسال پیامک
  async function handleSendOtp() {
    if (!phone || phone.length !== 11) {
      setError("شماره موبایل باید ۱۱ رقم باشد.");
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
        setOtpStep("VERIFY");
      } else {
        setError(data.error || "خطا در ارسال پیامک");
      }
    } catch (err) {
      setError("خطا در ارتباط با سرور.");
    } finally {
      setLoading(false);
    }
  }

  // هندلر مرحله دوم: تایید پیامک
  async function handleVerifyOtp() {
    if (!otpCode || otpCode.length < 4) {
      setError("کد تایید معتبر نیست.");
      return;
    }
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
        window.location.href = data.role === "ADMIN" ? "/admin" : callbackUrl;
      } else {
        setError(data.error || "کد تایید اشتباه است.");
      }
    } catch (err) {
      setError("خطا در ارتباط با سرور.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-white border border-zinc-100 rounded-3xl shadow-sm p-6 sm:p-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-zinc-950">ورود به حساب کاربری</h1>
        <p className="text-xs text-zinc-400">جهت دسترسی به امکانات سایت، وارد شوید.</p>
      </div>

      {otpEnabled && (
        <div className="flex bg-zinc-100 p-1 rounded-xl">
          <button
            onClick={() => { setLoginMode("PASSWORD"); setError(""); }}
            className={`flex-1 text-xs font-bold py-2.5 rounded-lg transition ${loginMode === "PASSWORD" ? "bg-white text-blue-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
          >
            با رمز عبور
          </button>
          <button
            onClick={() => { setLoginMode("OTP"); setError(""); setOtpStep("SEND"); }}
            className={`flex-1 text-xs font-bold py-2.5 rounded-lg transition ${loginMode === "OTP" ? "bg-white text-blue-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
          >
            با کد یکبار مصرف
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl flex items-center gap-2">
          <span>{error}</span>
        </div>
      )}

      {/* فرم ورود با رمز عبور */}
      {loginMode === "PASSWORD" && (
        <div className="space-y-5 animate-fade-in">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">نام کاربری یا ایمیل</label>
            <input
              type="text"
              dir="ltr"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">رمز عبور</label>
            <input
              type="password"
              dir="ltr"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="******"
              className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm font-medium"
            />
          </div>
          <button
            onClick={handlePasswordLogin}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm text-white shadow-sm transition bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400"
          >
            {loading ? "در حال بررسی..." : "ورود به حساب"}
          </button>
        </div>
      )}

      {/* فرم ورود با پیامک */}
      {loginMode === "OTP" && (
        <div className="space-y-5 animate-fade-in">
          {otpStep === "SEND" ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">شماره موبایل</label>
                <input
                  type="tel"
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09123456789"
                  className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm font-medium"
                />
              </div>
              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm text-white shadow-sm transition bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400"
              >
                {loading ? "در حال ارسال پیامک..." : "دریافت کد تایید"}
              </button>
            </>
          ) : (
            <>
              <div className="text-center pb-2">
                <span className="text-xs text-zinc-500">کد تایید به شماره {phone} ارسال شد. </span>
                <button onClick={() => setOtpStep("SEND")} className="text-xs text-blue-600 font-bold hover:underline">ویرایش شماره</button>
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">کد تایید پیامکی</label>
                <input
                  type="text"
                  dir="ltr"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="وارد کردن کد ۵ رقمی"
                  className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-center tracking-widest text-lg font-bold"
                />
              </div>
              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm text-white shadow-sm transition bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-400"
              >
                {loading ? "در حال بررسی..." : "تایید و ورود"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={
        <div className="w-full max-w-md bg-white border border-zinc-100 rounded-3xl shadow-sm p-6 sm:p-8 flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin h-8 w-8 text-blue-600 rounded-full border-4 border-zinc-200 border-t-blue-600" />
          <p className="text-zinc-500 text-sm">در حال بارگذاری...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}