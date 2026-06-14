import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t mt-10 bg-gray-50">
      <div className="container mx-auto py-10">

        {/* 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">

          {/* Column 1 - About */}
          <div>
            <h3 className="font-bold mb-4">
              درباره ما
            </h3>

            <p className="text-gray-600 leading-6">
              فروشگاه Physical Shop ارائه‌دهنده بهترین محصولات با
              کیفیت بالا و ارسال سریع در سراسر کشور است.
            </p>
          </div>

          {/* Column 2 - Links */}
          <div>
            <h3 className="font-bold mb-4">
              دسترسی سریع
            </h3>

            <div className="flex flex-col gap-2 text-gray-700">
              <Link href="/">خانه</Link>
              <Link href="/products">محصولات</Link>
              <Link href="/cart">سبد خرید</Link>
              <Link href="/profile/orders">
                سفارش‌های من
              </Link>
            </div>
          </div>

          {/* Column 3 - Categories */}
          <div>
            <h3 className="font-bold mb-4">
              دسته‌بندی‌ها
            </h3>

            <div className="flex flex-col gap-2 text-gray-700">
              <Link href="/products?category=nuts">
                خشکبار
              </Link>
              <Link href="/products?category=fruit">
                میوه خشک
              </Link>
              <Link href="/products?category=snacks">
                تنقلات
              </Link>
              <Link href="/products?category=organic">
                ارگانیک
              </Link>
            </div>
          </div>

          {/* Column 4 - Contact */}
          <div>
            <h3 className="font-bold mb-4">
              نماد اعتماد الکترونیک
            </h3>

            <div className="text-gray-600 flex flex-col gap-2">
              <Image
                src="/uploads/enamad.png"
                alt="e-namd"
                width={125}
                height={136}
              />
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t mt-8 pt-4 flex flex-col md:flex-row justify-between text-xs text-gray-500 gap-2">

          <p>
            © {new Date().getFullYear()} Physical Shop
          </p>

          <div className="flex gap-4">
            <Link href="/terms">قوانین</Link>
            <Link href="/privacy">حریم خصوصی</Link>
          </div>

        </div>
      </div>
    </footer>
  );
}