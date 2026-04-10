import { AdminShell } from "@/components/admin/admin-shell";
import { UserForm } from "@/features/users/user-form";
import { requireAdmin } from "@/features/auth/require-admin";

export default async function NewUserPage() {
  await requireAdmin();

  return (
    <AdminShell>
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-zinc-900">Create user</h2>
        <p className="text-sm text-zinc-500">Create a new admin or regular user account</p>
      </div>
      <UserForm mode="create" />
    </AdminShell>
  );
}
