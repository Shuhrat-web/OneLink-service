import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { LinkForm } from "@/features/links/link-form";
import { canManageLink, requireAuthenticatedUser } from "@/features/auth/require-admin";
import { findSmartLinkById } from "@/server/repositories/smart-link-repository";

type Props = { params: Promise<{ id: string }> };

export default async function EditLinkPage({ params }: Props) {
  const user = await requireAuthenticatedUser();

  const { id } = await params;
  const link = await findSmartLinkById(id);
  if (!link) notFound();
  if (!canManageLink(user, link)) notFound();

  const expires = link.expiresAt
    ? new Date(link.expiresAt.getTime() - link.expiresAt.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    : null;

  return (
    <AdminShell>
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-zinc-900">Edit smart link</h2>
        <p className="text-sm text-zinc-500">Update configuration and redirect rules</p>
      </div>
      <LinkForm
        mode="edit"
        initial={{
          id: link.id,
          title: link.title,
          description: link.description,
          slug: link.slug,
          iosUrl: link.iosUrl,
          androidUrl: link.androidUrl,
          webUrl: link.webUrl,
          deepLinkUrl: link.deepLinkUrl,
          isActive: link.isActive,
          expiresAt: expires,
          maxClicks: link.maxClicks,
          captchaEnabled: link.captchaEnabled,
          captchaMode: link.captchaMode,
        }}
      />
    </AdminShell>
  );
}
