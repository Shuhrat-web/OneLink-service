import Link from "next/link";
import { notFound } from "next/navigation";
import { withLinkPrefix } from "@/lib/env";
import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireAdmin } from "@/features/auth/require-admin";
import { formatDateTime } from "@/lib/utils";
import { findSmartLinkById } from "@/server/repositories/smart-link-repository";
import { getLinkStats, getRecentEvents } from "@/server/repositories/click-event-repository";

type Props = { params: Promise<{ id: string }> };

export default async function LinkDetailsPage({ params }: Props) {
  await requireAdmin();

  const { id } = await params;
  const link = await findSmartLinkById(id);
  if (!link) notFound();

  const [stats, recent] = await Promise.all([getLinkStats(link.id), getRecentEvents(link.id, 20)]);
  type RecentEvent = Awaited<ReturnType<typeof getRecentEvents>>[number];

  return (
    <AdminShell>
      <div className="mb-4 flex items-center justify-between">
        <div><h2 className="text-2xl font-semibold text-zinc-900">{link.title}</h2><p className="text-sm text-zinc-500">{withLinkPrefix(`/${link.slug}`)}</p></div>
        <div className="flex gap-2">
          <Link href={`/admin/links/${link.id}/edit`} className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white">Edit</Link>
          <form action={`/api/admin/links/${link.id}`} method="post">
            <input type="hidden" name="_method" value="DELETE" />
            <button className="rounded-md bg-rose-600 px-4 py-2 text-sm text-white">Delete</button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Configuration" subtitle="Smart link settings">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-2"><dt className="text-zinc-500">Status</dt><dd><Badge tone={link.isActive ? "green" : "red"}>{link.isActive ? "active" : "inactive"}</Badge></dd></div>
            <div className="flex justify-between gap-2"><dt className="text-zinc-500">Captcha</dt><dd><Badge tone={link.captchaEnabled ? "amber" : "gray"}>{link.captchaEnabled ? link.captchaMode : "off"}</Badge></dd></div>
            <div className="flex justify-between gap-2"><dt className="text-zinc-500">Expires</dt><dd>{formatDateTime(link.expiresAt)}</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-zinc-500">Max clicks</dt><dd>{link.maxClicks ?? "∞"}</dd></div>
            <div><dt className="text-zinc-500">iOS URL</dt><dd className="break-all">{link.iosUrl}</dd></div>
            <div><dt className="text-zinc-500">Android URL</dt><dd className="break-all">{link.androidUrl}</dd></div>
            <div><dt className="text-zinc-500">Web URL</dt><dd className="break-all">{link.webUrl}</dd></div>
            <div><dt className="text-zinc-500">Deep Link</dt><dd className="break-all">{link.deepLinkUrl ?? "—"}</dd></div>
          </dl>
        </Card>

        <Card title="QR Preview" subtitle="PNG preview and download options">
          <img src={`/api/qr/${link.slug}?format=png`} alt={`QR ${link.slug}`} width={256} height={256} className="mx-auto aspect-square w-full max-w-64 rounded-md border border-zinc-200 bg-white p-2" />
          <div className="mt-4 flex gap-2">
            <a href={`/api/qr/${link.slug}?format=png&download=1`} className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white">Download PNG</a>
            <a href={`/api/qr/${link.slug}?format=svg&download=1`} className="rounded-md bg-zinc-100 px-3 py-2 text-sm text-zinc-900">Download SVG</a>
          </div>
        </Card>

        <Card title="Stats" subtitle="Aggregated analytics">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-zinc-500">Total clicks</dt><dd>{stats.totalClicks}</dd></div>
            <div className="flex justify-between"><dt className="text-zinc-500">Unique clicks</dt><dd>{stats.uniqueClicks}</dd></div>
            <div className="flex justify-between"><dt className="text-zinc-500">iOS</dt><dd>{stats.platformBreakdown.ios}</dd></div>
            <div className="flex justify-between"><dt className="text-zinc-500">Android</dt><dd>{stats.platformBreakdown.android}</dd></div>
            <div className="flex justify-between"><dt className="text-zinc-500">Desktop/Web</dt><dd>{stats.platformBreakdown.web}</dd></div>
            <div className="flex justify-between"><dt className="text-zinc-500">Last click</dt><dd>{formatDateTime(stats.lastClickAt)}</dd></div>
          </dl>
        </Card>
      </div>

      <Card title="Recent click events" subtitle="Last 20 events">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-zinc-500">
              <tr><th className="py-2 pr-3">Time</th><th className="py-2 pr-3">Platform</th><th className="py-2 pr-3">Device</th><th className="py-2 pr-3">Country</th><th className="py-2 pr-3">Unique</th><th className="py-2 pr-3">Captcha</th></tr>
            </thead>
            <tbody>
              {recent.map((event: RecentEvent) => (
                <tr key={event.id} className="border-t border-zinc-100">
                  <td className="py-2 pr-3">{formatDateTime(event.clickedAt)}</td>
                  <td className="py-2 pr-3">{event.platform}</td>
                  <td className="py-2 pr-3">{event.deviceType}</td>
                  <td className="py-2 pr-3">{event.country ?? "—"}</td>
                  <td className="py-2 pr-3">{event.isUnique ? "yes" : "no"}</td>
                  <td className="py-2 pr-3">{event.captchaPassed ? "yes" : "no"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminShell>
  );
}
