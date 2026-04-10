"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

type Props = {
  mode: "create" | "edit";
  initial?: {
    id: string;
    title: string;
    description: string | null;
    slug: string;
    iosUrl: string;
    androidUrl: string;
    webUrl: string;
    deepLinkUrl: string | null;
    isActive: boolean;
    expiresAt: string | null;
    maxClicks: number | null;
    captchaEnabled: boolean;
    captchaMode: "off" | "always";
  };
};

export function LinkForm({ mode, initial }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function parseApiError(data: { error?: string; details?: unknown }) {
    if (data.error !== "Validation error") return data.error ?? "Request failed";

    const details = data.details as {
      formErrors?: string[];
      fieldErrors?: Record<string, string[] | undefined>;
    } | undefined;

    const messages: string[] = [];
    for (const message of details?.formErrors ?? []) messages.push(message);

    for (const [field, fieldMessages] of Object.entries(details?.fieldErrors ?? {})) {
      for (const message of fieldMessages ?? []) {
        messages.push(`${field}: ${message}`);
      }
    }

    return messages.length > 0 ? messages.join("; ") : "Validation error";
  }

  async function onSubmit(formData: FormData) {
    setError(null);
    setLoading(true);

    const payload = {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? "") || undefined,
      slug: String(formData.get("slug") ?? "") || undefined,
      iosUrl: String(formData.get("iosUrl") ?? ""),
      androidUrl: String(formData.get("androidUrl") ?? ""),
      webUrl: String(formData.get("webUrl") ?? ""),
      deepLinkUrl: String(formData.get("deepLinkUrl") ?? "") || undefined,
      isActive: formData.get("isActive") === "on",
      expiresAt: String(formData.get("expiresAt") ?? "") || undefined,
      maxClicks: Number(formData.get("maxClicks") || 0) || undefined,
      captchaEnabled: formData.get("captchaEnabled") === "on",
      captchaMode: String(formData.get("captchaMode") ?? "off"),
    };

    const endpoint = mode === "create" ? "/api/admin/links" : `/api/admin/links/${initial?.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const resp = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await resp.json();

    if (!resp.ok) {
      setError(parseApiError(data));
      setLoading(false);
      return;
    }

    router.push(mode === "create" ? `/admin/links/${data.id}` : `/admin/links/${initial?.id}`);
    router.refresh();
  }

  return (
    <form className="grid grid-cols-1 gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm" action={onSubmit}>
      <Input label="Title" name="title" required defaultValue={initial?.title ?? ""} />
      <Textarea label="Description" name="description" defaultValue={initial?.description ?? ""} />
      <Input label="Slug (optional)" name="slug" defaultValue={initial?.slug ?? ""} hint="lowercase letters, numbers, hyphen" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input label="iOS URL" name="iosUrl" type="url" required defaultValue={initial?.iosUrl ?? ""} />
        <Input label="Android URL" name="androidUrl" type="url" required defaultValue={initial?.androidUrl ?? ""} />
      </div>

      <Input label="Web URL" name="webUrl" type="url" required defaultValue={initial?.webUrl ?? ""} />
      <Input label="Deep Link URL (optional)" name="deepLinkUrl" type="url" defaultValue={initial?.deepLinkUrl ?? ""} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input label="Expires At (optional)" name="expiresAt" type="datetime-local" defaultValue={initial?.expiresAt ?? ""} />
        <Input label="Max Clicks (optional)" name="maxClicks" type="number" min={1} defaultValue={initial?.maxClicks ?? ""} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <label className="flex items-center gap-2 rounded-md border border-zinc-200 p-3 text-sm text-zinc-700">
          <input type="checkbox" name="isActive" defaultChecked={initial?.isActive ?? true} /> Active
        </label>

        <label className="flex items-center gap-2 rounded-md border border-zinc-200 p-3 text-sm text-zinc-700">
          <input type="checkbox" name="captchaEnabled" defaultChecked={initial?.captchaEnabled ?? false} /> Captcha enabled
        </label>

        <Select label="Captcha Mode" name="captchaMode" defaultValue={initial?.captchaMode ?? "off"}>
          <option value="off">off</option>
          <option value="always">always</option>
        </Select>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="flex justify-end">
        <Button disabled={loading} type="submit">{loading ? "Saving..." : mode === "create" ? "Create link" : "Save changes"}</Button>
      </div>
    </form>
  );
}
