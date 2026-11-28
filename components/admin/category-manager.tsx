"use client";

import { useRef, useState, useTransition } from "react";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryShowInHome,
} from "@/app/admin/categories/actions";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Edit,
  Check,
  X,
  Folder,
  FolderOpen,
  CornerDownLeft,
  Upload,
  Home,
} from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  showInHome?: boolean;
  parentId: string | null;
  subcategories?: Category[];
};

type Props = {
  initialCategories: Category[];
};

export function CategoryManager({ initialCategories }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const isEditMode = !!selectedCategory;

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState("");
  const [showInHome, setShowInHome] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleStartEdit = (cat: Category) => {
    setSelectedCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setParentId(cat.parentId || "");
    setShowInHome(Boolean(cat.showInHome));
    setImageFile(null);
    setImagePreview(cat.image || null);
    setRemoveImage(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setSelectedCategory(null);
    setName("");
    setSlug("");
    setParentId("");
    setShowInHome(false);
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setRemoveImage(false);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !slug.trim()) {
      toast.warning("لطفاً تمامی فیلدها را به طور کامل پر کنید.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("slug", slug.trim());
    formData.append("parentId", parentId);
    if (showInHome) formData.append("showInHome", "on");
    if (removeImage) formData.append("removeImage", "true");
    if (imageFile) formData.append("imageFile", imageFile);

    startTransition(async () => {
      try {
        const result =
          isEditMode && selectedCategory
            ? await updateCategory(selectedCategory.id, formData)
            : await createCategory(formData);

        if (result.success) {
          toast.success(result.message);
          handleCancelEdit();
        } else {
          toast.error(result.message || "خطایی رخ داد.");
        }
      } catch {
        toast.error("خطایی رخ داد. لطفاً دوباره تلاش کنید.");
      }
    });
  };

  const handleToggleHome = (cat: Category) => {
    startTransition(async () => {
      const result = await toggleCategoryShowInHome(cat.id, Boolean(cat.showInHome));
      if (result.success) toast.success(result.message);
      else toast.error(result.message || "خطا در تغییر وضعیت.");
    });
  };

  const handleDelete = (cat: Category, isParent: boolean) => {
    const msg = isParent
      ? `آیا از حذف دسته‌بندی «${cat.name}» مطمئن هستید؟ (در صورت داشتن زیردسته، آن‌ها نیز حذف می‌شوند)`
      : `آیا از حذف زیردسته «${cat.name}» مطمئن هستید؟`;

    if (!window.confirm(msg)) return;

    startTransition(async () => {
      const result = await deleteCategory(cat.id);
      if (result.success) {
        toast.success(result.message);
        if (selectedCategory?.id === cat.id) handleCancelEdit();
      } else {
        toast.error(result.message || "خطا در حذف دسته‌بندی.");
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in">
      {/* فرم ایجاد/ویرایش */}
      <Card className="border-zinc-100 shadow-sm rounded-2xl bg-white">
        <CardHeader className="border-b border-zinc-50 bg-zinc-50/20 pb-4">
          <CardTitle className="text-sm font-extrabold text-zinc-800">
            {isEditMode ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی جدید"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 mb-2">
                نام دسته‌بندی
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="مثال: شلوار جین، تیشرت، کفش"
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 mb-2">
                اسلاگ (Slug - انگلیسی بدون فاصله)
              </label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                dir="ltr"
                placeholder="مثال: pants یا tshirt"
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 mb-2">
                انتخاب دسته‌بندی مادر (اختیاری)
              </label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 bg-white text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition cursor-pointer"
              >
                <option value="">به عنوان دسته‌بندی مادر (ریشه)</option>
                {initialCategories
                  .filter((c) => c.id !== selectedCategory?.id)
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* بخش آپلود تصویر دسته‌بندی */}
            <div className="space-y-2 pt-1">
              <label className="block text-[10px] font-bold text-zinc-400">
                تصویر دسته‌بندی (مربعی - برای اسلایدر صفحه اصلی)
              </label>

              {imagePreview ? (
                <div className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 bg-zinc-50/50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="پیش‌نمایش دسته‌بندی"
                    className="h-16 w-16 rounded-full object-cover border border-zinc-200 bg-white shrink-0"
                  />
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-[11px] font-bold text-zinc-700 transition">
                      <Upload className="h-3.5 w-3.5 text-blue-600" />
                      <span>تغییر تصویر</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-[11px] font-bold text-red-500 hover:text-red-700 text-right px-1"
                    >
                      حذف تصویر
                    </button>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed border-zinc-200 hover:border-blue-400 hover:bg-blue-50/20 text-xs font-bold text-zinc-600 transition">
                  <Upload className="h-4 w-4 text-blue-600" />
                  <span>انتخاب و آپلود تصویر</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* چک‌باکس نمایش در اسلایدر صفحه اصلی */}
            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-50 border border-zinc-100 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showInHome}
                onChange={(e) => setShowInHome(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-xs font-bold text-zinc-700 block">
                  نمایش در اسلایدر صفحه اصلی
                </span>
                <span className="text-[10px] text-zinc-400 block">
                  در صورت داشتن تصویر، در اسلایدر دسته‌بندی‌های صفحه اصلی نمایش داده می‌شود.
                </span>
              </div>
            </label>

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

      {/* درختواره دسته‌بندی‌ها */}
      <div className="lg:col-span-2 space-y-4">
        {initialCategories.length === 0 ? (
          <Card className="border-dashed border-zinc-200 p-12 text-center bg-zinc-50/20">
            <CardContent className="py-4 text-xs text-zinc-400">
              هیچ دسته‌بندی هنوز ثبت نشده است.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {initialCategories.map((parent) => {
              const isParentEditing = selectedCategory?.id === parent.id;

              return (
                <div key={parent.id} className="space-y-2">
                  <Card
                    className={`border p-4 rounded-xl transition duration-200 ${
                      isParentEditing
                        ? "border-blue-500 bg-blue-50/10 ring-1 ring-blue-500"
                        : "border-zinc-100 bg-white"
                    }`}
                  >
                    <CardContent className="p-0 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        {parent.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={parent.image}
                            alt={parent.name}
                            className="h-10 w-10 rounded-full object-cover border border-zinc-200 shrink-0"
                          />
                        ) : (
                          <Folder className="h-5 w-5 text-blue-500 shrink-0" />
                        )}
                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                          <span className="font-bold text-sm text-zinc-800">
                            {parent.name}
                          </span>
                          <span className="font-mono text-[9px] bg-zinc-100 border text-zinc-400 px-1.5 py-0.5 rounded-lg">
                            {parent.slug}
                          </span>
                          {parent.showInHome && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full">
                              <Home className="h-2.5 w-2.5" />
                              <span>صفحه اصلی</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleToggleHome(parent)}
                          variant="outline"
                          size="icon"
                          className={`h-8 w-8 rounded-lg border-zinc-200 ${
                            parent.showInHome
                              ? "text-emerald-600 bg-emerald-50 border-emerald-200"
                              : "text-zinc-400"
                          }`}
                          title={
                            parent.showInHome
                              ? "حذف از اسلایدر صفحه اصلی"
                              : "نمایش در اسلایدر صفحه اصلی"
                          }
                        >
                          <Home className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          onClick={() => handleStartEdit(parent)}
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-lg border-zinc-200 text-zinc-500 hover:text-zinc-800"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleDelete(parent, true)}
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                          title="حذف دسته‌بندی"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {parent.subcategories && parent.subcategories.length > 0 && (
                    <div className="mr-6 pr-4 border-r border-dashed border-zinc-200 space-y-2">
                      {parent.subcategories.map((sub) => {
                        const isSubEditing = selectedCategory?.id === sub.id;
                        return (
                          <Card
                            key={sub.id}
                            className={`border p-3.5 rounded-xl transition duration-200 ${
                              isSubEditing
                                ? "border-blue-500 bg-blue-50/10 ring-1 ring-blue-500"
                                : "border-zinc-100/80 bg-zinc-50/20"
                            }`}
                          >
                            <CardContent className="p-0 flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <CornerDownLeft className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                                {sub.image ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={sub.image}
                                    alt={sub.name}
                                    className="h-8 w-8 rounded-full object-cover border border-zinc-200 shrink-0"
                                  />
                                ) : (
                                  <FolderOpen className="h-4 w-4 text-zinc-400 shrink-0" />
                                )}
                                <div className="flex flex-wrap items-center gap-2 min-w-0">
                                  <span className="font-semibold text-xs text-zinc-700">
                                    {sub.name}
                                  </span>
                                  <span className="font-mono text-[8px] bg-zinc-200/50 text-zinc-400 px-1.5 py-0.5 rounded-lg">
                                    {sub.slug}
                                  </span>
                                  {sub.showInHome && (
                                    <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full">
                                      <Home className="h-2.5 w-2.5" />
                                      <span>صفحه اصلی</span>
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <Button
                                  type="button"
                                  disabled={isPending}
                                  onClick={() => handleToggleHome(sub)}
                                  variant="outline"
                                  size="icon"
                                  className={`h-7 w-7 rounded-lg border-zinc-200 ${
                                    sub.showInHome
                                      ? "text-emerald-600 bg-emerald-50 border-emerald-200"
                                      : "text-zinc-400"
                                  }`}
                                  title={
                                    sub.showInHome
                                      ? "حذف از اسلایدر صفحه اصلی"
                                      : "نمایش در اسلایدر صفحه اصلی"
                                  }
                                >
                                  <Home className="h-3 w-3" />
                                </Button>
                                <Button
                                  type="button"
                                  onClick={() => handleStartEdit(sub)}
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7 rounded-lg border-zinc-200 text-zinc-500 hover:text-zinc-800"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  type="button"
                                  disabled={isPending}
                                  onClick={() => handleDelete(sub, false)}
                                  variant="destructive"
                                  size="icon"
                                  className="h-7 w-7 rounded-lg"
                                  title="حذف زیردسته"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
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