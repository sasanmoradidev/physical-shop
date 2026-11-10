import { prisma } from "@/lib/prisma";
import { BrandManager } from "@/components/admin/brand-manager";
import { Tag } from "lucide-react";
import { requirePermission } from "@/lib/rbac-server";

export default async function AdminBrandsPage() {
  await requirePermission("MANAGE_PRODUCTS");

  // واکشی لیست برندها به همراه تعداد محصولات هر برند
  const brands = await prisma.brand.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  return (
    <div className="container mx-auto py-8 px-4 space-y-8 animate-fade-in">
      
      {/* هدر صفحه */}
      <div className="flex items-center gap-3.5 pb-6 border-b border-zinc-100">
        <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-700 shadow-sm">
          <Tag className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">مدیریت برندها</h1>
          <p className="text-xs text-zinc-400 mt-1">
            لیست برندهای فروشگاه و تخصیص آن‌ها به کالاها
          </p>
        </div>
      </div>

      {/* کامپوننت یکپارچه مدیریت برندها */}
      <BrandManager initialBrands={brands} />

    </div>
  );
}