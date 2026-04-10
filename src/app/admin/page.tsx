import { AdminShell } from "@/components/admin/admin-shell";
import { StatsCards } from "@/features/analytics/stats-cards";
import { requireAuthenticatedUser } from "@/features/auth/require-admin";
import { getDashboardAggregates } from "@/server/repositories/click-event-repository";

export default async function AdminDashboardPage() {
  await requireAuthenticatedUser();
  const stats = await getDashboardAggregates();

  return (
    <AdminShell>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-zinc-900">Dashboard</h2>
        <p className="text-sm text-zinc-500">High-level platform metrics</p>
      </div>
      <StatsCards
        items={[
          { label: "Total links", value: stats.totalLinks },
          { label: "Active links", value: stats.activeLinks },
          { label: "Total clicks", value: stats.totalClicks },
          { label: "Clicks today", value: stats.clicksToday },
        ]}
      />
    </AdminShell>
  );
}
