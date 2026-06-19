import { prisma } from "@/lib/prisma";
import { CategoryManager } from "@/components/admin/category-manager";
import { FolderTree } from "lucide-react";

export default async function AdminCategoriesPage() {
  // واکشی درخت دسته‌بندی‌ها (فقط ریشه‌ها به همراه زیردسته‌ها)
  const categories = await prisma.category.findMany({
    where: {
      parentId: null, // دریافت فقط دسته‌بندی‌های والد
    },
    include: {
      subcategories: {
        orderBy: { name: "asc" }, // زیردسته‌بندی‌ها به ترتیب الفبا
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="container mx-auto py-8 px-4 space-y-8 animate-fade-in">
      
      {/* هدر صفحه */}
      <div className="flex items-center gap-3.5 pb-6 border-b border-zinc-100">
        <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-700 shadow-sm">
          <FolderTree className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">دسته‌بندی کالاها</h1>
          <p className="text-xs text-zinc-400 mt-1">مدیریت درختواره دسته‌بندی‌ها و نسبت دادن زیرمجموعه‌های کالا</p>
        </div>
      </div>

      {/* کامپوننت یکپارچه مدیریت دسته‌بندی‌ها */}
      <CategoryManager initialCategories={categories} />

    </div>
  );
}