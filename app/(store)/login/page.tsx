"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { hasPermission } from "@/lib/rbac";

function LoginForm() {
  const searchParams = useSearchParams();
  const explicitCallback = searchParams.get("callbackUrl");

  const [loginMode, setLoginMode] = useState<"PASSWORD" | "OTP">("PASSWORD");
  const [otpEnabled, setOtpEnabled] = useState(true);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpStep, setOtpStep] = useState<"SEND" | "VERIFY">("SEND");
  const [countdown, setCountdown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/settings/otp-status")
      .then((res) => res.json())
      .then((data) => setOtpEnabled(data.enabled))
      .catch(() => setOtpEnabled(true));
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  function getRedirectTarget(role?: string) {
    if (explicitCallback) return explicitCallback;
    if (role && hasPermission(role, "VIEW_ADMIN_DASHBOARD")) return "/admin";
    return "/profile";
  }

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

      const data = await res.json();
      if (res.ok) {
        window.location.assign(getRedirectTarget(data.role));
      } else {
        setError(data.error || "نام کاربری یا رمز عبور اشتباه است.");
      }
    } catch {
      setError("خطا در ارتباط با سرور.");
    } finally {
      setLoading(false);
    }
  }

  async function requestOtp(isResend = false) {
    if (!phone || phone.length !== 11) {
      setError("شماره موبایل باید ۱۱ رقم باشد.");
      return;
    }

    if (isResend) setResending(true);
    else setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, purpose: "LOGIN" }),
      });
      const data = await res.json();

      if (res.ok) {
        setOtpStep("VERIFY");
        setOtpCode("");
        setCountdown(60);
      } else {
        if (res.status === 429 && typeof data.retryAfter === "number") {
          setCountdown(data.retryAfter);
        }
        setError(data.error || "خطا در ارسال پیامک");
      }
    } catch {
      setError("خطا در ارتباط با سرور.");
    } finally {
      setLoading(false);
      setResending(false);
    }
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    await requestOtp(false);
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
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
        window.location.assign(getRedirectTarget(data.role));
      } else {
        if (data.maxAttemptsReached) {
          setOtpStep("SEND");
          setOtpCode("");
          setCountdown(0);
        }
        setError(data.error || "کد تایید اشتباه است.");
      }
    } catch {
      setError("خطا در ارتباط با سرور.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-white border border-zinc-100 rounded-3xl shadow-sm p-6 sm:p-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-brand-soft text-brand rounded-2xl flex items-center justify-center mb-4">
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
            type="button"
            onClick={() => { setLoginMode("PASSWORD"); setError(""); }}
            className={`flex-1 text-xs font-bold py-2.5 rounded-lg transition ${loginMode === "PASSWORD" ? "bg-white text-brand shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
          >
            با رمز عبور
          </button>
          <button
            type="button"
            onClick={() => { setLoginMode("OTP"); setError(""); setOtpStep("SEND"); }}
            className={`flex-1 text-xs font-bold py-2.5 rounded-lg transition ${loginMode === "OTP" ? "bg-white text-brand shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
          >
            با کد یکبار مصرف
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl">
          {error}
        </div>
      )}

      {loginMode === "PASSWORD" && (
        <form onSubmit={handlePasswordLogin} className="space-y-5 animate-fade-in">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">نام کاربری یا موبایل</label>
            <input
              type="text"
              dir="ltr"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition text-sm font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">رمز عبور</label>
            <input
              type="password"
              dir="ltr"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="******"
              className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition text-sm font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm text-brand-foreground shadow-sm transition bg-brand hover:bg-brand-hover disabled:bg-zinc-400"
          >
            {loading ? "در حال بررسی..." : "ورود به حساب"}
          </button>
        </form>
      )}

      {loginMode === "OTP" && (
        <div className="space-y-5 animate-fade-in">
          {otpStep === "SEND" ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">شماره موبایل</label>
                <input
                  type="tel"
                  dir="ltr"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09123456789"
                  className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition text-sm font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={loading || countdown > 0}
                className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm text-brand-foreground shadow-sm transition bg-brand hover:bg-brand-hover disabled:bg-zinc-400"
              >
                {loading
                  ? "در حال ارسال پیامک..."
                  : countdown > 0
                    ? `صبر کنید (${countdown.toLocaleString("fa-IR")} ثانیه)`
                    : "دریافت کد تایید"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="text-center pb-1">
                <span className="text-xs text-zinc-500">کد تایید به شماره {phone} ارسال شد. </span>
                <button
                  type="button"
                  onClick={() => { setOtpStep("SEND"); setError(""); }}
                  className="text-xs text-brand font-bold hover:underline"
                >
                  ویرایش شماره
                </button>
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">کد تایید پیامکی</label>
                <input
                  type="text"
                  dir="ltr"
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="کد ۵ رقمی"
                  className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition text-center tracking-widest text-lg font-bold"
                />
              </div>

              <div className="text-center text-xs">
                {countdown > 0 ? (
                  <span className="text-zinc-400 font-medium">
                    ارسال مجدد کد تا{" "}
                    <span className="font-bold text-zinc-700">
                      {countdown.toLocaleString("fa-IR")}
                    </span>{" "}
                    ثانیه دیگر
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={resending || loading}
                    onClick={() => requestOtp(true)}
                    className="text-brand hover:underline font-bold disabled:opacity-50"
                  >
                    {resending ? "در حال ارسال مجدد..." : "ارسال مجدد کد تایید"}
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm text-white shadow-sm transition bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-400"
              >
                {loading ? "در حال بررسی..." : "تایید و ورود"}
              </button>
            </form>
          )}
        </div>
      )}

      <div className="pt-4 border-t border-zinc-100 text-center text-xs text-zinc-500">
        حساب کاربری ندارید؟{" "}
        <Link
          href={explicitCallback ? `/register?callbackUrl=${encodeURIComponent(explicitCallback)}` : "/register"}
          className="text-brand hover:underline font-bold"
        >
          ثبت‌نام کنید
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={
        <div className="w-full max-w-md bg-white border border-zinc-100 rounded-3xl shadow-sm p-6 sm:p-8 flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin h-8 w-8 text-brand rounded-full border-4 border-zinc-200 border-t-brand" />
          <p className="text-zinc-500 text-sm">در حال بارگذاری...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}