import DashboardSidebar from "@/components/clinic/DashboardSidebar";

export default function DashboardLayout({ children }: { children: any }) {
  return (
    <div className="min-h-screen bg-transparent">
      <div className="section-shell dashboard-grid py-4">
        <DashboardSidebar />
        <main className="min-w-0 py-2">{children}</main>
      </div>
    </div>
  );
}
