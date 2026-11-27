import { requirePagePermission } from "@/lib/rbac-server";
import { getHomeConfig } from "@/lib/home-config";
import { HomepageManager } from "@/components/admin/homepage-manager";
import { Images } from "lucide-react";

export default async function AdminHomepagePage() {
  await requirePagePermission("MANAGE_PRODUCTS");
  const homeConfig = await getHomeConfig();

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 space-y-8 animate-fade-in">
      <div className="flex items-center gap-3.5 pb-6 border-b border-zinc-100">
        <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-700 shadow-sm">
          <Images className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            مدیریت صفحه اصلی و بنرها
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            بارگذاری اسلایدها، بنرهای تبلیغاتی ۴ ستونه، بنر جشنواره و کنترل نمایش بخش‌های صفحه اصلی
          </p>
        </div>
      </div>

      <HomepageManager initialConfig={homeConfig} />
    </div>
  );
}