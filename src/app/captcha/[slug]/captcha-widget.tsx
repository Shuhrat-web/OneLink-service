"use client";

import { useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";

export function CaptchaWidget({ slug }: { slug: string }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onVerify(token: string) {
    setLoading(true);
    setError(null);

    const resp = await fetch("/api/public/captcha/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, token }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      setLoading(false);
      setError(data.error ?? "Captcha verification failed");
      return;
    }

    window.location.href = data.redirectUrl;
  }

  return (
    <div className="space-y-4">
      <Turnstile
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""}
        onSuccess={onVerify}
        onError={() => setError("Captcha error. Please retry.")}
      />
      {loading ? <p className="text-sm text-zinc-500">Verifying...</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
