import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/dashboard/sidebar";
import DashboardTopbar from "@/components/dashboard/topbar";
import { DashboardGuard } from "@/components/dashboard/DashboardGuard";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardGuard>
      <SidebarProvider defaultOpen>
        <div className="flex min-h-svh w-full overflow-x-hidden">
          <AdminSidebar />

          <SidebarInset className="min-w-0 flex flex-col h-svh overflow-hidden">
            <DashboardTopbar />

            <main className="flex-1 overflow-y-auto bg-blue-50/20 p-6">
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </DashboardGuard>
  );
}
