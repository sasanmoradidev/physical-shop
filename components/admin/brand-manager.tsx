"use client";

import { useState, useTransition } from "react";
import { createBrand, updateBrand, deleteBrand } from "@/app/admin/brands/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit, Check, X, Tag } from "lucide-react";
import { toast } from "sonner";

type Brand = {
  id: string;
  name: string;
  slug: string;
  _count?: { products: number };
};

export function BrandManager({ initialBrands }: { initialBrands: Brand[] }) {
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const isEditMode = !!selectedBrand;

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleStartEdit = (brand: Brand) => {
    setSelectedBrand(brand);
    setName(brand.name);
    setSlug(brand.slug);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setSelectedBrand(null);
    setName("");
    setSlug("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      alert("لطفاً تمامی فیلدها را پر کنید.");
      return;
    }

    startTransition(async () => {
      try {
        if (isEditMode && selectedBrand) {
          await updateBrand(selectedBrand.id, name, slug);
          toast.success("تغییرات با موفقیت ذخیره شد.");
        } else {
          await createBrand(name, slug);
          alert("برند جدید با موفقیت ثبت شد.");
        }
        handleCancelEdit();
      } catch (error: any) {
        alert(error?.message || "خطایی رخ داد. لطفاً دوباره تلاش کنید.");
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in">
      
      {/* فرم ایجاد/ویرایش برند */}
      <Card className="border-zinc-100 shadow-sm rounded-2xl bg-white">
        <CardHeader className="border-b border-zinc-50 bg-zinc-50/20 pb-4">
          <CardTitle className="text-sm font-extrabold text-zinc-800">
            {isEditMode ? "ویرایش برند" : "افزودن برند جدید"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 mb-2">نام برند</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="مثال: اپل، سامسونگ"
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 mb-2">اسلاگ (انگلیسی بدون فاصله)</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                placeholder="مثال: apple"
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-xs font-mono font-bold"
              />
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
                    <span>{isEditMode ? "ذخیره تغییرات" : "ثبت برند"}</span>
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

      {/* لیست برندها */}
      <div className="lg:col-span-2 space-y-4">
        {initialBrands.length === 0 ? (
          <Card className="border-dashed border-zinc-200 p-12 text-center bg-zinc-50/20">
            <CardContent className="py-4 text-xs text-zinc-400">هیچ برندی هنوز ثبت نشده است.</CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {initialBrands.map((brand) => {
              const isEditing = selectedBrand?.id === brand.id;
              
              return (
                <Card
                  key={brand.id}
                  className={`border p-4 rounded-xl transition duration-200 ${
                    isEditing ? "border-blue-500 bg-blue-50/10 ring-1 ring-blue-500 shadow-inner" : "border-zinc-100 bg-white"
                  }`}
                >
                  <CardContent className="p-0 flex flex-col justify-between h-full gap-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <Tag className="h-4.5 w-4.5 text-blue-500" />
                        <div>
                          <span className="font-bold text-sm text-zinc-800 block">{brand.name}</span>
                          <span className="font-mono text-[9px] text-zinc-400">{brand.slug}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-lg border border-zinc-200 whitespace-nowrap">
                        {brand._count?.products || 0} کالا
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-3 border-t border-zinc-50">
                      <Button
                        onClick={() => handleStartEdit(brand)}
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs font-semibold rounded-lg border-zinc-200 text-zinc-600 hover:text-zinc-900 px-3"
                      >
                        <Edit className="h-3.5 w-3.5 ml-1" />
                        ویرایش
                      </Button>
                      <form action={deleteBrand.bind(null, brand.id)}>
                        <Button type="submit" variant="destructive" size="icon" className="h-8 w-8 rounded-lg">
                          <Trash2 className="h-3.5 w-3.5" />
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
    </div>
  );
}