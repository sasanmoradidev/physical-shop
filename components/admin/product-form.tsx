"use client";

import { useState, useTransition } from "react";
import { createProduct, updateProduct } from "@/app/admin/products/actions";
import { ImageManager } from "@/components/admin/image-manager";

import { createBrandInline } from "@/app/admin/brands/actions";
import { Plus, X, Check, Loader2, Trash2 } from "lucide-react";

type Category = {
    id: string;
    name: string;
    slug: string;
};

type Brand = { id: string; name: string; slug: string };

type ProductWithImages = {
    id: string;
    title: string;
    slug: string;
    sku?: string | null;
    description: string;
    price: any;
    offerPrice: any;
    offerStartsAt: Date | null;
    offerEndsAt: Date | null;
    stock: number;
    categoryId: string;
    brandId?: string | null;
    isActive: boolean;
    images: { id: string; url: string }[];
    variants?: { id?: string; name: string; sku?: string; price?: number | null; stock: number }[];
};

type Props = {
    categories: Category[];
    brands: Brand[];
    product?: ProductWithImages; // اگر ارسال شود، فرم در حالت ویرایش قرار می‌گیرد
};

export default function ProductForm({ categories, brands, product }: Props) {
    const [isPending, startTransition] = useTransition();
    const isEditMode = !!product;

    const [brandsList, setBrandsList] = useState(brands);
    const [selectedBrand, setSelectedBrand] = useState(product?.brandId || "");
    const [isAddingBrand, setIsAddingBrand] = useState(false);
    const [newBrandName, setNewBrandName] = useState("");
    const [isBrandPending, setIsBrandPending] = useState(false);
    const [variants, setVariants] = useState<any[]>(product?.variants || []);

    async function handleInlineBrandCreate() {
        if (!newBrandName.trim()) return;
        setIsBrandPending(true);
        try {
            const newBrand = await createBrandInline(newBrandName);
            setBrandsList((prev) => [...prev, newBrand]); // اضافه کردن به لیست فرم
            setSelectedBrand(newBrand.id); // انتخاب خودکار برند جدید
            setIsAddingBrand(false);
            setNewBrandName("");
        } catch (error) {
            alert("خطا در ایجاد برند. ممکن است نام تکراری باشد.");
        } finally {
            setIsBrandPending(false);
        }
    }

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

        // ۱. پاک کردن فیلد پیش‌فرض فایل‌ها
        formData.delete("images");

        // ۲. ارسال ساختار ترتیب نهایی شناسه‌ها (مثال: ["id-1", "uuid-2", "id-3"])
        const imageOrder = images.map((img) => img.id);
        formData.append("imageOrder", JSON.stringify(imageOrder));
        formData.append("variants", JSON.stringify(variants));

        // ۳. ارسال فایل‌های جدید با کلید اختصاصی متناظر با شناسه‌شان
        images.forEach((img) => {
            if (img.file) {
                formData.append(`file_${img.id}`, img.file);
            }
        });

        // اجرای اکشن مناسب
        // ۳. اجرای اکشن مناسب بر اساس ایجاد یا ویرایش
        startTransition(async () => {
            try {
                if (isEditMode && product) {
                    await updateProduct(product.id, formData);
                } else {
                    await createProduct(formData);
                }
            } catch (error: any) {
                // 👇 اگر خطا مربوط به ریدایرکت خود پلتفرم Next.js بود، آن را دوباره پرتاب کن تا ریدایرکت انجام شود
                if (
                    error?.digest?.includes("NEXT_REDIRECT") ||
                    error?.message?.includes("NEXT_REDIRECT")
                ) {
                    throw error;
                }

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
                <div className="grid md:grid-cols-3 gap-5">
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
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">کد اختصاصی (SKU)</label>
                        <input name="sku" defaultValue={product?.sku || ""} placeholder="مثال: PRD-1001" className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
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

            {/* دسته‌بندی و برند */}
            <section>
                <h2 className="text-lg font-semibold mb-4 text-gray-800">دسته‌بندی و برند</h2>
                <div className="grid md:grid-cols-2 gap-5">
                    {/* دسته‌بندی */}
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">دسته‌بندی</label>
                        <select
                            name="categoryId"
                            required
                            defaultValue={product?.categoryId || ""}
                            className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="">انتخاب دسته‌بندی</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    {/* برند با قابلیت افزودن در لحظه */}
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">برند (اختیاری)</label>
                        {!isAddingBrand ? (
                            <div className="flex gap-2">
                                <select
                                    name="brandId"
                                    value={selectedBrand}
                                    onChange={(e) => setSelectedBrand(e.target.value)}
                                    className="flex-1 border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="">بدون برند</option>
                                    {brandsList.map((b) => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setIsAddingBrand(true)}
                                    className="flex-shrink-0 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-3 rounded-xl flex items-center justify-center transition border border-zinc-200"
                                    title="افزودن برند جدید"
                                >
                                    <Plus className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2 items-center">
                                <input
                                    type="text"
                                    value={newBrandName}
                                    onChange={(e) => setNewBrandName(e.target.value)}
                                    placeholder="نام برند جدید..."
                                    className="flex-1 border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleInlineBrandCreate();
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={handleInlineBrandCreate}
                                    disabled={isBrandPending}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-3 rounded-xl flex items-center justify-center transition disabled:opacity-50"
                                >
                                    {isBrandPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setIsAddingBrand(false); setNewBrandName(""); }}
                                    className="bg-red-50 hover:bg-red-100 text-red-500 px-3 py-3 rounded-xl flex items-center justify-center transition border border-red-100"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* 🌟 بخش جدید: تنوع‌های محصول (اختیاری) */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">تنوع‌های محصول (رنگ، گارانتی، سایز)</h2>
                    <button
                        type="button"
                        onClick={() => setVariants([...variants, { id: crypto.randomUUID(), name: "", sku: "", price: "", stock: 0 }])}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                    >
                        <Plus className="h-4 w-4" />
                        <span>افزودن تنوع جدید</span>
                    </button>
                </div>

                {variants.length === 0 ? (
                    <div className="border border-dashed border-zinc-200 rounded-2xl p-6 text-center text-xs text-zinc-400 bg-zinc-50/50">
                        این محصول در حال حاضر ساده است. برای اضافه کردن رنگ یا سایز، روی "افزودن تنوع جدید" کلیک کنید.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {variants.map((variant, index) => (
                            <div key={variant.id} className="flex flex-col sm:flex-row gap-3 items-end bg-zinc-50 border border-zinc-200 p-4 rounded-2xl animate-fade-in">
                                <div className="flex-1 w-full">
                                    <label className="block text-[10px] font-bold text-zinc-500 mb-1">عنوان (مثال: رنگ مشکی)</label>
                                    <input
                                        required
                                        value={variant.name}
                                        onChange={(e) => {
                                            const newVars = [...variants];
                                            newVars[index].name = e.target.value;
                                            setVariants(newVars);
                                        }}
                                        className="w-full border rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div className="w-full sm:w-28">
                                    <label className="block text-[10px] font-bold text-zinc-500 mb-1">کد (SKU)</label>
                                    <input
                                        value={variant.sku}
                                        onChange={(e) => {
                                            const newVars = [...variants];
                                            newVars[index].sku = e.target.value;
                                            setVariants(newVars);
                                        }}
                                        className="w-full border rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div className="w-full sm:w-32">
                                    <label className="block text-[10px] font-bold text-zinc-500 mb-1">قیمت مجزا (تومان)</label>
                                    <input
                                        type="number"
                                        placeholder="قیمت اصلی"
                                        value={variant.price || ""}
                                        onChange={(e) => {
                                            const newVars = [...variants];
                                            newVars[index].price = e.target.value;
                                            setVariants(newVars);
                                        }}
                                        className="w-full border rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-[10px]"
                                    />
                                </div>
                                <div className="w-full sm:w-24">
                                    <label className="block text-[10px] font-bold text-zinc-500 mb-1">موجودی</label>
                                    <input
                                        type="number"
                                        required
                                        value={variant.stock}
                                        onChange={(e) => {
                                            const newVars = [...variants];
                                            newVars[index].stock = Number(e.target.value);
                                            setVariants(newVars);
                                        }}
                                        className="w-full border rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newVars = [...variants];
                                        newVars.splice(index, 1);
                                        setVariants(newVars);
                                    }}
                                    className="bg-red-50 text-red-500 p-2.5 rounded-xl hover:bg-red-100 transition border border-red-100 flex-shrink-0"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
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
                            // id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                            url: URL.createObjectURL(file),
                            file,
                        }));
                        setImages((prev) => [...prev, ...previews]);
                        // e.target.value = "";
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
        </form >
    );
}