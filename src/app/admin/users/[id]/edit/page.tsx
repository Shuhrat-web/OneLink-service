import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { UserForm } from "@/features/users/user-form";
import { requireAdmin } from "@/features/auth/require-admin";
import { getUserByIdUseCase } from "@/server/services/user-service";

type Props = { params: Promise<{ id: string }> };

export default async function EditUserPage({ params }: Props) {
  await requireAdmin();

  const { id } = await params;
  const user = await getUserByIdUseCase(id);
  if (!user) notFound();

  return (
    <AdminShell>
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-zinc-900">Edit user</h2>
        <p className="text-sm text-zinc-500">Update role, status and password</p>
      </div>
      <UserForm mode="edit" initial={{ id: user.id, email: user.email, role: user.role, isActive: user.isActive }} />
    </AdminShell>
  );
}
