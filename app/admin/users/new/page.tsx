import Link from "next/link";
import UserForm from "@/components/admin/user-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, UserPlus, Users } from "lucide-react";

export default function NewUserPage() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 space-y-6 animate-fade-in">
      
      {/* هدر بالای صفحه به همراه دکمه بازگشت */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-100">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-700 shadow-sm">
            <UserPlus className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">ایجاد کاربر جدید</h1>
            <p className="text-xs text-zinc-400 mt-1">مشخصات، ایمیل و کلمه عبور کاربر جدید را برای فروشگاه ثبت کنید.</p>
          </div>
        </div>

        <Button variant="outline" size="sm" asChild className="w-fit rounded-xl border-zinc-200 text-zinc-700">
          <Link href="/admin/users" className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4" />
            <span>بازگشت به کاربران</span>
          </Link>
        </Button>
      </div>

      {/* کارت فرم ثبت مشخصات */}
      <Card className="border-zinc-100 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardHeader className="border-b border-zinc-100/60 bg-zinc-50/10 pb-4">
          <CardTitle className="text-sm font-bold text-zinc-800 flex items-center gap-2">
            <Users className="h-4.5 w-4.5 text-blue-600" />
            <span>مشخصات حساب کاربری جدید</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <UserForm />
        </CardContent>
      </Card>
      
    </div>
  );
}