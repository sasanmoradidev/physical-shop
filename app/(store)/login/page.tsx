"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// بخش فرم لاگین را جدا می‌کنیم تا بتوانیم آن را در Suspense قرار دهیم
function LoginForm() {
  const searchParams = useSearchParams();
  
  // خواندن پارامتر callbackUrl از آدرس‌بار (اگر نبود، به صورت پیش‌فرض به /admin می‌رود)
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [email, setEmail] = useState("admin@test.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function login() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (res.ok) {
        console.log("LOGIN SUCCESS");
        // هدایت هوشمند کاربر به صفحه‌ای که قبلاً می‌خواسته برود (مثلاً ثبت آدرس)
        window.location.href = callbackUrl;
      } else {
        setError("ایمیل یا رمز عبور وارد شده نادرست است.");
      }
    } catch (err) {
      setError("خطایی در برقراری ارتباط با سرور رخ داده است.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-white border border-zinc-100 rounded-3xl shadow-sm p-6 sm:p-8 space-y-6">
      
      {/* هدر بخش لاگین */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-zinc-950">ورود به حساب کاربری</h1>
        <p className="text-xs text-zinc-400">جهت دسترسی به پنل کاربری اطلاعات خود را وارد کنید.</p>
      </div>

      {/* نمایش خطای لاگین */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-5">
        {/* فیلد ایمیل */}
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-2">
            نشانی ایمیل
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
              </svg>
            </span>
            <input
              type="email"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
              className="w-full pl-11 pr-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-400 text-sm font-medium"
            />
          </div>
        </div>

        {/* فیلد رمز عبور */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-zinc-700">
              رمز عبور
            </label>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </span>
            <input
              type="password"
              dir="ltr"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="******"
              required
              className="w-full pl-11 pr-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-400 text-sm font-medium"
            />
          </div>
        </div>

        {/* دکمه ورود */}
        <button
          onClick={login}
          disabled={loading}
          className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm text-white shadow-sm transition-all flex items-center justify-center gap-2 ${
            loading 
              ? "bg-zinc-400 cursor-not-allowed" 
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              در حال بررسی اطلاعات...
            </span>
          ) : (
            <span>ورود به حساب کاربری</span>
          )}
        </button>
      </div>

    </div>
  );
}

// کامپوننت اصلی صفحه که کل ساختار را در بر می‌گیرد و فرم را در یک لایه امنیتی Suspense لود می‌کند
export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={
        <div className="w-full max-w-md bg-white border border-zinc-100 rounded-3xl shadow-sm p-6 sm:p-8 flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin h-8 w-8 text-blue-600 rounded-full border-4 border-zinc-200 border-t-blue-600" />
          <p className="text-zinc-500 text-sm">در حال بارگذاری فرم ورود...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}