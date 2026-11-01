// app/(store)/register/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { UserPlus, User, Phone, Lock, AtSign, ArrowLeft } from "lucide-react";

function RegisterForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/profile";

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e: React.FormEvent) {
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
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, phone, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("حساب کاربری شما با موفقیت ساخته شد!");
        window.location.href = callbackUrl;
      } else {
        setError(data.error || "خطا در ثبت‌نام. لطفاً دوباره تلاش کنید.");
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
        <h1 className="text-2xl font-bold text-zinc-950">ایجاد حساب کاربری</h1>
        <p className="text-xs text-zinc-400">برای ثبت سفارش و پیگیری خریدها در فروشگاه ثبت‌نام کنید.</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
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
          {loading ? "در حال ثبت اطلاعات..." : "ثبت‌نام و ورود"}
        </button>
      </form>

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