"use client";

import { useState } from "react";
import { createProduct } from "../actions";
import {ImageManager} from "@/components/admin/image-manager";
import { prisma } from "@/lib/prisma";

export default async function NewProductPage() {
  const [images, setImages] = useState<any[]>([]);
  const categories =
    await prisma.category.findMany();
  return (
    <div className="container max-w-5xl mx-auto py-10">

      <h1 className="text-3xl font-bold mb-8">
        ایجاد محصول جدید
      </h1>

      <form
        action={createProduct}
        encType="multipart/form-data"
        className="bg-white rounded-2xl shadow border p-8 space-y-8"
      >

        {/* اطلاعات */}
        <section>
          <h2 className="text-lg font-semibold mb-4">
            اطلاعات محصول
          </h2>

          <div className="grid md:grid-cols-2 gap-5">

            <input
              name="title"
              placeholder="عنوان محصول"
              className="w-full border rounded-xl p-3"
            />

            <input
              name="slug"
              placeholder="slug"
              className="w-full border rounded-xl p-3"
            />

          </div>

          <textarea
            name="description"
            placeholder="توضیحات"
            rows={5}
            className="w-full border rounded-xl p-3 mt-4"
          />
        </section>

        {/* قیمت */}
        <section>
          <h2 className="text-lg font-semibold mb-4">
            قیمت و تخفیف
          </h2>

          <div className="grid md:grid-cols-3 gap-5">

            <input
              type="number"
              name="price"
              placeholder="قیمت"
              className="border rounded-xl p-3"
            />

            <input
              type="number"
              name="offerPrice"
              placeholder="قیمت تخفیف"
              className="border rounded-xl p-3"
            />

            <input
              type="number"
              name="stock"
              placeholder="موجودی"
              className="border rounded-xl p-3"
            />

          </div>
        </section>

        {/* زمان تخفیف */}
        <section>
          <h2 className="text-lg font-semibold mb-4">
            زمان تخفیف
          </h2>

          <div className="grid md:grid-cols-2 gap-5">

            <input
              type="datetime-local"
              name="offerStartsAt"
              className="border rounded-xl p-3"
            />

            <input
              type="datetime-local"
              name="offerEndsAt"
              className="border rounded-xl p-3"
            />

          </div>
        </section>

        {/* دسته‌بندی */}
        <section>
          <select
            name="categoryId"
            required
            className="w-full border rounded-xl p-3"
          >
            <option value="">انتخاب دسته‌بندی</option>

            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </section>

        {/* تصاویر (مهم‌ترین بخش) */}
        <section>
          <h2 className="text-lg font-semibold mb-4">
            تصاویر محصول
          </h2>

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              const files = Array.from(
                e.target.files || []
              );

              const previews = files.map(
                (file) => ({
                  id: crypto.randomUUID(),
                  url: URL.createObjectURL(file),
                  file,
                })
              );

              setImages((prev) => [
                ...prev,
                ...previews,
              ]);
            }}
            className="
              w-full
              border-2
              border-dashed
              rounded-xl
              p-6
            "
          />

          {/* 👇 اینجا همون ImageManager */}
          <div className="mt-5">
            <ImageManager
              initialImages={images}
              onChange={setImages}
            />
          </div>
        </section>

        {/* وضعیت */}
        <section>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked
            />
            محصول فعال باشد
          </label>
        </section>

        <div className="flex justify-end border-t pt-6">

          <button
            type="submit"
            className="
              bg-blue-600
              hover:bg-blue-700
              text-white
              px-8
              py-3
              rounded-xl
            "
          >
            ایجاد محصول
          </button>

        </div>

      </form>

    </div>
  );
}