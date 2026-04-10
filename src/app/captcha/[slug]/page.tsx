import { notFound, redirect } from "next/navigation";
import { withLinkPrefix } from "@/lib/env";
import { findSmartLinkBySlug } from "@/server/repositories/smart-link-repository";
import { resolveAvailability } from "@/server/services/link-rules-service";
import { CaptchaWidget } from "./captcha-widget";

type Props = { params: Promise<{ slug: string }> };

export default async function CaptchaPage({ params }: Props) {
  const { slug } = await params;
  const link = await findSmartLinkBySlug(slug);
  if (!link) notFound();

  const state = await resolveAvailability(link);
  if (state !== "ok") redirect(`/status?type=${state}`);

  if (!link.captchaEnabled || link.captchaMode !== "always") redirect(withLinkPrefix(`/${slug}`));

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center px-6">
      <div className="w-full rounded-xl border border-zinc-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-zinc-900">Verification required</h1>
        <p className="mt-2 text-sm text-zinc-600">Please complete captcha to continue to destination.</p>
        <div className="mt-5 flex justify-center"><CaptchaWidget slug={slug} /></div>
      </div>
    </main>
  );
}
