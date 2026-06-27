import { requireAuth } from "@/lib/rbac-server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Shield, Calendar } from "lucide-react";

export default async function ProfilePage() {
  const user = await requireAuth();

  const joinedDate = new Date(user.createdAt).toLocaleDateString("fa-IR");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* سربرگ مشخصات */}
      <div className="space-y-1 pb-4 border-b border-zinc-100">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">مشخصات کاربری</h1>
        <p className="text-xs text-zinc-400">اطلاعات هویتی و جزئیات حساب کاربری خود را در زیر مشاهده کنید.</p>
      </div>

      {/* کارت نمایش فیلدهای حساب کاربری */}
      <Card className="border-zinc-100 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardHeader className="border-b border-zinc-50 bg-zinc-50/10 pb-4">
          <CardTitle className="text-sm font-bold text-zinc-800 flex items-center gap-2">
            <User className="h-4.5 w-4.5 text-blue-600" />
            <span>اطلاعات پایه حساب</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            
            <div className="space-y-1 p-4 bg-zinc-50 rounded-xl border border-zinc-100/50">
              <span className="text-[10px] text-zinc-400 block">نام و نام خانوادگی</span>
              <span className="font-bold text-zinc-800 block text-sm">{user.name}</span>
            </div>

            <div className="space-y-1 p-4 bg-zinc-50 rounded-xl border border-zinc-100/50">
              <span className="text-[10px] text-zinc-400 block">نشانی ایمیل</span>
              <span className="font-bold text-zinc-800 block text-sm">{user.email}</span>
            </div>

            <div className="space-y-1 p-4 bg-zinc-50 rounded-xl border border-zinc-100/50">
              <span className="text-[10px] text-zinc-400 block">نقش کاربری در سایت</span>
              <span className="font-bold text-zinc-800 block text-sm">
                {user.role === "ADMIN" ? "مدیر کل سیستم" : "کاربر عادی"}
              </span>
            </div>

            <div className="space-y-1 p-4 bg-zinc-50 rounded-xl border border-zinc-100/50">
              <span className="text-[10px] text-zinc-400 block">تاریخ عضویت</span>
              <span className="font-bold text-zinc-800 block text-sm">{joinedDate}</span>
            </div>

          </div>

        </CardContent>
      </Card>
    </div>
  );
}