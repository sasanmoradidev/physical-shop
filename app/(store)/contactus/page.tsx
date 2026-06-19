"use client";

import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      // شبیه‌سازی ارسال اطلاعات به API تماس با ما
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSuccess(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err) {
      console.error("خطا در ارسال پیام", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      
      {/* سربرگ صفحه */}
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
        <h1 className="text-3xl font-extrabold text-zinc-900">تماس با ما</h1>
        <p className="text-sm text-zinc-500 leading-relaxed">
          سؤال، پیشنهاد یا انتقادی دارید؟ از طریق فرم زیر پیام خود را برای ما ارسال کنید. تیم پشتیبانی ما در سریع‌ترین زمان ممکن پاسخگوی شما خواهد بود.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* ستون راست: اطلاعات ارتباطی و فرم تماس */}
        <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
          
          {/* کارت‌های اطلاعات تماس سریع */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* تلفن */}
            <div className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <span className="text-xs text-zinc-400">تلفن تماس</span>
              <span className="text-sm font-semibold text-zinc-800" dir="ltr">۰۲۱-۸۸۸۸۸۸۸۸</span>
            </div>

            {/* ایمیل */}
            <div className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xs text-zinc-400">ایمیل پشتیبانی</span>
              <span className="text-sm font-semibold text-zinc-800 break-all">info@example.com</span>
            </div>

            {/* آدرس حضوری */}
            <div className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <span className="text-xs text-zinc-400">دفتر مرکزی</span>
              <span className="text-xs font-semibold text-zinc-800 leading-relaxed">تهران، خیابان ولیعصر</span>
            </div>

          </div>

          {/* فرم تماس */}
          <div className="bg-white border border-zinc-100 p-6 sm:p-8 rounded-3xl shadow-sm flex-1 mt-4">
            <h2 className="text-lg font-bold text-zinc-800 mb-6">ارسال پیام مستقیم</h2>

            {success && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm rounded-xl mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>پیام شما با موفقیت ارسال شد. به زودی با شما تماس خواهیم گرفت.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-2">نام و نام خانوادگی</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: رضا محمدی"
                    className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-2">نشانی ایمیل</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@mail.com"
                    dir="ltr"
                    className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-400 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-2">موضوع پیام</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="مثال: سوال پیش از خرید"
                  className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-2">متن پیام</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="پیام خود را به طور کامل بنویسید..."
                  className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-400 resize-none text-sm leading-relaxed"
                />
              </div>

              <button
                type="submit"
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
                    در حال ارسال پیام...
                  </span>
                ) : (
                  <span>ارسال پیام</span>
                )}
              </button>
            </form>
          </div>

        </div>

        {/* ستون چپ: نقشه تعاملی OpenStreetMap */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="bg-white border border-zinc-100 rounded-3xl p-4 shadow-sm flex-1 flex flex-col min-h-[350px] lg:min-h-0">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-zinc-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                موقعیت ما روی نقشه
              </h2>
              <a 
                href="https://www.openstreetmap.org/?mlat=35.6892&mlon=51.3890#map=13/35.6892/51.3890"
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
              >
                مشاهده بزرگ‌تر نقشه
              </a>
            </div>

            {/* محفظه نقشه OpenStreetMap */}
            <div className="relative flex-1 rounded-2xl overflow-hidden border border-zinc-100 bg-zinc-50">
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=51.3500%2C35.6700%2C51.4500%2C35.7300&amp;layer=mapnik&amp;marker=35.6892%2C51.3890"
                className="absolute inset-0 w-full h-full border-0 rounded-2xl"
                allowFullScreen
                loading="lazy"
                title="موقعیت ما در تهران بر روی OpenStreetMap"
              ></iframe>
            </div>
            
            <p className="text-[11px] text-zinc-400 mt-3 leading-relaxed">
              * دفتر پشتیبانی ما در محدوده مرکزی تهران واقع شده است. برای مراجعات حضوری هماهنگی قبلی الزامی است.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}