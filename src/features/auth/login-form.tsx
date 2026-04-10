"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const payload = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    const resp = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await resp.json();

    if (!resp.ok) {
      setError(data.error ?? "Login failed");
      setLoading(false);
      return;
    }

    window.location.assign("/admin");
  }

  return (
    <form action={onSubmit} className="w-full max-w-md space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <Input label="Email" name="email" type="email" required />
      <Input label="Password" name="password" type="password" required />
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <Button className="w-full" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</Button>
    </form>
  );
}
