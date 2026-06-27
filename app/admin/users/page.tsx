import { prisma } from "@/lib/prisma";
import { toggleUserRole, deleteUser } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requirePermission } from "@/lib/rbac-server";
import Link from "next/link";
import { Plus, Edit } from "lucide-react";

// ایمپورت آیکون‌های استاندارد Lucide
import {
    Users as UsersIcon,
    Mail,
    ShieldCheck,
    ShieldAlert,
    Calendar,
    Trash2,
    Search,
} from "lucide-react";

type Props = {
    searchParams: Promise<{
        q?: string;
        role?: string;
    }>;
};

export default async function AdminUsersPage({ searchParams }: Props) {
    const admin = await requirePermission("MANAGE_USERS");
    const { q = "", role = "" } = await searchParams;

    // ساخت کوئری فیلتر داینامیک دیتابیس
    const where = {
        ...(q
            ? {
                OR: [
                    { name: { contains: q, mode: "insensitive" as const } },
                    { email: { contains: q, mode: "insensitive" as const } },
                ],
            }
            : {}),
        ...(role ? { role: role as any } : {}),
    };

    const users = await prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="container mx-auto py-8 px-4 space-y-8 animate-fade-in">

            {/* هدر صفحه */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-100">
                <div className="flex items-center gap-3.5">
                    <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-700 shadow-sm">
                        <UsersIcon className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">مدیریت کاربران</h1>
                        <p className="text-xs text-zinc-400 mt-1">
                            مشاهده مشخصات کاربران، جستجوی زنده نام/ایمیل و ارتقا یا عزل نقش‌های مدیریت ({users.length} کاربر)
                        </p>
                    </div>
                </div>
                <Button asChild size="sm" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-2">
                    <Link href="/admin/users/new">
                        <Plus className="h-4 w-4" /> {/* فراموش نکنید که Plus را از lucide-react ایمپورت کنید */}
                        <span>کاربر جدید</span>
                    </Link>
                </Button>
            </div>

            {/* نوار جستجو و فیلتر هوشمند کاربران */}
            <form
                action="/admin/users"
                className="bg-white border border-zinc-100 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center gap-3"
            >
                <div className="relative flex-1">
                    <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
                    <input
                        type="text"
                        name="q"
                        defaultValue={q}
                        placeholder="جستجوی نام یا نشانی ایمیل..."
                        className="w-full border rounded-xl pr-10 pl-4 py-2.5 bg-zinc-50/40 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                    />
                </div>

                <select
                    name="role"
                    defaultValue={role}
                    className="w-full md:w-44 border rounded-xl px-4 py-2.5 bg-white text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition cursor-pointer"
                >
                    <option value="">همه نقش‌ها</option>
                    <option value="USER">کاربر عادی</option>
                    <option value="ADMIN">مدیر سایت</option>
                </select>

                <Button
                    type="submit"
                    size="sm"
                    className="w-full md:w-auto h-10 rounded-xl px-5 bg-zinc-900 hover:bg-zinc-800 text-white flex items-center justify-center text-xs font-semibold"
                >
                    <span>جستجو و فیلتر</span>
                </Button>
            </form>

            {/* نمایش لیست کاربران یا حالت تهی */}
            {users.length === 0 ? (
                <Card className="border-dashed border-zinc-200 p-12 text-center bg-zinc-50/20">
                    <CardContent className="flex flex-col items-center justify-center space-y-4">
                        <div className="p-4 bg-zinc-50 rounded-full text-zinc-400 border border-zinc-100">
                            <UsersIcon className="h-10 w-10" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-zinc-800">کاربری یافت نشد</h3>
                            <p className="text-xs text-zinc-400">جستجوی شما برای این نام، ایمیل یا نقش نتیجه‌ای در بر نداشت.</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {users.map((item) => {
                        const isSelf = admin?.id === item.id;
                        const userInitials = item.name ? item.name.charAt(0).toUpperCase() : "U";
                        const isUserAdmin = item.role === "ADMIN";
                        const joinedDate = new Date(item.createdAt).toLocaleDateString("fa-IR");

                        return (
                            <Card
                                key={item.id}
                                className="border-zinc-100 shadow-sm rounded-2xl p-5 bg-white hover:shadow-md transition duration-200"
                            >
                                <CardContent className="p-0 flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                                    {/* اطلاعات هویتی و آواتار دایره‌ای کاربر */}
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="h-12 w-12 rounded-full bg-zinc-50 border border-zinc-100 text-zinc-600 flex items-center justify-center text-lg font-bold shadow-inner flex-shrink-0 select-none">
                                            {userInitials}
                                        </div>
                                        <div className="space-y-1.5 truncate">
                                            <div className="flex flex-wrap items-center gap-2.5">
                                                <span className="font-bold text-sm text-zinc-800">{item.name}</span>
                                                {isSelf && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-100 shadow-sm">
                                                        حساب شما
                                                    </span>
                                                )}
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[9px] font-bold ${isUserAdmin
                                                    ? "bg-amber-50 text-amber-700 border border-amber-100"
                                                    : "bg-zinc-50 text-zinc-600 border border-zinc-150"
                                                    }`}>
                                                    {isUserAdmin ? "مدیر سایت" : "کاربر عادی"}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                                                <span className="flex items-center gap-1.5">
                                                    <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                                                    <span className="truncate">{item.email}</span>
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                                                    <span>تاریخ عضویت: {joinedDate}</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* دکمه‌های کنترلی نقش‌ها و حذف کاربر */}
                                    <div className="flex items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-zinc-50 flex-shrink-0">
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                            className="rounded-xl h-9 text-xs font-semibold border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                                        >
                                            <Link href={`/admin/users/${item.id}/edit`}>
                                                <Edit className="h-3.5 w-3.5 text-zinc-500" /> {/* فراموش نکنید که Edit را از lucide-react ایمپورت کنید */}
                                                <span>ویرایش</span>
                                            </Link>
                                        </Button>
                                        {/* دکمه تغییر نقش (ترفیع یا عزل ادمین) */}
                                        <form action={toggleUserRole.bind(null, item.id)}>
                                            <Button
                                                type="submit"
                                                variant="outline"
                                                size="sm"
                                                disabled={isSelf} // ادمین جاری نمی‌تواند نقش خودش را تغییر دهد
                                                className="rounded-xl h-9 text-xs font-semibold border-zinc-200"
                                            >
                                                {isUserAdmin ? (
                                                    <span className="flex items-center gap-1.5 text-red-600">
                                                        <ShieldAlert className="h-3.5 w-3.5" />
                                                        <span>عزل ادمین</span>
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 text-emerald-600">
                                                        <ShieldCheck className="h-3.5 w-3.5" />
                                                        <span>ارتقا به ادمین</span>
                                                    </span>
                                                )}
                                            </Button>
                                        </form>

                                        {/* دکمه حذف فیزیکی کاربر */}
                                        <form action={deleteUser.bind(null, item.id)}>
                                            <Button
                                                type="submit"
                                                variant="destructive"
                                                disabled={isSelf} // ادمین جاری نمی‌تواند حساب خودش را حذف کند
                                                className="rounded-xl h-9 w-9 flex items-center justify-center p-0"
                                                aria-label="حذف کاربر"
                                            >
                                                <Trash2 className="h-4 w-4" />
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
    );
}