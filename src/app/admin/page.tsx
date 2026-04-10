import { AdminShell } from "@/components/admin/admin-shell";
import { Card } from "@/components/ui/card";
import { DoughnutPlatformChart } from "@/features/analytics/doughnut-platform-chart";
import { LineClicksChart } from "@/features/analytics/line-clicks-chart";
import { StatsCards } from "@/features/analytics/stats-cards";
import { requireAuthenticatedUser } from "@/features/auth/require-admin";
import { getDashboardAggregates, getDashboardClicksOverTime, getDashboardPlatformBreakdown } from "@/server/repositories/click-event-repository";

export default async function AdminDashboardPage() {
  await requireAuthenticatedUser();
  const [stats, clicksOverTime, platformBreakdown] = await Promise.all([
    getDashboardAggregates(),
    getDashboardClicksOverTime(7),
    getDashboardPlatformBreakdown(),
  ]);

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

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Clicks over time" subtitle="Last 7 days: total vs unique clicks">
          <LineClicksChart points={clicksOverTime} />
        </Card>
        <Card title="Platform distribution" subtitle="All-time platform split">
          <DoughnutPlatformChart platformBreakdown={platformBreakdown} />
        </Card>
      </div>
    </AdminShell>
  );
}
