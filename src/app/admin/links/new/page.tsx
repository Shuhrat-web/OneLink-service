import { AdminShell } from "@/components/admin/admin-shell";
import { LinkForm } from "@/features/links/link-form";
import { requireAuthenticatedUser } from "@/features/auth/require-admin";

export default async function NewLinkPage() {
  await requireAuthenticatedUser();

  return (
    <AdminShell>
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-zinc-900">Create smart link</h2>
        <p className="text-sm text-zinc-500">Configure URLs, lifecycle and captcha protection</p>
      </div>
      <LinkForm mode="create" />
    </AdminShell>
  );
}
