"use client";
import Link from "next/link";
import { useCartStore } from "@/stores/cart-store";

export default function CartPage() {
    const {
        items,
        increase,
        decrease,
        removeItem,
    } = useCartStore();

    const subtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    // فرض می‌کنیم هزینه ارسال برای خریدهای بالای ۵۰۰ هزار تومان رایگان است
    const shippingCost = subtotal > 500000 || subtotal === 0 ? 0 : 25000;
    const total = subtotal + shippingCost;

    // فرمت‌کننده قیمت به ریال/تومان یا واحد مد نظر شما
    const formatPrice = (price: number) => {
        return price.toLocaleString("fa-IR") + " تومان";
    };

    // وضعیت سبد خرید خالی
    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
                <div className="bg-zinc-50 p-6 rounded-full mb-6">
                    <svg className="w-16 h-16 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-zinc-800 mb-2">سبد خرید شما خالی است!</h1>
                <p className="text-zinc-500 mb-8 max-w-sm">
                    در حال حاضر هیچ محصولی در سبد خرید شما وجود ندارد. می‌توانید برای مشاهده محصولات به فروشگاه بازگردید.
                </p>
                <Link
                    href="/"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-xl transition-all duration-200 shadow-sm"
                >
                    بازگشت به فروشگاه
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-10 max-w-6xl">
            <h1 className="text-3xl font-extrabold text-zinc-900 mb-8 pb-4 border-b border-zinc-100">
                سبد خرید
                <span className="text-sm font-normal text-zinc-500 mr-2">({items.length} کالا)</span>
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* لیست محصولات (سمت راست در دسکتاپ) */}
                <div className="lg:col-span-2 space-y-4">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="flex flex-col sm:flex-row items-center justify-between p-5 bg-white border border-zinc-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 gap-4"
                        >
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                {/* تصویر پیش‌فرض یا تصویر محصول */}
                                <div className="w-20 h-20 bg-zinc-100 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
                                    {item.image ? (
                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <h3 className="font-semibold text-zinc-800 text-lg line-clamp-1">{item.title}</h3>
                                    <p className="text-sm text-zinc-500">{formatPrice(item.price)}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
                                {/* کنترلر تعداد */}
                                <div className="flex items-center border border-zinc-200 rounded-xl bg-zinc-50/50 p-1">
                                    <button
                                        onClick={() => increase(item.id)}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-zinc-600 hover:text-blue-600 transition-colors"
                                        aria-label="افزایش تعداد"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </button>

                                    <span className="w-8 text-center font-bold text-zinc-800 select-none">
                                        {item.quantity}
                                    </span>

                                    <button
                                        onClick={() => decrease(item.id)}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-zinc-600 hover:text-blue-600 transition-colors"
                                        aria-label="کاهش تعداد"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                        </svg>
                                    </button>
                                </div>

                                {/* دکمه حذف */}
                                <button
                                    onClick={() => removeItem(item.id)}
                                    className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                                    aria-label="حذف از سبد"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* خلاصه سفارش (سمت چپ در دسکتاپ) */}
                <div className="bg-zinc-50 border border-zinc-100 p-6 rounded-2xl lg:sticky lg:top-6 space-y-6">
                    <h2 className="text-xl font-bold text-zinc-800 border-b border-zinc-200/60 pb-4">
                        خلاصه سفارش
                    </h2>

                    <div className="space-y-4 text-sm text-zinc-600">
                        <div className="flex justify-between">
                            <span>قیمت کالاها ({items.reduce((acc, item) => acc + item.quantity, 0)})</span>
                            <span className="font-semibold text-zinc-800">{formatPrice(subtotal)}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span>هزینه ارسال</span>
                            {shippingCost === 0 ? (
                                <span className="text-emerald-600 font-medium">رایگان</span>
                            ) : (
                                <span className="font-semibold text-zinc-800">{formatPrice(shippingCost)}</span>
                            )}
                        </div>

                        {shippingCost > 0 && (
                            <p className="text-xs text-zinc-400 bg-zinc-100 p-2.5 rounded-lg leading-relaxed">
                                سفارش‌های بالای ۵۰۰,۰۰۰ تومان مشمول ارسال رایگان می‌شوند.
                            </p>
                        )}
                    </div>

                    <div className="border-t border-zinc-200/60 pt-4 flex justify-between items-center text-lg">
                        <span className="font-bold text-zinc-800">مجموع سبد خرید:</span>
                        <span className="font-extrabold text-zinc-950">{formatPrice(total)}</span>
                    </div>

                    <Link
                        href="/checkout"
                        className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl shadow-sm transition-all duration-200 group text-center"
                    >
                        <span>ادامه خرید و ثبت سفارش</span>
                        <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                </div>

            </div>
        </div>
    );
}