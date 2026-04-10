import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireAdmin } from "@/features/auth/require-admin";
import { formatDateTime } from "@/lib/utils";
import { getUserByIdUseCase } from "@/server/services/user-service";

type Props = { params: Promise<{ id: string }> };

export default async function UserDetailsPage({ params }: Props) {
  await requireAdmin();

  const { id } = await params;
  const user = await getUserByIdUseCase(id);
  if (!user) notFound();

  return (
    <AdminShell>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-900">{user.email}</h2>
          <p className="text-sm text-zinc-500">User details</p>
        </div>
        <Link href={`/admin/users/${user.id}/edit`} className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white">Edit</Link>
      </div>

      <Card title="Profile" subtitle="Role and account status">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-2"><dt className="text-zinc-500">Role</dt><dd><Badge tone={user.role === "admin" ? "amber" : "gray"}>{user.role}</Badge></dd></div>
          <div className="flex justify-between gap-2"><dt className="text-zinc-500">Status</dt><dd><Badge tone={user.isActive ? "green" : "red"}>{user.isActive ? "active" : "inactive"}</Badge></dd></div>
          <div className="flex justify-between gap-2"><dt className="text-zinc-500">Created</dt><dd>{formatDateTime(user.createdAt)}</dd></div>
          <div className="flex justify-between gap-2"><dt className="text-zinc-500">Updated</dt><dd>{formatDateTime(user.updatedAt)}</dd></div>
        </dl>
      </Card>
    </AdminShell>
  );
}
