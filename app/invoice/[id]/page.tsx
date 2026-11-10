import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/rbac-server";
import { PrintButton } from "@/components/admin/print-button";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function InvoicePage({ params }: Props) {
  const { id } = await params;
  
  // بررسی دسترسی (فقط ادمین یا خریدارِ همین سفارش حق دیدن فاکتور را دارند)
  const user = await requireAuth();
  
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      items: {
        include: { product: true },
      },
    },
  });

  if (!order) notFound();

  // اگر کاربر ادمین نبود و سفارش هم مال خودش نبود، دسترسی مسدود شود
  if (user.role !== "ADMIN" && order.userId !== user.id) {
    notFound();
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString("fa-IR");

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white p-4 sm:p-8 font-vazirmatn text-gray-900" dir="rtl">
      {/* دکمه شناور چاپ (در حالت پرینت مخفی می‌شود) */}
      <PrintButton />

      {/* برگه A4 */}
      <div className="max-w-[210mm] mx-auto bg-white p-8 sm:p-12 shadow-md print:shadow-none print:p-0">
        
        {/* هدر فاکتور */}
        <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-6">
          <div>
            <h1 className="text-2xl font-black mb-2">فروشگاه فیزیکی</h1>
            <p className="text-xs text-gray-600">فاکتور فروش کالا و خدمات</p>
          </div>
          <div className="text-left space-y-2 text-sm font-semibold">
            <p>شماره فاکتور: <span className="font-mono">{order.id.slice(-8).toUpperCase()}</span></p>
            <p>تاریخ ثبت: {orderDate}</p>
          </div>
        </div>

        {/* مشخصات خریدار */}
        <div className="border border-gray-300 rounded-lg p-4 mb-8">
          <h2 className="text-sm font-bold bg-gray-100 -mx-4 -mt-4 px-4 py-2 mb-4 rounded-t-lg border-b border-gray-300">
            مشخصات خریدار
          </h2>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <p><span className="font-semibold text-gray-500">نام گیرنده:</span> {order.shippingFullName}</p>
            <p><span className="font-semibold text-gray-500">شماره موبایل:</span> <span dir="ltr">{order.shippingPhone}</span></p>
            <p className="col-span-2"><span className="font-semibold text-gray-500">استان و شهر:</span> {order.shippingProvince} - {order.shippingCity}</p>
            <p className="col-span-2 leading-relaxed"><span className="font-semibold text-gray-500">نشانی دقیق:</span> {order.shippingAddressLine}</p>
            <p><span className="font-semibold text-gray-500">کد پستی:</span> <span dir="ltr">{order.shippingPostalCode}</span></p>
          </div>
        </div>

        {/* جدول اقلام */}
        <table className="w-full text-sm border-collapse mb-8 text-center">
          <thead>
            <tr className="bg-gray-100 font-bold border-y-2 border-gray-800">
              <th className="py-3 px-2 border-x border-gray-300 w-12">ردیف</th>
              <th className="py-3 px-2 border-x border-gray-300 text-right">شرح کالا</th>
              <th className="py-3 px-2 border-x border-gray-300">تعداد</th>
              <th className="py-3 px-2 border-x border-gray-300">مبلغ واحد (تومان)</th>
              <th className="py-3 px-2 border-x border-gray-300">مبلغ کل (تومان)</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={item.id} className="border-b border-gray-300">
                <td className="py-3 px-2 border-x border-gray-300">{index + 1}</td>
                <td className="py-3 px-2 border-x border-gray-300 text-right font-semibold">{item.product.title}</td>
                <td className="py-3 px-2 border-x border-gray-300">{item.quantity}</td>
                <td className="py-3 px-2 border-x border-gray-300">{Number(item.price).toLocaleString("fa-IR")}</td>
                <td className="py-3 px-2 border-x border-gray-300 font-bold">
                  {(Number(item.price) * item.quantity).toLocaleString("fa-IR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* جمع فاکتور */}
        <div className="flex justify-end">
          <div className="w-1/2 border border-gray-300 rounded-lg overflow-hidden">
            <div className="flex justify-between p-3 text-sm border-b border-gray-200">
              <span className="font-semibold text-gray-600">جمع اقلام:</span>
              <span>{(Number(order.totalPrice) - Number(order.shippingCost || 0)).toLocaleString("fa-IR")} تومان</span>
            </div>
            <div className="flex justify-between p-3 text-sm border-b border-gray-200">
              <span className="font-semibold text-gray-600">هزینه ارسال:</span>
              <span>{order.shippingCost ? `${Number(order.shippingCost).toLocaleString("fa-IR")} تومان` : "رایگان"}</span>
            </div>
            <div className="flex justify-between p-4 bg-gray-100 text-base font-black">
              <span>مبلغ نهایی فاکتور:</span>
              <span>{Number(order.totalPrice).toLocaleString("fa-IR")} تومان</span>
            </div>
          </div>
        </div>

        {/* فوتر فاکتور (محل مهر و امضا) */}
        <div className="mt-16 pt-8 border-t border-gray-300 flex justify-between text-sm text-gray-500 font-semibold">
          <div className="text-center w-32">مهر و امضای فروشنده</div>
          <div className="text-center w-32">امضای تحویل‌گیرنده</div>
        </div>

      </div>
    </div>
  );
}