import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Props = {
  categories: Category[];
  searchParams: {
    q?: string;
    category?: string;
    sort?: string;
  };
  actionUrl: string; // آدرس مقصد برای ارسال فیلترها (مثال: "/products" یا "/admin/products")
};

export function ProductFilters({ categories, searchParams, actionUrl }: Props) {
  const { q, category, sort } = searchParams;

  return (
    <form
      action={actionUrl}
      className="bg-white border border-zinc-100 p-4 rounded-2xl shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:gap-3"
    >
      {/* باکس جستجوی متنی */}
      <div className="relative flex-1">
        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
        <input
          type="text"
          name="q"
          defaultValue={q || ""}
          placeholder="جستجوی نام کالا..."
          className="w-full border rounded-xl pr-10 pl-4 py-2.5 bg-zinc-50/40 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
        />
      </div>

      {/* انتخاب دسته‌بندی */}
      <select
        name="category"
        defaultValue={category || ""}
        className="w-full md:w-44 border rounded-xl px-4 py-2.5 bg-white text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition cursor-pointer"
      >
        <option value="">همه دسته‌بندی‌ها</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.slug}>
            {cat.name}
          </option>
        ))}
      </select>

      {/* نحوه مرتب‌سازی */}
      <select
        name="sort"
        defaultValue={sort || "newest"}
        className="w-full md:w-44 border rounded-xl px-4 py-2.5 bg-white text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition cursor-pointer"
      >
        <option value="newest">جدیدترین</option>
        <option value="price_asc">ارزان‌ترین</option>
        <option value="price_desc">گران‌ترین</option>
      </select>

      {/* دکمه تایید فیلتر */}
      <Button
        type="submit"
        size="sm"
        className="w-full md:w-auto h-10 rounded-xl px-5 bg-zinc-900 hover:bg-zinc-800 text-white flex items-center justify-center gap-2 text-xs font-semibold"
      >
        <SlidersHorizontal className="h-4 w-4" />
        <span>اعمال فیلتر</span>
      </Button>
    </form>
  );
}