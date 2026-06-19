import { ProfileSidebar } from "@/components/profile/profile-sidebar";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* ستون راست (عرض ۱ از ۴): سایدبار کاربری */}
        <div className="lg:col-span-1 lg:sticky lg:top-24">
          <ProfileSidebar />
        </div>

        {/* ستون چپ (عرض ۳ از ۴): محتوای پویای زیرصفحات */}
        <div className="lg:col-span-3">
          {children}
        </div>
      </div>
    </div>
  );
}