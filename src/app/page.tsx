import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 text-center">
      <p className="text-xs uppercase tracking-widest text-zinc-500">SmartLink / OneQR</p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight text-zinc-900">Smart Redirect Platform</h1>
      <p className="mt-4 text-zinc-600">One short link + one QR code that routes users by platform and tracks analytics.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/admin" className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white">Open Admin</Link>
      </div>
    </main>
  );
}
