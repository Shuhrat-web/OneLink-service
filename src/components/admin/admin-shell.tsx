import Link from "next/link";
import { ReactNode } from "react";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">SmartLink / OneQR</p>
            <h1 className="text-lg font-semibold text-zinc-900">Admin Panel</h1>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link className="text-zinc-700 hover:text-zinc-900" href="/admin">Dashboard</Link>
            <Link className="text-zinc-700 hover:text-zinc-900" href="/admin/links">Links</Link>
            <form action="/api/admin/auth/logout" method="post">
              <button className="text-zinc-700 hover:text-zinc-900" type="submit">Logout</button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
