import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/features/auth/require-admin";
import { listUsersUseCase } from "@/server/services/user-service";
import { formatDateTime } from "@/lib/utils";

export default async function AdminUsersPage() {
  await requireAdmin();
  const users = await listUsersUseCase();

  return (
    <AdminShell>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-900">Users</h2>
          <p className="text-sm text-zinc-500">Manage admin and regular users</p>
        </div>
        <Link href="/admin/users/new" className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white">New user</Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-500">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Role</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Created</th>
              <th className="px-4 py-3 text-left font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-zinc-100">
                <td className="px-4 py-3"><Link className="font-medium text-zinc-900 underline" href={`/admin/users/${user.id}`}>{user.email}</Link></td>
                <td className="px-4 py-3"><Badge tone={user.role === "admin" ? "amber" : "gray"}>{user.role}</Badge></td>
                <td className="px-4 py-3"><Badge tone={user.isActive ? "green" : "red"}>{user.isActive ? "active" : "inactive"}</Badge></td>
                <td className="px-4 py-3 text-zinc-700">{formatDateTime(user.createdAt)}</td>
                <td className="px-4 py-3 text-zinc-700">{formatDateTime(user.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
