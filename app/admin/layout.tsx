import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col lg:flex-row">
      {/* سایدبار مدیریت */}
      <AdminSidebar />

      {/* محتوای اصلی صفحات مدیریت */}
      <main className="flex-1 p-4 md:p-8 w-full">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 min-h-[calc(100vh-180px)] shadow-sm">
          {children}
        </div>
      </main>
    </div>
  );
}