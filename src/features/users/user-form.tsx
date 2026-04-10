"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type Props = {
  mode: "create" | "edit";
  initial?: {
    id: string;
    email: string;
    role: "admin" | "user";
    isActive: boolean;
  };
};

export function UserForm({ mode, initial }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setError(null);
    setLoading(true);

    const password = String(formData.get("password") ?? "").trim();
    const payload: {
      email: string;
      role: string;
      isActive: boolean;
      password?: string;
    } = {
      email: String(formData.get("email") ?? ""),
      role: String(formData.get("role") ?? "user"),
      isActive: formData.get("isActive") === "on",
    };

    if (mode === "create" || password.length > 0) payload.password = password;

    const endpoint = mode === "create" ? "/api/admin/users" : `/api/admin/users/${initial?.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const resp = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await resp.json();
    if (!resp.ok) {
      setError(data.error ?? "Request failed");
      setLoading(false);
      return;
    }

    router.push(mode === "create" ? `/admin/users/${data.id}` : `/admin/users/${initial?.id}`);
    router.refresh();
  }

  return (
    <form className="grid grid-cols-1 gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm" action={onSubmit}>
      <Input label="Email" name="email" type="email" required defaultValue={initial?.email ?? ""} />
      <Select label="Role" name="role" defaultValue={initial?.role ?? "user"}>
        <option value="user">user</option>
        <option value="admin">admin</option>
      </Select>

      <label className="flex items-center gap-2 rounded-md border border-zinc-200 p-3 text-sm text-zinc-700">
        <input type="checkbox" name="isActive" defaultChecked={initial?.isActive ?? true} /> Active user
      </label>

      <Input
        label={mode === "create" ? "Password" : "New password (optional)"}
        name="password"
        type="password"
        required={mode === "create"}
        hint={mode === "edit" ? "Leave empty to keep current password" : undefined}
      />

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="flex justify-end">
        <Button disabled={loading} type="submit">{loading ? "Saving..." : mode === "create" ? "Create user" : "Save changes"}</Button>
      </div>
    </form>
  );
}
