import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductFilters } from "@/components/product/product-filters";
import { ProductPagination } from "@/components/product/product-pagination";

import { DeleteProductButton } from "./delete-button";
import { ToggleStatusButton } from "./toggle-status-button";

import {
  Plus,
  Edit,
  Layers,
  Package,
  ShoppingBag,
} from "lucide-react";

type Props = {
  searchParams: Promise<{
    page?: string;
    q?: string;
    category?: string;
    sort?: string;
  }>;
};

const PAGE_SIZE = 12; // تعداد نمایش کالا در هر صفحه پنل مدیریت

export default async function AdminProductsPage({ searchParams }: Props) {
  const { page, q, category, sort } = await searchParams;
  const currentPage = Number(page || "1");

  // ساخت کوئری داینامیک جستجو برای ادمین (بدون شرط isActive برای اینکه ادمین کالاهای غیرفعال را هم ببیند)
  const where = {
    ...(q ? { title: { contains: q, mode: "insensitive" as const } } : {}),
    ...(category ? { category: { slug: category } } : {}),
  };

  const totalProducts = await prisma.product.count({ where });
  const totalPages = Math.ceil(totalProducts / PAGE_SIZE);

  const orderBy =
    sort === "price_asc"
      ? { price: "asc" as const }
      : sort === "price_desc"
        ? { price: "desc" as const }
        : { createdAt: "desc" as const };

  const products = await prisma.product.findMany({
    where,
    include: {
      category: true,
      images: {
        orderBy: { order: "asc" },
      },
    },
    orderBy,
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="container mx-auto py-8 px-4 space-y-8 animate-fade-in">

      {/* هدر مدیریت */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-100">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-700 shadow-sm">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">محصولات</h1>
            <p className="text-xs text-zinc-400 mt-1">
              لیست کالاها و مدیریت دقیق موجودی کل فروشگاه ({totalProducts} کالا)
            </p>
          </div>
        </div>

        <Button asChild size="sm" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-2">
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" />
            <span>محصول جدید</span>
          </Link>
        </Button>
      </div>

      {/* ۱. استفاده مجدد از فیلترهای واکشی کالا در پنل مدیریت */}
      <ProductFilters
        categories={categories}
        searchParams={{ q, category, sort }}
        actionUrl="/admin/products"
      />

      {/* نمایش محصولات یا حالت تهی */}
      {products.length === 0 ? (
        <Card className="border-dashed border-zinc-200 p-12 text-center bg-zinc-50/20">
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-zinc-50 rounded-full text-zinc-400 border border-zinc-100">
              <Package className="h-10 w-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-zinc-800">هیچ محصولی یافت نشد</h3>
              <p className="text-xs text-zinc-400">جستجوی شما نتیجه‌ای در بر نداشت یا محصولی ثبت نشده است.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {products.map((product) => {
            const imageUrl = product.images?.[0]?.url || "/placeholder.png";
            const isOutOfStock = product.stock <= 0;

            return (
              <Card
                key={product.id}
                className="border-zinc-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition duration-200 flex flex-col justify-between bg-white"
              >
                <div>
                  <div className="relative aspect-square bg-zinc-50 border-b border-zinc-50 flex items-center justify-center overflow-hidden">
                    {/* 
        اگر محصول غیرفعال باشد، کلاس‌های opacity-40 و grayscale به عکس اضافه می‌شود 
        تا از لحاظ بصری برای ادمین مشخص شود.
      */}
                    <Image
                      src={imageUrl}
                      alt={product.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 250px"
                      className={`object-contain p-5 transition-all duration-300 ${!product.isActive ? "opacity-40 grayscale" : ""
                        }`}
                    />

                    {/* برچسب موجودی انبار (موجود/ناموجود) */}
                    <div className="absolute top-3.5 right-3.5 flex flex-col gap-1.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold shadow-sm ${isOutOfStock
                            ? "bg-red-50 text-red-700 border border-red-100"
                            : "bg-green-50 text-green-700 border border-green-100"
                          }`}
                      >
                        {isOutOfStock ? "ناموجود" : `${product.stock} عدد`}
                      </span>
                    </div>

                    {/* 👇 برچسب وضعیت انتشار (اگر کالا غیرفعال باشد نمایش داده می‌شود) */}
                    {!product.isActive && (
                      <div className="absolute top-3.5 left-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold bg-zinc-800 text-zinc-50 border border-zinc-900 shadow-sm">
                          غیرفعال
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-semibold">
                      <Layers className="h-3 w-3 text-zinc-400" />
                      <span>{product.category.name}</span>
                    </div>
                    <h3
                      className="font-bold text-sm text-zinc-800 line-clamp-1"
                      title={product.title}
                    >
                      {product.title}
                    </h3>
                    <div className="flex flex-col text-left">
                      <span className="font-extrabold text-base text-zinc-900 tracking-tight">
                        {Number(product.price).toLocaleString("fa-IR")}
                      </span>
                      <span className="text-[9px] text-zinc-400">تومان</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-zinc-50/60 mt-auto flex items-center justify-between gap-2">

                  {/* دکمه ویرایش (لینک به صفحه ادیت) */}
                  <Button
                    asChild
                    variant="outline"
                    className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold py-2 h-9 rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition"
                  >
                    <Link href={`/admin/products/${product.id}/edit`}>
                      <Edit className="h-3.5 w-3.5 text-zinc-500" />
                      <span>ویرایش</span>
                    </Link>
                  </Button>

                  {/* 👇 دکمه کلاینتی تغییر وضعیت (فعال/غیرفعال کردن) */}
                  <ToggleStatusButton id={product.id} isActive={product.isActive} />

                  {/* 👇 دکمه کلاینتی حذف کالا */}
                  <DeleteProductButton id={product.id} />

                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ۲. استفاده مجدد از کامپوننت صفحه‌بندی در پنل مدیریت */}
      <ProductPagination
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl="/admin/products"
        searchParams={{ q, category, sort }}
      />
    </div>
  );
}