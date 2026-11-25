import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac-server";
import { CategoryManager } from "@/components/admin/category-manager";
import { FolderTree } from "lucide-react";

export default async function AdminCategoriesPage() {
  await requirePermission("MANAGE_CATEGORIES");

  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      subcategories: { orderBy: { name: "asc" } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="container mx-auto py-8 px-4 space-y-8 animate-fade-in">
      <div className="flex items-center gap-3.5 pb-6 border-b border-zinc-100">
        <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-700 shadow-sm">
          <FolderTree className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">دسته‌بندی کالاها</h1>
          <p className="text-xs text-zinc-400 mt-1">مدیریت درختواره دسته‌بندی‌ها و نسبت دادن زیرمجموعه‌های کالا</p>
        </div>
      </div>

      <CategoryManager initialCategories={categories} />
    </div>
  );
}