import Link from "next/link";
import { withLinkPrefix } from "@/lib/env";
import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { requireAuthenticatedUser } from "@/features/auth/require-admin";
import { smartLinkQuerySchema } from "@/server/schemas/link";
import { listSmartLinksUseCase } from "@/server/services/smart-link-service";
import { formatDateTime } from "@/lib/utils";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function AdminLinksPage({ searchParams }: Props) {
  const user = await requireAuthenticatedUser();

  const raw = await searchParams;
  const parsed = smartLinkQuerySchema.parse({
    search: typeof raw.search === "string" ? raw.search : undefined,
    active: typeof raw.active === "string" ? raw.active : undefined,
    captcha: typeof raw.captcha === "string" ? raw.captcha : undefined,
    expired: typeof raw.expired === "string" ? raw.expired : undefined,
    page: typeof raw.page === "string" ? raw.page : undefined,
    pageSize: typeof raw.pageSize === "string" ? raw.pageSize : undefined,
  });

  const result = await listSmartLinksUseCase(parsed, user);

  return (
    <AdminShell>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-900">Smart Links</h2>
          <p className="text-sm text-zinc-500">Search and manage redirects</p>
        </div>
        <Link href="/admin/links/new" className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white">New link</Link>
      </div>

      <form className="mb-4 grid grid-cols-1 gap-3 rounded-xl border border-zinc-200 bg-white p-4 md:grid-cols-4">
        <input type="text" name="search" placeholder="Search by title/slug" defaultValue={parsed.search ?? ""} className="h-10 rounded-md border border-zinc-300 px-3 text-sm" />
        <select name="active" defaultValue={parsed.active} className="h-10 rounded-md border border-zinc-300 px-3 text-sm">
          <option value="all">All statuses</option><option value="true">Active only</option><option value="false">Inactive only</option>
        </select>
        <select name="captcha" defaultValue={parsed.captcha} className="h-10 rounded-md border border-zinc-300 px-3 text-sm">
          <option value="all">Captcha: all</option><option value="true">Captcha enabled</option><option value="false">Captcha disabled</option>
        </select>
        <select name="expired" defaultValue={parsed.expired} className="h-10 rounded-md border border-zinc-300 px-3 text-sm">
          <option value="all">Expiry: all</option><option value="true">Expired</option><option value="false">Not expired</option>
        </select>
        <button className="h-10 rounded-md bg-zinc-900 px-4 text-sm text-white md:col-span-4">Apply filters</button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-500">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Title</th><th className="px-4 py-3 text-left font-medium">Slug</th><th className="px-4 py-3 text-left font-medium">Owner</th><th className="px-4 py-3 text-left font-medium">State</th><th className="px-4 py-3 text-left font-medium">Captcha</th><th className="px-4 py-3 text-left font-medium">Expires</th><th className="px-4 py-3 text-left font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {result.items.map((item) => (
              <tr key={item.id} className="border-t border-zinc-100">
                <td className="px-4 py-3"><Link className="font-medium text-zinc-900 underline" href={`/admin/links/${item.id}`}>{item.title}</Link></td>
                <td className="px-4 py-3 text-zinc-700">{withLinkPrefix(`/${item.slug}`)}</td>
                <td className="px-4 py-3 text-zinc-700">{item.owner.email}</td>
                <td className="px-4 py-3"><Badge tone={item.isActive ? "green" : "red"}>{item.isActive ? "active" : "inactive"}</Badge></td>
                <td className="px-4 py-3"><Badge tone={item.captchaEnabled ? "amber" : "gray"}>{item.captchaEnabled ? item.captchaMode : "off"}</Badge></td>
                <td className="px-4 py-3 text-zinc-700">{formatDateTime(item.expiresAt)}</td>
                <td className="px-4 py-3 text-zinc-700">{formatDateTime(item.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
