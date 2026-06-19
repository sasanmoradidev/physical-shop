"use client";

import { useState, useTransition } from "react";
import {
    createCategory,
    updateCategory,
    deleteCategory,
} from "@/app/admin/categories/actions";

import { toast } from "sonner";

// ایمپورت کامپوننت‌های شکیل پروژه (Shadcn UI)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ایمپورت آیکون‌های لوساید برای ناوبری
import { Plus, Trash2, Edit, Check, X, Folder, FolderOpen, CornerDownLeft } from "lucide-react";

type Category = {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
    subcategories?: Category[];
};

type Props = {
    initialCategories: Category[]; // فقط لیست دسته‌بندی‌های ریشه (والدها) همراه با ساب‌هایشان
};

export function CategoryManager({ initialCategories }: Props) {
    const [selectedCategory, setSelectedMethod] = useState<Category | null>(null);
    const isEditMode = !!selectedCategory;

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [parentId, setParentId] = useState("");

    const [isPending, startTransition] = useTransition();

    const handleStartEdit = (cat: Category) => {
        setSelectedMethod(cat);
        setName(cat.name);
        setSlug(cat.slug);
        setParentId(cat.parentId || "");

        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCancelEdit = () => {
        setSelectedMethod(null);
        setName("");
        setSlug("");
        setParentId("");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !slug) {
            toast.warning("لطفاً تمامی فیلدها را به طور کامل پر کنید.");
            return;
        }

        startTransition(async () => {
            try {
                if (isEditMode && selectedCategory) {
                    await updateCategory(selectedCategory.id, name, slug, parentId);
                    toast.success("تغییرات با موفقیت ذخیره شد."); // 👈 توست موفقیت
                } else {
                    await createCategory(name, slug, parentId);
                    toast.success("دسته‌بندی جدید با موفقیت ثبت شد."); // 👈 توست موفقیت
                }
                handleCancelEdit();
            } catch (error: any) {
                console.error(error);
                toast.error(error?.message || "خطایی رخ داد. لطفاً دوباره تلاش کنید."); // 👈 توست خطا
            }
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in">

            {/* سمت راست (فرم پویا ایجاد/ویرایش) */}
            <Card className="border-zinc-100 shadow-sm rounded-2xl bg-white">
                <CardHeader className="border-b border-zinc-50 bg-zinc-50/20 pb-4">
                    <CardTitle className="text-sm font-extrabold text-zinc-800">
                        {isEditMode ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی جدید"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-400 mb-2">نام دسته‌بندی</label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="مثال: کالای دیجیتال، لپ‌تاپ"
                                className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-xs font-semibold"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-zinc-400 mb-2">اسلاگ (Slug - انگلیسی بدون فاصله)</label>
                            <input
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                required
                                placeholder="مثال: digital یا laptop"
                                className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-xs font-mono font-bold"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-zinc-400 mb-2">انتخاب دسته‌بندی مادر (اختیاری)</label>
                            <select
                                value={parentId}
                                onChange={(e) => setParentId(e.target.value)}
                                className="w-full border rounded-xl px-4 py-3 bg-zinc-50/30 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition cursor-pointer bg-white"
                            >
                                <option value="">به عنوان دسته‌بندی مادر (ریشه)</option>
                                {/* نمایش دسته‌بندی‌های اصلی جهت استفاده به عنوان والد */}
                                {initialCategories
                                    .filter((c) => c.id !== selectedCategory?.id) // حذف خود دسته در زمان ادیت
                                    .map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                            </select>
                            <span className="text-[9px] text-zinc-400 leading-normal mt-1 block">
                                * در صورتی که می‌خواهید این مورد یک زیردسته‌بندی باشد، والد آن را انتخاب کنید.
                            </span>
                        </div>

                        <div className="flex flex-col gap-2 pt-4 border-t border-zinc-50 mt-2">
                            <Button
                                type="submit"
                                disabled={isPending}
                                size="sm"
                                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 flex items-center justify-center gap-1.5 shadow-sm"
                            >
                                {isPending ? (
                                    <span>در حال ثبت...</span>
                                ) : (
                                    <>
                                        <Check className="h-4 w-4" />
                                        <span>{isEditMode ? "ذخیره تغییرات" : "ثبت دسته‌بندی"}</span>
                                    </>
                                )}
                            </Button>

                            {isEditMode && (
                                <Button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    variant="outline"
                                    size="sm"
                                    className="w-full rounded-xl border-zinc-200 text-zinc-500 text-xs font-bold h-10 flex items-center justify-center gap-1.5"
                                >
                                    <X className="h-4 w-4" />
                                    <span>انصراف و افزودن جدید</span>
                                </Button>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* سمت چپ (درختواره دسته‌بندی‌ها و فرزندانشان) */}
            <div className="lg:col-span-2 space-y-4">
                {initialCategories.length === 0 ? (
                    <Card className="border-dashed border-zinc-200 p-12 text-center bg-zinc-50/20">
                        <CardContent className="py-4 text-xs text-zinc-400">هیچ دسته‌بندی هنوز ثبت نشده است.</CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {initialCategories.map((parent) => {
                            const isParentEditing = selectedCategory?.id === parent.id;

                            return (
                                <div key={parent.id} className="space-y-2">

                                    {/* رندر دسته‌بندی اصلی (مادر) */}
                                    <Card className={`border p-4 rounded-xl transition duration-200 ${isParentEditing ? "border-blue-500 bg-blue-50/10 ring-1 ring-blue-500" : "border-zinc-100 bg-white"
                                        }`}>
                                        <CardContent className="p-0 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-2.5">
                                                <Folder className="h-4.5 w-4.5 text-blue-500" />
                                                <span className="font-bold text-sm text-zinc-800">{parent.name}</span>
                                                <span className="font-mono text-[9px] bg-zinc-100 border text-zinc-400 px-1.5 py-0.5 rounded-lg">{parent.slug}</span>
                                            </div>

                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                <Button
                                                    onClick={() => handleStartEdit(parent)}
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-lg border-zinc-200 text-zinc-500 hover:text-zinc-800"
                                                >
                                                    <Edit className="h-3.5 w-3.5" />
                                                </Button>
                                                <form action={deleteCategory.bind(null, parent.id)}>
                                                    <Button type="submit" variant="destructive" size="icon" className="h-8 w-8 rounded-lg">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </form>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* رندر زیردسته‌بندی‌های والد (فرزندان) به صورت دندانه دار و تو رفته (RTL) */}
                                    {parent.subcategories && parent.subcategories.length > 0 && (
                                        <div className="mr-6 pr-4 border-r border-dashed border-zinc-200 space-y-2">
                                            {parent.subcategories.map((sub) => {
                                                const isSubEditing = selectedCategory?.id === sub.id;
                                                return (
                                                    <Card key={sub.id} className={`border p-3.5 rounded-xl transition duration-200 ${isSubEditing ? "border-blue-500 bg-blue-50/10 ring-1 ring-blue-500" : "border-zinc-100/80 bg-zinc-50/20"
                                                        }`}>
                                                        <CardContent className="p-0 flex items-center justify-between gap-4">
                                                            <div className="flex items-center gap-2">
                                                                <CornerDownLeft className="h-3.5 w-3.5 text-zinc-400" />
                                                                <FolderOpen className="h-4 w-4 text-zinc-400" />
                                                                <span className="font-semibold text-xs text-zinc-700">{sub.name}</span>
                                                                <span className="font-mono text-[8px] bg-zinc-200/50 text-zinc-400 px-1.5 py-0.5 rounded-lg">{sub.slug}</span>
                                                            </div>

                                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                                <Button
                                                                    onClick={() => handleStartEdit(sub)}
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="h-7 w-7 rounded-lg border-zinc-200 text-zinc-500 hover:text-zinc-800"
                                                                >
                                                                    <Edit className="h-3 w-3" />
                                                                </Button>
                                                                <form action={deleteCategory.bind(null, sub.id)}>
                                                                    <Button type="submit" variant="destructive" size="icon" className="h-7 w-7 rounded-lg">
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </Button>
                                                                </form>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    )}

                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

        </div>
    );
}