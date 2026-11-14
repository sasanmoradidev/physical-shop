import Link from "next/link";
import { ShieldAlert, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50">
      <div className="max-w-md w-full bg-white border border-zinc-100 rounded-3xl shadow-sm p-8 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-zinc-900">عدم دسترسی</h1>
          <p className="text-xs text-zinc-500 leading-relaxed">
            شما مجوز لازم برای مشاهده این بخش را ندارید.
          </p>
        </div>
        <Button asChild className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold h-10 px-6">
          <Link href="/" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            <span>بازگشت به صفحه اصلی</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}