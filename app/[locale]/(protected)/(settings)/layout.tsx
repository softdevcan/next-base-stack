import { ProfileSidebar } from "@/components/profile-sidebar";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Sidebar - hidden on mobile, visible on desktop */}
        <div className="hidden lg:block">
          <ProfileSidebar />
        </div>

        {/* Main content */}
        <div className="flex-1 max-w-4xl">{children}</div>
      </div>
    </div>
  );
}
