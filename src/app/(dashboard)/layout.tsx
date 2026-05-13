import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { currentTenant } from "@/shared/auth/current-tenant";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const tenant = await currentTenant();

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="min-h-screen lg:pl-72">
        <AppHeader tenant={tenant} />
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
