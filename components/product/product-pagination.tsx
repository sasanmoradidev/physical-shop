import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  currentPage: number;
  totalPages: number;
  baseUrl: string; // آدرس مقصد برای لینک‌ها (مثال: "/products" یا "/admin/products")
  searchParams: {
    q?: string;
    category?: string;
    sort?: string;
  };
};

export function ProductPagination({
  currentPage,
  totalPages,
  baseUrl,
  searchParams,
}: Props) {
  if (totalPages <= 1) return null;

  const { q = "", category = "", sort = "newest" } = searchParams;

  // ایجاد آدرس پویا بر اساس پارامترهای فعلی
  const getPageLink = (pageNumber: number) => {
    const params = new URLSearchParams();
    params.set("page", String(pageNumber));
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (sort) params.set("sort", sort);

    return `${baseUrl}?${params.toString()}`;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      {/* دکمه صفحه قبل */}
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage <= 1}
        asChild={currentPage > 1}
        className="rounded-xl h-9 w-9 border-zinc-200"
      >
        {currentPage > 1 ? (
          <Link href={getPageLink(currentPage - 1)}>
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>

      {/* شماره صفحات */}
      {pages.map((pageNumber) => {
        const isActive = pageNumber === currentPage;
        return (
          <Button
            key={pageNumber}
            variant={isActive ? "default" : "outline"}
            size="sm"
            asChild={!isActive}
            className={`h-9 w-9 rounded-xl font-bold text-xs ${
              isActive
                ? "bg-blue-600 text-white shadow-sm"
                : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            {!isActive ? (
              <Link href={getPageLink(pageNumber)}>{pageNumber}</Link>
            ) : (
              <span>{pageNumber}</span>
            )}
          </Button>
        );
      })}

      {/* دکمه صفحه بعد */}
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage >= totalPages}
        asChild={currentPage < totalPages}
        className="rounded-xl h-9 w-9 border-zinc-200"
      >
        {currentPage < totalPages ? (
          <Link href={getPageLink(currentPage + 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}