"use client";

import { useState, useTransition } from "react";
import { createProduct, updateProduct } from "@/app/admin/products/actions";
import { ImageManager } from "@/components/admin/image-manager";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type ProductWithImages = {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: any;
  offerPrice: any;
  offerStartsAt: Date | null;
  offerEndsAt: Date | null;
  stock: number;
  categoryId: string;
  isActive: boolean;
  images: { id: string; url: string }[];
};

type Props = {
  categories: Category[];
  product?: ProductWithImages; // اگر ارسال شود، فرم در حالت ویرایش قرار می‌گیرد
};

export default function ProductForm({ categories, product }: Props) {
  const [isPending, startTransition] = useTransition();
  const isEditMode = !!product;

  // مقداردهی اولیه تصاویر بر اساس وجود یا عدم وجود محصول
  const [images, setImages] = useState<any[]>(
    product
      ? product.images.map((img) => ({ id: img.id, url: img.url }))
      : []
  );

  // تابع کمکی برای فرمت‌دهی تاریخ میلادی به فرمت قابل نمایش در <input type="datetime-local" />
  function formatDateForInput(date: Date | string | null | undefined) {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);

    // ۱. مدیریت تصاویر کلاینت
    formData.delete("images");
    images.forEach((img) => {
      if (img.file) {
        formData.append("images", img.file);
      }
    });

    // ۲. در حالت ویرایش، لیست شناسه تصاویری که باقی مانده‌اند را ارسال می‌کنیم
    if (isEditMode && product) {
      const keptImageIds = images
        .filter((img) => img.id && !img.file)
        .map((img) => img.id);
      formData.append("keptImageIds", JSON.stringify(keptImageIds));
    }

    // ۳. اجرای اکشن مناسب بر اساس ایجاد یا ویرایش
    startTransition(async () => {
      try {
        if (isEditMode && product) {
          await updateProduct(product.id, formData);
        } else {
          await createProduct(formData);
        }
      } catch (error) {
        console.error(error);
        alert("خطایی رخ داد. لطفاً دوباره تلاش کنید.");
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow border p-8 space-y-8 animate-fade-in"
    >
      {/* اطلاعات محصول */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-gray-800">اطلاعات محصول</h2>
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs text-gray-500 mb-1">عنوان محصول</label>
            <input
              name="title"
              required
              defaultValue={product?.title}
              placeholder="عنوان محصول"
              className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">اسلاگ (Slug)</label>
            <input
              name="slug"
              required
              defaultValue={product?.slug}
              placeholder="iphone-15-pro"
              className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-xs text-gray-500 mb-1">توضیحات</label>
          <textarea
            name="description"
            required
            defaultValue={product?.description}
            placeholder="توضیحات محصول"
            rows={5}
            className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </section>

      {/* قیمت و موجودی */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-gray-800">قیمت و موجودی</h2>
        <div className="grid md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs text-gray-500 mb-1">قیمت اصلی (تومان)</label>
            <input
              type="number"
              name="price"
              required
              defaultValue={product ? Number(product.price) : ""}
              placeholder="قیمت اصلی"
              className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">قیمت تخفیف</label>
            <input
              type="number"
              name="offerPrice"
              defaultValue={product?.offerPrice ? Number(product.offerPrice) : ""}
              placeholder="قیمت تخفیف خورده"
              className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">موجودی انبار</label>
            <input
              type="number"
              name="stock"
              required
              defaultValue={product?.stock}
              placeholder="تعداد موجودی"
              className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* زمان تخفیف */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-gray-800">زمان تخفیف</h2>
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs text-gray-500 mb-1">شروع تخفیف</label>
            <input
              type="datetime-local"
              name="offerStartsAt"
              defaultValue={formatDateForInput(product?.offerStartsAt)}
              className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">پایان تخفیف</label>
            <input
              type="datetime-local"
              name="offerEndsAt"
              defaultValue={formatDateForInput(product?.offerEndsAt)}
              className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* دسته‌بندی */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-gray-800">دسته‌بندی</h2>
        <select
          name="categoryId"
          required
          defaultValue={product?.categoryId || ""}
          className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">انتخاب دسته‌بندی</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </section>

      {/* تصاویر محصول */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-gray-800">تصاویر محصول</h2>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            const previews = files.map((file) => ({
              id: crypto.randomUUID(),
              url: URL.createObjectURL(file),
              file,
            }));
            setImages((prev) => [...prev, ...previews]);
          }}
          className="w-full border-2 border-dashed rounded-xl p-6 cursor-pointer hover:bg-gray-50 transition"
        />

        <div className="mt-5">
          <ImageManager initialImages={images} onChange={setImages} />
        </div>
      </section>

      {/* وضعیت انتشار */}
      <section className="flex items-center gap-3">
        <input
          type="checkbox"
          name="isActive"
          id="isActive"
          defaultChecked={product ? product.isActive : true}
          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="isActive" className="text-gray-700 select-none cursor-pointer">
          محصول فعال و آماده نمایش در سایت باشد
        </label>
      </section>

      {/* دکمه ثبت */}
      <div className="flex justify-end border-t pt-6">
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {isPending
            ? isEditMode
              ? "در حال ذخیره تغییرات..."
              : "در حال ایجاد محصول..."
            : isEditMode
            ? "ذخیره تغییرات"
            : "ایجاد محصول"}
        </button>
      </div>
    </form>
  );
}